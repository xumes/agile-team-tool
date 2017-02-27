var React = require('react');
var api = require('../api.jsx');
var _ = require('underscore');
var InlineSVG = require('svg-inline-react');
var HomeAddTeamNameModal = require('./HomeAddTeamNameModal.jsx');
var HomeAddTeamHierarchyModal = require('./HomeAddTeamHierarchyModal.jsx');
var HomeAddTeamTypeModal = require('./HomeAddTeamTypeModal.jsx');
var HomeAddTeamMemberModal = require('./HomeAddTeamMemberModal.jsx');
var HomeAddTeamMemberRole = require('./HomeAddTeamMemberRole.jsx');

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
      teamMembers: []
    };
  },

  componentDidMount: function() {
    this.getTeamNames();
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
    this.setState({ newTeamObj: {} });
    this.openWindow('showTeamNameModal');
  },

  openWindow: function(screenName) {
    var self = this;
    screenName = screenName || self.state.currentScreen;
    console.log('openWindow', screenName, self.state);
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
    console.log('closeWindow', screenName, self.state);
    if (screenName != '' && self.state.screenPropKey.indexOf(screenName) != -1) {
      var screenStatus = self.state.screenStatus;
      screenStatus[screenName].active = false;
      self.setState({screenStatus : screenStatus});
      this.resetTeamHierarchy();
    }
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
    console.log('setTeamType', team);
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
    console.log('new team is:'+ JSON.stringify(this.state.newTeamObj));

    /*
    api.postTeam() // save team
    api.associateTeam() // parent
    api.associateTeam() // children
    */
  },

  onchangeParentTeamDropdown: function(event) {
    var selectVal = event.target.value;
    var selectText = $('#' + event.target.id + ' option:selected').text();
    var obj = {
      value: selectVal,
      text: selectText
    }
    this.setState({selectedParentTeam: obj});
    console.log('in onchange parent team dropdown'+JSON.stringify(this.state.selectedParentTeam));
  },

  render: function () {
    var self = this;
    var addBtnStyle = self.props.access?'block':'none';

    return (
      <div>
        <div class='home-nav-tab-buttons-item' style={{'display': addBtnStyle}}>
          <InlineSVG onClick={self.createNewTeam} src={require('../../../img/Att-icons/att-icons_Add.svg')}></InlineSVG>
        </div>

        <HomeAddTeamNameModal activeWindow={this.state.screenStatus['showTeamNameModal'].active} closeWindow={self.closeWindow} openWindow={self.openWindow} newTeamObj={self.state.newTeamObj} setTeamNameDesc={self.setTeamNameDesc} />

        <HomeAddTeamTypeModal activeWindow={this.state.screenStatus['showTeamTypeModal'].active} closeWindow={self.closeWindow} openWindow={self.openWindow} newTeamObj={self.state.newTeamObj} setTeamType={self.setTeamType} selectableParents={self.state.selectableParents} setSelectableParents={self.setSelectableParents}  selectedParentTeam={self.state.selectedParentTeam} setSelectedParentTeam={self.setSelectedParentTeam} />

        <HomeAddTeamMemberModal activeWindow={this.state.screenStatus['showTeamMemberModal'].active} closeWindow={self.closeWindow} openWindow={self.openWindow} newTeamObj={self.state.newTeamObj} setTeamMember={self.setTeamMember}  />

        <HomeAddTeamHierarchyModal activeWindow={this.state.screenStatus['showTeamHierarchyModal'].active} closeWindow={self.closeWindow} openWindow={self.openWindow} 
        selectableParents={self.state.selectableParents} selectedParentTeam={self.state.selectedParentTeam} setSelectedParentTeam={self.setSelectedParentTeam} 
        setSelectableChildren={self.setSelectableChildren}  selectableChildren={self.state.selectableChildren} setSelectedChildTeams={self.setSelectedChildTeams} selectedChildTeams={self.state.selectedChildTeams}
        />

        <HomeAddTeamMemberRole activeWindow={this.state.screenStatus['showTeamMemberRoleModal'].active} closeWindow={self.closeWindow} openWindow={self.openWindow} newTeamObj={self.state.newTeamObj} setTeamMember={self.setTeamMember} roles={self.props.roles} saveTeam={self.saveTeam}/>

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
