var React = require('react');
var SquadDropdown = require('./TeamDropdown.jsx');
var IterationDropdown = require('./IterationDropdown.jsx');
var DatePicker = require('react-datepicker');
var Tooltip = require('react-tooltip');
var api = require('../api.jsx');
var moment = require('moment');
var Dropdown = require('./Dropdown.jsx');
var dropList = [];
dropList.push({id:true, name: 'Yes'});
dropList.push({id:false, name: 'No'});

var readonlyMsg = 'You have view-only access for the selected team (to update a team, you must be a member or a member of its parent team)';

var memberCountTT = "Number of unique team members supporting this iteration.  The default is derived based on the team's current makeup and can be overridden by user input. This count is used to compute the iteration's FTE value and the 2 Pizza Rule metric results.";

var fteThisiterationTT = "FTE (Full-time Equivalent) is sum of all Team Member allocation percentages divided by number of unique Team Members.  The default is derived based on the current team's makeup and can be overridden by user input.  This value is used to compute the iteration's Unit Cost values";

var refreshFTETT = 'Clicking this ICON will replace the team member count and the FTE value with current values from the Team Information area on the Home page.';

var teamChangeListTT = 'Indicate if there was a change to the team\'s makeup during this iteration.  Changes might include adding/replacing/removing members or member allocation percentage updates that you feel are significant.  Indicating that a team change occurred might help to explain higher/lower team productivity when compared to other iterations.';


