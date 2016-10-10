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
    $('select[name="teamSelectList"]').change(this.teamSelectOnChange);
  },

  teamSelectOnChange: function(e) {
    alert('New team (from parent) has been selected ' + e.target.value);
  },

  render: function() {
    var teamSelectListStyle = {
      'minWidth': '380px'
    };
    var populateTeamNames = this.state.teamNames.map(function(item) {
      return (
        <option value={item._id}>{item.name}</option>
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