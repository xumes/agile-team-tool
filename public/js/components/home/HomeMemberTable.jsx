var React = require('react');
var api = require('../api.jsx');
var _ = require('underscore');

var HomeMemberTable = React.createClass({
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
            var blockId = 'member_'+idx;
            var nameId = 'name_'+idx;
            var locationId = 'location_'+idx;
            var roleId = 'role_'+idx;
            var allocationId = 'allocation_'+idx;
            var awkId = 'awk_'+idx;
            return (
              <div key={blockId} id={blockId} class='team-member-table-content-block' style = {blockColor}>
                <div id={nameId} style={{'width':'29.8%'}}>
                  <div style={{'width':'28.6%','height':'100%','display':'inline-block','float':'left'}}>
                    <img src={src}></img>
                  </div>
                  <div style={{'width':'71.4%','height':'50%','display':'inline-block','float':'left','position':'relative','top':'25%'}}>
                    <h>{member.name}</h>
                    <br/>
                    <h1>{member.email}</h1>
                  </div>
                </div>
                <div id={roleId} style={{'width':'19.3%'}}>
                  <h>{memberDetail.role}</h>
                </div>
                <div id={locationId} style={{'width':'21.9%'}}>
                  <h>{mLocation}</h>
                </div>
                <div id={allocationId} style={{'width':'13.3%'}}>
                  <h>{memberDetail.allocation + '%'}</h>
                </div>
                <div id={awkId} style={{'width':'15.7%'}}>
                  <h>Full time</h>
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
            <h class='team-member-table-close-btn' onClick={self.props.showTeamTable}>X</h>
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
              <button type='button' class='ibm-btn-sec ibm-btn-blue-50'>Add Team Member</button>
            </div>
          </div>
        </div>
      )
    }
  }
});

module.exports = HomeMemberTable;
