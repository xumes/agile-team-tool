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
var OPTSELECT = {
  ALLOCATION: 'allocation',
  ROLE: 'role',
  AVGWORKWEEK: 'avgworkweek'
};

var HomeAddTeamMemberRole = React.createClass({
  getInitialState: function() {
    return {
      buttonOptions: {
        prevScreen: 'showTeamMemberModal',
        prevDisabled: '',
        nextScreen: '',
        finishDisabled: 'disabled',
        nextDisabled: ''  //TODO: disabled
      },
      defaultRoles: [],
      defaultWorkTime: {
        'Full Time': 100,
        'Half Time': 50,
        'Other': -1
      }
    }
  },

  componentDidMount: function() {
    var self = this;
    var tmproles = self.props.roles;
    self.setState({defaultRoles: tmproles});
    self.disableFinishButton();
  },

  disableFinishButton: function() {
    var buttonOptions = this.state.buttonOptions;
    buttonOptions.finishDisabled = 'disabled';
    this.setState({buttonOptions: buttonOptions});
  },

  enableFinishButton: function() {
    var buttonOptions = this.state.buttonOptions;
    buttonOptions.finishDisabled = '';
    this.setState({buttonOptions: buttonOptions});
  },

  show: function() {
    var self = this;
    var tmproles = self.props.roles;
    var memRole = _.pluck(self.props.newTeamObj.members, 'role');
    if (tmproles && memRole) {
      var tmp = [];
      _.map(memRole, function(val){
        if (!_.contains(tmproles, val)) {
          tmproles.push(val);
        }
      });
      this.setState({defaultRoles: tmproles});
    }
    self.disableFinishButton();
  },

  selectHandler: function(ref, data) {
    var self = this;
    var uid;
    var selectVal = data['value'];
    var updatedMember = [];
    var type;

    if (!_.isUndefined(ref.selrole)) {
      uid = ref.selrole.props['data-uid'];
      type = OPTSELECT.ROLE;
    } else if (!_.isUndefined(ref.selalloc)) {
      uid = ref.selalloc.props['data-uid'];
      type = OPTSELECT.ALLOCATION;
    } else if (!_.isUndefined(ref.selavgworkweek)) {
      uid = ref.selavgworkweek.props['data-uid'];
      type = OPTSELECT.AVGWORKWEEK;
    }
    console.log('HomeAddTeamMemberRole selectHandler member: ', self.props.newTeamObj.members);
    console.log('HomeAddTeamMemberRole selectHandler uid:',uid);
    console.log('HomeAddTeamMemberRole selectHandler type:',type);
    console.log('HomeAddTeamMemberRole selectHandler selectVal:',selectVal);
    var memberList = self.props.newTeamObj.members.map(function(member){
      var obj = {};
      obj.name = member.name;
      obj.email = member.email;
      obj.userId = member.userId;
      obj.location = member.location || '';
      obj.role = member.role || null;
      obj.allocation = member.allocation || 100;
      obj.workTime = member.workTime || 'Full Time';
      if (member.userId === uid) {
        if (type === OPTSELECT.ROLE) {
          obj.role = selectVal;
        } else if (type === OPTSELECT.ALLOCATION) {
          obj.allocation = selectVal;
        } else if (type === OPTSELECT.AVGWORKWEEK) {
          obj.workTime = selectVal;
        }
      }
      updatedMember.push(obj);
    });

    if (type === OPTSELECT.ROLE) {
      var tmproles = self.state.defaultRoles;
      // when selecting the 'Other...' option get the entered data.
      if (!_.contains(tmproles, selectVal)) {
        var tmp = self.state.defaultRoles;
        tmp.push(selectVal);
        self.setState({defaultRoles: tmp});
      }
    }

    if (type === OPTSELECT.AVGWORKWEEK) {
      var tmpworkweek = self.state.defaultWorkTime;
      if (!_.contains(tmpworkweek, selectVal)) {
        var obj = {};
        obj[selectVal] = selectVal;
        var tmp = _.extend(tmpworkweek, obj);
        self.setState({defaultWorkTime: tmp});
      }
    }

    self.props.setTeamMember(updatedMember);
    console.log('HomeAddTeamMemberRole selectHandler updatedMember:', updatedMember);
    this.enableFinishButton();
  },

  onclickEditInPlace: function(uid) {
    $('#data-edit-inplace-location-'+uid).hide();
    $('#edit-inplace-location-'+uid).show();
  },

  editInPlaceSaveLocation: function(uid) {
    var self = this;
    var updatedMember = [];
    var value = $('#txtedit-inplace-location-'+uid).val().trim();
    var memberList = self.props.newTeamObj.members.map(function(member){
      var obj = {};
      obj = _.clone(member);
      if (member.userId === uid) {
        obj.location = value;
      }
      updatedMember.push(obj);
    });
    self.props.setTeamMember(updatedMember);
    console.log('editInPlaceSaveLocation updatedMember:',updatedMember);
    $('#edit-inplace-location-'+uid).hide();
    self.enableFinishButton();
  },

  editInPlaceCancelLocation: function(uid, prevdata) {
    $('#data-edit-inplace-location-'+uid).html(prevdata).show();
    $('#edit-inplace-location-'+uid).hide();
  },

  render: function() {
    var self = this;
    var teamMemberList = null;
    if (!_.isEmpty(self.props.newTeamObj) && !_.isEmpty(self.props.newTeamObj.members)) {
      teamMemberList = self.props.newTeamObj.members.map(function(member,idx) {
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
            <td class='r_location'>
              <div class='data-edit-inplace' id={'data-edit-inplace-location-'+memberUserId} onClick={self.onclickEditInPlace.bind(null, memberUserId)}>{memberLocation}</div>
              <div class='edit-inplace-field' style={{'display': 'none'}} id={'edit-inplace-location-'+memberUserId}>
                <input type='text' name='edit-inplace-location' id={'txtedit-inplace-location-'+memberUserId} class='edit-inplace-location' defaultValue={memberLocation} />
                <div class='edit-inplace-btns'>
                  <div class='r_cancel-btn' onClick={self.editInPlaceCancelLocation.bind(null, memberUserId, memberLocation)}>
                    <InlineSVG src={require('../../../img/Att-icons/att-icons_close-cancel.svg')}></InlineSVG>
                  </div>
                  <div class='r_save-btn' onClick={self.editInPlaceSaveLocation.bind(null, memberUserId)}>
                    <InlineSVG src={require('../../../img/Att-icons/att-icons_confirm.svg')}></InlineSVG>
                  </div>
                </div>
              </div>
            </td>
            <td class='r_role' data-index={idx}>
              <HomeAddTeamDropdownRole newTeamObj={self.props.newTeamObj} memberUserId={memberUserId} roles={self.state.defaultRoles} setTeamMember={self.props.setTeamMember} memberRole={memberRole} roleHandler={self.selectHandler} />
            </td>
            <td class='r_allocation' data-index={idx}>
              <HomeAddTeamDropdownAllocation newTeamObj={self.props.newTeamObj} memberUserId={memberUserId} setTeamMember={self.props.setTeamMember} memberAlloc={memberAlloc} allocHandler={self.selectHandler} />
            </td>
            <td class='r_workweek'>
              <HomeAddTeamDropdownWorkTime newTeamObj={self.props.newTeamObj} memberUserId={memberUserId} defaultWorkTime={self.state.defaultWorkTime} setTeamMember={self.props.setTeamMember} memberWorkTime={memberWorkTime} workTimeHandler={self.selectHandler} />
            </td>
          </tr>
        );
      });
    }

    return (
      <Modal aria-labelledby='modal-label' className='reactbootstrap-modal' backdropClassName='reactbootstrap-backdrop' show={self.props.activeWindow} onShow={self.show}>
        <div class='new-team-creation-add-block new-team-creation-addteam-member' id='addTeamMemberRoleBlock'>
          <div class='new-team-creation-add-block-header'>
            <h>Team Member Roles and Time Allocations</h>
            <span class='close-ico'><InlineSVG onClick={self.props.closeWindow} src={require('../../../img/Att-icons/att-icons-close.svg')}></InlineSVG></span>
          </div>
          <div class='new-team-creation-add-block-content'>
            <div class='new-team-creation-add-block-content-mid'>
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
      </Modal>
    );
  }
});

module.exports = HomeAddTeamMemberRole;
