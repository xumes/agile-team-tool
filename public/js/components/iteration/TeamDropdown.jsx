var React = require('react');
var api = require('../api.jsx');
var ReactDOM = require('react-dom');

var TeamDropdown = React.createClass({
  getInitialState: function() {
    return {
      selectedTeam: this.props.selectedTeam,
      teamNames: []
    }
  },

  componentDidMount: function() {
    var self = this; // Need to get reference to this instance
    api.getSquadTeams()
      .then(function(teams) {
        self.setState({teamNames: teams});
      });
    $(this.refs.selectDropDown).select2();
    $(this.refs.selectDropDown).change(this.handleChange);
    self.setState({selectedTeam: this.props.selectedTeam});
  },

  handleChange: function(e){
    this.setState({selectedTeam: e.target.value});
    this.props.teamChangeHandler(e);
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
      <select value={this.state.selectedTeam} name='teamSelectList' style={teamSelectListStyle}  onChange={this.props.teamChangeHandler} ref='selectDropDown'>
        <option value=''>Select one</option>
        {populateTeamNames}
      </select>
    )
  }

});

module.exports = TeamDropdown;