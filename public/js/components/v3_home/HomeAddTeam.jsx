var React = require('react');
var api = require('../api.jsx');
var utils = require('../utils.jsx');
var _ = require('underscore');
var InlineSVG = require('svg-inline-react');
var HomeAddTeamNameModal = require('./HomeAddTeamNameModal.jsx');
var HomeAddTeamHierarchyModal = require('./HomeAddTeamHierarchyModal.jsx');
var HomeAddTeamTypeModal = require('./HomeAddTeamTypeModal.jsx');
var HomeAddTeamMemberModal = require('./HomeAddTeamMemberModal.jsx');
var HomeAddTeamMemberRole = require('./HomeAddTeamMemberRole.jsx');
var ConfirmDialog = require('./ConfirmDialog.jsx');

var HomeAddTeam = React.createClass({
  getInitialState: function() {
    return {
      screenStatus: {
        showTeamNameModal: {active: false},
        showTeamTypeModal: {active: false},
        showTeamHierarchyModal: {active: false},
        showTeamMemberModal: {active: false},
        showTeamMemberRoleModal: {active: false}
      },
      screenPropKey: [
        'showTeamNameModal',
        'showTeamTypeModal',
        'showTeamHierarchyModal',
        'showTeamMemberModal',
        'showTeamMemberRoleModal'
      ],
      currentScreen: 'showTeamNameModal',
      newTeamObj: {},
      selectableParents: [],
      selectableChildren: [],
      selectedParentTeam: {},
      selectedChildTeams: [],
      teamNames: [],
      teamMembers: [],
      showConfirmModal: false
    };
  },

  componentDidMount: function() {
    this.getTeamNames();
    this.showTooltip();
  },

  componentWillUpdate: function(nextProps, nextState) {
    this.showTooltip();
  },

  showTooltip: function() {
    setTimeout(function(){
      $('.home-nav-tab-buttons .createnewteam-btn svg').attr('title', 'Create New Team');
    },2);
  },

  getTeamNames: function() {
    var self = this;
    return api.fetchTeamNames()
      .then(function(teams) {
        self.setState({
          teamNames: teams
        });
      });
  },

  createNewTeam: function() {
    this.setState({newTeamObj: {type: 'null'}});
    this.openWindow('showTeamNameModal');
  },

  openWindow: function(screenName) {
    var self = this;
    screenName = screenName || self.state.currentScreen;
    if (screenName != '' && self.state.screenPropKey.indexOf(screenName) != -1) {
      var screenStatus = self.state.screenStatus;
      var currentScreen = self.state.currentScreen;
      for(var key in screenStatus) {
        if (key != screenName)
          screenStatus[key].active = false;
        else
          screenStatus[key].active = true;
      }
      self.setState({
        screenStatus : screenStatus,
        currentScreen: screenName
      });
    }
  },

  closeWindow: function() {
    var self = this;
    var screenName = self.state.currentScreen;
    if (screenName != '' && self.state.screenPropKey.indexOf(screenName) != -1) {
      var screenStatus = self.state.screenStatus;
      screenStatus[screenName].active = false;
      self.setState({screenStatus : screenStatus});
      this.resetTeamHierarchy();
    }

    // if the Window is close then lets clear the newTeamObj state variable.
    this.setState({newTeamObj: {}});
  },

  resetTeamHierarchy: function(){
    var self = this;
    self.setState({
      selectedParentTeam : {},
      selectedChildTeams : []
    });
  },

  setTeamNameDesc: function(name, description) {
    var team = this.state.newTeamObj;
    team.name = name;
    team.description = description;
    this.setState({ newTeamObj: team });
  },

  setSelectableParents: function(teams) {
    this.setState({ selectableParents: teams });
  },

  setSelectableChildren: function(teams) {
    this.setState({ selectableChildren: teams });
  },

  setTeamType: function(type) {
    var team = this.state.newTeamObj;
    team.type = type;
    this.setState({ newTeamObj: team });
  },

  setTeamMember: function(members) {
    var team = this.state.newTeamObj;
    team.members = members;
    this.setState({ newTeamObj: team });
  },

  setSelectedParentTeam: function(team) {
    this.setState({ selectedParentTeam: team });
  },

  setSelectedChildTeams: function(teams) {
    this.setState({ selectedChildTeams: teams });
  },

  saveTeam: function() {
    var self = this;
    var currentTeam = {};
    var promiseArray = [];

    api.postTeam(JSON.stringify(self.state.newTeamObj))
      .then(function(result) {
        currentTeam = result;
        // self.props.tabClickedHandler('',currentTeam.pathId);
        return result;
      })
      .then(function(result) {
         //if there is parent:
         if (!_.isEmpty(self.state.selectedParentTeam))
         {
          api.associateTeam(self.state.selectedParentTeam._id, currentTeam._id)
           .then(function(result) {
           });
         }
         return result;
      })
      .then (function(result) {
        //if there is child(ren):
         if (!_.isEmpty(self.state.selectedChildTeams)&& self.state.selectedChildTeams.length >0)
         {
           _.each(self.state.selectedChildTeams, function(childTeam) {
             promiseArray.push(api.associateTeam(currentTeam._id, childTeam._id));
            });

            if (promiseArray.length > 0)
              Promise.all(promiseArray);
         }
         self.closeWindow();
         // alert('You have successfully added this team. ');
         self.props.tabClickedHandler('',currentTeam.pathId);
         self.setState({showConfirmModal: true});
      })
      .catch(function(err) {
        if (err) {
          var str = '';
          var err1 = [];
          var err2 = [];
          try {
            if (err && err['responseJSON']) {
              var tmperr = err['responseJSON']['errors'];
              _.each(tmperr, function(e, idx, ls) {
                var divIdx = parseInt(idx.match(/\d+/)[0], 10);
                utils.highlightErrorField(e.path, divIdx);
                err1.push(e['message']);
              });
              err2 = utils.returnUniqErrors(err1);
              _.each(err2, function(s) {
                str = str + ' ' + s + '\n';
              });
              alert(str);
            } else {
              alert(err);
            }
          } catch(e) {
            console.log('e:', e);
          }
        }
        console.log(err);
      });
  },

  onchangeParentTeamDropdown: function(event) {
    var selectVal = event.target.value;
    var selectText = $('#' + event.target.id + ' option:selected').text();
    var obj = {
      value: selectVal,
      text: selectText
    }
    this.setState({selectedParentTeam: obj});
  },

  hideConfirmDialog: function() {
    this.setState({showConfirmModal: false});
  },

  render: function () {
    var self = this;
    var addBtnStyle = self.props.access?'block':'none';

    return (
      <div class='home-nav-tab-buttons-item' style={{'display': 'block'}}>
        <div style={{'width':'100%','height':'100%'}} class='createnewteam-btn'>
          <InlineSVG onClick={this.createNewTeam} src={require('../../../img/Att-icons/att-icons_Add.svg')}></InlineSVG>
        </div>

        <HomeAddTeamNameModal activeWindow={this.state.screenStatus['showTeamNameModal'].active} closeWindow={self.closeWindow} openWindow={self.openWindow} newTeamObj={self.state.newTeamObj} setTeamNameDesc={self.setTeamNameDesc} />

        <HomeAddTeamTypeModal activeWindow={this.state.screenStatus['showTeamTypeModal'].active} closeWindow={self.closeWindow} openWindow={self.openWindow} newTeamObj={self.state.newTeamObj} setTeamType={self.setTeamType} selectableParents={self.state.selectableParents} setSelectableParents={self.setSelectableParents}  selectedParentTeam={self.state.selectedParentTeam} setSelectedParentTeam={self.setSelectedParentTeam} setTeamMember={self.setTeamMember} />

        <HomeAddTeamMemberModal activeWindow={this.state.screenStatus['showTeamMemberModal'].active} closeWindow={self.closeWindow} openWindow={self.openWindow} newTeamObj={self.state.newTeamObj} setTeamMember={self.setTeamMember}  />

        <HomeAddTeamHierarchyModal activeWindow={this.state.screenStatus['showTeamHierarchyModal'].active} closeWindow={self.closeWindow} openWindow={self.openWindow}
        selectableParents={self.state.selectableParents} selectedParentTeam={self.state.selectedParentTeam} setSelectedParentTeam={self.setSelectedParentTeam}
        setSelectableChildren={self.setSelectableChildren}  selectableChildren={self.state.selectableChildren} setSelectedChildTeams={self.setSelectedChildTeams} selectedChildTeams={self.state.selectedChildTeams} />

        <HomeAddTeamMemberRole activeWindow={this.state.screenStatus['showTeamMemberRoleModal'].active} closeWindow={self.closeWindow} openWindow={self.openWindow} newTeamObj={self.state.newTeamObj} setTeamMember={self.setTeamMember} roles={self.props.roles} saveTeam={self.saveTeam}/>

        <ConfirmDialog showConfirmModal={self.state.showConfirmModal} confirmAction={self.hideConfirmDialog} alertType='information' content={'You have successfully added this team.'} actionBtnLabel='Ok' />
        {/*
        //TODO, needs only to pass newTeamObj as the container object of the new team related data, and only relevant setter functions that will update the object.
        <HomeAddTeamHierarchyModal showModal={this.state.showTeamHierarchyModal} closeWindow={self.hideTeamHierarchyModal}  updateStep={self.updateStep} setTeamObj={self.setTeamObj} getTeamObj={getTeamObj} onchangeParentTeamDropdown={self.onchangeParentTeamDropdown} teamNames={self.state.teamNames} selectableParents={self.state.selectableParents} onchangeChildTeamList={self.onchangeChildTeamList}/>
        <HomeAddTeamMemberRoleModal showModal={this.state.showTeamNameModal} closeWindow={self.hideAddTeamModal} />
        */}
      </div>
    )
  }
});
module.exports = HomeAddTeam;