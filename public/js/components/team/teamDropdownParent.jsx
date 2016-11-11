var React = require('react');
var api = require('../api.jsx');
var ReactDOM = require('react-dom');

var TeamDropdownParent = React.createClass({
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
    $(this.refs.selectDropDown).select2();
    //$(this.refs.selectDropDown).change(this.props.teamChangeHandler);
  },

  render: function() {
    var teamSelectListStyle = {
      'width': '400px'
    };
    var populateTeamNames = this.state.teamNames.map(function(item) {
      return (
        <option key={item._id} value={item._id}>{item.name}</option>
      )
    });

    return (
      <select defaultValue="new" name="teamSelectList" style={teamSelectListStyle} ref='selectDropDown'>
        <option value="new">Create new...</option>
        {populateTeamNames}
      </select>
    )
  }

});

module.exports = TeamDropdownParent;
