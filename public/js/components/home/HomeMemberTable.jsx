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
      var members = _.sortBy(self.props.loadDetailTeam.team.members, function(member){
        return member.name.toLowerCase();
      });
      var team = self.props.loadDetailTeam.team;
      self.updateMemberTable(members, team,self.props.loadDetailTeam.members);
    } else {
      $('#teamMemberTable').show();
      self.updateMemberTable(null, null,null);
    }
  },

  toTitleCase: function(str) {
    if (_.isEmpty(str)) return '';
    var strArray = str.toUpperCase().split(',');
    if (strArray.length < 3) {
      return str.toUpperCase();
    } else {
      strArray[0] = strArray[0].replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
      return strArray.join(', ');
    }
  },

  updateMemberTable: function(members, team, memberUserCollection) {
    var self = this;
    if (members != null && team != null) {
      var j = 0;
      _.each(members, function(member){
       var memberUserCollectionDetail = _.find(memberUserCollection, function(m) {     
         if (m.userId == member.userId) {
           return {
            'mLocation': m.location.site 
           }
         }
       });
        var mLocation = '';
        if (memberUserCollectionDetail != undefined)
          mLocation = self.toTitleCase(memberUserCollectionDetail.location.site);

        var row = "<tr><td id='name_" + j + "'>" + member.name + '</td>';
        row = row + '<td>' + member.allocation + '</td>';
        row = row + "<td id='location_ref_" + j + "'>" + mLocation + "</div></td>";
        row = row + '<td>' + member.role + '</td>';
        row = row + '</tr>';
        $('#membersList').append(row);
        j++;
      });
    } else {
      $('#membersList').append('<tr class="odd"><td valign="top" colspan="4" class="dataTables_empty">No data available</td></tr>');
    }
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
