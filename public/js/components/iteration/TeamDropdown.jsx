var React = require('react');
var api = require('../api.jsx');
var ReactDOM = require('react-dom');

var TeamDropdown = React.createClass({
  getInitialState: function() {
    return {
      teamNames: [],
      teamInfo: {},
      firstOption:  ['', 'Select one']
    }
  },

  componentWillMount: function() {
    var self = this;
    api.getSquadTeams()
      .then(function(teams) {
        var selectedTeamInfo;
        var teamId = self.props.iteration.teamId;
        if (teams != undefined && teams.length > 0 &&
        teamId != undefined && teamId != ''){
          selectedTeamInfo = _.find(teams, {_id:teamId});
        }
        self.setState({teamNames: teams, teamInfo: selectedTeamInfo});
        if (teamId != undefined && teamId != ''){
          return api.isUserAllowed(self.props.iteration.teamId);
        }
        else {
          return null;
        }
    })
    .then(function(result){
      if (result != null){
        return self.props.readOnlyAccess(!result);
      }
    })
    .catch(function(err){
      console.log('[team-componentWillMount] error:'+JSON.stringify(err));
    });


  },

  componentDidMount: function() {
    $('select[name="teamSelectList"]').select2();
    $('select[name="teamSelectList"]').change(this.handleChange);
  },

  componentDidUpdate: function() {
    $('select[name="teamSelectList"]').select2();
  },

  handleChange: function(e){
    var self = this;
    var teamId = e.target.value;
    if (!_.isEmpty(teamId)){
      api.isUserAllowed(teamId)
        .then(function(result) {
          var selectedTeamInfo = _.find(self.state.teamNames, {_id:teamId});
          self.setState({teamInfo: selectedTeamInfo});
          self.props.teamChangeHandler(teamId, result);
        })
        .catch(function(err){
          console.log('[team change] error:'+JSON.stringify(err), err);
        });
    }
    else {
      this.props.teamReset(teamId);
    }
  },

  getTeamInfo: function(){
    return this.state.teamInfo;
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
      <select value={this.props.iteration.teamId} name='teamSelectList' id='teamSelectList' style={teamSelectListStyle}  onChange={this.handleChange} ref='teamSelectList'>
        <option value={this.state.firstOption[0]} key={this.state.firstOption[0]}>{this.state.firstOption[1]}</option>
        {populateTeamNames}
      </select>
    )
  }

});

module.exports = TeamDropdown;