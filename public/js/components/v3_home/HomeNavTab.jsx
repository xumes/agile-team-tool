var React = require('react');
var api = require('../api.jsx');
var InlineSVG = require('svg-inline-react');
var HomeSearchField = require('./HomeSearchField.jsx');

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
    return (
      <nav class='home-nav-tab' >
        <div class='home-nav-tab-div'>
          <div class='home-nav-tab-list' role='tablist' >
              <li class='home-nav-tab-item' id='myTeams' role='tab' data-state={'open'} tabIndex='0' onClick={this.myTeamsClicked}>My Teams</li>
              <li class='home-nav-tab-item' id='allTeams' role='tab' data-state={''} onClick={this.allTeamsClicked}>All Teams</li>
          </div>
          <div class='home-nav-tab-buttons'>
            <div id='hideNavBtn' class='home-nav-tab-buttons-item' onClick={this.homeNavHide}>
              <InlineSVG src={require('../../../img/Att-icons/att-icons_contract.svg')}></InlineSVG>
            </div>
            <div id='navSearchBtn' class='home-nav-tab-buttons-item' onClick={this.showSearch}>
              <InlineSVG src={require('../../../img/Att-icons/att-icons_search.svg')}></InlineSVG>
            </div>
            <div class='home-nav-tab-buttons-item'>
              <InlineSVG src={require('../../../img/Att-icons/att-icons_Add.svg')}></InlineSVG>
            </div>
          </div>
        </div>
        <HomeSearchField />
      </nav>
    )
  }
});
module.exports = HomeNavTab;
