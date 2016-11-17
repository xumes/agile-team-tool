var _ = require('underscore');
var React = require('react');
var api = require('../api.jsx');
var ReactDOM = require('react-dom');

var TeamDropdown = React.createClass({
  getInitialState: function() {
    return {
      teamNames: []
    }
  },
  componentDidMount: function() {
    console.log('TeamDropdown componentDidMount');
    var self = this;
    this.getTeamNames();
    //api.fetchTeamNames()
    //  .then(function(teams) {
    //    self.setState({
    //      teamNames: teams
    //    })
    //  });
    // Use IBM's bundled select2 package
    $(self.refs.teamSelectList).select2();
    $(self.refs.teamSelectList).change(this.props.teamChangeHandler);
  },
  getTeamNames: function() {
    var self = this;
    return api.fetchTeamNames()
      .then(function(teams) {
        self.setState({
          teamNames: teams
        })
      });
  },
  componentWillReceiveProps: function(newProps) {
    console.log('TeamDropdown componentWillReceiveProps ', newProps);
    var team = _.find(this.state.teamNames, function(team) {
        return team._id == newProps.defaultTeam;
      });
    if (_.isEmpty(team) || _.isEqual(newProps.defaultTeam, 'delete')) {
      this.getTeamNames();
    }
  },
  /*
  componentWillUpdate(nextProps, nextState) {
    console.log('TeamDropdown componentWillUpdate',nextProps, nextState);
  },
  */
  componentDidUpdate(prevProps, prevState) {
    console.log('TeamDropdown componentDidUpdate')
    if (_.isEqual(this.props.defaultTeam, 'delete'))
      this.refs.teamSelectList.value = 'new';
    else
      this.refs.teamSelectList.value = this.props.defaultTeam;
  },
  render: function() {
    console.log('TeamDropdown render',this.props.defaultTeam,this.state.teamNames.length);;
    var teamSelectListStyle = {
      'minWidth': '400px'
    };
    var populateTeamNames = this.state.teamNames.map(function(item) {
      return (
        <option key={item._id} value={item._id}>{item.name}</option>
      )
    });
    return (
      <select defaultValue={this.props.defaultTeam} id="teamSelectList"  name="teamSelectList" ref='teamSelectList' style={teamSelectListStyle} >
        <option value="new">Create new...</option>
        {populateTeamNames}
      </select>
    )
  }
});

module.exports = TeamDropdown;
