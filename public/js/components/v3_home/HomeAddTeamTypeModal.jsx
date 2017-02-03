var React = require('react');
var api = require('../api.jsx');
var _ = require('underscore');
var InlineSVG = require('svg-inline-react');
var Modal = require('react-overlays').Modal;
var HomeTeamTypeRadioOptions = require('./HomeTeamTypeRadioOptions.jsx');
var HomeTeamTypeFooter = require('./HomeTeamTypeFooter.jsx');

var HomeAddTeamTypeModal = React.createClass({
  getInitialState: function() {
    return {
      teamTypeSelModal: true,
      selectedteamType: '',
      selparentList: 'none',
      teamNames: []
    }
  },

  getTeamNames: function() {
    var self = this;
    return api.fetchTeamNames()
      .then(function(teams) {
        self.setState({
          teamNames: teams
        })
      });
  },

  componentDidMount: function() {
    this.getTeamNames();
    this.setState({selectedteamType: ''});
    this.setState({selparentList: 'none'});
  },

  render: function() {
    var self = this;
    var addBtnStyle = this.props.loadDetailTeam.access?'block':'none';
    var selectedteamType = this.props.selectedteamType;

    var selparent1Style = {'display': 'none'};
    if (selectedteamType == 'squadteam') {
      selparent1Style = {'display': 'block'};
    }
    var populateTeamNames = this.state.teamNames.map(function(item) {
      return (
        <option key={item._id} value={item._id}>{item.name}</option>
      );
    });
    return (
      <Modal aria-labelledby='modal-label' className='reactbootstrap-modal' backdropClassName='reactbootstrap-backdrop' show={self.props.showModal}>
        <div class='new-team-creation-add-block'>
          <div class='new-team-creation-add-block-header'>
            <h>New Team Creation</h>
            <span class='close-ico'><InlineSVG onClick={self.props.closeWindow} src={require('../../../img/Att-icons/att-icons-close.svg')}></InlineSVG></span>
          </div>
          <div class='new-team-creation-add-block-content'>
            <div class='new-team-creation-add-block-content-mid'>
              <h3 class="lblstyle2">I am creating a...</h3>
              <HomeTeamTypeRadioOptions onchangeTeamtypeRadio={self.props.onchangeTeamtypeRadio} onchangeParentTeamDropdown={self.props.onchangeParentTeamDropdown} selparent1Style={selparent1Style} populateTeamNames={populateTeamNames} selectedteamType={self.state.selectedteamType} />
            </div>
            <div class='footer-note'><strong class="note1">NOTE:</strong>&nbsp;To join an existing team, click the "All teams" tab, find the team and click "request to join"</div>
          </div>
          <HomeTeamTypeFooter updateStep={self.props.updateStep} selectedteamType={selectedteamType} />
        </div>
      </Modal>
    )
  }
});

module.exports = HomeAddTeamTypeModal;
