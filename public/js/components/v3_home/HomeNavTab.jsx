var React = require('react');
var api = require('../api.jsx');

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
            <input class='home-nav-tab-buttons-item' type='image' src='../../../img/Att-icons/att-icons_Add.svg' />
            <input class='home-nav-tab-buttons-item' type='image' src='../../../img/Att-icons/att-icons_search.svg' />
            <input id='hideNavBtn' class='home-nav-tab-buttons-item' type='image' src='../../../img/Att-icons/att-icons_contract.svg' onClick={this.homeNavHide}/>
          </div>
        </div>
      </nav>
    )
  }
});

module.exports = HomeNavTab;
