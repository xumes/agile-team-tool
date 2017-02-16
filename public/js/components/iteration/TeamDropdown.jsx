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
    var teamId = self.props.iteration.teamId;
    api.getSquadTeams({name:1})
      .then(function(teams) {
        self.setState({teamNames: teams});
        if (teamId != undefined && teamId != '')
          return api.isUserAllowed(teamId);
        else
          return;
    })
    .then(function(result){
      if (result != null){
        self.props.readOnlyAccess(!result);
        return api.loadTeam(teamId);
      }
      else
        return;
    })
    .then(function(result){
      if (result != null)
        self.setState({teamInfo: result});
      else
        return;
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
          self.props.teamChangeHandler(teamId, result);
          return api.loadTeam(teamId);
        })
        .then(function(result){
          self.setState({teamInfo: result});          
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