var React = require('react');
var api = require('../api.jsx');

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
    $('select[name="teamSelectList"]').select2();
    $('select[name="teamSelectList"]').change(this.props.clickAction);
  },
  render: function() {
    var labelStyle = {
      'lineHeight': '27px',
    };
    var teamSelectListStyle = {
      'width': '300px'
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
            <select name="teamSelectList" style={teamSelectListStyle}>
            <option value="">Select one</option>
            {populateTeamNames}
          </select>
         </span>
       </p>
    )
  }

});

module.exports = TeamForm;