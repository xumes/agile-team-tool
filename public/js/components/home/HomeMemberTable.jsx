var React = require('react');
var api = require('../api.jsx');
var _ = require('underscore');

var HomeMemberTable = React.createClass({
  componentWillUpdate: function(nextProps, nextState) {
  },
  componentDidUpdate: function() {
    var self = this;
    if (self.props.loadDetailTeam.team != undefined && self.props.loadDetailTeam.members != undefined && self.props.loadDetailTeam.members.length > 0) {
      $('#teamMemberTable').show();
      var members = _.sortBy(self.props.loadDetailTeam.members, function(member){
        return member.name.toLowerCase();
      });
      var team = self.props.loadDetailTeam.team;
      self.updateMemberTable(members, team);
    }
  },

  updateMemberTable(members, team) {
    var j = 0;
    _.each(members, function(member){
      var memberDetail = _.find(team.members, function(m){
        if (m.userId == member.userId) {
          return {
            'role': m.role,
            'allocation': m.allocation
          }
        }
      });
      var row = "<tr><td id='name_" + j + "'>" + member.name + '</td>';
      row = row + '<td>' + memberDetail.allocation + '</td>';
      row = row + "<td id='location_ref_" + j + "'>" + member.location.site + "</div></td>";
      row = row + '<td>' + memberDetail.role + '</td>';
      row = row + '</tr>';
      $('#membersList').append(row);
      j++;
    });
  },
  render: function() {
    return (
      <div id='teamMemberTable'>
        <br />
        <h2 class='ibm-bold ibm-h4'>Team Members</h2>
        <div class='ibm-rule ibm-alternate'>
          <hr />
        </div>
        <table class='ibm-data-table' id='memberTable' summary='__REPLACE_ME__'  style={{'fontSize': '90%'}}>
          <thead>
            <tr>
              <th scope='col' width='30%'>Name</th>
              <th scope='col' width='10%'>Allocation</th>
              <th scope='col' width='30%'>Location</th>
              <th scope='col' width='30%'>Role</th>
            </tr>
          </thead>
          <tbody id='membersList'>
          </tbody>
        </table>
      </div>
    )
  }
});

module.exports = HomeMemberTable;
