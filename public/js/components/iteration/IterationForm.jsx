var React = require('react');
var api = require('../api.jsx');
var Management = require('./IterationMgmt.jsx');
var Throughput = require('./IterationThroughput.jsx');
var Velocity = require('./IterationVelocity.jsx');
var Defect = require('./IterationDefect.jsx');
var Additional = require('./IterationAdditional.jsx');
var Buttons = require('./IterationButtons.jsx');
var moment = require('moment');
var initData = {
  '_id':'',
  'createDate':'',
  'createdByUserId':'',
  'createdBy':'',
  'startDate':null,
  'endDate':null,
  'name':'',
  'teamId':'',
  'memberCount':'',
  'cycleTimeInBacklog':'',
  'cycleTimeWIP':'',
  'defectsEndBal':'',
  'defectsClosed':'',
  'defects':'',
  'defectsStartBal':'',
  'memberChanged':false,
  'comment':'',
  'teamSatisfaction':'',
  'clientSatisfaction':'',
  'deployments':'',
  'storyPointsDelivered':'',
  'committedStoryPoints':'',
  'deliveredStories':'',
  'committedStories':'',
  'status':'',
  'memberFte':'',
  'docStatus':null,
  'updatedBy':'',
  'updatedByUserId':'',
  'updateDate':''
};

var invalidBorder = '#f00';
var invalidBackground = '';
var teamInfo = new Object();

