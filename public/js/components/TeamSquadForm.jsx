var React = require('react');
var api = require('../api.jsx');
var TeamDropdown = require('./TeamSquadDropdown.jsx');

var TeamForm = React.createClass({
  getInitialState: function() {
    return {
      selectedTeam: 'new',
      teamNames: []
    }
  },

  componentDidMount: function() {
    var self = this;
    api.getSquadTeams({name:1})
      .then(function(teams) {
        self.setState({
          teamNames: teams
        })
      });

    // Use IBM's bundled select2 package
    $('#teamSelectList').select2();
    $('#teamSelectList').change(this.teamSelectOnChange);
  },
  teamSelectOnChange: function(e) {
    alert('New Squad team has been selected ' + e.target.value);
  },

  render: function() {
    var labelStyle = {
      'lineHeight': '20px',
    };
    var teamSelectListStyle = {
      'minWidth': '380px'
    };
    var populateTeamNames = this.state.teamNames.map(function(item) {
      return (
        <option value={item._id}>{item.name}</option>
      )
    });

    return (
      <p>
        <label style={labelStyle} for="teamSelectList">Select an existing team:<span class="ibm-required">*</span></label>
          <span>
            <TeamDropdown/>
         </span>
       </p>
    )
  }

});

module.exports = TeamForm;