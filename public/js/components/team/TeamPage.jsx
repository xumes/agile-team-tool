var React = require('react');
var Header = require('../Header.jsx');
var TeamForm = require('./TeamForm.jsx');
var TeamMembers = require('./TeamMembers.jsx');
var TeamLinks = require('./TeamLinks.jsx');
var TeamParentAssociation = require('./TeamParentAssociation.jsx');
var TeamChildAssociation = require('./TeamChildAssociation.jsx');
var TeamIteration = require('./TeamIteration.jsx');
var TeamAssessment = require('./TeamAssessment.jsx');

var TeamPage = React.createClass({
  getInitialState: function() {
    return {
      selectedTeam: null,
      teamInfoVisible: false
    }
  },

  teamChangeHandler: function(event) {
    console.log('Selected parent:', event.target.value);
    this.setState({
      selectedTeam: event.target.value,
      teamInfoVisible: true
    });
  },

  render: function() {
    return (
      <div>
        <Header title="Agile Team" />
        <TeamForm teamChangeHandler={this.teamChangeHandler} />
        <TeamMembers visible={this.state.teamInfoVisible} teamId={this.state.selectedTeam} />
        <TeamLinks visible={this.state.teamInfoVisible} teamId={this.state.selectedTeam} />
        <TeamParentAssociation visible={this.state.teamInfoVisible} teamId={this.state.selectedTeam} />
        <TeamChildAssociation visible={this.state.teamInfoVisible} teamId={this.state.selectedTeam} />
        <TeamIteration visible={this.state.teamInfoVisible} teamId={this.state.selectedTeam} />
        <TeamAssessment visible={this.state.teamInfoVisible} teamId={this.state.selectedTeam} />
      </div>
    )
  }
});

module.exports = TeamPage;
