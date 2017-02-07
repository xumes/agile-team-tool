var React = require('react');
var api = require('../api.jsx');
var InlineSVG = require('svg-inline-react');
var HomeSearchField = require('./HomeSearchField.jsx');
var HomeAddTeam = require('./HomeAddTeam.jsx');

var HomeNavTab = React.createClass({
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

  render: function() {
    var self = this;

    return (
      <nav class='home-nav-tab' >
        <div class='home-nav-tab-div'>
          <div class='home-nav-tab-list' role='tablist' >
              <li class='home-nav-tab-item' id='myTeams' role='tab' data-state={'open'} onClick={this.myTeamsClicked}>
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

            <HomeAddTeam access={self.props.loadDetailTeam.access} />

            <div id='navSearchBtn' class='home-nav-tab-buttons-item' onClick={this.showSearch} style={{'right': '10%'}}>
              <InlineSVG src={require('../../../img/Att-icons/att-icons_search.svg')}></InlineSVG>
            </div>

          </div>
        </div>
        <HomeSearchField />
      </nav>
    )
  }
});
module.exports = HomeNavTab;
