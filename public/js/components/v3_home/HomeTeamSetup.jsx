var React = require('react');
var api = require('../api.jsx');
var _ = require('underscore');
var InlineSVG = require('svg-inline-react');
var Modal = require('react-overlays').Modal;
var currentTeamId = '';
var currentParentId = '';
var currentChildren = [];
var allowTeamTypeChange = false;
var self = this;

var HomeTeamSetup = React.createClass({
  getInitialState: function() {
    return {
      showParentSetup: false,
      showTreeSetup: false,
      showConfirmModal: false,
      selectableParents: [],
      selectableChildren: [],
      children: [],
      childCount: 0
    }
  },
  componentDidUpdate: function(prevProps, prevState) {
    var self = this;

    if (!self.state.showParentSetup) {
      $('#childSelectList').val('').change();
    }
  },
  selectListInit: function(loadDetailTeam) {
    var self = this;
    return new Promise(function(resolve, reject) {

      var promiseArray = [];
      allowTeamTypeChange = false;
      if (!_.isEqual('squad', loadDetailTeam.type) || (loadDetailTeam.iterations.length == 0 && loadDetailTeam.assessments.length == 0))
        allowTeamTypeChange = true;

      promiseArray.push(api.getSelectableParents(loadDetailTeam.team._id));
      promiseArray.push(api.getChildrenTeams(loadDetailTeam.team.pathId));
      if (allowTeamTypeChange)
        promiseArray.push(api.getSelectableChildren(loadDetailTeam.team._id));

      Promise.all(promiseArray)
        .then(function(results) {
          var selectableParents = _.sortBy(results[0], 'name');
          var children = _.sortBy(results[1], 'name');
          var selectableChildren = [];
          if (allowTeamTypeChange) {
            selectableChildren = results[2];
            // adding existing children for possible add/remove
            _.each(children, function(childTeam) {
              selectableChildren.push(childTeam);
            });
            _.sortBy(results[2], 'name');
          }
          currentChildren = _.clone(children);
          currentTeamId = loadDetailTeam.team._id;
          if (loadDetailTeam.team.path != null) {
            currentParentId = loadDetailTeam.hierarchy[loadDetailTeam.hierarchy.length - 1]._id;
            selectableChildren = _.reject(selectableChildren, function(team) {
              return team._id == loadDetailTeam.hierarchy[0]._id && !_.isEqual('squad', team.type);
            });
          } else {
            currentParentId = '';
          }

          var returnNewState = {
            selectableParents: selectableParents,
            selectableChildren: selectableChildren,
            children: children,
            childCount: children.length
          };

          return resolve(returnNewState);
        })
        .catch(function(err){
          console.log(err);
          return reject(err);
        });
    });
  },
  parentSelectHandler: function(e) {
    var self = this;
    if (self.state.showTreeSetup) {
      var selectedParent = $('#parentSelectList option:selected').val();
      if (!_.isEmpty(selectedParent)) {
        var parentTeam = _.find(self.state.selectableParents, function(team) {
          if (team._id == selectedParent) return team;
        });
        /*
        var childTeam = _.find(self.state.children, function(team) {
          if (team._id == selectedParent) return team;
        })
        if (!_.isEmpty(childTeam) && _.isEqual(childTeam._id, parentTeam._id)) {
          alert(parentTeam.name + ' cannot be both a parent and a child.');
          $('#parentSelectList').val('').change();
          return;
        }
        */
        _.each(self.state.children, function(childTeam) {
          console.log(childTeam, childTeam.path);
          if (_.isEqual(childTeam._id, parentTeam._id)) {
            alert(parentTeam.name + ' cannot be both a parent and a child.');
            $('#parentSelectList').val('').change();
            return;
          }
          if (!_.isEmpty(parentTeam.path)) {
            var rootPathId = parentTeam.path.split(',')[1];
            if (_.isEqual(rootPathId, childTeam.pathId)) {
              alert(parentTeam.name + ' cannot be your parent team since it is reporting to '+childTeam.name+', that is already listed as your child team.');
              $('#parentSelectList').val('').change();
              return;
            }
          }
        })
      }
    }
  },
  childSelectHandler: function(e) {
    var self = this;
    var selectedParent = self.state.showParentSetup ? $('#squadParentSelectList option:selected').val() : $('#parentSelectList option:selected').val();
    var selectedChild = $('#childSelectList option:selected').val();
    if (!_.isEmpty(selectedChild)) {
      var childTeam = _.find(self.state.selectableChildren, function(team) {
        if (team._id == selectedChild) return team;
      })
      if (_.isEqual(selectedParent, selectedChild)) {
        alert(childTeam.name + ' cannot be both a parent and a child.');
        $('#childSelectList').val('').change();
        return;
      }
      if (!_.isEmpty(selectedParent)) {
        var parentTeam = _.find(self.state.selectableParents, function(team) {
          if (team._id == selectedParent) return team;
        });
        if (!_.isEmpty(parentTeam.path)) {
          var rootPathId = parentTeam.path.split(',')[1];
          if (_.isEqual(rootPathId, childTeam.pathId)) {
            alert(childTeam.name + ' cannot be added as a child since your current parent team, '+parentTeam.name+', is reporting to it.');
            $('#childSelectList').val('').change();
            return;
          }
        }
      }
      if ($('.team-setup-children p#'+selectedChild).length > 0) {
        alert(childTeam.name + ' is already listed.');
        $('#childSelectList').val('').change();
        return;
      }
      var children = self.state.children;
      children.push(childTeam);
      children = _.sortBy(children, 'name');
      self.setState({children:children});
    }
  },
  childDeleteHandler: function(id) {
    var self = this;
    var children = self.state.children;
    children = _.filter(children, function(team) {
      return !_.isEqual(id, team._id);
    });

    self.setState({children:children});
  },
  show: function() {
    var self = this;
    if (self.state.showParentSetup) {
      $('#teamParentSetupBlock select').select2({'dropdownParent':$('#teamParentSetupBlock')});
      $('#squadParentSelectList').val(currentParentId).change();

    } else if (self.state.showTreeSetup) {
      $('#teamTreeSetupBlock select').select2({'dropdownParent':$('#teamTreeSetupBlock')});
      $('#parentSelectList').val(currentParentId).change();
      $('#parentSelectList').change(self.parentSelectHandler);
      $('#childSelectList').val('').change();
      $('#childSelectList').change(self.childSelectHandler);
    }
  },
  showTeamSetup: function() {
    var self = this;
    self.selectListInit(self.props.loadDetailTeam)
      .then(function(result) {
        if (!allowTeamTypeChange)
          self.setState({
            showParentSetup: true,
            selectableParents: result.selectableParents,
            selectableChildren: result.selectableChildren,
            children: result.children
          });
        else
          self.setState({
            showTreeSetup: true,
            selectableParents: result.selectableParents,
            selectableChildren: result.selectableChildren,
            children: result.children
          });
     })
      .catch(function(err) {
        console.log(err);
     });
  },
  hideTeamSetup: function() {
    if (!allowTeamTypeChange)
      this.setState({ showParentSetup: false });
    else
      this.setState({ showTreeSetup: false });
  },
  confirmDelete: function() {
    this.setState({ showConfirmModal: true });
  },
  hideConfirmDialog: function() {
    this.setState({ showConfirmModal: false });
  },
  deleteTeam: function() {
    var self = this
    var team = self.props.loadDetailTeam.team;
    api.deleteTeam(JSON.stringify(team))
      .then(function(result) {
        //alert('You have successfully deleted the team.');
        self.props.tabClickedHandler('','');
      })
      .catch(function(err) {
        alert(err);
        console.log(err);
      });
    this.setState({
      showParentSetup: false,
      showTreeSetup: false,
      showConfirmModal: false
    });

  },
  updateTeamSetup: function() {
    var self = this;
    var team = self.props.loadDetailTeam.team;
    var promiseArray = [];

    //TODO: try Promoise.seq or Promise.each for sequential updates.

    // check for any parent update
    var newParentId = self.state.showParentSetup ? $('#squadParentSelectList option:selected').val() : $('#parentSelectList option:selected').val();
    if (!_.isEqual(currentParentId, newParentId)) {
      currentParentId = newParentId;
      //console.log('parent update detected', currentParentId, newParentId);
      if (newParentId != '')
        promiseArray.push(api.associateTeam(newParentId, team._id));
      else
        promiseArray.push(api.removeAssociation(team._id))
    }

    // check for any child update
    //console.log(currentChildren, self.state.children);
    _.each(currentChildren, function(childTeam) {
      var team = _.find(self.state.children, function(team) {
        if (team._id == childTeam._id)
          return team;
      });
      if (_.isEmpty(team)) {
        //console.log('removed child detected', childTeam);
        promiseArray.push(api.removeAssociation(childTeam._id));
      }
    })
    _.each(self.state.children, function(childTeam) {
      var team = _.find(currentChildren, function(team) {
        if (team._id == childTeam._id)
          return team;
      });
      if (_.isEmpty(team)) {
        //console.log('add child detected', team);
        promiseArray.push(api.associateTeam(currentTeamId, childTeam._id));
      }
    });

    // if squad, check if need to change type first
    var teamTypeUpdated = false;
    if (allowTeamTypeChange) {
      if (_.isEqual('squad', team.type) && self.state.children.length > 0) {
        //console.log('team type update detected', self.state);
        team.type = null;
        promiseArray.push(api.putTeam(JSON.stringify(team)));
      }
      teamTypeUpdated = true;
    }

    if (teamTypeUpdated) {
      api.putTeam(JSON.stringify(team))
        .then(function(result) {
          return Promise.all(promiseArray);
        })
        .then(function(results) {
          if (results.length > 0) {
            self.props.tabClickedHandler('',team.pathId);
          }
          self.hideTeamSetup();
          return null;
        })
        .catch(function(err) {
          console.log(err);
          return err;
        });
    } else {
      Promise.all(promiseArray)
        .then(function(results) {
          if (results.length > 0) {
            self.props.tabClickedHandler('',team.pathId);
          }
          self.hideTeamSetup();
          return null;
        })
        .catch(function(err) {
          console.log(err);
          return err;
        });
    }
  },

  render: function() {
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
    //console.log('selectableParents.length', self.state.selectableParents.length);
    var parentOptions = null;
    if (self.state.selectableParents.length > 0) {
      var parentOptions = self.state.selectableParents.map(function(item, index) {
        return (
          <option key={index} value={item._id}>{item.name}</option>
        )
      });
    }
    //console.log('selectableChildren.length', selectableChildren.length);
    var childOptions = null;
    if (self.state.selectableChildren.length > 0) {
      var childOptions = self.state.selectableChildren.map(function(item, index) {
        return (
          <option key={index} value={item._id} >{item.name}</option>
        )
      });
    }

    //console.log('children.length', self.state.children.length);
    var childTeams = null;
    if (self.state.children.length > 0) {
      childTeams = self.state.children.map(function(item, index) {
        return (
          <p key={index} id={item._id}>
            <h title={item.name}>{item.name}</h>
            <InlineSVG class='team-setup-children-remove-icon' src={require('../../../img/Att-icons/att-icons_remove.svg')} onClick={!self.props.loadDetailTeam.access ? '' : self.childDeleteHandler.bind(null, item._id)}></InlineSVG>
          </p>
        )
      });
    }

    // if team type squad, and iteration or assessment exist, show note
    var showNote = {'display':'none'};
    if (!_.isEmpty(self.props.loadDetailTeam)) {
      if (!allowTeamTypeChange)
        showNote = {'display':'block'};
    }

    return (
      <div style={{'height': '100%'}} id='teamSetupBlock'>
        <div class='home-team-header-teamname-btn' onClick={self.showTeamSetup}>
          <InlineSVG class='home-team-header-teamname-btn-img' src={require('../../../img/Att-icons/att-icons_team-settings-open.svg')}></InlineSVG>
        </div>

        <Modal aria-labelledby='modal-label' style={modalStyle} backdropStyle={backdropStyle} show={self.state.showParentSetup} onHide={self.hideTeamSetup}  onShow={self.show}>
          <div class='home-modal-block' style={{'height':'425px', 'width':'500px'}} id='teamParentSetupBlock'>
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
                  <select id='squadParentSelectList' name='squadParentSelectListA' disabled={!self.props.loadDetailTeam.access} defaultValue={currentParentId}>
                    <option key='pdef' value=''>No parent team</option>
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
                <button class=' ibm-btn-sec ibm-btn-small ibm-btn-blue-50' onClick={self.confirmDelete} id='deleteBtn' disabled={!self.props.loadDetailTeam.access} >Delete Team</button>
              </div>
              <div style={{'float':'right'}}>
                <button class=' ibm-btn-pri ibm-btn-small ibm-btn-blue-50' style={{'marginRight':'.5em'}} onClick={self.updateTeamSetup} id='updateBtn' disabled={!self.props.loadDetailTeam.access} >Save Changes</button>
                <button class=' ibm-btn-sec ibm-btn-small ibm-btn-blue-50' onClick={self.hideTeamSetup} id='cancelBtn'>Cancel</button>
              </div>
            </div>
          </div>
        </Modal>

        <Modal aria-labelledby='modal-label' style={modalStyle} backdropStyle={backdropStyle} show={self.state.showTreeSetup} onHide={self.hideTeamSetup}  onShow={self.show}>
          <div class='home-modal-block' style={{'height':'425px', 'width':'500px'}} id='teamTreeSetupBlock'>
            <div class='home-modal-block-header'>
              <h>Team Setup</h>
              <div class='home-modal-block-close-btn' onClick={self.hideTeamSetup}>
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
                  <select id='parentSelectList' name='parentSelectList' disabled={!self.props.loadDetailTeam.access} defaultValue={currentParentId}>
                    <option key='pdef' value=''>No parent team</option>
                    {parentOptions}
                  </select>
                  <div>
                    <h>{self.props.loadDetailTeam.team.name}</h>
                  </div>
                  <select id='childSelectList' name='childSelectList' disabled={!self.props.loadDetailTeam.access}>
                    <option key='cdef' value=''>Select one</option>
                    {childOptions}
                  </select>
                  <div class='team-setup-children' style={!self.props.loadDetailTeam.access ? {'backgroundColor' : '#ececec'} : {'backgroundColor' : 'inherit'}}>
                    {childTeams}
                  </div>
                </div>
              </div>
            </div>
            <div class='home-modal-block-footer ibm-btn-row' style={{'width':'95%'}}>
              <div style={{'float':'left'}}>
                <button class=' ibm-btn-sec ibm-btn-small ibm-btn-blue-50' onClick={self.confirmDelete} id='deleteBtn' disabled={!self.props.loadDetailTeam.access} >Delete Team</button>
              </div>
              <div style={{'float':'right'}}>
                <button class=' ibm-btn-pri ibm-btn-small ibm-btn-blue-50' style={{'marginRight':'.5em'}} onClick={self.updateTeamSetup} id='updateBtn' disabled={!self.props.loadDetailTeam.access} >Save Changes</button>
                <button class=' ibm-btn-sec ibm-btn-small ibm-btn-blue-50' onClick={self.hideTeamSetup} id='cancelBtn'>Cancel</button>
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
