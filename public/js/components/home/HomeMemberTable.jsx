var React = require('react');
var api = require('../api.jsx');
var _ = require('underscore');

var HomeMemberTable = React.createClass({
  componentWillUpdate: function(nextProps, nextState) {
  },
  componentDidUpdate: function() {
    // var self = this;
    // if (self.props.loadDetailTeam.team != undefined && self.props.loadDetailTeam.members != undefined && self.props.loadDetailTeam.members.length > 0) {
    //   $('#teamMemberTable').show();
    //   var members = _.sortBy(self.props.loadDetailTeam.members, function(member){
    //     return member.name.toLowerCase();
    //   });
    //   var team = self.props.loadDetailTeam.team;
    //   self.updateMemberTable(members, team);
    // } else {
    //   $('#teamMemberTable').show();
    //   self.updateMemberTable(null, null);
    // }
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

  updateMemberTable: function(members, team) {
    var self = this;
    if (members != null && team != null) {
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
        var mLocation = self.toTitleCase(member.location.site);
        var row = "<tr><td id='name_" + j + "'>" + member.name + '</td>';
        row = row + '<td>' + memberDetail.allocation + '</td>';
        row = row + "<td id='location_ref_" + j + "'>" + mLocation + "</div></td>";
        row = row + '<td>' + memberDetail.role + '</td>';
        row = row + '</tr>';
        $('#membersList').append(row);
        j++;
      });
    } else {
      $('#membersList').append('<tr class="odd"><td valign="top" colspan="4" class="dataTables_empty">No data available</td></tr>');
    }
  },
  render: function() {
    var self = this;
    if (self.props.loadDetailTeam.team == undefined) {
      return null;
    } else {
      team = self.props.loadDetailTeam.team;
      if (team.members.length == 0) {
        var teamMembers = null;
      } else {
        var members = _.sortBy(self.props.loadDetailTeam.members, function(member){
          return member.name.toLowerCase();
        });
        var team = self.props.loadDetailTeam.team;
        teamMembers = members.map(function(member, idx){
          if (idx <= 14) {
            var memberDetail = _.find(team.members, function(m){
              if (m.userId == member.userId) {
                return {
                  'role': m.role,
                  'allocation': m.allocation
                }
              }
            });
            var mLocation = self.toTitleCase(member.location.site);
            var src = 'http://dpev027.innovate.ibm.com:10000/image/' + member.userId.toUpperCase();
            var blockColor = {
              'backgroundColor': '#FFFFFF'
            }
            if (idx % 2 != 0) {
              blockColor['backgroundColor'] = '#EFEFEF';
            }
            return (
              <div key={idx} class='team-member-table-content-block' style = {blockColor}>
                <div style={{'width':'29.8%'}}>
                  <div style={{'width':'28.6%','height':'100%','display':'inline-block','float':'left'}}>
                    <img src={src}></img>
                  </div>
                  <div style={{'width':'71.4%','height':'50%','display':'inline-block','float':'left','position':'relative','top':'25%'}}>
                    <h>{member.name}</h>
                    <br/>
                    <h1>{member.email}</h1>
                  </div>
                </div>
                <div style={{'width':'19.3%'}}>
                  <h>{memberDetail.role}</h>
                </div>
                <div style={{'width':'21.9%'}}>
                  <h>{mLocation}</h>
                </div>
                <div style={{'width':'13.3%'}}>
                  <h>{memberDetail.allocation + '%'}</h>
                </div>
                <div style={{'width':'15.7%'}}>
                  <h>5 days</h>
                </div>
              </div>
            )
          }
        });
      }
      return (
        <div id='teamMemberTable' style={{'display':'none'}}>
          <div class='team-member-table-title-div'>
            <h class='team-member-table-title'>Team Details</h>
          </div>
          <div class='team-member-table' id='memberTable'>
            <div class='team-member-table-header-block'>
              <div style={{'width':'29.6%'}}>
                <h>Name</h>
              </div>
              <div style={{'width':'0.2%','backgroundColor':'#FFFFFF'}}>
              </div>
              <div style={{'width':'19.1%'}}>
                <h>Role</h>
              </div>
              <div style={{'width':'0.2%','backgroundColor':'#FFFFFF'}}>
              </div>
              <div style={{'width':'21.7%'}}>
                <h>Location</h>
              </div>
              <div style={{'width':'0.2%','backgroundColor':'#FFFFFF'}}>
              </div>
              <div style={{'width':'13.1%'}}>
                <h>Allocation</h>
              </div>
              <div style={{'width':'0.2%','backgroundColor':'#FFFFFF'}}>
              </div>
              <div style={{'width':'15.7%'}}>
                <h>Avg. work week</h>
              </div>
            </div>
            {teamMembers}
            <div class='team-member-table-footer-block'>
              <div class='team-member-table-add-btn'>
                <h>Add Team Member</h>
              </div>
            </div>
          </div>
        </div>
      )
    }
  }
});

module.exports = HomeMemberTable;
