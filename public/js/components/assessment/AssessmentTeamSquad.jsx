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
    var urlParams = getJsonParametersFromUrl();
    var teamId =  _.isEmpty(urlParams) || _.isEmpty(urlParams.id) ? '' : urlParams.id;
    var assessId = _.isEmpty(urlParams) || _.isEmpty(urlParams.assessId) ? null : urlParams.assessId;
    api.getSquadTeams({name:1})
      .then(function(teams) {
        self.setState({
          teamNames: teams
        });
        if (teamId != '') {
          //self.teamChangeHandler(null, teamId, assessId);
          setTimeout(function(){
            $('select[name=\'teamSelectList\']').val(teamId).change();
          },1000);
        }
        if (assessId != null) {
          setTimeout(function(){
            $('select[name=\'assessmentSelectList\']').val(assessId).change();
          },2000);
        }
      });
    // Use IBM's bundled select2 package
    $('select[name="teamSelectList"]').select2();
    $('select[name="teamSelectList"]').change(this.props.teamChangeHandler);
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
        <option key={item._id} value={item._id}>{item.name}</option>
      )
    });

    return (
      <p>
        <label style={labelStyle} for='teamSelectList'>Select an existing team:<span class='ibm-required'>*</span></label>
          <span>
            <select name='teamSelectList' style={teamSelectListStyle}>
            <option key='' value=''>Select one</option>
            {populateTeamNames}
          </select>
         </span>
       </p>
    )
  }

});

module.exports = TeamForm;
