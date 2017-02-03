var React = require('react');
var api = require('../api.jsx');
var _ = require('underscore');
var InlineSVG = require('svg-inline-react');
var HomeAddTeamNameModal = require('./HomeAddTeamNameModal.jsx');
var HomeAddTeamTypeModal = require('./HomeAddTeamTypeModal.jsx');

var HomeAddTeam = React.createClass({
  getInitialState: function() {
    return {
      showTeamNameModal: false,
      showTeamTypeModal: false,
      showTeamMemberModal: false,
      showTeamMemberRoleModal: false,
      showTeamHierarchyModal: false,
      newTeamObj: {},
      selparentList: 'none',
      selectedteamType: '',
      newTeamName: '',
      newTeamDescription: '',
      selectedParentTeam: ''
     };
  },

  addTeamNameModal: function() {
    this.clearFormFields();
    this.setState({showTeamNameModal: true});
  },

  hideAddTeamNameModal: function() {
    this.setState({showTeamNameModal: false});
  },

  updateStep: function(step) {
    var self = this;
    console.log('HomeAddTeam updateStep:', step);
    this.hideAllTeamCreateModal();
    if (step == 'showTeamTypeSelection') {
      this.setState({showTeamTypeModal: true});
    } else if (step == 'showAddTeamMembers') {
      this.setState({showTeamMemberModal: true});
    } else if (step == 'showMemberTeamRole') {
      this.setState({showTeamMemberRoleModal: true});
    } else if (step == 'showParentChildTeamHierarchy') {
      this.setState({showTeamHierarchyModal: true});
    }
  },

  setTeamObj: function(value) {
    console.log('HomeAddTeam newTeamObj:', JSON.stringify(value));
    this.setState({newTeamObj: value});
  },

  hideTeamTypeModal: function() {
    this.setState({showTeamTypeModal: false});
    this.setState({selectedteamType: ''});
  },

  hideAllTeamCreateModal: function() {
    this.setState({showTeamNameModal: false});
    this.setState({showTeamTypeModal: false});
    this.setState({showTeamMemberModal: false});
    this.setState({showTeamMemberRoleModal: false});
    this.setState({showTeamHierarchyModal: false});
  },

  onchangeTeamtypeRadio: function(event) {
    var selectVal = event.target.value;
    console.log('HomeAddTeam onchangeTeamtypeRadio selectVal:', selectVal);
    $('#btn-teamtypeselect').prop('disabled', false);
    if (selectVal == 'squadteam') {
      this.setState({selparentList: 'block'});
    } else {
      this.setState({selparentList: 'none'});
    }
    this.setState({selectedteamType: selectVal});
  },

  onchangeParentTeamDropdown: function(event) {
    var selectVal = event.target.value;
    this.setState({selectedParentTeam: selectVal});
  },

  changeHandlerTeamName: function(event) {
    this.setState({newTeamName: event.target.value});
  },

  changeHandlerTeamDesc: function(event) {
    this.setState({newTeamDescription: event.target.value});
  },

  clearFormFields: function() {
    this.setState({newTeamName: ''});
    this.setState({newTeamDescription: ''});
    this.setState({selectedteamType: ''});
    this.setState({selectedParentTeam: ''});
  },

  render: function () {
    var self = this;
    var addBtnStyle = self.props.access?'block':'none';
    var getTeamObj = function() {
      var obj = {
        name: self.state.newTeamName || '',
        description: self.state.newTeamDescription || ''
      }
      return obj;
    };
    return (
      <div>
        <div class='home-nav-tab-buttons-item' style={{'display': addBtnStyle}}>
          <InlineSVG onClick={this.addTeamNameModal} src={require('../../../img/Att-icons/att-icons_Add.svg')}></InlineSVG>
        </div>

        <HomeAddTeamNameModal showModal={this.state.showTeamNameModal} closeWindow={self.hideAddTeamNameModal} updateStep={self.updateStep} setTeamObj={self.setTeamObj} getTeamObj={getTeamObj} changeHandlerTeamName={self.changeHandlerTeamName} changeHandlerTeamDesc={self.changeHandlerTeamDesc} />
        <HomeAddTeamTypeModal showModal={this.state.showTeamTypeModal} closeWindow={self.hideTeamTypeModal} loadDetailTeam={self.props.loadDetailTeam} updateStep={self.updateStep} newTeamObj={self.state.newTeamObj} onchangeTeamtypeRadio={self.onchangeTeamtypeRadio} selectedteamType={self.state.selectedteamType} onchangeParentTeamDropdown={self.onchangeParentTeamDropdown} />

        {/*
        <HomeAddTeamTypeModal showModal={this.state.showTeamNameModal} closeWindow={self.hideAddTeamModal} />

        <HomeAddTeamMemberModal showModal={this.state.showTeamNameModal} closeWindow={self.hideAddTeamModal} />

        <HomeAddTeamMemberRoleModal showModal={this.state.showTeamNameModal} closeWindow={self.hideAddTeamModal} />
        */}
      </div>
    )
  }
});
module.exports = HomeAddTeam;
