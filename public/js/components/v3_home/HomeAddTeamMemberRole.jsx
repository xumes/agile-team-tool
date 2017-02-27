var React = require('react');
var ReactDOM = require('react-dom');
var api = require('../api.jsx');
var _ = require('underscore');
var InlineSVG = require('svg-inline-react');
var Modal = require('react-overlays').Modal;
var HomeAddTeamFooterButtons = require('./HomeAddTeamFooterButtons.jsx');
var utils = require('../utils.jsx');
var Select = require('react-select');
var HomeAddTeamDropdownRole = require('./HomeAddTeamDropdownRole.jsx');
var HomeAddTeamDropdownAllocation = require('./HomeAddTeamDropdownAllocation.jsx');
var HomeAddTeamDropdownWorkTime = require('./HomeAddTeamDropdownWorkTime.jsx');

var HomeAddTeamMemberRole = React.createClass({
  getInitialState: function() {
    return {
      buttonOptions: {
        prevScreen: 'showTeamMemberModal',
        prevDisabled: '',
        nextScreen: '',
        nextDisabled: 'disabled'
      },
      defaultRoles: []
    }
  },

  componentDidMount: function() {
    var self = this;
    var tmproles = self.props.roles;
    console.log('componentDidMount defaultRoles:',tmproles);
    self.setState({defaultRoles: tmproles});
  },

  componentDidUpdate: function() {
    var self = this;
    var tmproles = self.props.roles;
    console.log('componentDidUpdate defaultRoles:',tmproles);

    // self.setState({defaultRoles: tmproles});
  },
  show: function() {
    // $('#addTeamMemberRoleBlock select').select2({'dropdownParent':$('#addTeamMemberRoleBlock')});
    var self = this;
    var tmproles = self.props.roles;
    console.log('componentDidUpdate defaultRoles:',tmproles);

    self.setState({defaultRoles: tmproles});
  },

  roleHandler: function(ref, data) {
    var self = this;
    var uid;
    var selectVal = data['value'];
    var updatedMember = [];

    uid = ref.selrole.props['data-uid'];
    console.log('uid:', uid);
    var memberList = self.props.newTeamObj.members.map(function(member){
      var obj = {};
      obj.name = member.name;
      obj.email = member.email;
      obj.userId = member.userId;
      obj.location = member.location || '';
      obj.role = member.role || '';
      obj.allocation = member.allocation || 100;
      obj.workTime = member.workTime || 'Full Time';
      if (member.userId === uid) {
        obj.role = selectVal;
      }
      updatedMember.push(obj);
    });

    var tmproles = self.state.defaultRoles;
    // when selecting the 'Other...' option
    if (!_.contains(tmproles, selectVal)) {
      var tmp = self.state.defaultRoles;
      tmp.push(selectVal);
      self.setState({defaultRoles: tmp});
    }

    self.props.setTeamMember(updatedMember);
    console.log('changeHandler updatedMember:');
    console.dir(updatedMember);
    var buttonOptions = self.state.buttonOptions;
    buttonOptions.nextDisabled = '';
    self.setState({buttonOptions: buttonOptions});
  },

  allocHandler: function(ref, data) {
    var self = this;
    var uid;
    var selectVal = data['value'];
    var updatedMember = [];

    uid = ref.selalloc.props['data-uid'];
    console.log('uid:', uid);
    var memberList = self.props.newTeamObj.members.map(function(member){
      var obj = {};
      obj.name = member.name;
      obj.email = member.email;
      obj.userId = member.userId;
      obj.location = member.location || '';
      obj.role = member.role || '';
      obj.allocation = member.allocation || 100;
      obj.workTime = member.workTime || 'Full Time';
      if (member.userId === uid) {
        obj.allocation = selectVal;
      }
      updatedMember.push(obj);
    });

    self.props.setTeamMember(updatedMember);
    console.log('changeHandler updatedMember:');
    console.dir(updatedMember);
    var buttonOptions = self.state.buttonOptions;
    buttonOptions.nextDisabled = '';
    self.setState({buttonOptions: buttonOptions});
  },

  workTimeHandler: function(ref, data) {

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
        var memberRole = member.role;
        var memberAlloc = member.allocation;
        var memberWorkTime = member.workTime;
        if (member && member.location.site) {
          memberLocation = utils.toTitleCase(member.location.site);
        } else if (member && member.location) {
          memberLocation = utils.toTitleCase(member.location);
        }
        return (
          <tr key={key}>
            <td class='r_name'>{memberName}</td>
            <td class='r_location'>{memberLocation}</td>
            <td class='r_role'>
              <HomeAddTeamDropdownRole newTeamObj={self.props.newTeamObj} memberUserId={memberUserId} roles={self.state.defaultRoles} setTeamMember={self.props.setTeamMember} memberRole={memberRole} roleHandler={self.roleHandler} />
            </td>
            <td class='r_allocation'>
              <HomeAddTeamDropdownAllocation newTeamObj={self.props.newTeamObj} memberUserId={memberUserId} setTeamMember={self.props.setTeamMember} memberAlloc={memberAlloc} allocHandler={self.allocHandler} />
            </td>
            <td class='r_workweek'>
              <HomeAddTeamDropdownWorkTime newTeamObj={self.props.newTeamObj} memberUserId={memberUserId} setTeamMember={self.props.setTeamMember} memberWorkTime={memberWorkTime} workTimeHandler={self.workTimeHandler} />
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
                          <td class='heading r_name' style={{textAlign:'left'}}>Name</td>
                          <td class='heading r_location' style={{textAlign:'center'}}>Location</td>
                          <td class='heading r_role' style={{textAlign:'center'}}>Role</td>
                          <td class='heading r_allocation' style={{textAlign:'center'}}>Allocation</td>
                          <td class='heading r_workweek' style={{textAlign:'center'}}>Avg. Work Week</td>
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
