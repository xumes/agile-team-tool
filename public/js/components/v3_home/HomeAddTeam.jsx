var React = require('react');
var api = require('../api.jsx');
var _ = require('underscore');
var InlineSVG = require('svg-inline-react');
var HomeAddTeamNameModal = require('./HomeAddTeamNameModal.jsx');
var HomeTeamParentChildHierModal = require('./HomeAddTeamNameModal.jsx');

var HomeAddTeam = React.createClass({
  getInitialState: function() {
    return {
      showTeamNameModal: false,
      showTeamTypeModal: false,
      showTeamParentChildHierModal: false,
      showTeamMemberModal: false,
      showTeamMemberRoleModal: false,
      newTeam: new Object()
     };
  },

  addTeamNameModal: function() {
    this.setState({showTeamNameModal:  true })
  },

  hideAddTeamNameModal: function() {
    console.log('in hideAddTeamNameModal');
    this.setState({showTeamNameModal:  false })
  },

  addTeamParentChildHierModal: function() {
    this.setState({showTeamParentChildHierModal:  true })
  },

  hideTeamParentChildHierModal: function() {
    console.log('in hideAddTeamNameModal');
    this.setState({showTeamParentChildHierModal:  false })
  },

  updateTeam: function(teamName, teamDescription){
     var rObject = {
       'name': teamName,
       'description': teamDescription
    };

    this.setState({
      newTeam: rObject
    });
  },

  render: function () {
    var self = this;
    var addBtnStyle = self.props.access?'block':'none';

    return (
      <div>
        <div class='home-nav-tab-buttons-item' style={{'display': addBtnStyle}}>
          <InlineSVG onClick={this.addTeamNameModal}  src={require('../../../img/Att-icons/att-icons_Add.svg')}></InlineSVG>
        </div>

        <HomeAddTeamNameModal showModal={this.state.showTeamNameModal} closeWindow={self.hideAddTeamNameModal} newTeam={self.state.newTeam} updateTeam={this.updateTeam} showParentChildHierModal={this.addTeamParentChildHierModal}/>

        <HomeTeamParentChildHierModal showModal={this.state.showTeamParentChildHierModal} closeWindow={self.hideTeamParentChildHierModal} newTeam={self.state.newTeam} updateTeam={this.updateTeam}/>

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
