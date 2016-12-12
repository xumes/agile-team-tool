var React = require('react');
var api = require('../api.jsx');
var templates = require('./AssessmentUpdateDocs.jsx');
var _ = require('underscore');
var newestTemplateVersion = 'ag_ref_atma_components_v06';

var AssessmentButtons = React.createClass({
  componentDidMount: function() {

  },

  submitAssess: function() {
    var self = this;
    var assessType = $('#teamTypeSelectList').val();
    var software = $('#softwareYesNo').val();
    //var assessId = self.props.assessmentStatus.assessId;
    var teamId = $('select[name=\'teamSelectList\']').val();
    var submittedDate = $('#submitDatePicker').val();
    if ($('#submitDatePicker').val() == '') {
      var submittedDate = ''
    } else {
      submittedDate = new Date(submittedDate);
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
      return alert('All assessment maturity practices need to be answered.  See highlighted practices in yellow.');
    }
    if (_.isEmpty(self.props.assessment.assessment)) {
      var req = api.addAssessment(updateDoc);
    } else {
      updateDoc['_id'] = self.props.assessment.assessment._id;
      req = api.updateAssessment(updateDoc);
    }
    req.then(function(result){
      alert('Maturity assessment has been submitted.');
      $('select[name=\'teamSelectList\']').val(self.props.assessment.teamId).change();
      setTimeout(function(){
        console.log(result._id);
        $('select[name=\'assessmentSelectList\']').val(result._id).change();
      },1500);

      return;
    }).catch(function(err){
      alert(err);
      return;
    });
  },

  saveDraft: function() {
    var self = this;
    var assessType = $('#teamTypeSelectList').val();
    var software = $('#softwareYesNo').val();
    // var assessId = self.props.assessmentStatus.assessId;
    var teamId = $('select[name=\'teamSelectList\']').val();
    var updateDoc = {
      'assessmentStatus' : 'Draft',
      'version' : newestTemplateVersion,
      'type' : assessType,
      'deliversSoftware' : false,
      'componentResults' : [],
      'actionPlans': [],
      'teamId': teamId
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
    if (_.isEmpty(self.props.assessment.assessment)) {
      var req = api.addAssessment(updateDoc);
    } else {
      updateDoc['_id'] = self.props.assessment.assessment._id;
      req = api.updateAssessment(updateDoc);
    }
    req.then(function(result){
      alert('Maturity assessment has been saved as draft.');
      //$('select[name=\'teamSelectList\']').val(teamId).change();
      if (_.isEmpty(self.props.assessment.assessment)) {
        $('select[name=\'teamSelectList\']').val(self.props.assessment.teamId).change();
      } else {
        $('select[name=\'teamSelectList\']').val(self.props.assessment.teamId).change();
      }
      return;
    }).catch(function(err){
      alert(err);
      return;
    });
  },

  cancelAssessment: function() {
    if (this.props.assessment.assessment._id == null) {
      $('select[name="assessmentSelectList"]').val('n').change();
    } else {
      $('select[name="assessmentSelectList"]').val(this.props.assessment.assessment._id).change();
    }
    alert('Current changes have been cancelled.');
  },

  deleteAssessment: function() {
    var self = this;
    if (_.isEmpty(self.props.assessment.assessment) || self.props.assessment.assessment.assessmentStatus != 'Draft') {
      alert('This assessment cannot be deleted.');
    } else {
      if(confirm('You have requested to delete this draft assessment.  All saved progress will be deleted. Please confirm that you want to proceed with this delete.')){
        api.deleteAssessment(self.props.assessment.assessment._id)
          .then(function(result){
            // $('select[name="assessmentSelectList"] option[value=' + self.props.assessmentStatus.assessId + ']').remove();
            // $('select[name="assessmentSelectList"]').val('').change();
            $('select[name=\'teamSelectList\']').val(self.props.assessment.teamId).change();
            alert('Your assessment has been deleted.');
            return;
          })
          .catch(function(err){
            console.log(err);
            return;
          });
      }
      else{
        return false;
      }
    }
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

  render: function() {
    var spanStyle = {
      float: 'left',
      display: 'block'
    };

    var statusColor = { color : 'blue'};

    if (!this.props.assessment.access) {
      var submitBtnDisplay = true;
      var saveBtnDislpay = true;
      var deleteBtnDisplay = true;
      var cancelBtnDisplay = true;
    } else {
      if (_.isEmpty(this.props.assessment.assessment)) {
        // console.log(this.props.assessment.squadAssessments);
        if (this.props.assessment.squadAssessments.length > 0 && this.props.assessment.squadAssessments[0]['assessmentStatus'] == 'Draft') {
          submitBtnDisplay = true;
          saveBtnDislpay = true;
          deleteBtnDisplay = true;
          cancelBtnDisplay = true;
        } else {
          submitBtnDisplay = false;
          saveBtnDislpay = false;
          deleteBtnDisplay = true;
          cancelBtnDisplay = false;
        }
      } else {
        if (this.props.assessment.assessment.assessmentStatus == 'Draft') {
          submitBtnDisplay = false;
          saveBtnDislpay = false;
          deleteBtnDisplay = false;
          cancelBtnDisplay = false;
        } else {
          submitBtnDisplay = true;
          saveBtnDislpay = true;
          deleteBtnDisplay = true;
          cancelBtnDisplay = true;
        }
      }
    }

    if(_.isEmpty(this.props.assessment.assessment)) {
      var isVisible = { display: 'none'};
      var status = '';
    } else {
      isVisible = { display: 'block'};
      status = this.props.assessment.assessment.assessmentStatus;
    }

    return (
      <div>
        <div style={isVisible}>
          <span style={spanStyle}>
            Team assessment status: <span style={statusColor}>{status}</span>
          </span>
        </div>
        <div class="ibm-btn-row" style={{"textAlign": "right"}}>
          <input id='submitAssessBtn' type="button" class="ibm-btn-pri ibm-btn-small" name="submitAssessBtn" value="Submit" disabled={submitBtnDisplay} onClick={this.submitAssess}/>
          <input id='saveAssessBtn' type="button" class="ibm-btn-sec ibm-btn-small" name="saveAssessBtn" value="Save as draft" disabled={saveBtnDislpay} onClick={this.saveDraft}/>
          <input id='deleteAssessBtn' type="button" class="ibm-btn-sec ibm-btn-small" name="deleteAssessBtn" value="Delete draft" disabled={deleteBtnDisplay} onClick={this.deleteAssessment}/>
          <input id='cancelAssessBtn' type="button" class="ibm-btn-sec ibm-btn-small" name="cancelAssessBtn" value="Cancel current changes" disabled={cancelBtnDisplay} onClick={this.cancelAssessment}/>
          <span id="progressIndicatorTop"></span>
        </div>
      </div>
    )
  }
});

module.exports = AssessmentButtons;