var IterationForm = React.createClass({
  getInitialState: function() {
    var initIteration = _.clone(initData);
    initIteration.teamId = this.props.selectedTeam;
    initIteration._id = this.props.selectedIteration;
    return {
      enableFields: false,
      iteration: initIteration,
      addBtnDisable: true,
      updateBtnDisable: true,
      lastUpdateTimestamp: '',
      lastUpdateUser: '',
      id:'',
      selectedTeamInfo: new Object(),
      readOnlyAccess: false
    }
  },

  readOnlyAccess: function(status){
    var add = false;
    var update = false;
    if (!status) {
      if(!_.isEmpty(this.state.iteration.teamId)) {
        if (this.state.iteration._id === 'new' || _.isEmpty(this.state.iteration._id)){
          add = true;
          update = false;
        }
        else {
          add = false;
          update = true;
        }
      }
    }
    this.setState({
      readOnlyAccess: status,
      enableFields: !status,
      addBtnDisable: !add,
      updateBtnDisable: !update});
  },

  teamReset: function(teamId){
    var resetData = _.clone(initData);
    resetData.teamId = teamId;
    this.clearHighlightedIterErrors();
    var addDisable = false;
    if (_.isEmpty(teamId) || this.state.readOnlyAccess){
      addDisable = true;
    }
    this.setState({
      iteration: resetData,
      addBtnDisable: addDisable,
      updateBtnDisable: true});
  },

  populateForm: function(data){
    //populate form fields per data retrieved
    var enableStatus = !this.state.readOnlyAccess;
    var add = false;
    var update = false;
    this.clearHighlightedIterErrors();
    if (enableStatus){
      if(data != null){
        if ( data._id != 'new') {
          add = false;
          update = true;
        } else {
          add = true
          update = false;
        }
      } else {
        add = true
        update = false;
      }
    }
    if (data != undefined && data != null){
      this.setState({
        lastUpdateTimestamp: this.showDateUTC(data.updateDate),
        lastUpdateUser: data.updatedBy,
        id: data._id,
        addBtnDisable: !add,
        updateBtnDisable: !update,
        enableFields: enableStatus,
        iteration: data
      });
    } else {
      var resetData = _.clone(initData);
      this.setState({
        lastUpdateTimestamp: '',
        lastUpdateUser: '',
        id: '',
        addBtnDisable: !add,
        updateBtnDisable: !update,
        enableFields: enableStatus,
        iteration: resetData
      });
    }
    return;
  },

  showDateUTC: function(formatDate) {
    if (formatDate == null || formatDate == '' || formatDate == 'NaN')
      return 'Not available';
    var utcTime = moment.utc(formatDate).format('MMM DD, YYYY, HH:mm (z)');
    return utcTime;
  },

  updateIterationCache: function() {
    this.refs.management.initTeamIterations(this.state.iteration.teamId, this.state.iteration._id, true, ['new', 'Create new...']);
  },

  updateIterationInfo: function(action){
    var self = this;
    if (action == 'add'){
      this.setState({addBtnDisable: true});
      this.processIteration();
    }
    else if (action == 'update'){
      this.setState({updateBtnDisable: true});
      this.processIteration();
    }
    else if (action == 'clear' || action == 'clearIteration') {
      if (action == 'clear'){
        var resetData = _.clone(initData);
        this.setState({iteration:resetData, enableFields: false, readOnlyAccess: false, addBtnDisable: true, updateBtnDisable: true});
      }
      this.clearHighlightedIterErrors();
      window.scrollTo(0, 0);
    }
  },

  showMessagePopup: function(message) {
    alert(message);
  },

  handleIterationErrors:function (errorResponse, operation) {
    var errorlist = '';
    var response = errorResponse.responseJSON;

    if (response && response.error) {
      var errors = response.error.errors;
      if (errors){
        // Return iteration errors as String
        errorlist = this.getIterationErrorPopup(errors);
        if (!_.isEmpty(errorlist)) {
          this.showMessagePopup(errorlist);
          if (operation === 'add') {
            this.setState({addBtnDisable: false});
          } else if (operation === 'update') {
            this.setState({updateBtnDisable: false});
          }
        }
      }
      else {
        this.showMessagePopup(response.error);
      }
    }
},

getIterationErrorPopup: function(errors) {
  var errorLists = '';
  // Model fields/Form element field
  var fields = {
    '_id': 'iterationSelectList',
    'teamId': 'teamSelectList',
    'name': 'iterationName',
    'startDate': 'iterationStartDate',
    'endDate': 'iterationEndDate',
    'committedStories': 'commStories',
    'committedStoryPoints': 'commPoints',
    'memberCount': 'memberCount',
    'memberFte': 'fteThisiteration',
    'deliveredStories': 'commStoriesDel',
    'storyPointsDelivered': 'commPointsDel',
    'deployments': 'DeploythisIteration',
    'defectsStartBal': 'defectsStartBal',
    'defects': 'defects',
    'defectsClosed': 'defectsClosed',
    'defectsEndBal': 'defectsEndBal',
    'cycleTimeWIP': 'cycleTimeWIP',
    'cycleTimeInBacklog': 'cycleTimeInBacklog',
    'memberChanged': 'teamChangeList',
    'clientSatisfaction': 'clientSatisfaction',
    'teamSatisfaction': 'teamSatisfaction'
  };

  Object.keys(fields).forEach(function(mdlField, index) {
    var frmElement = fields[mdlField];
    if (errors[mdlField]) {
      if (frmElement) {
        setFieldErrorHighlight(frmElement);
      }
      errorLists = errorLists + errors[mdlField].message + '\n';
    } else {
      if (frmElement) {
        clearFieldErrorHighlight(frmElement);
      }
    }
  });
    return errorLists;
  },

  setFieldErrorHighlight: function (id) {
    if ($('#' + value).is('select')) {
      $($('#select2-' + id + '-container').parent()).css('border-color', invalidBorder);
      $($('#select2-' + id + '-container').parent()).css('background', invalidBackground);
    }
    else {
      $('#' + id).css('border-color', invalidBorder);
      $('#' + id).css('background', invalidBackground);
    }
  },

  clearFieldErrorHighlight: function (id) {
    if ($('#' + id).is('select')) {
      $($('#select2-' + id + '-container').parent()).css('border-color', '');
      $($('#select2-' + id + '-container').parent()).css('background', '');
    }
    else {
      $('#' + id).css('border-color', '');
      $('#' + id).css('background', '');
    }
  },

  clearHighlightedIterErrors: function () {
    var fields = [
      'teamSelectList',
      'iterationName',
      'iterationStartDate',
      'iterationEndDate',
      'commStories',
      'commPoints',
      'memberCount',
      'fteThisiteration',
      'commStoriesDel',
      'commPointsDel',
      'DeploythisIteration',
      'defectsStartBal',
      'defects',
      'defectsClosed',
      'defectsEndBal',
      'cycleTimeWIP',
      'cycleTimeInBacklog',
      'teamChangeList',
      'commentIter',
      'clientSatisfaction',
      'teamSatisfaction'
    ];

    for (j = 0; j < fields.length; j++) {
      clearFieldErrorHighlight(fields[j]);
    }
  },

  processIteration: function () {
    var self =this;
    api.loadTeam(self.state.iteration.teamId)
    .then(function(data) {
      if (data != undefined) {
        var jsonData = data;
        if (jsonData.type != undefined && jsonData.type.toLowerCase() != 'squad') {
          self.showMessagePopup('Team information has been changed to non squad.  Iteration information cannot be entered for non squad teams.');
          //loadAgileTeams('new', '');
          self.updateIterationInfo('clearIteration');
          return;
        }

        if(_.isEmpty(self.state.iteration._id) || self.state.iteration._id === 'new'){
          api.addIteration(self.state.iteration)
          .then(function(result) {
            self.setState({iteration: result});
            self.clearHighlightedIterErrors();
            self.showMessagePopup('You have successfully added Iteration information.');
            self.updateIterationCache();
          })
          .catch(function(err){
            self.handleIterationErrors(err, 'add');
          });
        }
        else {
          api.updateIteration(self.state.iteration)
          .then(function(result) {
            self.clearHighlightedIterErrors();
            self.showMessagePopup('You have successfully updated Iteration information.');
            self.updateIterationCache();
          })
          .catch(function(err){
            self.handleIterationErrors(err, 'update');
          });
        }
      }
    });
  },

  updateField: function(field, value){
    var copy = _.clone(this.state.iteration);
    copy[field] = value;
    this.setState({iteration:copy});
  },

  getDefectsStartBalance: function () {
    this.refs.defect.getDefectsStartBalance();
  },

  updateAllocation: function () {
    var memCnt = this.refs.management.teamMemCount();
    var memFte = this.refs.management.teamMemFTE();
    var copy = _.clone(this.state.iteration);
    copy['memberCount'] = memCnt;
    copy['memberFte'] = memFte;
    this.setState({iteration:copy});
  },

  updateFields: function(result){
    var copy = _.clone(this.state.iteration);
    _.each(result, function(value, key){
      copy[key] = value;
    });

    this.setState({iteration:copy});
  },

  render: function() {

    var subStyle = {
      'width': '410px'
    };
    var subStyle2 = {
      'width': '730px'
    };

    return (
      <form className='ibm-column-form'>
        <Management updateForm={this.populateForm} enableFields={this.state.enableFields}  ref='management' iteration={this.state.iteration} updateField={this.updateField} readOnlyAccess={this.readOnlyAccess} isReadOnly={this.state.readOnlyAccess} clearError={this.clearFieldErrorHighlight} defectBal={this.getDefectsStartBalance} teamReset={this.teamReset} updateAllocation={this.updateAllocation} processIteration={this.processIteration} updateFields={this.updateFields}/>

        <Throughput enableFields={this.state.enableFields} ref='throughput' iteration={this.state.iteration}  updateField={this.updateField}/>

        <Velocity enableFields={this.state.enableFields} ref='velocity' iteration={this.state.iteration} updateField={this.updateField}/>

        <Defect enableFields={this.state.enableFields} ref='defect' iteration={this.state.iteration} updateField={this.updateField} updateDefectBal={this.updateFields} isReadOnly={this.state.readOnlyAccess}/>

        <Additional enableFields={this.state.enableFields} ref='additional' iteration={this.state.iteration} updateField={this.updateField} clearError={this.clearFieldErrorHighlight}/>

        <Buttons ref='buttons' iteration={this.state.iteration} parentUpdate= {this.updateIterationInfo} addBtnDisable={this.state.addBtnDisable} updateBtnDisable={this.state.updateBtnDisable}/>

        <h2 className='ibm-bold ibm-h4'>Last update</h2>
        <div className='ibm-rule ibm-alternate-1'>
          <hr/>
        </div>
        <div>
          <span>
            Last update:<span  id='lastUpdateTimestamp'>{this.state.lastUpdateTimestamp}</span>&nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
            Updated by:<span  id='lastUpdateUser'>{this.state.iteration.updatedBy}</span>
          </span>
        </div>
        <div id='debugSection'>
          <label>
            <span>Doc id for this page(for SIT only):</span>
          </label>
          <span id='doc_id'>{this.state.id}</span>
        </div>
      </form>
    )
  }

});

module.exports = IterationForm;
