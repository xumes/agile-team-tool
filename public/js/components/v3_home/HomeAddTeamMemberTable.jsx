var React = require('react');
var api = require('../api.jsx');
var _ = require('underscore');
var InlineSVG = require('svg-inline-react');
var utils = require('../utils.jsx');

var HomeAddTeamMemberTable = React.createClass({

  componentDidMount: function() {
    // $('#tbl-members-data').scrollable();
  },

  render: function() {
    var self = this;
    var teamMemberList = self.props.teamMembers.map(function(member) {
      var key = (Date.now().toString(36) + Math.random().toString(36).substr(2, 5)).toUpperCase();
      var memberName = member.name;
      var memberEmail = member.email;
      var memberLocation = '';
      if (member && member.location.site) {
        memberLocation = utils.toTitleCase(member.location.site);
      } else if (member && member.location) {
        memberLocation = utils.toTitleCase(member.location);
      }

      return (
        <tr key={key}>
          <td class='row-delete'><div class='delete-ico'><InlineSVG onClick={self.props.deleteTeamMember.bind(null, memberEmail)} src={require('../../../img/Att-icons/att-icons_delete-redbg.svg')}></InlineSVG></div>&nbsp;&nbsp;</td>
          <td class='name'>{memberName}</td>
          <td class='email'><span class='email'>{memberEmail}</span></td>
          <td class='location'><span class='location'>{memberLocation}</span></td>
        </tr>
      );
    });
    return(
      <table class='tbl-members' >
        <thead>
          <tr>
            <td class='h-delete'>&nbsp;</td>
            <td class='heading' style={{textAlign:'left'}}>Name</td>
            <td class='heading' style={{textAlign:'center'}}>Email</td>
            <td class='heading' style={{textAlign:'center'}}><span class='location'>Location</span></td>
          </tr>
        </thead>
        <tbody class='tbl-members-data'>
          {self.props.teamMembers.length != 0  ? teamMemberList : <tr style={{display:'block'}}><td colSpan='4' class='dataTables_empty'>No data available</td></tr>}
        </tbody>
      </table>
    );
  }
});

module.exports = HomeAddTeamMemberTable;
