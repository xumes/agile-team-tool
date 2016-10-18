var React = require('react');
var api = require('../api.jsx');
var HomeNavTab = require('./HomeNavTab.jsx');
var HomeSpinner = require('./HomeSpinner.jsx');
var HomeTeamNav = require('./HomeTeamNav.jsx');

var HomeNav = React.createClass({
  getInitialState: function() {
    return {
      spinnerHide: 'none',
      searchTreeHide: 'none',
      teamTreeHide: 'block',
      searchTeams: []
    }
  },

  searchChangeHandler: function(searchTeams) {
    this.setState({'searchTeams': searchTeams});
    this.setState({'searchTreeHide': 'block'});
    this.setState({'spinnerHide': 'none'});
  },

  searchStartHandler: function() {
    this.setState({'spinnerHide': 'block'});
    this.setState({'searchTreeHide': 'none'});
    this.setState({'teamTreeHide': 'none'});
  },

  render: function() {
    return (
      <div>
        <HomeNavTab sendSearchTeams={this.searchChangeHandler} searchStart={this.searchStartHandler}/>
        <HomeSpinner spinnerHide={this.state.spinnerHide}/>
        <HomeTeamNav searchTeams={this.state.searchTeams} searchTreeHide={this.state.searchTreeHide}/>
      </div>
    )
  }
});

module.exports = HomeNav;
