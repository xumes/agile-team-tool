var React = require('react');
var api = require('../api.jsx');
var InlineSVG = require('svg-inline-react');
var HomeSearchField = require('./HomeSearchField.jsx');
var HomeAddTeam = require('./HomeAddTeam.jsx');
var Modal = require('react-overlays').Modal;

var HomeNavTab = React.createClass({
  getInitialState: function() {
    return { showModal: false };
  },

  myTeamsClicked: function() {
    if ($('#myTeams').attr('data-state') != 'open') {
      this.props.tabClicked('mytab');
    }
  },

  allTeamsClicked: function() {
    if ($('#allTeams').attr('data-state') != 'open') {
      this.props.tabClicked('alltab');
    }
  },

  showSearch: function() {
    if ($('#searchFieldDiv').css('display') == 'none') {
      $('#searchFieldDiv').fadeIn();
    } else {
      $('#searchFieldDiv').fadeOut();
    }
  },

  homeNavHide: function() {
    $('.home-nav-tab-buttons-item').prop('disabled',true);
    $('#homeNavDiv').animate({
      left: '-=500',
    },200,function(){
      $('.home-nav-tab-buttons-item').prop('disabled',false);
      $('#homeNavDiv').hide();
    });
  },
  addTeamModal: function(id) {
    var self = this;
    console.log('add Team Modal:',id);
    self.setState({showModal:  true });
    if(id) {
      self.setState({modalTitle: 'New Team Information'});
    }
  },
  hideAddTeamModal: function() {
    var self = this;

    $('.implabel').select2();
    self.setState({showModal:  false });
    self.setState({showOtherlabel: false});
  },

  render: function() {
    var addBtnStyle = this.props.loadDetailTeam.access?'block':'none';     
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

    return (
      <nav class='home-nav-tab' >
        <div class='home-nav-tab-div'>
          <div class='home-nav-tab-list' role='tablist' >
              <li class='home-nav-tab-item' id='myTeams' role='tab' data-state={'open'} tabIndex='0' onClick={this.myTeamsClicked}>
                <h>
                  My Teams
                </h>
              </li>
              <li class='home-nav-tab-item' id='allTeams' role='tab' data-state={''} onClick={this.allTeamsClicked}>
                <h>
                  All Teams
                </h>
              </li>
          </div>
          <div class='home-nav-tab-buttons'>
            <div id='hideNavBtn' class='home-nav-tab-buttons-item' onClick={this.homeNavHide} style={{'left': '5%'}}>
              <InlineSVG src={require('../../../img/Att-icons/att-icons-Chevron-left.svg')}></InlineSVG>
            </div>
            <div class='home-nav-tab-buttons-item' style={{'display': addBtnStyle}}>
              <InlineSVG onClick={this.addTeamModal}  src={require('../../../img/Att-icons/att-icons_Add.svg')}></InlineSVG>
            </div>
            <div id='navSearchBtn' class='home-nav-tab-buttons-item' onClick={this.showSearch} style={{'right': '10%'}}>
              <InlineSVG src={require('../../../img/Att-icons/att-icons_search.svg')}></InlineSVG>
            </div>
          </div>
        </div>
        <HomeSearchField />

        <Modal aria-labelledby='modal-label' style={modalStyle} backdropStyle={backdropStyle} show={self.state.showModal} onHide={self.hideAddTeamModal}>
          <HomeAddTeam hideAddTeamModal={self.hideAddTeamModal} loadDetailTeam={self.props.loadDetailTeam}/>
        </Modal>

      </nav>
    )
  }
});
module.exports = HomeNavTab;
