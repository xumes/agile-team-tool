var React = require('react');
var api = require('../api.jsx');
var templates = require('./AssessmentUpdateDocs.jsx');
var _ = require('underscore');
var moment = require('moment');
var InlineSVG = require('svg-inline-react');
var newestTemplateVersion = 'ag_ref_atma_components_v07';
var ConfirmPopover = require('../index/ConfirmPopover.jsx');
var ConfirmDialog = require('../index/ConfirmDialog.jsx');

var AssessmentButtons = React.createClass({
  getInitialState: function() {
    return {
      alertMsg: '',
      showConfirmModal: false
    };
  },

  componentDidMount: function() {

  },

  submitAssess: function() {
    var self = this;
    var assessType = $('#assessmentTeamTypeSelector').val();
    var software = $('#assessmentSoftwareTypeSelector').val();
    //var assessId = self.props.assessmentStatus.assessId;
    var teamId = self.props.loadDetailTeam.team._id;
    var submittedDate = $('#submitDatePicker').val();
    if ($('#assessmentSubmitDateTitle').html() == 'On Submission') {
      var submittedDate = ''
    } else {
      submittedDate = new Date(moment($('#assessmentSubmitDateTitle').html(), 'DD MMM YYYY'));
    }
    var updateDoc = {
      'assessmentStatus' : 'Submitted',
      'version' : newestTemplateVersion,
      'type' : assessType,
      'deliversSoftware' : false,
      'componentResults' : [],
      'actionPlans': [],
      'teamId': teamId,
      'submittedDate': submittedDate
    }
    var objectLength = 0;
    var checkedIsEmpty = false;
    updateDoc.componentResults.push(JSON.parse(JSON.stringify(templates[newestTemplateVersion][assessType])));
    var p1N = updateDoc.componentResults[0].practiceNumber;
    objectLength = updateDoc.componentResults[0].assessedComponents.length;
    if (software == 'Yes') {
      updateDoc['deliversSoftware'] = true;
      updateDoc.componentResults.push(JSON.parse(JSON.stringify(templates[newestTemplateVersion]['Delivery'])));
      var p2N = updateDoc.componentResults[1].practiceNumber;
      objectLength = objectLength + updateDoc.componentResults[1].assessedComponents.length;
    }
    var checkedCurrs = $('.iradio_square-blue.curr.checked > input');
    var checkedTargs = $('.iradio_square-blue.targ.checked > input');
    if (checkedCurrs.length < objectLength || checkedTargs.length < objectLength) {
      checkedIsEmpty = true;
    }
    if (p1N) {
      self.getUpdateDoc(0, p1N, checkedCurrs, checkedTargs, updateDoc, checkedIsEmpty);
    }
    if (p2N) {
      self.getUpdateDoc(1, p2N, checkedCurrs, checkedTargs, updateDoc, checkedIsEmpty);
    }
    if (checkedIsEmpty) {
      // return alert('All assessment maturity practices need to be answered.  See highlighted practices in yellow.');
      self.setState({alertMsg: 'All assessment maturity practices need to be answered. See highlighted practices in yellow.', showConfirmModal: true});
      return;
    }
    if (_.isEmpty(self.props.assessDraft)) {
      var req = api.addAssessment(updateDoc);
    } else {
      updateDoc['_id'] = self.props.assessDraft._id;
      req = api.updateAssessment(updateDoc);
    }
    req.then(function(result){
      if (_.isEmpty(self.props.assessDraft)) {
        self.props.loadDetailTeam.assessments.unshift(result);
      } else {
        self.props.loadDetailTeam.assessments[0] = result;
      }
      self.props.updateAssessmentSummary();
      // self.props.hideAssessmentPopover();
      // alert('Maturity assessment has been submitted.');
      $('#submittedMatAssessment').show();
      return;
    }).catch(function(err){
      alert(err);
      return;
    });
  },

  saveDraft: function() {
    var self = this;
    var assessType = $('#assessmentTeamTypeSelector').val();
    var software = $('#assessmentSoftwareTypeSelector').val();
    // var assessId = self.props.assessmentStatus.assessId;
    var teamId = self.props.loadDetailTeam.team._id;
    if ($('#assessmentSubmitDateTitle').html() == 'On Submission') {
      var submittedDate = ''
    } else {
      submittedDate = new Date(moment($('#assessmentSubmitDateTitle').html(), 'DD MMM YYYY'));
    }
    var updateDoc = {
      'assessmentStatus' : 'Draft',
      'version' : newestTemplateVersion,
      'type' : assessType,
      'deliversSoftware' : false,
      'componentResults' : [],
      'actionPlans': [],
      'teamId': teamId,
      'submittedDate': submittedDate
    }
    updateDoc.componentResults.push(JSON.parse(JSON.stringify(templates[newestTemplateVersion][assessType])));
    var p1N = updateDoc.componentResults[0].practiceNumber;
    if (software == 'Yes') {
      updateDoc['deliversSoftware'] = true;
      updateDoc.componentResults.push(JSON.parse(JSON.stringify(templates[newestTemplateVersion]['Delivery'])));
      var p2N = updateDoc.componentResults[1].practiceNumber;
    }
    var checkedCurrs = $('.iradio_square-blue.curr.checked > input');
    var checkedTargs = $('.iradio_square-blue.targ.checked > input');
    if (p1N) {
      self.getUpdateDoc(0, p1N, checkedCurrs, checkedTargs, updateDoc);
    }
    if (p2N) {
      self.getUpdateDoc(1, p2N, checkedCurrs, checkedTargs, updateDoc);
    }
    if (_.isEmpty(self.props.assessDraft)) {
      var req = api.addAssessment(updateDoc);
    } else {
      updateDoc['_id'] = self.props.assessDraft._id;
      req = api.updateAssessment(updateDoc);
    }
    req.then(function(result){
      if (_.isEmpty(self.props.assessDraft)) {
        self.props.loadDetailTeam.assessments.unshift(result);
      } else {
        self.props.loadDetailTeam.assessments[0] = result;
      }
      self.props.updateAssessmentSummary();
      // self.props.hideAssessmentPopover();
      // alert('Maturity assessment has been saved as draft.');
      $('#saveDraftConfirm').show();
      return;
    }).catch(function(err){
      alert(err);
      return;
    });
  },
  showConfirm: function (id) {
    $('#' + id).show();
  },
  cancelAssessment: function() {
    $('#cancelAssessDraftConfirm').hide();
    this.props.updateAssessmentPopover();
    // if(confirm('You have requested to cancel all changes you made on this draft assessment.  All changes will be removed. Please confirm that you want to proceed with this cancel changes.')){
    //   this.props.updateAssessmentPopover();
    //   alert('Current changes have been cancelled.');
    // }
  },

  deleteAssessment: function() {
    var self = this;
    $('#deleteAssessDraftConfirm').hide();
    if (_.isEmpty(self.props.assessDraft) || self.props.assessDraft.assessmentStatus != 'Draft') {
      self.setState({alertMsg: 'This assessment draft hasn\'t been saved, there is no necessary to delete it.', showConfirmModal: true});
    } else {
      api.deleteAssessment(self.props.assessDraft._id)
        .then(function(result){
          _.find(self.props.loadDetailTeam.assessments, function(assess, idx){
            if (assess._id.toString() == self.props.assessDraft._id.toString()) {
              return self.props.loadDetailTeam.assessments.splice(idx, 1);
            }
          })
          self.props.updateAssessmentSummary();
          self.props.hideAssessmentPopover();
          // alert('Your assessment draft has been deleted.');
          return;
        })
        .catch(function(err){
          console.log(err);
          return;
        });
    }
    // if (_.isEmpty(self.props.assessDraft) || self.props.assessDraft.assessmentStatus != 'Draft') {
    //   alert('This assessment draft hasn\'t been saved, there is no necessary to delete it.');
    // } else {
    //   if(confirm('You have requested to delete this draft assessment.  All saved progress will be deleted. Please confirm that you want to proceed with this delete.')){
    //     api.deleteAssessment(self.props.assessDraft._id)
    //       .then(function(result){
    //         _.find(self.props.loadDetailTeam.assessments, function(assess, idx){
    //           if (assess._id.toString() == self.props.assessDraft._id.toString()) {
    //             return self.props.loadDetailTeam.assessments.splice(idx, 1);
    //           }
    //         })
    //         self.props.updateAssessmentSummary();
    //         self.props.hideAssessmentPopover();
    //         alert('Your assessment draft has been deleted.');
    //         return;
    //       })
    //       .catch(function(err){
    //         console.log(err);
    //         return;
    //       });
    //   }
    //   else{
    //     return false;
    //   }
    // }
  },

  getUpdateDoc: function(index, countArray, checkedCurrs, checkedTargs, updateDoc, checkedIsEmpty) {
    var self = this;
    var count = 0;
    var totalCurrScore = 0;
    var totalTargScore = 0;
    for (var i = 0; i < countArray.length; i++) {
      for (var j = 0; j < countArray[i]; j++) {
        var chId = 'atma_' + index + '_prin_' + i + '_prac_' + j;
        var currScore = self.getPointById(chId, checkedCurrs);
        updateDoc.componentResults[index].assessedComponents[count].currentLevelName = currScore.levelName;
        updateDoc.componentResults[index].assessedComponents[count].currentScore = currScore.score;
        var targetScore = self.getPointById(chId, checkedTargs);
        updateDoc.componentResults[index].assessedComponents[count].targetLevelName = targetScore.levelName;
        updateDoc.componentResults[index].assessedComponents[count].targetScore = targetScore.score;
        var improveDescription = self.getComments(chId);
        updateDoc.componentResults[index].assessedComponents[count].improveDescription = improveDescription;
        if (improveDescription != '') {
          var actionPlan = {
            'actionPlanId' : updateDoc.actionPlans.length,
            'isUserCreated': false,
            'componentName': updateDoc.componentResults[index].componentName,
            'principleId': updateDoc.componentResults[index].assessedComponents[count].principleId,
            'principleName': updateDoc.componentResults[index].assessedComponents[count].principleName,
            'practiceId': updateDoc.componentResults[index].assessedComponents[count].practiceId,
            'practiceName': updateDoc.componentResults[index].assessedComponents[count].practiceName,
            'improveDescription': improveDescription,
            'currentScore': currScore.score,
            'targetScore': targetScore.score,
            'progressSummary': '',
            'keyMetric': '',
            'actionStatus': 'Open'
          }
          updateDoc.actionPlans.push(actionPlan);
        }
        if (checkedIsEmpty==true && (currScore.score == 0 || targetScore.score == 0)) {
          $('#' + chId + ' > a').css('background', 'yellow');
        }
        totalCurrScore = totalCurrScore + currScore.score;
        totalTargScore = totalTargScore + targetScore.score;
        count ++ ;
      }
    }
    if (count > 0) {
      updateDoc.componentResults[index].currentScore = totalCurrScore / parseFloat(count);
      updateDoc.componentResults[index].targetScore = totalTargScore / parseFloat(count);
    }
  },

  getPointById: function(chId, chArray) {
    var pt = 0;
    var chValue = '';
    var chElement = _.find(chArray, function(ch){
      if (ch.name.indexOf(chId) >= 0) {
        return ch;
      }
    });
    if (chElement !== undefined && chElement.value !== undefined) {
      chValue = chElement.value;
      switch(chElement.value) {
        case 'Initiating':
          pt = 1;
          break;
        case 'Practicing':
          pt = 2;
          break;
        case 'Transforming':
          pt = 3;
          break;
        case 'Scaling':
          pt = 4;
      }
    }
    return {
      'levelName': chValue,
      'score': pt
    };
  },

  getComments: function(chId) {
    var chElementId = chId + '_action';
    return $('#' + chElementId).val();
  },

  hideConfirmDialog: function() {
    this.setState({showConfirmModal: false, alertMsg: ''});
  },

  render: function() {
    var self = this;
    var spanStyle = {
      float: 'left',
      display: 'block'
    };

    var statusColor = { color : 'blue'};

    if(_.isEmpty(this.props.assessDraft)) {
      var isVisible = { display: 'none'};
      var status = '';
    } else {
      isVisible = { display: 'block'};
      status = this.props.assessDraft.assessmentStatus;
    }

    return (
      <div class='assessment-btns'>
        <div class='status-bar' style={isVisible}>
          <span>
            Team assessment status: <span style={statusColor}>{status}</span>
          </span>
        </div>
        <div class='btn-row'>
          <div class='btn-col' style={{'marginLeft':'0'}}>
            <button type='button' id='saveAssessBtn' class='ibm-btn-sec ibm-btn-blue-50' name='saveAssessBtn' disabled={this.props.haveAccess} onClick={this.saveDraft}>{'Save Draft'}</button>
          </div>
          <div class='btn-col'>
            <button type='button' id='submitAssessBtn' class='ibm-btn-pri ibm-btn-blue-50' name='submitAssessBtn' disabled={this.props.haveAccess} onClick={this.submitAssess}>{'Submit'}</button>
          </div>
          <div class='btn-col'>
            <button type='button' id='cancelAssessBtn' class='ibm-btn-sec ibm-btn-blue-50' name='cancelAssessBtn' disabled={this.props.haveAccess} onClick={this.showConfirm.bind(null, 'cancelAssessDraftConfirm')}>{'Reset'}</button>
          </div>
          <div class='delete-col' onClick={this.showConfirm.bind(null, 'deleteAssessDraftConfirm')}>
            <div class='delete-img'>
              <InlineSVG src={require('../../../img/Att-icons/att-icons_delete.svg')}></InlineSVG>
            </div>
            <h1>{'Delete Assessment Draft'}</h1>
          </div>
          <span id='progressIndicatorTop'></span>
        </div>
        <ConfirmPopover confirmClick={this.cancelAssessment} confirmId='cancelAssessDraftConfirm' content={'You have requested to reset all changes you made on this draft assessment.  All changes will be removed. Please confirm that you want to proceed with this reset changes.'} cancelBtn='block' confirmBtn='block' okBtn='none'/>
        <ConfirmPopover confirmClick={this.deleteAssessment} confirmId='deleteAssessDraftConfirm' content={'You have requested to delete this draft assessment.  All saved progress will be deleted. Please confirm that you want to proceed with this delete.'} cancelBtn='block' confirmBtn='block' okBtn='none'/>
        <ConfirmPopover confirmId='saveDraftConfirm' content={'Maturity assessment has been saved as draft.'} cancelBtn='none' confirmBtn='none' okBtn='block' hideAssessmentPopover={this.props.hideAssessmentPopover}/>
        <ConfirmPopover confirmId='submittedMatAssessment' content={'Maturity assessment has been submitted.'} cancelBtn='none' confirmBtn='none' okBtn='block' hideAssessmentPopover={this.props.hideAssessmentPopover}/>
        <ConfirmDialog showConfirmModal={self.state.showConfirmModal} hideConfirmDialog={self.hideConfirmDialog} confirmAction={self.hideConfirmDialog} alertType='error' content={self.state.alertMsg} actionBtnLabel='Ok' />
      </div>
    )
  }
});

module.exports = AssessmentButtons;
