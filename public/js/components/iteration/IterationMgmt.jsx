var React = require('react');
var SquadDropdown = require('../team/TeamDropdown.jsx');
var IterationDropdown = require('./IterationDropdown.jsx');
var DatePicker = require('react-datepicker');
var api = require('../api.jsx');
require('react-datepicker/dist/react-datepicker.css');
var moment = require('moment');

var IterationMgmt = React.createClass({
  getInitialState: function() {
    return {
      enableFields: false,
      iteration: {},
      selectedTeam: '',
      iterationName: '',
      iterationStartDate: null,
      iterationEndDate: null
    }
  },

  teamSelectOnChange: function(e) {
    var selected = e.target.value;
    if (selected != ''){
      this.setState({enableFields: true, selectedTeam: selected});
      this.refs.iterList.retrieveIterations(selected);
      this.props.enableFormFields(true);
    }
    else {
      this.setState({enableFields: false});
      this.props.enableFormFields(false);
    }
    this.props.iteration.teamId = selected;
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

  populateForm: function(data){
    if (data != undefined && data != null){
      this.props.iteration.startDate = data.startDate;
      this.props.iteration.endDate = data.endDate;
      this.setState({
        iterationName: data.name,
        iterationStartDate: moment(data.startDate),
        iterationEndDate: moment(data.endDate)
      });
    }
    else {
      this.props.iteration.name = '';
      this.props.iteration.startDate = null;
      this.props.iteration.endDate = null;
      this.setState({
        iterationName: '',
        iterationStartDate: null,
        iterationEndDate: null
      });
      
    }
    this.props.updateForm(data);
  },

  render: function() {
    var labelStyle = {
      'lineHeight': '20px',
      'width': '240px'
    };
    var spacing = {
      'marginBottom':'10px'
    };

    return (
      <div>
        <div style={spacing}>
          <label style={labelStyle} for='teamSelectList'>Select an existing squad team:<span className='ibm-required'>*</span></label>
            <span>
              <SquadDropdown teamChangeHandler={this.teamSelectOnChange}/>
           </span>
        </div>
        <div style={spacing}>
          <label style={labelStyle} for='iterationSelectList'>Iteration number/identifier:<span className='ibm-required'>*</span></label>
            <span>
              <IterationDropdown enableFields={this.state.enableFields} ref='iterList' updateForm = {this.populateForm} iteration={this.props.iteration}/>
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
