var React = require('react');
var api = require('../api.jsx');
var _ = require('underscore');
var InlineSVG = require('svg-inline-react');
var Modal = require('react-overlays').Modal;
var currentTeamId = '';
var currentParentId = '';
//var selectableParents = [];

var HomeTeamSetup = React.createClass({
  getInitialState: function() {
    return {
      showTeamModal: false,
      showFullTeamModal: false,
      showConfirmModal: false,
      selectableParents: []
    }
  },
  componentDidMount: function() {
    $('squadParentSelectList').select2({'dropdownParent':$('#teamSquadBlock')});
  },
  componentWillUpdate: function(newProps) {
    var self = this;
    console.log('componentWillUpdate ', newProps);
    if (!_.isEmpty(newProps.loadDetailTeam) && !_.isEqual(currentTeamId, newProps.loadDetailTeam.team._id)) {
      currentTeamId = newProps.loadDetailTeam.team._id;
      if (newProps.loadDetailTeam.hierarchy.length>0) {
        currentParentId = newProps.loadDetailTeam.hierarchy[newProps.loadDetailTeam.hierarchy.length - 1]._id;
      }
      api.getSelectableParents(currentTeamId)
        .then(function(result) {
          var selectableParents = _.sortBy(result, 'name');
          self.setState({ selectableParents : selectableParents });
          console.log('done update');
          return selectableParents;
        })
        .catch(function(err){
          console.log(err);
          return err;
        });
    } else {
      console.log('not getting a new list',currentTeamId, newProps.loadDetailTeam.team._id);
    }
  },
  componentDidUpdate: function() {
    var self = this;
    if (!_.isEmpty(self.refs)) {
      if (!_.isEmpty(self.props.loadDetailTeam)) {
        if (_.isEqual('squad', self.props.loadDetailTeam.team.type) && (self.props.loadDetailTeam.iterations.length > 0 || self.props.loadDetailTeam.assessments.length > 0)) {
          $(self.refs.rparentSelectList).select2({'dropdownParent':$('#teamSquadBlock')});
          $(self.refs.rparentSelectList).change(currentParentId);
          self.refs.deleteBtn.disabled = !self.props.loadDetailTeam.access;
          self.refs.updateBtn.disabled = !self.props.loadDetailTeam.access;
        } else {
          $(self.refs.rparentSelectList).select2({'dropdownParent':$('#teamTypeBlock')});
          $(self.refs.rchildSelectList).select2({'dropdownParent':$('#teamTypeBlock')});
          $(self.refs.rparentSelectList).change(currentParentId);
          self.refs.deleteBtn.disabled = !self.props.loadDetailTeam.access;
          self.refs.updateBtn.disabled = !self.props.loadDetailTeam.access;

          // for children list disabled option
          // $('#parentSelectList option[value="5858519ea0a583041f67034e"]').prop('disabled','disabled')

        }
      }
    }
  },
  showSquadTeamSetup: function() {
    this.setState({ showTeamModal: true });
  },
  hideTeamSetup: function() {
    this.setState({ showTeamModal: false });
  },
  showFullTeamSetup: function() {
    this.setState({ showFullTeamModal: true });
  },
  hideFullTeamSetup: function() {
    this.setState({ showFullTeamModal: false });
  },
  confirmDelete: function() {
    this.setState({ showConfirmModal: true });
  },
  hideConfirmDialog: function() {
    this.setState({ showConfirmModal: false });
  },
  deleteTeam: function() {
    console.log('team needs to be deleted here', this.props);
    this.props.selectedTeamChanged(null);
    this.setState({ showTeamModal: false, showConfirmModal: false });
  },
  updateTeam: function() {
    console.log('team needs to be updated here', this.refs.rparentSelectList.value, this.props);
    var self = this;
    if (currentParentId != '') {
      api.associateTeam(self.refs.rparentSelectList.value, self.props.loadDetailTeam.team._id)
        .then(function(results) {
          self.props.selectedTeamChanged(self.props.loadDetailTeam.team.pathId);
          self.setState({ showTeamModal: false });
          return result;
        })
        .catch(function(err) {
          alert(err);
          return err;
        });
    } else {
      if (currentParentId == '' && currentParentId == self.refs.rparentSelectList.value) {
        alert('No Parent team association to remove.');
        return;
      }
      api.removeAssociation(self.props.loadDetailTeam.team._id)
        .then(function(results) {
          currentParentId = '';
          self.props.selectedTeamChanged(self.props.loadDetailTeam.team.pathId);
          self.setState({ showTeamModal: false });
          return result;
        })
        .catch(function(err) {
          alert(err);
          return err;
        });
    }
  },

  render: function () {
    var self = this;

    var backdropStyle = {
      top: 0, bottom: 0, left: 0, right: 0,
      zIndex: 'auto',
      backgroundColor: '#000',
      opacity: 0.5,
      width: '100%',
      height: '100%'
    };
    var modalStyle = {
      position: 'fixed',
      width: '100%',
      height: '100%',
      zIndex: 1040,
      top: 0, bottom: 0, left: 0, right: 0,
    };
    //console.log('render', self.state.selectableParents.length, currentTeamId, currentParentId);
    var parentOptions = null;
    if (self.state.selectableParents.length > 0) {
      var parentOptions = self.state.selectableParents.map(function(item) {
        return (
          <option key={item._id} value={item._id}>{item.name}</option>
        )
      });
    }
    // if team type squad, and iteration or assessment exist, show note
    var showNote = {'display':'none'};
    var teamTypeChange = false;
    if (!_.isEmpty(self.props.loadDetailTeam)) {
      if (_.isEqual('squad', self.props.loadDetailTeam.team.type) && (self.props.loadDetailTeam.iterations.length > 0 || self.props.loadDetailTeam.assessments.length > 0))
        showNote = {'display':'block'};
      else
        teamTypeChange = true;
    }
    console.log('teamTypeChange', teamTypeChange, _.isEqual('squad', self.props.loadDetailTeam.team.type));
    return (
      <div style={{'height': '100%'}}>
        <div class='home-team-header-teamname-btn' onClick={teamTypeChange ? self.showFullTeamSetup : self.showSquadTeamSetup}>
          <InlineSVG class='home-team-header-teamname-btn-img' src={require('../../../img/Att-icons/att-icons_team-settings-21.svg')}></InlineSVG>
        </div>

        <Modal aria-labelledby='modal-label' style={modalStyle} backdropStyle={backdropStyle} show={self.state.showTeamModal} onHide={self.hideTeamSetup}  >
          <div class='home-modal-block' style={{'height':'425px', 'width':'500px'}} id='teamSquadBlock'>
            <div class='home-modal-block-header'>
              <h>Team Setup</h>
              <div class='home-modal-block-close-btn' onClick={self.hideTeamSetup}>
                <InlineSVG title='Close' src={require('../../../img/Att-icons/att-icons-close.svg')}></InlineSVG>
              </div>
            </div>

            <div class='home-modal-block-content'>
              <div class='team-setup-squad-block'>
                <div class='team-setup-squad-icon'>
                  <InlineSVG src={require('../../../img/Att-icons/att-icons_teamsetup.svg')}></InlineSVG>
                </div>
                <div class='team-setup-squad-icon-arrow-top'>
                  <div class='line'/>
                  <InlineSVG src={require('../../../img/Att-icons/play-arrow.svg')}></InlineSVG>
                </div>
                <div class='team-setup-squad-icon-arrow-bottom'>
                  <div class='line'/>
                  <InlineSVG src={require('../../../img/Att-icons/play-arrow.svg')}></InlineSVG>
                </div>
                <div class="team-setup-squad-content">
                  <label for='squadParentSelectList'>Parent Team</label>
                  <select id='squadParentSelectList' name='squadParentSelectList' ref='rparentSelectList' disabled={!self.props.loadDetailTeam.access} defaultValue={currentParentId}>
                    <option key='' value=''>No parent team</option>
                    {parentOptions}
                  </select>
                  <div>
                    <h>{self.props.loadDetailTeam.team.name}</h>
                  </div>
                </div>
              </div>
              <p style={showNote}>Note: Because your team has an iteration result or a maturity assessment result, you no longer have abilities to add child teams beneath you.</p>
            </div>
            <div class='home-modal-block-footer ibm-btn-row' style={{'width':'95%'}}>
              <div style={{'float':'left'}}>
                <button class=' ibm-btn-sec ibm-btn-small ibm-btn-blue-50' onClick={self.confirmDelete} id='deleteBtn' ref='deleteBtn'>Delete Team</button>
              </div>
              <div style={{'float':'right'}}>
                <button class=' ibm-btn-pri ibm-btn-small ibm-btn-blue-50' style={{'marginRight':'.5em'}} onClick={self.updateTeam} id='updateBtn' ref='updateBtn'>Save Changes</button>
                <button class=' ibm-btn-sec ibm-btn-small ibm-btn-blue-50' onClick={self.hideTeamSetup} id='cancelBtn'>Cancel</button>
              </div>
            </div>
          </div>
        </Modal>

        <Modal aria-labelledby='modal-label' style={modalStyle} backdropStyle={backdropStyle} show={self.state.showFullTeamModal} onHide={self.hideFullTeamSetup}  >
          <div class='home-modal-block' style={{'height':'425px', 'width':'500px'}} id='teamTypeBlock'>
            <div class='home-modal-block-header'>
              <h>Team Setup XYZ</h>
              <div class='home-modal-block-close-btn' onClick={self.hideFullTeamSetup}>
                <InlineSVG title='Close' src={require('../../../img/Att-icons/att-icons-close.svg')}></InlineSVG>
              </div>
            </div>
            <div class='home-modal-block-content'>
              <div class='team-setup-block'>
                <div class='team-setup-icon'>
                  <InlineSVG src={require('../../../img/Att-icons/att-icons_parent+squad.svg')}></InlineSVG>
                </div>
                <div class='team-setup-icon-arrow-top'>
                  <div class='line'/>
                  <InlineSVG src={require('../../../img/Att-icons/play-arrow.svg')}></InlineSVG>
                </div>
                <div class='team-setup-icon-arrow-middle'>
                  <div class='line'/>
                  <InlineSVG src={require('../../../img/Att-icons/play-arrow.svg')}></InlineSVG>
                </div>
                <div class='team-setup-icon-arrow-bottom'>
                  <div class='line'/>
                  <InlineSVG src={require('../../../img/Att-icons/play-arrow.svg')}></InlineSVG>
                </div>
                <div class="team-setup-content">
                  <select id='parentSelectList' name='parentSelectList' ref='rparentSelectList' disabled={!self.props.loadDetailTeam.access} defaultValue={currentParentId}>
                    <option key='' value=''>No parent team</option>
                    {parentOptions}
                  </select>
                  <div>
                    <h>{self.props.loadDetailTeam.team.name}</h>
                  </div>
                  <select id='childSelectList' name='childSelectList' ref='rchildSelectList' multiple disabled={!self.props.loadDetailTeam.access}>
                    <option key='' value=''>Select one</option>
                    {parentOptions}
                  </select>
                  <div class='team-setup-children'>
                    <p>Test 1<InlineSVG src={require('../../../img/Att-icons/att-icons_remove.svg')}></InlineSVG></p>
                    <p>Test child 2</p>
                    <p>Test this section here</p>
                  </div>
                </div>
              </div>
            </div>
            <div class='home-modal-block-footer ibm-btn-row' style={{'width':'95%'}}>
              <div style={{'float':'left'}}>
                <button class=' ibm-btn-sec ibm-btn-small ibm-btn-blue-50' onClick={self.confirmDelete} id='deleteBtn' ref='deleteBtn'>Delete Team</button>
              </div>
              <div style={{'float':'right'}}>
                <button class=' ibm-btn-pri ibm-btn-small ibm-btn-blue-50' style={{'marginRight':'.5em'}} onClick={self.updateTeam} id='updateBtn' ref='updateBtn'>Save Changes</button>
                <button class=' ibm-btn-sec ibm-btn-small ibm-btn-blue-50' onClick={self.hideFullTeamSetup} id='cancelBtn'>Cancel</button>
              </div>
            </div>
          </div>
        </Modal>

        <Modal aria-labelledby='modal-label' style={modalStyle} backdropStyle={backdropStyle} show={self.state.showConfirmModal} onHide={self.hideConfirmDialog}  >
          <div class='home-modal-block' style={{'height':'290px', 'width':'370px'}}>
            <div class='home-modal-block-header' style={{'backgroundColor':'#d0021b','height':'15%'}}>
              <h>Warning!</h>
              <div class='home-modal-block-close-btn' onClick={self.hideConfirmDialog}>
                <InlineSVG title='Close' src={require('../../../img/Att-icons/att-icons-close.svg')}></InlineSVG>
              </div>
            </div>
            <div class='home-modal-block-content'>
              <p>This will permanently delete your team and remove it from all child or parent associations!</p>
              <p>Are you sure you want to continue?</p>
            </div>
            <div class='home-modal-block-footer ibm-btn-row' style={{'width':'93%','top':'-10%'}}>
              <div style={{'float':'right'}}>
                <button class=' ibm-btn-pri ibm-btn-small ibm-btn-red-50' style={{'marginRight':'.5em','background':'#d0021b none repeat scroll 0 0','borderColor':'#d0021b'}} onClick={self.deleteTeam} id='updateBtn' ref='updateBtn'>Delete</button>
                <button class=' ibm-btn-pri ibm-btn-small ibm-btn-blue-50' onClick={self.hideConfirmDialog} id='cancelBtn'>Cancel</button>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    )
  }
});
module.exports = HomeTeamSetup;