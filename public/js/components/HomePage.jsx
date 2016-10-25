var React = require('react');
var api = require('../api.jsx');
var Header = require('./Header.jsx');
var HomeNav = require('./HomeNav.jsx');
var HomeContent = require('./HomeContent.jsx');

var HomePage = React.createClass({
  getInitialState: function() {
    return {
      selectedTeam: ''
    }
  },

  selectedTeamChanged: function(teamId) {
    this.setState({'selectedTeam': teamId});
  },
  render: function() {
    return (
      <div class="ibm-columns" >
        <div class="ibm-col-6-2">
          <HomeNav selectedTeam={this.selectedTeamChanged}/>
        </div>
        <div id="mainContent" class="ibm-col-6-4">
          <HomeContent selectedTeam={this.state.selectedTeam}/>
        </div>
      </div>
    )
  }
});
module.exports = HomePage;
