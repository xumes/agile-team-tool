var React = require('react');
var api = require('../api.jsx');
var _ = require('underscore');
var InlineSVG = require('svg-inline-react');
var Modal = require('react-overlays').Modal;
var HomeAddTeamFooterButtons = require('./HomeAddTeamFooterButtons.jsx');
var utils = require('../utils.jsx');
// var HomeAddTeamMemberRoleTable = require('./HomeAddTeamMemberRoleTable.jsx');
// var HomeAddTeamMemberRoleFooter = require('./HomeAddTeamMemberRoleFooter.jsx');

var HomeAddTeamMemberRole = React.createClass({
  getInitialState: function() {
    return {
      buttonOptions: {
        prevScreen: 'showTeamMemberModal',
        prevDisabled: '',
        nextScreen: '',
        nextDisabled: 'disabled'
      }
    }
  },

  show: function() {
    $('#addTeamMemberRoleBlock select').select2({'dropdownParent':$('#addTeamMemberRoleBlock')});
  },

  render: function() {
    var self = this;
    var teamMemberList = null;
    if (!_.isEmpty(self.props.newTeamObj) && !_.isEmpty(self.props.newTeamObj.members)) {
      teamMemberList = self.props.newTeamObj.members.map(function(member) {
        var key = (Date.now().toString(36) + Math.random().toString(36).substr(2, 5)).toUpperCase();
        var memberName = member.name;
        var memberEmail = member.email;
        var memberUserId = member.userId;
        var memberLocation = '';
        if (member && member.location.site) {
          memberLocation = utils.toTitleCase(member.location.site);
        } else if (member && member.location) {
          memberLocation = utils.toTitleCase(member.location);
        }
        var allocationArray = Array.from(Array(101).keys());
        var allocationSelection = allocationArray.map(function(a){
          return (
            <option key={a} value={a}>{a}%</option>
          );
        });
        var roleSelection = self.props.roles.map(function(r){
          return (
            <option key={r} value={r}>{r}</option>
          );
        });
        return (
          <tr key={key}>
            <td class='name'>{memberName}</td>
            <td class='location'>{memberLocation}</td>
            <td class='role'>
              <select class='selrole' >
                <option>Select role</option>
                {roleSelection}
              </select>
            </td>
            <td class='allocation'>
              <select class='selalloc' >
                {allocationSelection}
              </select>
            </td>
          </tr>
        );
      });
    }

    return (
      <Modal aria-labelledby='modal-label' className='reactbootstrap-modal' backdropClassName='reactbootstrap-backdrop' show={self.props.activeWindow} onShow={self.show}>
        <div class='new-team-creation-addteam-member' id='addTeamMemberRoleBlock'>
            <div class='new-team-creation-add-block-header'>
              <h>Team Member Roles and Time Allocations</h>
              <span class='close-ico'><InlineSVG onClick={self.props.closeWindow} src={require('../../../img/Att-icons/att-icons-close.svg')}></InlineSVG></span>
            </div>
            <div class='new-team-creation-add-block-pad'>
              <div class='new-team-creation-add-block-content' style={{'marginBottom': '15em'}}>
                <div class='new-team-creation-add-block-content-mid2'>
                  <p class='desc'>Edit the location, role and time allocation of each team member from dropdowns provided.</p>
                  <div class='tbl-memberRole-results'>
                    <table class='tbl-members' >
                      <thead>
                        <tr>
                          <td class='heading' style={{textAlign:'left'}}>Name</td>
                          <td class='heading' style={{textAlign:'center'}}>Location</td>
                          <td class='heading' style={{textAlign:'center'}}>Role</td>
                          <td class='heading' style={{textAlign:'center'}}>Allocation</td>
                        </tr>
                      </thead>
                      <tbody class='tbl-members-role-data'>
                        {self.props.newTeamObj && self.props.newTeamObj.members && self.props.newTeamObj.members.length != 0  ? teamMemberList : <tr style={{display:'block'}}><td colSpan='4' class='dataTables_empty'>No data available</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <HomeAddTeamFooterButtons buttonOptions={self.state.buttonOptions} openWindow={self.props.openWindow} saveTeam={self.props.saveTeam} />
            </div>
        </div>
      </Modal>
    );
  }
});

module.exports = HomeAddTeamMemberRole;
