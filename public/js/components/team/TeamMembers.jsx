var React = require('react');
var _ = require('underscore');
var TeamDropdownRole = require('./TeamDropdownRole.jsx');
var TeamErrorValidationHandler = require('./TeamErrorValidationHandler.jsx');
var teamApi = require('./TeamApi.jsx');

var TeamMembers = React.createClass({
  getInitialState: function() {
    return {
      selectedAction: 'add',
      selectedIndex: [],
      selectedMember: {
        name: '',
        role: '',
        allocation: '',
        userId: '',
        email: ''
      },
      facesPerson: new Object(),
      teamMembers: [],
      userMembers: [],
      formError: {
        error: new Object(),
        map: [
          {field: 'name', id: 'teamMemberName'},
          {field: 'userId', id: 'teamMemberName'},
          {field: 'role', id: 'memberRoleSelectList'},
          {field: 'role', id: 'otherRoleDesc'},
          {field: 'allocation', id: 'memberAllocation'}
        ]
      }
    }
  },
  componentDidMount: function() {
    var self = this;
    FacesTypeAhead.init(
      $('#teamMemberName'), {
        key: 'ciodashboard;agileteamtool@us.ibm.com',
        resultsAlign: 'left',
        showMoreResults: false,
        faces: {
          headerLabel: 'People',
          onclick: function(person) {
            self.state.facesPerson = person;
            return person['name'];
          }
        },
        topsearch: {
          headerLabel: 'w3 Results',
          enabled: false
        }
      });
    // Use IBM's bundled select2 package
    $('#memberRoleSelectList').select2();
    $('#memberListAction').select2();
    $('#memberListAction').change(this.memberListActionChange);
  },
  componentWillReceiveProps: function(newProps) {
    var self = this;
    var map = self.state.formError.map;
    self.setState({
      teamMembers: newProps.selectedTeam && newProps.selectedTeam.team ? newProps.selectedTeam.team.members : [],
      userMembers: newProps.selectedTeam && newProps.selectedTeam.members ? newProps.selectedTeam.members : [],
      formError: {
        error: new Object(),
        map: map
      }
    });
  },
  componentDidUpdate: function() {
    var selectedTeam = this.props.selectedTeam;
    if (!_.isEmpty(selectedTeam) && selectedTeam.access) {
      this.refs.teamMemberName.value = this.state.selectedMember.name;
      this.refs.teamMemberName.disabled = _.isEqual(this.state.selectedAction, 'update') ? true : false;
      if ($('#memberRoleSelectList option[value="' + this.state.selectedMember.role + '"]').length == 0) {
        $('#memberRoleSelectList').val('Other...').trigger('change');
        this.refs.otherRoleDesc.value = this.state.selectedMember.role;
        this.refs.otherRoleDesc.disabled = false;
      } else {
        $('#memberRoleSelectList').val(this.state.selectedMember.role).trigger('change');
        this.refs.otherRoleDesc.value = '';
        this.refs.otherRoleDesc.disabled = true;
      }
      this.refs.memberAllocation.value = this.state.selectedMember.allocation;
      this.refs.memberAllocation.disabled = false;
      this.refs.memberListAction.disabled = true;
      this.refs.addMemberBtn.disabled = _.isEqual(this.state.selectedAction, 'add') ? false : true;
      this.refs.updateMemberBtn.disabled = _.isEqual(this.state.selectedAction, 'update') ? false : true;
      this.refs.cancelMemberBtn.disabled = false;
    } else {
      this.refs.teamMemberName.disabled = true;
      this.refs.otherRoleDesc.disabled = true;
      this.refs.memberAllocation.disabled = true;
      this.refs.memberListAction.disabled = true;
      this.refs.addMemberBtn.disabled = true;
      this.refs.updateMemberBtn.disabled = true;
      this.refs.cancelMemberBtn.disabled = true;
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
  memberRoleChangeHandler: function(e) {
    var role = e.currentTarget.value || $('#memberRoleSelectList option:selected').val();
    if (role.indexOf('Other...') != -1) {
      this.state.selectedMember.role = role;
      $('#otherRoleDescSection').show();
      $('#otherRoleDesc').removeAttr('disabled');
      $('#otherRoleDesc').val('');
    } else {
      this.state.selectedMember.role = '';
      $('#otherRoleDescSection').hide();
    }
  },
  memberRoleOtherChange: function(e) {
    if (this.refs.otherRoleDesc.value != '') {
      this.state.role = this.refs.otherRoleDesc.value;
    }
  },
  memberNameChange: function(e) {
    if (e.currentTarget.value == '')
      this.setState({facesPerson: new Object()});
    else if (!_.isEmpty(this.state.facesPerson) && !_.isEqual(e.currentTarget.value, this.state.facesPerson.name))
      this.setState({facesPerson: new Object()});
  },
  memberNameBlur: function(e) {
    if (!_.isEmpty(this.state.facesPerson) && _.isEqual(e.currentTarget.value, this.state.facesPerson.name)) {
      if (this.refs.memberAllocation.value == '') {
        this.refs.memberAllocation.value = 100;
      }
    }
  },
  wholeNumCheck: function(e) {
    var pattern = /^\d*$/;
    if (e.charCode >= 32 && e.charCode < 127 &&  !pattern.test(String.fromCharCode(e.charCode)))
    {
      e.preventDefault();
    }
  },
  memberSelected: function() {
    var index = [];
    var count = 0;
    $('input[name="member"]:checked').each(function() {
      count++;
      index.push($(this).val());
    });
    if (count > 0) {
      this.state.selectedIndex = index;
      this.refs.memberListAction.disabled = false;
      $('#memberAction').text('Actions... (' + count + ')');
      $('#memberAction').val('');
      $(this.refs.memberListAction).select2();
    } else {
      this.resetMember();
    }
  },
  memberListActionChange: function(e) {
    var self = this;
    var action = e.currentTarget.value;
    if (action == 'remove') {
      self.refs.addMemberBtn.disabled = true;
      self.refs.updateMemberBtn.disabled = true;
      var teamMembers = [];
      for (var i=0; i<self.state.teamMembers.length; i++) {
        if (self.state.selectedIndex.indexOf(i+'') == -1)
          teamMembers.push(self.state.teamMembers[i]);
      }
      var team = {
        _id: self.props.selectedTeam.team._id,
        members: teamMembers
      };
      teamApi.modifyTeamMembers(JSON.stringify(team))
        .then(function(result) {
          self.state.teamMembers = teamMembers;
          self.resetMember();
          alert('You have successfully removed Team member(s).');
          self.props.sectionUpdateHandler(result);
        })
        .catch(function(err) {
          var map = self.state.formError.map;
          self.setState({
            formError: {
              error: err,
              map: map
            }
          });
        });
        $('#memberListAction').val('').change();
    } else if (action == 'update') {
      if ($('input[name="member"]:checked').length > 1) {
        showMessagePopup('Only one member can be selected for update.');
        $('#memberListAction').val('').change();

      } else {
        var index = $('input[name="member"]:checked').val();
        var member = {
          name: $('#name_ref_'+index).html(),
          role: $('#role_ref_'+index).html(),
          allocation: $('#alloc_ref_'+index).html(),
          userId: $('#userId_ref_'+index).html(),
          email: $('#email_ref_'+index).html(),
        };
        var map = self.state.formError.map;
        self.setState({
          selectedIndex: [index],
          selectedAction: action,
          selectedMember: member,
          formError: {
            error: new Object(),
            map: map
          }
        });
        $('#memberListAction').val('').change();
        this.refs.memberListAction.disabled = false;
      }
    }
  },
  addUpdateMember: function(e) {
    var self = this;
    if (e.target.id == 'addMemberBtn') {
      var member = {
        name: $('#teamMemberName').val(),
        role:  $('#memberRoleSelectList').val() == 'Other...' ? $('#otherRoleDesc').val() : $('#memberRoleSelectList').val(),
        allocation: $('#memberAllocation').val(),
        userId: self.state.facesPerson.uid ? self.state.facesPerson.uid.toUpperCase() : null,
        email: self.state.facesPerson.email ? self.state.facesPerson.email.toLowerCase() : null,
        location: {
          site: self.state.facesPerson.location ? self.state.facesPerson.location.toLowerCase() : null
        }
      }
      var teamMembers = self.state.teamMembers;
      var userMembers = self.state.userMembers;
      teamMembers.push(member);
      userMembers.push(member);
      var team = {
        _id: self.props.selectedTeam.team._id,
        members: teamMembers
      };
      teamApi.modifyTeamMembers(JSON.stringify(team))
        .then(function(result) {
          self.resetMember();
          alert('You have successfully added a Team Member to team to ' + self.props.selectedTeam.team.name + '.');
          self.props.sectionUpdateHandler(result);
        })
        .catch(function(err) {
          self.state.teamMembers.pop();
          self.state.userMembers.pop();
          var map = self.state.formError.map;
          self.setState({
            formError: {
              error: err,
              map: map
            }
          });
        });
    } else if (e.target.id == 'updateMemberBtn') {
      var member = self.state.selectedMember;
      member.role = $('#memberRoleSelectList').val() == 'Other...' ? $('#otherRoleDesc').val() : $('#memberRoleSelectList').val();
      member.allocation = $('#memberAllocation').val();
      var teamMembers = self.state.teamMembers;
      teamMembers[self.state.selectedIndex[0]] = member;
      //ajax call
      var team = {
        _id: self.props.selectedTeam.team._id,
        members: teamMembers
      };
      teamApi.modifyTeamMembers(JSON.stringify(team))
        .then(function(result) {
          self.resetMember();
          alert('You have successfully updated a Team Member.');
          self.props.sectionUpdateHandler(result);
        })
        .catch(function(err) {
          var map = self.state.formError.map;
          self.setState({
            formError: {
              error: err,
              map: map
            }
          });
        });
    }
  },
  resetMember: function(e) {
    var map = this.state.formError.map;
    this.setState({
      selectedAction: 'add',
      selectedIndex: [],
      selectedMember: {
        name: '',
        role: '',
        allocation: '',
        userId: '',
        email: ''
      },
      facesPerson: new Object(),
      formError: {
        error: new Object(),
        map: map
      }
    });
    $("input[name='member']:checked").removeAttr('checked');
    $('#memberAction').text('Actions...');
    $('#memberAction').val('');
    this.refs.memberListAction.disabled = true;
    $(this.refs.memberListAction).select2();
  },
  showHideSection: function() {
    this.props.showHideSection('teamDetailsPageSection');
  },
  render: function() {
    var self = this;
    var count = 0;
    var memberAccess = '';
    self.state.teamMembers = _.sortBy(self.state.teamMembers, function(m){
      return m.name.toLowerCase();
    });
    var teamMemberList = self.state.teamMembers.map(function(member){
      var userMember = _.find(self.state.userMembers, function(um){
        if (um.userId == member.userId) {
          return um;
        }
      });
      var memberRole = member.role;
      var memberAllocation = member.allocation;
      var memberBlockId = 'mrow_' + count;
      var memberId = 'member_' + count;
      var memberName = member.name;
      var memberEmail = member.email;
      var memberUserId = member.userId;
      var memberLocation = userMember ? self.toTitleCase(userMember.location.site) : '';
      var nameRefId = 'name_ref_' + count;
      var emailRefId = 'email_ref_' + count;
      var userIdRefId = 'userId_ref_' + count;
      var locationRefId = 'location_ref_' + count;
      var roleRefId = 'role_ref_' + count;
      var allocRefId = 'alloc_ref_' + count;
      if (self.props.selectedTeam.access) {
        memberAccess = '';
      } else {
        memberAccess='true';
      }
      count++;
      return (
        <tr key={memberBlockId} id={memberBlockId}>
          <td scope='row' class='ibm-table-row'>
            <label for={memberId} class='ibm-access'>Select {memberName}</label>
            <input type='checkbox' name='member' id={memberId} value={count-1} disabled={memberAccess} onClick={self.memberSelected}/>
          </td>
          <td id={nameRefId}>{memberName}</td>
          <td id={emailRefId}>{memberEmail}</td>
          <td id={userIdRefId} style={{'display':'none'}}>{memberUserId}</td>
          <td id={allocRefId}>{memberAllocation}</td>
          <td id={locationRefId}>{memberLocation}</td>
          <td id={roleRefId}>{memberRole}</td>
        </tr>
      );
    });
    var hiddenStyle = {
      'display': 'none'
    };
    var widthStyle = {
      'width': '400px'
    };
    var tooltipStyle = {
      position: 'relative',
      top: '-5px',
      left: '10px'
    };
    return (
      <div class='ibm-show-hide ibm-widget-processed' id='teamDetailsPageSection'>
        <h2 class='ibm-bold ibm-h4'>
          <a class='' title='Expand/Collapse' style={{'cursor':'pointer'}} onClick={self.showHideSection}>
            Team membership
          </a>
        </h2>
        <div class='ibm-container-body' id='newMemberPageSection' style={{'display':'none'}}>
          <p id='new_member_section_id'>
            <label for='teamMemberName'>Team member<span class='ibm-required'>*</span></label>
            <span>
              <input type='text' placeholder='Ex: Name or Email Adress' size='50' id='teamMemberName' name='teamMemberName' ref='teamMemberName' style={widthStyle} aria-label='team member' role='combobox' onChange={this.memberNameChange} onBlur={this.memberNameBlur}/>
            </span>
          </p>

          <p id='new_role_section_id' class='ibm-form-elem-grp'>
            <label for='memberRoleSelectList'>Role
              <a class='ibm-information-link' data-widget='tooltip' data-contentid='squadToolTip-role' style={tooltipStyle}><span class='ibm-access'>Tooltip</span></a>
            </label>
            <span>
              <TeamDropdownRole memberRoleChangeHandler={this.memberRoleChangeHandler} selectedTeam={this.props.selectedTeam} selectedRole={this.state.selectedMember.role}/>
            </span>
          </p>

          <div id='squadToolTip-role' class='ibm-tooltip-content'>
            <p class='toolTip'>Please refer to the User Guide's appendix for details explanation of roles.</p>
          </div>

          <p id='otherRoleDescSection' class='ibm-form-elem-grp' style={hiddenStyle}>
            <label for='otherRoleDesc'>&nbsp;<span class='ibm-access'>Other role description</span></label>
            <span>
              <input type='text' id='otherRoleDesc' name='otherRoleDesc' ref='otherRoleDesc' size='50' placeholder='Other role description' aria-label='Other role' style={widthStyle} onChange={this.memberRoleOtherChange} />
            </span>
          </p>

          <p id='allocationSection'>
            <label for='memberAllocation'>Member allocation(%): <span class='ibm-required'></span></label>
            <span>
              <input type='text' id='memberAllocation' name='memberAllocation' ref='memberAllocation' maxLength='3' size='50' placeholder='Ex: 100' onKeyPress='' style={widthStyle} aria-label='memberAllocation' onKeyPress={this.wholeNumCheck}/>
            </span>
          </p>

          <p id='team_member_btns_id' class='ibm-btn-row'>
            <label>&nbsp;<span class='ibm-access'>Update buttons</span></label>
            <span>
              <input type='button' class='ibm-btn-pri ibm-btn-small' id='addMemberBtn' ref='addMemberBtn' value='Add team member' onClick={this.addUpdateMember} />
              <input type='button' class='ibm-btn-sec ibm-btn-small' id='updateMemberBtn' ref='updateMemberBtn' value='Update team member' onClick={this.addUpdateMember} />
              <input type='button' class='ibm-btn-sec ibm-btn-small' id='cancelMemberBtn' ref='cancelMemberBtn' value='Reset team member' onClick={this.resetMember} />
            </span>
          </p>

          <div class='ibm-rule ibm-alternate'>
            <hr />
          </div>
          <div style={{'float':'left', 'fontSize':'14px', 'width':'100%'}} class='tcaption'>
            <em id='teamNameTitle' class='ibm-bold'>Team members</em>
            <p style={{'float': 'right', 'width': '400px'}}>
              <span id='spin' style={{'display': 'none'}} class='ibm-spinner'></span>
              <span style={{'width': '350px'}}>
              <label for='memberListAction' class='ibm-access'>Action</label>
              <select id='memberListAction' name='memberListAction' ref='memberListAction' style={{'width': '150px'}} aria-label='memberListAction' >
                  <option id='memberAction' defaultValue='Actions...' >Actions...</option>
                  <option value='update'>Update</option>
                  <option value='remove'>Remove</option>
              </select>
              </span>
            </p>
          </div>
          <table class='ibm-data-table' data-tablerowselector='enable' id='teamMemberTable' summary='List of team members' style={{'fontSize': '90%'}}>
            <thead>
              <tr>
                <th scope='col'></th>
                <th scope='col' width='23%'>Name</th>
                <th scope='col' width='12%'>Email</th>
                <th scope='col' width='10%'>Allocation</th>
                <th scope='col' width='25%'>Location</th>
                <th scope='col' width='30%'>Role</th>
              </tr>
            </thead>
            <tbody id='memberList'>
              {teamMemberList != null ? teamMemberList : <tr class='odd'><td colSpan='6' class='dataTables_empty'>No data available</td></tr>}
            </tbody>
          </table>
        </div>
        <TeamErrorValidationHandler formError={this.state.formError} />
      </div>
    )
  }
});

module.exports = TeamMembers;
