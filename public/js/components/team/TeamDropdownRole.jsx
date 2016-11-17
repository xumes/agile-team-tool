var React = require('react');
var teamApi = require('./TeamApi.jsx');
var ReactDOM = require('react-dom');

var TeamDropdownRole = React.createClass({
  getInitialState: function() {
    return {
      selectedRole: '',
      memberRoles: []
    }
  },
  componentDidMount: function() {
    var self = this; // Need to get reference to this instance
    teamApi.fetchTeamMemberRoles()
      .then(function(roles) {
        self.setState({
          memberRoles: roles
        })
      });

    // Use IBM's bundled select2 package
    $(this.refs.memberRoleSelectList).select2();
    $(this.refs.memberRoleSelectList).change(this.props.memberRoleChangeHandler);
  },
  componentDidUpdate: function() {
    console.log(this.refs);
    var selectedTeam = this.props.selectedTeam;
    if (!_.isEmpty(selectedTeam))
      this.refs.memberRoleSelectList.disabled = !selectedTeam.access;
    else
      this.refs.memberRoleSelectList.disabled = false;
  },
  render: function() {
    var widthStyle = {
      'width': '400px'
    };
    var populateMemberRoles = this.state.memberRoles.map(function(item) {
      return (
        <option key={item} value={item}>{item}</option>
      )
    });

    return (
      <select defaultValue={this.props.selectedRole} id='memberRoleSelectList' name='memberRoleSelectList' ref='memberRoleSelectList' style={widthStyle}>
        <option value=''>Select one</option>
        {populateMemberRoles}
      </select>
    )
  }
});

module.exports = TeamDropdownRole;
