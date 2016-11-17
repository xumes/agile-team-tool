var React = require('react');
var _ = require('underscore');
var TeamDropdownRole = require('./TeamDropdownRole.jsx');
var taPerson = null;

var TeamMembers = React.createClass({
  getInitialState: function() {
    return {
      selectedMember: new Object()
    }
  },
  componentDidMount: function() {
    FacesTypeAhead.init(
      $('#teamMemberName'), {
        key: 'ciodashboard;agileteamtool@us.ibm.com',
        resultsAlign: 'left',
        showMoreResults: false,
        faces: {
          headerLabel: 'People',
          onclick: function(person) {
            taPerson = person;
            return person['name'];
          }
        },
        topsearch: {
          headerLabel: 'w3 Results',
          enabled: true
        }
      });

    // Use IBM's bundled select2 package
    $('select[name=\'memberRoleSelectList\']').select2();
    $('select[name=\'memberListAction\']').select2();
  },
  componentDidUpdate: function() {
    var selectedTeam = this.props.selectedTeam;
    if (!_.isEmpty(selectedTeam)) { 
      this.refs.teamMemberName.disabled = !selectedTeam.access;
      this.refs.otherRoleDesc.disabled = !selectedTeam.access;
      this.refs.memberAllocation.disabled = !selectedTeam.access;
      this.refs.memberListAction.disabled = true;
      this.refs.addMemberBtn.disabled = !selectedTeam.access;
      this.refs.updateMemberBtn.disabled = true;
      this.refs.cancelMemberBtn.disabled = !selectedTeam.access;
      $('input[type=checkbox]').change(this.memberClick);
    } else {
      this.refs.teamMemberName.disabled = false;
      this.refs.otherRoleDesc.disabled = false;
      this.refs.memberAllocation.disabled = false;
      this.refs.memberListAction.disabled = true;
      this.refs.addMemberBtn.disabled = false;
      this.refs.updateMemberBtn.disabled = true;
      this.refs.cancelMemberBtn.disabled = false;
    }
  },
  memberRoleChangeHandler: function(e) {
    var role = $('#memberRoleSelectList option:selected').text();
    if ($('#memberRoleSelectList option:selected').val().indexOf('Other...') != -1)
      $('#otherRoleDescSection').show();
    else
      $('#otherRoleDescSection').hide();

    if ($('#memberRoleSelectList').val() != '')
      clearFieldErrorHighlight('memberRoleSelectList');
  },
  memberRoleOtherChange: function(e) {
    if ($('#otherRoleDesc').val() != '')
      clearFieldErrorHighlight('otherRoleDesc');      
  },
  memberNameChange: function(e) {
    if ($('#teamMemberName').val() == '')
      taPerson = null;
    else if (taPerson != undefined && $('#teamMemberName').val() != taPerson['name'])
      taPerson = null;

    if (taPerson != null)
      clearFieldErrorHighlight('teamMemberName');
  },
  memberNameBlur: function(e) {
    if (taPerson != undefined && taPerson != null) {
      clearFieldErrorHighlight('teamMemberName');
      if ($('#memberAllocation').val() == '')
        $('#memberAllocation').val('100');
    }
  },
  wholeNumCheck: function(e) {
    var pattern = /^\d*$/;
    if (e.charCode >= 32 && e.charCode < 127 &&  !pattern.test(String.fromCharCode(e.charCode)))
    {
      e.preDefault();
    }
  },
  memberClick: function(e) {
    var count = $('input[name="member"]:checked').length;

    if (count > 0) {
      $('#memberListAction').removeAttr('disabled');
      $('#memberAction').html('Actions... (' + count + ')');
      $('#select2-memberListAction-container').text('Actions... (' + count + ')');
      $('#select2-memberListAction-container').attr('title', 'Actions... (' + count + ')');
      $('#select2-memberListAction-container').css('color', 'black');

    } else {
      $('#memberListAction').val('');
      $('#select2-memberListAction-container').text('Actions...');
      $('#select2-memberListAction-container').attr('title', 'Actions...');
      $('#select2-memberListAction-container').css('color', 'grey');
      $('#memberListAction').attr('disabled', 'disabled');
      updateMemberInfo('clear');
    }
  },
  memberListActionChange: function(e) {
    if ($('input[name="member"]:checked').length < 1) {
      showMessagePopup('No selected members to perform desired action.');
      $('#memberListAction').val('');
      $('#select2-memberListAction-container').text('Actions...');
      $('#select2-memberListAction-container').attr('title', 'Actions...');
      $('#select2-memberListAction-container').css('color', 'grey');
      $('#memberListAction').attr('disabled', 'disabled');
      return;
    }
    var enableAction = false;
    var action = $('#memberListAction option:selected').val();
    if (action == 'remove') {
      $('#addMemberBtn').attr('disabled', 'disabled');
      $('#updateMemberBtn').attr('disabled', 'disabled');
      deleteTeamMember();

    } else if (action == 'update') {
      if ($('input[name="member"]:checked').length > 1) {
        showMessagePopup('Only one member can be selected for update.');

      } else {
        loadMemberInfo($('input[name="member"]:checked').val());
      }
      enableAction = true;
    }
    var count = $('input[name="member"]:checked').length;
    var actionText = count > 0 ? 'Actions...(' + count + ')' : 'Actions...';
    if (enableAction) {
      $('#memberListAction').removeAttr('disabled');
      $('#memberListAction').val('');
      $('#select2-memberListAction-container').text(actionText);
      $('#select2-memberListAction-container').attr('title', actionText);
      $('#select2-memberListAction-container').css('color', 'black');
    } else {
      $('#select2-memberListAction-container').text(actionText);
      $('#select2-memberListAction-container').attr('title', actionText);
      $('#select2-memberListAction-container').css('color', 'grey');
      $('#memberListAction').attr('disabled', 'disabled');
    }
  },
  addUpdateMember: function(e) {
    $('#addMemberBtn').attr('disabled', 'disabled');
    $('#memberListAction').attr('disabled', 'disabled');
    $('#updateMemberBtn').attr('disabled', 'disabled');
    var hasError = false;
    var currAlloc = isNaN(parseInt($('#memberAllocation').val())) ? 0 : parseInt($('#memberAllocation').val());
    if (taPerson == undefined || $('#teamMemberName').val() == '') {
      setFieldErrorHighlight('teamMemberName');
      showMessagePopup('Unable to retrieve information from Faces for the member indicated.  Please try the selection again.');
      hasError = true;
    } else if (isNaN(currAlloc) || (currAlloc < 0 || currAlloc > 100)) {
      setFieldErrorHighlight('memberAllocation');
      showMessagePopup('Team member allocation should be between <br> 0 - 100');
      hasError = true;
    } else if ($('#memberRoleSelectList option:selected').val() == '') {
      setFieldErrorHighlight('memberRoleSelectList');
      showMessagePopup('Please select a valid role');
      hasError = true;
    } else if ($('#memberRoleSelectList option:selected').val() == 'other' && $('#otherRoleDesc').val().trim() == '') {
      setFieldErrorHighlight('otherRoleDesc');
      showMessagePopup('Specify the "Other" role for the selected member.');
      hasError = true;
    }
    if (hasError) {
      if (e.target.id == 'addMemberBtn')
        $('#addMemberBtn').removeAttr('disabled');
      else if (e.target.id == 'updateMemberBtn')
        $('#updateMemberBtn').removeAttr('disabled');

      return;
    }
  },
  resetMember: function(e) {
    taPerson = null;
    $('#otherRoleDescSection').fadeOut();
    $('#memberRoleSelectList').val('');
    $('#memberRoleSelectList').trigger('change');
    clearFieldErrorHighlight('memberRoleSelectList');
    $('#otherRoleDesc').val('');
    clearFieldErrorHighlight('otherRoleDesc');
    $('#teamMemberName').val('');
    clearFieldErrorHighlight('teamMemberName');
    $('#memberAllocation').val('');
    clearFieldErrorHighlight('memberAllocation');
    $('#teamMemberName').removeAttr('disabled');
    $('#addMemberBtn').removeAttr('disabled');
    $('#updateMemberBtn').attr('disabled', 'disabled');
    $('#memberListAction').attr('disabled', 'disabled');
    $('#select2-memberListAction-container').text('Action...');
    $("input[name='member']:checked").each(function() {
      this.checked = false;
    });
  },
  render: function() {
    var self = this;
    if (_.isEmpty(self.props.selectedTeam.members) || self.props.selectedTeam.members.length <= 0) {
      var teamMembers = null;
    } else {
      var tmembers = self.props.selectedTeam.team.members;
      var count = 0;
      tempMembers = _.sortBy(self.props.selectedTeam.members, function(member){
        return member.name.toLowerCase();
      });
      teamMembers = tempMembers.map(function(member){
        var tmember = _.find(tmembers, function(m){
          if (m.userId == member.userId) {
            return m;
          }
        });
        var memberRole = tmember.role;
        var memberAllocation = tmember.allocation;
        var memberBlockId = 'mrow_' + count;
        var memberId = 'member_' + count;
        var memberName = member.name;
        var memberEmail = member.email;
        var memberLocation = member.location.site;
        var nameRefId = 'name_ref_' + count;
        var emailRefId = 'email_ref_' + count;
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
              <input type='checkbox' name='member' id={memberId} value={count-1} disabled={memberAccess} />
            </td>
            <td id={nameRefId}>{memberName}</td>
            <td id={emailRefId}>{memberEmail}</td>
            <td id={allocRefId}>{memberAllocation}</td>
            <td id={locationRefId}>{memberLocation}</td>
            <td id={roleRefId}>{memberRole}</td>
          </tr>
        );
      });
    }
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
          <a class='' title='Expand/Collapse' style={{'cursor':'pointer'}} onClick={()=>self.props.showHideSection('teamDetailsPageSection')}>
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
              <TeamDropdownRole memberRoleChangeHandler={this.memberRoleChangeHandler} selectedTeam={this.props.selectedTeam} selectedRole={this.state.selectedRole}/>
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
              <select id='memberListAction' name='memberListAction' ref='memberListAction' style={{'width': '150px'}} aria-label='memberListAction' onChange={this.memberListActionChange}>
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
              {teamMembers != null ? teamMembers : <tr class='odd'><td colSpan='6' class='dataTables_empty'>No data available</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    )
  }
});

module.exports = TeamMembers;
