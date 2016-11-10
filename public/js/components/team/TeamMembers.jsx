var React = require('react');
var _ = require('underscore');

var TeamMembers = React.createClass({
  componentDidMount: function() {
    $('select[name=\'memberRoleSelectList\']').select2();
    $('select[name=\'memberListAction\']').select2();
  },

  render: function() {
    var self = this;
    if (self.props.selectedTeam.members == undefined || self.props.selectedTeam.members.length <= 0) {
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
          var memberAccess = '';
        } else {
          memberAccess='true';
        }
        count++;
        return (
          <tr key={memberBlockId} id={memberBlockId}>
            <td scope='row' class='ibm-table-row'>
              <input name='member' id={memberId} type='checkbox' value={count-1} disabled={memberAccess}/>
              <label for={memberId} class='ibm-access'>Select {memberName}</label>
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

    var width150Style = {
      'width': '150px'
    };


    var width350Style = {
      'width': '350px'
    };

    var tooltipStyle = {
      position: 'relative',
      top: '-5px',
      left: '10px'
    };

    var otherRoleSpanStyle = {
      'paddingLeft': '.7%'
    };

    var tableStyle = {
      'float': 'left',
      'fontSize': '14px',
      'width': '100%'
    };

    var tableFontStyle = {
      'fontSize': '90%'
    };

    var tableHeaderStyle = {
      'float': 'right',
      'width': '400px'
    };

    return (
      <div class='ibm-show-hide ibm-widget-processed' id='teamDetailsPageSection'>
        <h2 class='ibm-bold ibm-h4'>
          <a class='' title='Expand/Collapse' onClick={()=>self.props.showHideSection('teamDetailsPageSection')}>
            Team membership
          </a>
        </h2>
        <div class='ibm-container-body' id='newMemberPageSection' style={{'display':'none'}}>
          <p id='new_member_section_id'>
            <label aria-label='teamMemberName'>Team member<span class='ibm-required'>*</span></label>
            <span>
              <input type='text' placeholder='Ex: Name or Email Adress' size='50'
                     id='teamMemberName' name='teamMemberName' style={widthStyle} aria-label='team member' role='combobox' />
            </span>
          </p>

          <p id='new_role_section_id' class='ibm-form-elem-grp'>
            <label aria-label='memberRoleSelectList'>Role
              <a class='ibm-information-link' data-widget='tooltip' data-contentid='squadToolTip-role' style={tooltipStyle}><span class='ibm-access'>Tooltip</span></a>
            </label>
            <span>
              <select defaultValue='selectone' id='memberRoleSelectList' name='memberRoleSelectList' style={widthStyle}>
                <option value='selectone' aria-label='memberRoleSelectList'>Select one</option>
                <option value='analyst'>Analyst</option>
                <option value='architect'>Architect</option>
                <option value='consultant'>Consultant</option>
                <option value='dba'>DBA</option>
                <option value='designer'>Designer</option>
                <option value='developer'>Developer</option>
                <option value='infrastructure'>Infrastructure</option>
                <option value='iterationmanager'>Iteration Manager</option>
                <option value='manager'>Manager</option>
                <option value='operationsandsupport'>Operations and Support</option>
                <option value='productowner'>Product Owner</option>
                <option value='programprojectmgmt'>Program & Project Mgmt</option>
                <option value='tester'>Tester</option>
                <option value='other'>Other...</option>
              </select>
            </span>
          </p>

          <div id='squadToolTip-role' class='ibm-tooltip-content'>
            <p class='toolTip'>Please refer to the User Guide's appendix for details explanation of roles.</p>
          </div>

          <p id='otherRoleDescSection' class='ibm-form-elem-grp' style={hiddenStyle}>
            <span style={otherRoleSpanStyle}>
              <input type='text' name='otherRoleDesc' id='otherRoleDesc' size='50' placeholder='Other role description' aria-label='Other role' style={widthStyle} />
            </span>
          </p>

          <p id='new_alloc_section_id'>
            <label aria-label='memberAllocation'>Member allocation(%):

              <span class='ibm-required'></span></label>
              <span>
                <input type='text' name='memberAllocation'
                       id='memberAllocation' maxLength='3' size='50' placeholder='Ex: 100' onKeyPress='' style={widthStyle} aria-label='memberAllocation' />
              </span>
          </p>

          <p id='team_member_btns_id' class='ibm-btn-row'>
            <label>&nbsp;<span class='ibm-access'>Update buttons</span></label>
            <span>
              <input type='button' class='ibm-btn-pri ibm-btn-small' id='addMemberBtn' value='Add team member' onClick='' />
              <input type='button' class='ibm-btn-sec ibm-btn-small' id='updateMemberBtn' value='Update team member' onClick='' />
              <input type='button' class='ibm-btn-sec ibm-btn-small' id='cancelMemberBtn' value='Reset team member' onClick='' />
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
              <label aria-label='memberListAction' class='ibm-access'>Action</label>
              <select id='memberListAction' name='memberListAction' style={{'width': '150px'}} aria-label='memberListAction'>
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
              {teamMembers}
            </tbody>
          </table>

        </div>
      </div>
    )
  }



});

module.exports = TeamMembers;
