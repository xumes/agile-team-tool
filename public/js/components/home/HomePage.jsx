var React = require('react');
var api = require('../api.jsx');
var Header = require('../Header.jsx');
var HomeNav = require('./HomeNav.jsx');
var HomeContent = require('./HomeContent.jsx');
var HomeIterContent = require('./HomeIterContent.jsx');
var InlineSVG = require('svg-inline-react');

var HomePage = React.createClass({
  getInitialState: function() {
    return {
      searchTeamSelected: '',
      selectedTeam: '',
      newTeams: new Object(),
      loadDetailTeam: new Object(),
      selectedIter: ''
    }
  },

  selectedTeamChanged: function(team) {
    this.setState({'selectedTeam': team});
  },
  newTeamsChanged: function(teams) {
    this.setState({'newTeams': teams});
  },
  searchTeamSelectedChanged: function(teamId) {
    this.setState({'searchTeamSelected': teamId});
  },

  iterChangeHandler: function(e) {
    this.setState({'selectedIter': e.target.value.toString()});
  },

  loadDetailTeamChanged: function(team) {
    if (team.team.type != 'squad') {
      $('#homeNavDiv').show();
      $('#homeNavDiv').css('left','0');
      $('#iterContent').hide();
      $('#mainContent').css('left', '30.5%');
      $('#hideNavBtn').hide();
    } else {
      $('#homeNavDiv').hide();
      $('#homeNavDiv').css('left','-500px');
      $('#iterContent').show();
      $('#mainContent').css('left', '0');
      $('#hideNavBtn').show();
    }
    $('.home-chart-filter-block').hide();
    this.setState({'loadDetailTeam': team, 'selectedIter': ''});
  },

  searchStart: function() {
    $('#navSpinner').show();
    $('#searchTree').hide();
    $('#teamTree').hide();
  },

  searchEnd: function() {
    $('#navSpinner').hide();
    $('#searchTree').show();
    $('#teamTree').hide();
  },

  tabClickedStart: function() {
    $('#navSpinner').show();
    $('#searchTree').hide();
    $('#teamTree').hide();
  },

  tabClickedEnd: function() {
    $('#navSpinner').hide();
    $('#searchTree').hide();
    $('#teamTree').show();
  },

  tabClickedHandler: function(tab, pathId) {

    var self = this;
    self.tabClickedStart();
    $('#allTeams').attr('data-state','');
    $('#myTeams').attr('data-state','open');
    if (tab == 'mytab') {
      $('#searchFieldDiv').hide();
      api.getMyTeams()
      .then(function(data){
        var newData = {
          'tab': 'myteams',
          'data': data
        };
        self.setState({'newTeams': newData});
        // self.setState({'searchTeamSelected': ''});
        $('#searchCancel').click();
        return null;
      })
      .catch(function(err){
        self.tabClickedEnd();
        $('#teamTree').empty();
        console.log(err);
        return null;
      })
    } else {
      $('#searchFieldDiv').show();
      $('#allTeams').attr('data-state','open');
      $('#myTeams').attr('data-state','');
      api.getAllTeams()
      .then(function(data){
        var newData = {
          'tab': 'allteams',
          'data': data
        };
        self.setState({'newTeams': newData});
        console.log('done');
        return null;
      })
      .catch(function(err){
        self.tabClickedEnd();
        $('#teamTree').empty();
        console.log(err);
        return null;
      });
    }
  },

  showHomeNav: function() {
    $('#homeNavDiv').show();
    $('.home-nav-show-btn').prop('disabled',true);
    $('#homeNavDiv').animate({
      left: '+=500',
    },200,function(){
      $('.home-nav-show-btn').prop('disabled',false);
    });
  },

  render: function() {
    var pageStyle = {
      'width': '100%',
      'height': '100%'
    }
    var columnsStyle = {
      'width': '96.6%',
      'padding': '0',
      'margin': '0 1.7%',
      'height': '100%'
    };
    var sectionOneStyle = {
      'width': '30.91%',
      'backgroundColor': '#F7F7F7',
      'height': '200%'
    }
    var sectionTwoStyle = {
      'width': '69.09%',
      'height': '100%',
      'position': 'relative'
    }
    var src = require('../../../img/Att-icons/att-icons_expand.svg');
    return (
      <div style={pageStyle}>
        <div class='ibm-columns' style={columnsStyle}>
          <div id='mainContent' class='ibm-col-6-4' style={sectionTwoStyle}>
            <HomeContent loadDetailTeam={this.state.loadDetailTeam} selectedTeamChanged={this.selectedTeamChanged} tabClickedHandler={this.tabClickedHandler}/>
          </div>
          <div id='iterContent' class='ibm-col-6-2' style={sectionOneStyle}>
            <HomeIterContent loadDetailTeam={this.state.loadDetailTeam} selectedIter={this.state.selectedIter} iterChangeHandler={this.iterChangeHandler}/>
          </div>
        </div>
        <div id='homeNavShowBtnDiv' class='home-nav-show-btn-div'>
          <InlineSVG class='home-nav-show-btn' src={src} onClick={this.showHomeNav}></InlineSVG>
          <div class='home-nav-show-text'>
            Teams
          </div>
        </div>
        <div id='homeNavDiv' class='home-nav-div' hidden='true'>
          <HomeNav loadDetailTeamChanged={this.loadDetailTeamChanged} selectedTeam={this.state.selectedTeam} selectedTeamChanged={this.selectedTeamChanged} newTeams={this.state.newTeams} newTeamsChanged={this.newTeamsChanged} tabClickedHandler={this.tabClickedHandler}/>
        </div>
      </div>
    )
  }
});
module.exports = HomePage;
