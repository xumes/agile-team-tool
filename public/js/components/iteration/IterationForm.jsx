var React = require('react');
var api = require('../api.jsx');
var Management = require('./IterationMgmt.jsx');
var Commitment = require('./IterationCommitment.jsx');
var Result = require('./IterationResult.jsx');
var Metrics = require('./IterationMetrics.jsx');
var Buttons = require('./IterationButtons.jsx');

var moment = require('moment');
var initData = {
'_id':'',
'createDate':'',
'createdByUserId':'',
'createdBy':'',
'startDate':'',
'endDate':'',
'name':'',
'teamId':'',
'memberCount':null,
'locationScore':null,
'cycleTimeInBacklog':null,
'cycleTimeWIP':null,
'defectsEndBal':null,
'defectsClosed':null,
'defects':null,
'defectsStartBal':null,
'memberChanged':false,
'comment':'',
'teamSatisfaction':null,
'clientSatisfaction':null,
'deployments':null,
'storyPointsDelivered':null,
'commitedStoryPoints':null,
'deliveredStories':null,
'committedStories':null,
'status':'',
'memberFte':null,
'docStatus':null,
'updatedBy':'',
'updatedByUserId':'',
'updateDate':''};

var IterationForm = React.createClass({
  getInitialState: function() {
    initData.teamId = this.props.selectedTeam;
    initData._id = this.props.selectedIteration;
    return {
      enableFields: false,
      iteration: initData,
      addBtnDisable: true,
      updateBtnDisable: true,
      lastUpdateTimestamp: '',
      lastUpdateUser: '',
      id:'',
    }
  },

  populateForm: function(data, state){
    //populate form fields per data retrieved
    this.refs.management.populateForm(data, state);
    this.refs.commitment.populateForm(data, state);
    this.refs.result.populateForm(data, state);
    this.refs.metrics.populateForm(data, state);

    if (data != undefined && data != null){
      this.setState({
        lastUpdateTimestamp: this.showDateUTC(data.updateDate),
        lastUpdateUser: data.updatedBy,
        id: data._id,
        addBtnDisable: true,
        updateBtnDisable: false,
        enableFields: true});
        this.setState({iteration: data});
    }
    else{
      this.setState({
        lastUpdateTimestamp: '',
        lastUpdateUser: '',
        id: '',
        addBtnDisable: false,
        updateBtnDisable: true,
        enableFields: true});
        this.setState({iteration: initData});
    }
    
    this.refs.buttons.enableButtons(this.state.addBtnDisable, this.state.updateBtnDisable);
  },

  enableFormFields: function(state){
    this.setState({enableFields: state});
    this.refs.commitment.enableFormFields(state);
    this.refs.result.enableFormFields(state);
    this.setState({addBtnDisable: false, updateBtnDisable: true});
    this.refs.buttons.enableButtons(this.state.addBtnDisable, this.state.updateBtnDisable);
  },

  showDateUTC: function(formatDate) {
    if (formatDate == null || formatDate == '' || formatDate == 'NaN')
      return 'Not available';
    var utcTime = moment.utc(formatDate).format('MMM DD, YYYY, HH:mm (z)');
    return utcTime;
  },

  updateIterationCache: function(iteration, selected) {
    this.refs.management.initTeamIterations(this.state.iteration.teamId, this.state.iteration._id);
  },

  updateIterationInfo: function(action){
    var self = this;
    if (action == 'add'){
      api.addIteration(self.state.iteration)
      .then(function(result) {
      //TODO add response handling
        self.setState({iteration: result});
        self.showMessagePopup('You have successfully added Iteration information.');
        self.updateIterationCache();
      });
    }
    else if (action == 'update'){
      api.updateIteration(self.state.iteration)
      .then(function(result) {
      //TODO add response handling
        self.showMessagePopup('You have successfully added Iteration information.');
        self.updateIterationCache();
      });
    }
    
  },

  loadSelectedAgileTeamIterationInfo: function(){
  var iterationId = this.state.iteration._id;
  // retrieve and load latest iteration information for the team
  $.ajax({
    type: 'GET',
    url: '/api/iteration/current/' + encodeURIComponent(iterationId)
  })
    .fail(function(xhr, textStatus, errorThrown) {
      if (xhr.status === 400) {
        errorHandler(xhr, textStatus, errorThrown);
      }
    })
    .done(function(data) {
      teamIterInfo = data;
      clearHighlightedIterErrors();
      $('#iterationSelectList').val(teamIterInfo._id);
      $('#select2-iterationSelectList-container').text($('#iterationSelectList option:selected').text());
      $('#select2-iterationSelectList-container').attr('title', $('#iterationSelectList option:selected').text());
      $('#iterationName').val(teamIterInfo.iteration_name);
      $('#iterationStartDate').val(showDateDDMMMYYYY(teamIterInfo.iteration_start_dt));
      $('#iterationEndDate').val(showDateDDMMMYYYY(teamIterInfo.iteration_end_dt));
      $('#iterationinfoStatus').val(teamIterInfo.iterationinfo_status);
      $('#commStories').val(teamIterInfo.nbr_committed_stories);
      $('#commPoints').val(teamIterInfo.nbr_committed_story_pts);
      $('#memberCount').val(teamIterInfo.team_mbr_cnt);
      $('#commStoriesDel').val(teamIterInfo.nbr_stories_dlvrd);
      $('#commPointsDel').val(teamIterInfo.nbr_story_pts_dlvrd);
      $('#storyPullIn').val(teamIterInfo.nbr_stories_pulled_in);
      $('#storyPtPullIn').val(teamIterInfo.nbr_story_pts_pulled_in);
      $('#retroItems').val(teamIterInfo.retro_action_items);
      $('#retroItemsComplete').val(teamIterInfo.retro_action_items_complete);
      $('#teamChangeList').val(teamIterInfo.team_mbr_change);
      $('#select2-teamChangeList-container').text($('#teamChangeList option:selected').text());
      $('#select2-teamChangeList-container').attr('title', $('#teamChangeList option:selected').text());
      $('#lastUpdateUser').html(teamIterInfo.last_updt_user);
      $('#lastUpdateTimestamp').html(showDateUTC(teamIterInfo.last_updt_dt));
      $('#commentIter').val(teamIterInfo.iteration_comments);
      $('#doc_id').html(teamIterInfo._id);
      if (teamIterInfo.fte_cnt != '') {
        var alloc = parseFloat(teamIterInfo.fte_cnt).toFixed(1);
        $('#fteThisiteration').val(alloc);
      }
      $('#DeploythisIteration').val(teamIterInfo.nbr_dplymnts);
      $('#defectsStartBal').val(teamIterInfo.nbr_defects_start_bal);
      $('#defectsIteration').val(teamIterInfo.nbr_defects);
      $('#defectsClosed').val(teamIterInfo.nbr_defects_closed);
      $('#defectsEndBal').val(teamIterInfo.nbr_defects_end_bal);
      $('#cycleTimeWIP').val(teamIterInfo.nbr_cycletime_WIP);
      $('#cycleTimeInBacklog').val(teamIterInfo.nbr_cycletime_in_backlog);
      $('#clientSatisfaction').val(teamIterInfo.client_sat);
      $('#teamSatisfaction').val(teamIterInfo.team_sat);
      calculateMetrics();

      if (!hasAccess(teamIterInfo.team_id)) {
        enableIterationFields(false);
      } else {
        enableIterationFields(true);
      }
    });
  },

  showMessagePopup: function(message) {
    alert(message);
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
        <Management updateForm={this.populateForm} enableFormFields={this.enableFormFields} ref='management' iteration={this.state.iteration}/>
        <Commitment updateForm={this.populateForm} enableFields={this.state.enableFields} ref='commitment' iteration={this.state.iteration}/>
        <Result updateForm={this.populateForm} enableFields={this.state.enableFields} ref='result' iteration={this.state.iteration}/>
        <Metrics updateForm={this.populateForm} ref='metrics' iteration={this.state.iteration}/>
        <Buttons ref='buttons' iteration={this.state.iteration} parentUpdate = {this.updateIterationInfo}/>
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
