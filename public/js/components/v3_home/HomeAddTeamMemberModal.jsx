var React = require('react');
var api = require('../api.jsx');
var _ = require('underscore');
var InlineSVG = require('svg-inline-react');
var Modal = require('react-overlays').Modal;
var HomeAddTeamMemberFooter = require('./HomeAddTeamMemberFooter.jsx');

var HomeAddTeamMemberModal = React.createClass({
  componentDidMount: function() {
    jQuery('#csvfile').fileinput();
    jQuery('#tbl-members-data').scrollable();
  },

  componentDidUpdate: function(prevProps, prevState) {
    jQuery('#csvfile').fileinput();
    jQuery('#tbl-members-data').scrollable();
  },

  render: function() {
    var self = this;
    var teamObj = this.props.getTeamObj();
    console.log('HomeAddTeamMemberModal newTeamObj:', teamObj);
    console.log('HomeAddTeamMemberModal selectedParentTeam:', this.props.selectedParentTeam);
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
                      <label for='txtmember' class='frmlabel'>Add Team Members manually</label>
                      <input type='text' name='txtmember' id='txtmember' size='32' placeholder='ex. John Smith or smith@xx.ibm.com' />
                      <div class='btn-addmember'>
                        <InlineSVG src={require('../../../img/Att-icons/att-icons_Add.svg')}></InlineSVG>
                      </div>
                    </div>

                    <div class='col2'>
                      <div class='note2'>
                        <strong class="note1">NOTE:</strong>
                        <p>You will be able to customize your team members locations, allocations and roles next.</p>
                      </div>
                    </div>

                    <div class='clearboth'></div>
                    <label for="csvfile" class='frmlabel'>Upload a CSV file:</label>
                    <span>
                      <input id="csvfile" type="file" data-widget="fileinput" data-multiple="false" />
                    </span>

                    <div class='tbl-results'>
                      <table class='tbl-members' >
                        <thead>
                          <tr>
                            <td class='h-delete'>&nbsp;</td>
                            <td class='heading'>Name</td>
                            <td class='heading'>Email</td>
                            <td class='heading'>Location</td>
                          </tr>
                        </thead>
                        <tbody class='tbl-members-data' id='tbl-members-data' data-widget="scrollable" data-height="100">
                            <tr>
                              <td class='row-delete'><div class='delete-ico'><InlineSVG src={require('../../../img/Att-icons/att-icons_delete-redbg.svg')}></InlineSVG></div>&nbsp;&nbsp;</td>
                              <td class='name'>JohnDoeUser1</td>
                              <td class='email'><span class='email'>JohnDoeUser1@ph.ibm.com</span></td>
                              <td class='location'><span class='location'>CEBU PH</span></td>
                            </tr>
                            <tr>
                              <td class='row-delete'><div class='delete-ico'><InlineSVG src={require('../../../img/Att-icons/att-icons_delete-redbg.svg')}></InlineSVG></div>&nbsp;&nbsp;</td>
                              <td class='name'>JohnDoeUser2</td>
                              <td class='email'><span class='email'>JohnDoeUser2@ph.ibm.com</span></td>
                              <td class='location'><span class='location'>CEBU PH</span></td>
                            </tr>
                            <tr>
                              <td class='row-delete'><div class='delete-ico'><InlineSVG src={require('../../../img/Att-icons/att-icons_delete-redbg.svg')}></InlineSVG></div>&nbsp;&nbsp;</td>
                              <td class='name'>JohnDoeUser3</td>
                              <td class='email'><span class='email'>JohnDoeUser3@ph.ibm.com</span></td>
                              <td class='location'><span class='location'>CEBU PH</span></td>
                            </tr>                                                        
                        </tbody>
                      </table>
                    </div>
                  </form>

                </div>
              </div>
              <HomeAddTeamMemberFooter updateStep={self.props.updateStep} currentStep={self.props.currentStep} selectedteamType={selectedteamType} />
            </div>
        </div>
      </Modal>
    );
  }
});

module.exports = HomeAddTeamMemberModal;
