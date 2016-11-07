var React = require('react');
var api = require('../api.jsx');
var ReactDOM = require('react-dom');

var TeamDropdown = React.createClass({
  getInitialState: function() {
    return {
      selectedTeam: '',
      teamNames: []
    }
  },

  componentDidMount: function() {
    var self = this; // Need to get reference to this instance
    api.getSquadTeams()
      .then(function(teams) {
        self.setState({
          teamNames: teams
        })
      });

    // Use IBM's bundled select2 package
    $('select[name='teamSelectList']').select2();
    $('select[name='teamSelectList']').change(this.props.teamChangeHandler);
  },

  render: function() {
    var teamSelectListStyle = {
      'minWidth': '400px'
    };
    var populateTeamNames = this.state.teamNames.map(function(item) {
      return (
        <option key={item._id} value={item._id}>{item.name}</option>
      )
    });

    return (
      <select defaultValue='' name='teamSelectList' style={teamSelectListStyle}>
        <option value=''>Select one</option>
        {populateTeamNames}
      </select>
    )
  }

});

module.exports = TeamDropdown;