var React = require('react');
var api = require('../api.jsx');
var HomeSearchTree = require('./HomeSearchTree.jsx');
//var HomeTeamTree = require('./HomeTeamTree.jsx');

var HomeTeamNav = React.createClass({
  getInitialState: function() {
    return {
    }
  },

  searchTeamClickHandler: function(clickedTeam) {
    console.log(clickedTeam);
  },

  render: function() {
    return (
      <div class="agile-team-nav" data-widget="scrollable" data-height="600">
        <HomeSearchTree searchTeams={this.props.searchTeams} searchTreeHide={this.props.searchTreeHide} clickedTeam={this.state.searchTeamClickHandler}/>
      </div>
    )
  }
});

module.exports = HomeTeamNav;
