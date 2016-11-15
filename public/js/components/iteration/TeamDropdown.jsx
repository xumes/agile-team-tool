var React = require('react');
var api = require('../api.jsx');
var ReactDOM = require('react-dom');

var TeamDropdown = React.createClass({
  getInitialState: function() {
    return {
      selectedTeam: this.props.selectedTeam,
      teamNames: [],
      teamInfo: new Object()
    }
  },

  componentWillMount: function() {
    var self = this; // Need to get reference to this instance
    api.getSquadTeams()
      .then(function(teams) {
        var selectedTeamInfo;
        if (teams != undefined && teams.length > 0 && 
        self.props.selectedTeam != undefined && self.props.selectedTeam != ''){
          selectedTeamInfo = _.find(teams, {_id:self.props.selectedTeam});
        }
        self.setState({teamNames: teams, selectedTeam: self.props.selectedTeam, teamInfo: selectedTeamInfo});
        if (self.props.selectedTeam != undefined && self.props.selectedTeam != ''){
          return api.isUserAllowed(self.props.selectedTeam);
        }
        else {
          return null;
        }
    })
    .then(function(result){
      if (result != null){
        self.props.enableFormFields(result);
      }
    });

  },

  componentDidMount: function() {    
    $(this.refs.teamSelectList).select2();
    $(this.refs.teamSelectList).change(this.handleChange);
  },

  handleChange: function(e){
    var selectedTeamInfo = _.find(this.state.teamNames, {_id:e.target.value});
    this.setState({selectedTeam: e.target.value, teamInfo: selectedTeamInfo});
    this.props.teamChangeHandler(e);
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
      <select value={this.state.selectedTeam} id='teamSelectList' style={teamSelectListStyle}  onChange={this.props.teamChangeHandler} ref='teamSelectList'>
        <option value=''>Select one</option>
        {populateTeamNames}
      </select>
    )
  }

});

module.exports = TeamDropdown;