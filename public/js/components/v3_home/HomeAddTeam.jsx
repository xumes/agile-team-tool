var React = require('react');
var api = require('../api.jsx');
var _ = require('underscore');
var InlineSVG = require('svg-inline-react');
var HomeAddTeamNameModal = require('./HomeAddTeamNameModal.jsx');

var HomeAddTeam = React.createClass({
  getInitialState: function() {
    return {
      showTeamNameModal: false,
      showTeamTypeModal: false,
      showTeamMemberModal: false,
      showTeamMemberRoleModal: false
     };
  },

  addTeamModal: function() {
    this.setState({showTeamNameModal:  true })
  },

  hideAddTeamModal: function() {
    this.setState({showTeamNameModal:  false })
  },

  render: function () {
    var self = this;
    var addBtnStyle = self.props.access?'block':'none';

    return (
      <div>
        <div class='home-nav-tab-buttons-item' style={{'display': addBtnStyle}}>
          <InlineSVG onClick={this.addTeamModal}  src={require('../../../img/Att-icons/att-icons_Add.svg')}></InlineSVG>
        </div>

        <HomeAddTeamNameModal showModal={this.state.showTeamNameModal} closeWindow={self.hideAddTeamModal} />

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
