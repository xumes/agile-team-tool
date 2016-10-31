var React = require('react');
var api = require('../api.jsx');
var Header = require('../Header.jsx');
var HomeNav = require('./HomeNav.jsx');
var HomeContent = require('./HomeContent.jsx');

var HomePage = React.createClass({
  getInitialState: function() {
    return {
      searchTeamSelected: '',
      selectedTeam: new Object(),
      newTeams: new Object()
    }
  },

  selectedTeamChanged: function(team) {
    this.setState({'selectedTeam': team});
  },
  newTeamsChanged: function(teams) {
    this.setState({'newTeams': teams});
  },
  searchTeamSelectedChanged: function(teamId) {
    this.setState({'searchTeamSelected': teamId});
  },
  render: function() {
    return (
      <div class="ibm-columns" >
        <div class="ibm-col-6-2">
          <HomeNav selectedTeam={this.selectedTeamChanged} newTeams={this.state.newTeams} newTeamsChanged={this.newTeamsChanged} searchTeamSelectedChanged={this.searchTeamSelectedChanged} searchTeamSelected={this.state.searchTeamSelected}/>
        </div>
        <div id="mainContent" class="ibm-col-6-4">
          <HomeContent selectedTeam={this.state.selectedTeam} searchTeamSelectedChanged={this.searchTeamSelectedChanged} newTeamsChanged={this.newTeamsChanged}/>
        </div>
      </div>
    )
  }
});
module.exports = HomePage;
