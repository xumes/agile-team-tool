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
      showTeamMemberRoleModal: false
     };
  },

  addTeamNameModal: function() {
    this.setState({showTeamNameModal: true});
  },

  hideAddTeamNameModal: function() {
    this.setState({showTeamNameModal: false});
  },

  updateStep: function(step) {
    var self = this;
    console.log('updateStep:', step);
    this.hideAllTeamCreateModal();
    if (step == 'showTeamTypeSelection') {
      this.setState({showTeamTypeModal: true});
    }
    if (step == 'showAddTeamMembers') {
      this.setState({showTeamMemberModal: true});
    }
  },

  hideTeamTypeModal: function() {
    this.setState({showTeamTypeModal: false});
  },

  hideAllTeamCreateModal: function() {
    this.setState({showTeamNameModal: false});
    this.setState({showTeamTypeModal: false});
    this.setState({showTeamMemberModal: false});
    this.setState({showTeamMemberRoleModal: false});
  },

  render: function () {
    var self = this;
    var addBtnStyle = self.props.access?'block':'none';

    return (
      <div>
        <div class='home-nav-tab-buttons-item' style={{'display': addBtnStyle}}>
          <InlineSVG onClick={this.addTeamNameModal} src={require('../../../img/Att-icons/att-icons_Add.svg')}></InlineSVG>
        </div>

        <HomeAddTeamNameModal showModal={this.state.showTeamNameModal} closeWindow={self.hideAddTeamNameModal} updateStep={self.updateStep} />
        <HomeAddTeamTypeModal showModal={this.state.showTeamTypeModal} closeWindow={self.hideTeamTypeModal} loadDetailTeam={self.props.loadDetailTeam} updateStep={self.updateStep} />

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
