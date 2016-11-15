var React = require('react');
var SquadDropdown = require('./TeamDropdown.jsx');
var IterationDropdown = require('./IterationDropdown.jsx');
var DatePicker = require('react-datepicker');
var api = require('../api.jsx');
require('react-datepicker/dist/react-datepicker.css');
var moment = require('moment');
var readonlyMsg = 'You have view-only access for the selected team (to update a team, you must be a member or a member of its parent team)';

var IterationMgmt = React.createClass({
  getInitialState: function() {
    return {
      enableFields: false,
      enableIter: false,
      selectedTeam: '',
      iterationName: '',
      iterationStartDate: null,
      iterationEndDate: null,
      hideMsg: true
    }
  },

  componentWillMount: function() {
    this.setState({selectedTeam: this.props.iteration.teamId});
  },

  teamSelectOnChange: function(e) {
    var self = this;
    var selected = e.target.value;
    api.isUserAllowed(selected)
      .then(function(result) {
        self.props.enableFormFields(result);
        self.setState({
          enableIter: true,
          iterationName: '',
          iterationStartDate: null,
          iterationEndDate: null,
          hideMsg: result});
        if (!_.isEmpty(selected)){
          if (result){
            self.refs.iterList.retrieveIterations(selected, null, result, ['new', 'Create new...']);
          }
          else{
            self.refs.iterList.retrieveIterations(selected, null, result, ['', 'Select one']);
          }
        }
    });    
    self.props.iteration.teamId = selected;
  },

  nameChange: function(e){
    this.props.iteration.name = e.target.value;
    this.setState({iterationName : e.target.value});
  },

  startDateChange: function(date){
    this.props.iteration.startDate = moment(date).format('MM/DD/YYYY');
    this.setState({iterationStartDate : date});
  },

  endDateChange: function(date){
    this.props.iteration.endDate = moment(date).format('MM/DD/YYYY');
    this.setState({iterationEndDate : date});
  },

  initTeamIterations: function(teamId, selected, state, firstEntry){
    //this.setState({enableIter: true});
    this.refs.iterList.retrieveIterations(teamId, selected, state, firstEntry);
  },

  populateForm: function(data, state){
    if (data != undefined && data != null){
      this.setState({
        selectedTeam: data.teamId,
        iterationName: data.name,
        iterationStartDate: moment(data.startDate),
        iterationEndDate: moment(data.endDate),
        enableFields: state, 
        enableIter: true
      });
    }
    else {
      this.setState({
        iterationName: '',
        iterationStartDate: null,
        iterationEndDate: null
      });
    }
  },

  enableFormFields: function(state){
    this.setState({enableFields: state, hideMsg: state});
  },

  getTeamInfo: function(){
    var team = this.refs.squadList.getTeamInfo();
    return team;
  },

  render: function() {
    var labelStyle = {
      'lineHeight': '20px',
      'width': '240px'
    };
    var spacing = {
      'marginBottom':'10px'
    };

    var msgSpacing = {
      'paddingLeft':'5%'
    };

    return (
      <div>
        <div style={spacing}>
          <label style={labelStyle} for='teamSelectList'>Select an existing squad team:<span className='ibm-required'>*</span></label>
            <span>
              <SquadDropdown teamChangeHandler={this.teamSelectOnChange} enableFormFields={this.props.enableFormFields} ref='squadList' selectedTeam={this.state.selectedTeam} selectedTeamInfo={this.props.selectedTeamInfo}/>
           </span>
        </div>
        {!this.state.hideMsg ? <div className="agile-read-only-status ibm-item-note-alternate" style={msgSpacing} id='userEditMsg'>{readonlyMsg}</div>:null}
        <div style={spacing}>
          <label style={labelStyle} for='iterationSelectList'>Iteration number/identifier:<span className='ibm-required'>*</span></label>
            <span>
              <IterationDropdown enableFields={this.state.enableIter} enableFormFields={this.props.enableFormFields} ref='iterList' updateForm = {this.props.updateForm} iteration={this.props.iteration}/>
            </span>
        </div>
        <div id='newIterationNameSection' style={spacing}>
          <label style={labelStyle} for='iterationName'>&nbsp;<span className='ibm-access'>Iteration number/identifier</span></label>
          <span>
            <input type='text' name='iterationName' id='iterationName' size='44' value={this.state.iterationName} placeholder='Iteration number/identifier' disabled={!this.state.enableFields} onChange={this.nameChange} className='iterationField'/>
          </span>
        </div>
        <div style={spacing}>
          <label style={labelStyle} for='iterationStartDate'>Iteration start date:<span className='ibm-required'>*</span></label>
          <span>
            <DatePicker selected={this.state.iterationStartDate} onChange={this.startDateChange} name='iterationStartDate' id='iterationStartDate' size='44' value={this.state.iterationStartDate} disabled={!this.state.enableFields} placeholderText='Iteration start date' className='iterationField'/>
          </span>
        </div>
        <div style={spacing}>
          <label style={labelStyle} for='iterationEndDate'>Iteration end date:<span className='ibm-required'>*</span></label>
          <span>
            <DatePicker selected={this.state.iterationEndDate} onChange={this.endDateChange} name='iterationEndDate' id='iterationEndDate' size='44' value={this.state.iterationEndDate} disabled={!this.state.enableFields} placeholderText='Iteration end date' className='iterationField'/>
          </span>
        </div>
        <div className='ibm-rule ibm-gray-80'>
          <hr/>
        </div>
      </div>
    )
  }
});

module.exports = IterationMgmt;
