var React = require('react');
var api = require('../api.jsx');
var TeamDropdown = require('./TeamDropdown.jsx');

var TeamForm = React.createClass({
  getInitialState: function() {
    return {
      selectedTeam: 'new',
      teamNames: []
    }
  },

  componentDidMount: function() {
    var self = this;
    api.fetchTeamNames()
      .then(function(teams) {
        self.setState({
          teamNames: teams
        })
      });

    // Use IBM's bundled select2 package
    $('select[name="teamSelectList"]').change(this.teamSelectOnChange);

  },

  teamSelectOnChange: function(e) {
    alert('New team (from parent) has been selected ' + e.target.value);
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
      <form class="ibm-column-form">
        <p>
          <label style={labelStyle} for="teamSelectList">Create or select an existing team:<span class="ibm-required">*</span></label>
            <span>
              <TeamDropdown/>
           </span>
         </p>
      </form>
    )
  }

});

module.exports = TeamForm;
