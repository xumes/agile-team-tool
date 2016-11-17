var React = require('react');
var api = require('../api.jsx');
var ReactDOM = require('react-dom');

var TeamFormButtons = React.createClass({
  componentDidMount: function() {  
      this.refs.addTeamBtn.disabled = false;
      this.refs.updateTeamBtn.disabled = true;
      this.refs.deleteTeamBtn.disabled = true;
  },
  componentDidUpdate: function() {
    var selectedTeam = this.props.selectedTeam;
    if (!_.isEmpty(selectedTeam)) {
      this.refs.addTeamBtn.disabled = true;
      this.refs.updateTeamBtn.disabled = !selectedTeam.access;
      this.refs.deleteTeamBtn.disabled = !selectedTeam.access;
    } else {
      this.refs.addTeamBtn.disabled = false;
      this.refs.updateTeamBtn.disabled = true;
      this.refs.deleteTeamBtn.disabled = true;
    }
  },
  addTeam: function(e) {
    this.props.formAction('add');
  },
  updateTeam: function(e) {
    this.props.formAction('update');
  },
  deleteTeam: function(e) {
    this.props.formAction('delete');
  },
  resetTeam: function(e) {
    this.props.formAction('reset');
  },    
  render: function() {
    return (
      <p>
        <label>&nbsp;<span class="ibm-access">Update buttons</span></label>
        <span class="ibm-btn-row">
          <input type="button" class="ibm-btn-pri ibm-btn-small" id="addTeamBtn" ref="addTeamBtn" value="Add team" onClick={this.addTeam}/>
          <input type="button" class="ibm-btn-sec ibm-btn-small" id="updateTeamBtn" ref="updateTeamBtn" value="Update team" onClick={this.updateTeam}/>
          <input type="button" class="ibm-btn-sec ibm-btn-small" id="deleteTeamBtn" ref="deleteTeamBtn" value="Delete team" onClick={this.deleteTeam}/>
          <input type="button" class="ibm-btn-sec ibm-btn-small" id="resetTeamBtn" value="Reset team" onClick={this.resetTeam}/>
        </span>
      </p>
    )
  }

});

module.exports = TeamFormButtons;