var IterationMgmt = React.createClass({
  getInitialState: function() {
    return {
      iterationStartDate: null,
      iterationEndDate: null
    }
  },

  teamSelectOnChange: function(teamId, userAllowed) {
    var self = this;
    self.props.updateField('teamId',teamId);
    if (!_.isEmpty(teamId)){
      this.props.teamReset(teamId);
      this.refs.iterList.retrieveIterations(teamId, null);
      this.props.readOnlyAccess(!userAllowed);
    }
    else {
      this.props.teamReset(teamId);
    }
  },

  nameChange: function(e){
    this.props.updateField('name',e.target.value);
    if(!_.isEmpty(e.target.value)){
      this.props.clearError('iterationName');
    }
  },

  nameBlur: function(e){
    if(!_.isEmpty(e.target.value) && (_.isEmpty(this.props.iteration._id) || this.props.iteration._id === 'new')){
      this.props.updateAllocation();
    }
  },

  startDateChange: function(date){
    var selectedStartDate = moment.utc(date);
    var selectedEndDate = moment.utc(this.props.iteration.endDate);
    if (selectedStartDate <= selectedEndDate) {
      this.props.clearError('iterationStartDate');
      this.props.clearError('iterationEndDate');
    }

    selectedEndDate = selectedStartDate.add(13,'day');
    var obj = {};
    obj.startDate = new Date(date);
    obj.endDate = new Date(selectedEndDate);
    this.props.updateFields(obj);

    //this.props.defectBal();
  },

  endDateChange: function(date){
    var selectedStartDate = moment.utc(this.props.iteration.startDate);
    var selectedEndDate = moment.utc(date);
    if (selectedEndDate >= selectedStartDate) {
      this.props.clearError('iterationStartDate');
      this.props.clearError('iterationEndDate');
    }
    this.props.updateField('endDate', new Date(date));
  },

  initTeamIterations: function(teamId, selected, state, firstEntry){
    this.refs.iterList.retrieveIterations(teamId, selected, state, firstEntry);
  },

  defaultDate: function(date){
    var result = null;
    if (!_.isNull(date) && !_.isEmpty(date)){
      result = moment.utc(date);
    }
    return result;
  },

  getTeamInfo: function(){
    var team = this.refs.squadList.getTeamInfo();
    return team;
  },

  memberCountChange: function(e){
    this.props.updateField('memberCount',e.target.value);
  },

  fteThisiterationChange: function(e){
    this.props.updateField('memberFte',e.target.value);
  },

  fteThisiterationUpdate: function(e){
    var ftes = this.floatDefault(e.target.value).toFixed(1);
    this.props.updateField('memberFte',ftes);
  },

  numericValue:function(data) {
    var value = parseInt(data);
    if (!isNaN(value)) {
      return value;
    }
    else {
      return 0;
    }
  },

  floatDefault:function(num) {
    var value = parseFloat(num);
    if (!isNaN(value)) {
      return value;
    }
    else {
      return 0;
    }
  },

  teamMemCount: function () {
    var count = 0;
    var currentTeam = this.getTeamInfo();
    if (!_.isEmpty(currentTeam) && currentTeam.members) {
      count = currentTeam.members.length;
    }
    return count;
  },

  teamMemFTE: function () {
    var fte = 0.0;
    var currentTeam = this.getTeamInfo();
    if (!_.isEmpty(currentTeam) && currentTeam.members) {
      var teamCount = 0;
      var self = this;
      _.each(currentTeam.members, function(member) {
        teamCount += self.numericValue(member.allocation);
      });
      fte = parseFloat(teamCount / 100).toFixed(1);
    }
    return fte;
  },

  refreshFTE: function () {
    var tmc = this.teamMemCount();
    var fte = this.teamMemFTE();
    if (confirm('You are about to overwrite the contents of these fields with ' + tmc + ' and ' + fte + ' respectively.  Do you want to continue?')){
      this.refFTECount(tmc, fte);
    }
  },

  refFTECount: function (tmc, fte) {
    this.props.updateAllocation();
    this.props.processIteration();
  },

  paste:function(e) {
    e.preventDefault();
  },

  decimalNumCheck:function(e) {
    var pattern = /^\d*[.]?\d*$/;
    if (e.charCode >= 32 && e.charCode < 127 &&  !pattern.test(e.target.value + String.fromCharCode(e.charCode)))
    {
      e.preventDefault();
    }
  },

  render: function() {
    var labelStyle = {
      'width': '218px'
    };
    var labelStyle2 = {
      'width': '170px'
    };

    var msgSpacing = {
      'paddingLeft':'5%'
    };

    var linkStyle = {
      'position': 'relative',
      'top': '-10px',
      'left': '3px',
      'display': 'inline'
    };

    var linkStyle2 = {
      'position': 'relative',
      'top': '3px',
      'left': '5px',
      'display': (!this.props.isReadOnly && !_.isEmpty(this.props.iteration.teamId)) ? 'inline':'none',
      'cursor': 'pointer'
    };

    return (
      <div>
        <Tooltip id='commTT'/>
        <div className='iteration'>
            <label style={labelStyle} for='teamSelectList'>Select an existing squad team:<span className='ibm-required'>*</span></label>
            <span>
              <SquadDropdown teamChangeHandler={this.teamSelectOnChange} ref='squadList' selectedTeamInfo={this.props.selectedTeamInfo} readOnlyAccess={this.props.readOnlyAccess} iteration={this.props.iteration} teamReset={this.props.teamReset}/>
            </span>
        </div>
        {this.props.isReadOnly ? <div className="agile-read-only-status ibm-item-note-alternate" style={msgSpacing} id='userEditMsg'>{readonlyMsg}</div>:null}
        <div className='iteration'>
            <label style={labelStyle} for='iterationSelectList'>Iteration number/identifier:<span className='ibm-required'>*</span></label>
            <span>
              <IterationDropdown ref='iterList' updateForm={this.props.updateForm} iteration={this.props.iteration} updateField={this.props.updateField} isReadOnly={this.props.isReadOnly} teamReset={this.props.teamReset}/>
            </span>
        </div>
        <div className='iteration'>
          <label style={labelStyle} for='iterationName'>&nbsp;<span className='ibm-access'>Iteration number/identifier</span></label>
          <span>
            <input type='text' name='iterationName' id='iterationName' size='44' value={this.props.iteration.name} placeholder='Iteration number/identifier' disabled={!this.props.enableFields} onChange={this.nameChange} onBlur={this.nameBlur} className='iterationField'/>
          </span>
        </div>
        <div className='iteration'>
          <div>
            <label style={labelStyle} for='iterationStartDate'>Iteration start date:<span className='ibm-required'>*</span></label>
            <span>
              <DatePicker selected={this.props.iteration.startDate != null? moment.utc(this.props.iteration.startDate):null} readOnly dateFormat='DDMMMYYYY' onChange={this.startDateChange} name='iterationStartDate' id='iterationStartDate' disabled={!this.props.enableFields} placeholderText='Iteration start date' className='iterationField-2' ref='iterationStartDate' fixedHeight/>
            </span>
          </div>
          <div>
            <label for='iterationEndDate' style={labelStyle2}>Iteration end date:<span className='ibm-required'>*</span></label>
            <span>
              <DatePicker selected={this.props.iteration.endDate != null ? moment.utc(this.props.iteration.endDate): null} readOnly dateFormat='DDMMMYYYY' onChange={this.endDateChange} name='iterationEndDate' id='iterationEndDate' disabled={!this.props.enableFields} placeholderText='Iteration end date' className='iterationField-2' ref='iterationEndDate' fixedHeight/>
            </span>
          </div>
        </div>
        <div className='iteration'>
          <div className='iteration-sm'>
            <label for='memberCount' style={labelStyle}>Team members this iteration:<span className='ibm-required'></span>
              <a className='ibm-information-link' style={linkStyle} data-tip={memberCountTT}/>
            </label>
            <span>
              <input type='text' name='memberCount' id='memberCount' size='8' value={this.props.iteration.memberCount != null ?this.props.iteration.memberCount:''} placeholder='0' className='inputCustom' onChange={this.memberCountChange} disabled={!this.props.enableFields} onKeyPress={this.wholeNumCheck} onPaste={this.paste}/>
              <a className='ibm-refresh-link' style={linkStyle2} role='button' onClick={this.refreshFTE} data-tip={refreshFTETT}/>
            </span>
          </div>
          <div>
            <label for='fteThisiteration' style={labelStyle2}>FTE this iteration:<span className='ibm-required'></span>
            <a className='ibm-information-link' style={linkStyle} data-tip={fteThisiterationTT}/>
            </label>
            <span>
              <input type='text' name='fteThisiteration' id='fteThisiteration' size='8' value={this.props.iteration.memberFte != null?this.props.iteration.memberFte:''} placeholder='0.0' className='inputCustom' onChange={this.fteThisiterationChange} disabled={!this.props.enableFields} onKeyPress={this.decimalNumCheck} onBlur={this.fteThisiterationUpdate} onPaste={this.paste}/>
            </span>
          </div>

        </div>
        <div className='iteration'>
          <div>
            <label for='teamChangeList' style={labelStyle}>Was there a team change?
              <a className='ibm-information-link' id='teamChangeListTT' style={linkStyle} data-tip={teamChangeListTT}></a>
            </label>
            <span>
              <Dropdown selectionList={dropList} id='teamChangeList' name='teamChangeList' enableFields={this.props.enableFields} iteration={this.props.iteration} updateField={this.props.updateField}/>
            </span>
          </div>
        </div>
        <div className='ibm-rule ibm-gray-80'>
          <hr/>
        </div>
      </div>
    )
  }
});

module.exports = IterationMgmt;
