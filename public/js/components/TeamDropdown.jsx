var React = require('react');
var api = require('../api.jsx');

var TeamDropdown = React.createClass({
  getInitialState: function() {
    return {
      selectedTeam: 'new',
      teamNames: []
    }
  },

  componentDidMount: function() {
    var self = this; // Need to get reference to this instance
    api.fetchTeamNames()
      .then(function(teams) {
        self.setState({
          teamNames: teams
        })
      });

    // Use IBM's bundled select2 package
    $('select[name="teamSelectList"]').select2();

  },



  render: function() {
    var teamSelectListStyle = {
      'minWidth': '380px'
    };
    var populateTeamNames = this.state.teamNames.map(function(item) {
      return (
        <option key={item._id} value={item._id}>{item.name}</option>
      )
    });

    return (
      <select name="teamSelectList" style={teamSelectListStyle}>
        <option value="new" selected="selected">Create new...</option>
        {populateTeamNames}
      </select>
    )
  }

});

module.exports = TeamDropdown;
