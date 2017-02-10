var React = require('react');
var api = require('../api.jsx');
var _ = require('underscore');
var InlineSVG = require('svg-inline-react');
var Modal = require('react-overlays').Modal;
var utils = require('../utils.jsx');
var HomeAddTeamMemberFooter = require('./HomeAddTeamMemberFooter.jsx');
var HomeAddTeamMemberFaces = require('./HomeAddTeamMemberFaces.jsx');
var HomeAddTeamMemberTable = require('./HomeAddTeamMemberTable.jsx');

var HomeAddTeamMemberModal = React.createClass({
  getInitialState: function() {
    return {
      facesPerson: new Object(),
      facesPersonFullName: ''
    };
  },

  componentDidMount: function() {
    var self = this;
    $('#csvfile').fileinput();
    $('#tbl-members-data').scrollable();
    self.setState({facesPersonFullName: ''});
  },

  componentDidUpdate: function(prevProps, prevState) {
    var self = this;
    $('#csvfile').fileinput();
    $('#tbl-members-data').scrollable();
  },

  addTeamMember: function() {
    var self = this;
    var teamMemberData = [];
    var member = $('#txtTeamMemberName').val().trim();
    // var member = {
    //   name: $('#teamMemberName').val(),
    //   role:  $('#memberRoleSelectList').val() == 'Other...' ? $('#otherRoleDesc').val() : $('#memberRoleSelectList').val(),
    //   allocation: $('#memberAllocation').val(),
    //   userId: self.state.facesPerson.uid ? self.state.facesPerson.uid.toUpperCase() : null,
    //   email: self.state.facesPerson.email ? self.state.facesPerson.email.toLowerCase() : null,
    //   location: {
    //     site: self.state.facesPerson.location ? self.state.facesPerson.location.toLowerCase() : null
    //   }
    // }
    if (member !== '') {
      $('#txtTeamMemberNameError').removeClass('ibm-alert-link');
      $('#txtTeamMemberNameError').html('');
      var member = {
          name: self.state.facesPersonFullName,
          userId: self.state.facesPerson.uid ? self.state.facesPerson.uid.toUpperCase() : null,
          email: self.state.facesPerson.email ? self.state.facesPerson.email.toLowerCase() : null,
          location: {
            site: self.state.facesPerson.location ? self.state.facesPerson.location.toLowerCase() : null
          }
        }

        // onced added to the Table, clear the txtfield automatically
        $('#txtTeamMemberName').val('');
        var teamMembers = self.props.teamMembers;
        teamMembers.push(member);
        // remove duplicate user by email
        _.each(_.uniq(_.pluck(teamMembers, 'email'), utils.toLowerCase), function(value) {
          teamMemberData.push(_.findWhere(teamMembers, {email: value}));
        });

        console.log('Added member:', teamMemberData);
        self.props.setTeamMember(teamMemberData);
    } else {
      $('#txtTeamMemberNameError').addClass('ibm-alert-link');
      $('#txtTeamMemberNameError').html('Member name is required.');
    }
  },

  deleteTeamMember: function(email) {
    var self = this;
    var updatedMember = [];
    console.log('deleteTeamMember before:', this.props.teamMembers);
    updatedMember = _.filter(this.props.teamMembers, function(ls) {
      if (ls['email'] === email)
        return false;
      else
        return true;
    });

    console.log('deleteTeamMember after:', updatedMember);
    self.props.setTeamMember(updatedMember);
  },

  changeHandlerFacesFullname: function(value) {
    this.setState({facesPersonFullName: value});
  },

  updateFacesObj: function(obj) {
    this.setState({facesPerson: obj});
  },

  render: function() {
    var self = this;
    var teamObj = this.props.getTeamObj();
    var addBtnStyle = this.props.loadDetailTeam.access?'block':'none';
    var selectedteamType = this.props.selectedteamType;
    return (
      <Modal aria-labelledby='modal-label' className='reactbootstrap-modal' backdropClassName='reactbootstrap-backdrop' show={self.props.showModal}>
        <div class='new-team-creation-addteam-member'>
            <div class='new-team-creation-add-block-header'>
              <h>Add Team Members</h>
              <span class='close-ico'><InlineSVG onClick={self.props.closeWindow} src={require('../../../img/Att-icons/att-icons-close.svg')}></InlineSVG></span>
            </div>
            <div class='new-team-creation-add-block-pad'>
              <div class='new-team-creation-add-block-content'>
                <div class='new-team-creation-add-block-content-mid2'>
                  <form class="ibm-row-form">
                    <div class='col1'>
                      <HomeAddTeamMemberFaces addTeamMember={self.addTeamMember} updateFacesObj={self.updateFacesObj} changeHandlerFacesFullname={self.changeHandlerFacesFullname} />
                    </div>

                    <div class='col2'>
                      <div class='note2'>
                        <strong class="note1">NOTE:</strong>
                        <p>You will be able to customize your team members locations, allocations and roles next.</p>
                      </div>
                    </div>

                    <div class='clearboth'></div>
                    <div class='csvblock'>
                      <label for="csvfile" class='frmlabel'>Upload a CSV file:</label>
                      <span>
                        <input id="csvfile" type="file" data-widget="fileinput" data-multiple="false" />
                      </span>
                    </div>

                    <div class='tbl-results'>
                      <HomeAddTeamMemberTable teamMembers={self.props.teamMembers} deleteTeamMember={self.deleteTeamMember} />
                    </div>
                  </form>

                </div>
              </div>
              <HomeAddTeamMemberFooter updateStep={self.props.updateStep} currentStep={self.props.currentStep} selectedteamType={selectedteamType} updateTeam={self.props.updateTeam} />
            </div>
        </div>
      </Modal>
    );
  }
});

module.exports = HomeAddTeamMemberModal;
