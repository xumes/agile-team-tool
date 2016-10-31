var React = require('react');

var TeamMembers = React.createClass({
  componentDidMount: function() {
    $('select[name="memberRoleSelectList"]').select2();
    $('select[name="memberListAction"]').select2();
  },

  render: function() {
    var overallStyle = {
      'display': this.props.visible == false ? 'none': 'block'
    };
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
      <form class="ibm-column-form">
        <div style={overallStyle} id="teamDetailsPageSection" class="squad-sections">
          <div data-widget="showhide" data-type="panel" class="ibm-show-hide">
            <h2 class="ibm-bold ibm-h4">Team membership {this.props.teamId} </h2>

            <div class="ibm-container-body" id="newMemberPageSection">
              <p id="new_member_section_id">
                <label aria-label="teamMemberName">Team member<span class="ibm-required">*</span></label>
                <span>
                  <input type="text" placeholder="Ex: Name or Email Adress" value="" size="50"
                         id="teamMemberName" name="teamMemberName" style={widthStyle} aria-label="team member" role="combobox" />
                </span>
              </p>

              <p id="new_role_section_id" class="ibm-form-elem-grp">
                <label aria-label="memberRoleSelectList">Role
                  <a class="ibm-information-link" data-widget="tooltip" data-contentid="squadToolTip-role" style={tooltipStyle}><span class="ibm-access">Tooltip</span></a>
                </label>
                <span>
                  <select id="memberRoleSelectList" name="memberRoleSelectList" style={widthStyle}>
                    <option value="" selected="selected" aria-label="memberRoleSelectList">Select one</option>
                  </select>
                </span>
              </p>

              <div id="squadToolTip-role" class="ibm-tooltip-content">
                <p class="toolTip">Please refer to the User Guide's appendix for details explanation of roles.</p>
              </div>

              <p id="otherRoleDescSection" class="ibm-form-elem-grp" style={hiddenStyle}>
                <span style={otherRoleSpanStyle}>
                  <input type="text" name="otherRoleDesc" id="otherRoleDesc" size="50" value=""
                         placeholder="Other role description" aria-label="Other role" style={widthStyle} />
                </span>
              </p>

              <p id="new_alloc_section_id">
                <label aria-label="memberAllocation">Member allocation(%):

                  <span class="ibm-required"></span></label>
                  <span>
                    <input type="text" name="memberAllocation"
                           id="memberAllocation" maxlength="3" size="50" value="0" placeholder="Ex: 100" onkeypress="return isNumber(event)" style={widthStyle} aria-label="memberAllocation" />
                  </span>
              </p>

              <p id="team_member_btns_id" class="ibm-btn-row">
                <label>&nbsp;<span class="ibm-access">Update buttons</span></label>
                <span>
                  <input type="button" class="ibm-btn-pri ibm-btn-small" id="addMemberBtn" value="Add team member" onclick="updateMemberInfo('addTeamMember')" />
                  <input type="button" class="ibm-btn-sec ibm-btn-small" id="updateMemberBtn" value="Update team member" onclick="updateMemberInfo('updateTeamMember')" />
                  <input type="button" class="ibm-btn-sec ibm-btn-small" id="cancelMemberBtn" value="Reset team member" onclick="updateMemberInfo('clear');" />
                </span>
              </p>

              <span>Table here</span>



            </div>

          </div>
        </div>
      </form>
    )
  }



});

module.exports = TeamMembers;
