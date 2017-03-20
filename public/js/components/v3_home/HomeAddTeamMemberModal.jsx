var React = require('react');
var api = require('../api.jsx');
var _ = require('underscore');
var InlineSVG = require('svg-inline-react');
var Modal = require('react-overlays').Modal;
var HomeAddTeamFooterButtons  = require('./HomeAddTeamFooterButtons.jsx');
var HomeAddTeamMemberFaces = require('./HomeAddTeamMemberFaces.jsx');
var HomeAddTeamMemberTable = require('./HomeAddTeamMemberTable.jsx');
var utils = require('../utils.jsx');

var HomeAddTeamMemberModal = React.createClass({
  getInitialState: function() {
    return {
      facesPerson: new Object(),
      buttonOptions: {
        prevScreen: '',
        prevDisabled: '',
        nextScreen: 'showTeamMemberRoleModal',
        nextDisabled: 'disabled'
      }
    };
  },

  componentDidMount: function() {
    var self = this;
    // $('#tbl-members-data').scrollable(); // it wont work..table becomes messy!
    self.setState({facesPersonFullName: ''});
    self.disableNextButton();
  },

  componentWillReceiveProps: function(newProps) {
    // Empty the facesPerson to prevent from adding by clicking Add icon
    if (newProps.activeWindow !== undefined && newProps.activeWindow === false) {
      this.setState({facesPerson: {}});
    }
    this.isNextBtnDisable();
  },

  componentWillUpdate: function(nextProps, nextState) {
    var self = this;
    if (!self.props.activeWindow && nextProps.activeWindow) {
      var buttonOptions = self.state.buttonOptions;
      buttonOptions.prevScreen = _.isEqual('squad', self.props.newTeamObj.type) ? 'showTeamTypeModal' : 'showTeamHierarchyModal';
      self.setState({ buttonOptions: buttonOptions });
      self.isNextBtnDisable();
    }
  },

  isNextBtnDisable: function() {
    var self = this;
    if (!_.isEmpty(self.props.newTeamObj) && !_.isEmpty(self.props.newTeamObj.members)) {
      self.enableNextButton();
    }else{
      self.disableNextButton();
    }
  },

  addTeamMember: function() {
    var self = this;
    var teamMemberData = [];
    //var member = $('#txtTeamMemberName').val().trim();
    if (!_.isEmpty(self.state.facesPerson)) {
      $('#txtTeamMemberNameError').removeClass('ibm-alert-link');
      $('#txtTeamMemberNameError').html('');
        var member = {
            name: self.state.facesPerson.name,
            userId: self.state.facesPerson.uid ? self.state.facesPerson.uid.toUpperCase() : null,
            email: self.state.facesPerson.email ? self.state.facesPerson.email.toLowerCase() : null,
            location: {
              site: self.state.facesPerson.location ? self.state.facesPerson.location.toLowerCase() : null
            },
            allocation: 100,
            workTime: 100
          };

        // onced added to the Table, clear the txtfield automatically
        $('#txtTeamMemberName').val('');
        var members = [];
        if (!_.isEmpty(self.props.newTeamObj) && !_.isEmpty(self.props.newTeamObj.members))
          members = self.props.newTeamObj.members;
        members.push(member);

        // remove duplicate user by email
        _.each(_.uniq(_.pluck(members, 'userId'), utils.toLowerCase), function(value) {
          teamMemberData.push(_.findWhere(members, {userId: value}));
        });

        self.props.setTeamMember(teamMemberData);

        if (!_.isEmpty(teamMemberData)) {
          self.enableNextButton();
        }
        self.setState({facesPerson: {}});
    } else {
      $('#txtTeamMemberNameError').addClass('ibm-alert-link');
      $('#txtTeamMemberNameError').html('Member name is required.');
    }
  },

  deleteTeamMember: function(userId) {
    var self = this;
    var updatedMember = [];
    var members = self.props.newTeamObj.members;
    updatedMember = _.filter(members, function(ls) {
      return !_.isEqual(ls['userId'], userId);
    });
    self.props.setTeamMember(updatedMember);
    if (_.isEmpty(updatedMember)) {
      self.disableNextButton();
    }
  },

  updateFacesObj: function(obj) {
    this.setState({facesPerson: obj});
  },

  disableNextButton: function() {
    var buttonOptions = this.state.buttonOptions;
    buttonOptions.nextDisabled = 'disabled';
    this.setState({buttonOptions: buttonOptions});
  },

  enableNextButton: function() {
    var buttonOptions = this.state.buttonOptions;
    buttonOptions.nextDisabled = '';
    this.setState({buttonOptions: buttonOptions});
  },

  render: function() {
    var self = this;
    var teamObj = self.props.newTeamObj;
    return (
      <Modal aria-labelledby='modal-label' className='reactbootstrap-modal' backdropClassName='reactbootstrap-backdrop' show={self.props.activeWindow}>
        <div class='new-team-creation-add-block new-team-creation-addteam-member' id='addTeamMemberBlock'>
          <div class='new-team-creation-add-block-header'>
            <h>Add Team Members</h>
            <span class='close-ico'><InlineSVG onClick={self.props.closeWindow} src={require('../../../img/Att-icons/att-icons-close.svg')}></InlineSVG></span>
          </div>
          <div class='new-team-creation-add-block-content'>
            <div class='new-team-creation-add-block-content-mid'>
              <form class="ibm-row-form">
                <div class='col1'>
                  <HomeAddTeamMemberFaces addTeamMember={self.addTeamMember} updateFacesObj={self.updateFacesObj} changeHandlerFacesFullname={self.changeHandlerFacesFullname} />
                </div>

                <div class='col2'>
                  <div class='note2'>
                    <strong class="note1">NOTE:</strong>
                    <p class='note1-desc'>You will be able to customize your team members locations, allocations and roles next.</p>
                  </div>
                </div>

                <div class='clearboth'></div>

                <div class='tbl-results'>
                  <HomeAddTeamMemberTable newTeamObj={self.props.newTeamObj} deleteTeamMember={self.deleteTeamMember} />
                </div>
              </form>

            </div>
          </div>

          <HomeAddTeamFooterButtons buttonOptions={self.state.buttonOptions} openWindow={self.props.openWindow} />
        </div>
      </Modal>
    );
  }
});

module.exports = HomeAddTeamMemberModal;
