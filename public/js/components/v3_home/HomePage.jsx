var React = require('react');
var api = require('../api.jsx');
var HomeHeader = require('./HomeHeader.jsx');
var HomeNav = require('./HomeNav.jsx');
var HomeContent = require('./HomeContent.jsx');
var HomeIterContent = require('./HomeIterContent.jsx');
var InlineSVG = require('svg-inline-react');
var update = require('immutability-helper');
var utils = require('../utils.jsx');
var windowSize = {
  'height': 768,
  'width': 1440,
  'fontSize': 0.625
}

var HomePage = React.createClass({
  getInitialState: function() {
    return {
      searchTeamSelected: '',
      selectedTeam: '',
      newTeams: new Object(),
      loadDetailTeam: new Object(),
      selectedIter: '',
      roles: []
    }
  },

  componentWillMount: function() {
    var self = this;
    api.fetchTeamMemberRoles()
      .then(function(roles){
        roles.unshift('Select a role');
        self.setState({'roles': roles});
      })
      .catch(function(err){
        console.log(err);
      });
  },

  componentDidMount: function() {
    this.handleResize();
    window.addEventListener('resize', this.handleResize);
  },

  componentWillUnmount: function() {
    window.removeEventListener('resize', this.handleResize);
  },

  handleResize: function() {
    var self = this;
    setTimeout(function() {
      var height = $('.home-team-header-members-div').height()*0.9;
      $('.home-header-image').css({'width': height+'px', 'height': height+'px'});
      $('.home-team-header-member-image').css({'width': height*0.9+'px', 'height': height*0.9+'px'});
    }, 0);
    if (window.innerWidth >= 1280 && window.innerWidth < 1900) {
      $('html').css('width', '100vw');
      $('html').css('height', '56.25vw');
      $('#homeNavShowBtnDiv').show();
      $('.ibm-columns').css('width', '96.6%');
      $('.ibm-columns').css('left', '0');
      $('#homeNavDiv').css('width', '30%');
      var fontSize = (window.innerWidth/windowSize['width']) * windowSize['fontSize'];
      var changeSize = fontSize*100 + '%';
      if (!_.isEmpty(self.state.loadDetailTeam)) {
        if (self.state.loadDetailTeam.team.type == 'squad') {
          $('#homeNavDiv').hide();
          $('#homeNavDiv').css('left','-6%');
          $('#homeNavDiv').css('top','-205.4%');
          $('#homeNavDiv').css('box-shadow', 'rgba(0, 0, 0, 0.219608) 0.1em 0.3em 0.4em 0px');
          $('#iterContent').show();
          $('#mainContent').css('left', '0');
          $('#hideNavBtn').show();
        } else {
          $('#homeNavDiv').show();
          $('#homeNavDiv').css('left','0');
          $('#homeNavDiv').css('top','-130%');
          $('#homeNavDiv').css('box-shadow', '');
          $('#iterContent').hide();
          $('#mainContent').css('left', '28.5%');
          $('#hideNavBtn').hide();
        }
      }
      $('html').css('font-size', changeSize);
    } else if (window.innerWidth >= 1900) {
      $('html').css('width', '100vw');
      $('html').css('height', '0.375vw');
      fontSize = (1280/windowSize['width']) * windowSize['fontSize'];
      $('.ibm-columns').css('width', '72.7%');
      $('.ibm-columns').css('left', '24.3%');
      $('#homeNavShowBtnDiv').hide();
      $('#homeNavDiv').css('width', '25%');
      $('#homeNavDiv').css('left', '-73%');
      $('#homeNavDiv').css('top', '-100%');
      $('#homeNavDiv').css('box-shadow', '');
      $('#homeNavDiv').show();
      $('#hideNavBtn').hide();

      $('#iterContent').show();
      $('#mainContent').css('left', '0');
      changeSize = fontSize*100 + '%';
      $('html').css('font-size', changeSize);
      self.handleChartResize();
    } else {
      changeSize = 1280/1440 * windowSize['fontSize']*100 + '%';
      $('html').css('font-size', changeSize);
    }
  },

  handleChartResize: function(e) {
    $(Highcharts.charts).each(function(i,chart) {
      if (chart == null) return;
      if ($('#' + $(chart.container).attr('id')).length > 0) {
        var height = chart.renderTo.clientHeight;
        var width = chart.renderTo.clientWidth;
        chart.setSize(width, height);
      }
    });
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
    if (window.innerWidth < 1900) {
      if (team.team.type != 'squad') {
        $('#homeNavDiv').show();
        $('#homeNavDiv').css('box-shadow', '');
        $('#homeNavDiv').css('left','0');
        $('#homeNavDiv').css('top','-130%');
        $('#iterContent').hide();
        $('#mainContent').css('left', '28.5%');
        $('#hideNavBtn').hide();

      } else {
        $('#homeNavDiv').hide();
        $('#homeNavDiv').css('box-shadow', '0.1em 0.3em 0.4em 0 rgba(0,0,0,0.22)');
        $('#homeNavDiv').css('left','-6%');
        $('#homeNavDiv').css('top','-205.4%');
        $('#iterContent').show();
        $('#mainContent').css('left', '0');
        $('#hideNavBtn').show();
      }
    }
    $('.home-chart-filter-block').hide();
    this.setState({'loadDetailTeam': team, 'selectedIter': ''});
  },

  searchStart: function() {
    $('#navSpinner').show();
    $('#newSearchTree').hide();
    $('#newTeamTree').hide();
  },

  searchEnd: function() {
    $('#navSpinner').hide();
    $('#newSearchTree').show();
    $('#newTeamTree').hide();
  },

  tabClickedStart: function() {
    $('#navSpinner').show();
    $('#newSearchTree').hide();
    $('#newTeamTree').hide();
  },

  tabClickedEnd: function() {
    $('#navSpinner').hide();
    $('#newSearchTree').hide();
    $('#newTeamTree').show();
  },

  tabClickedHandler: function(tab, pathId) {
    var self = this;
    tab = tab || self.state.newTeams.tab
    self.tabClickedStart();
    $('#allTeams').attr('data-state','');
    $('#myTeams').attr('data-state','open');
    if (tab == 'myteams') {
      $('#searchFieldDiv').hide();
      $('#navSearchBtn').hide();
      api.getMyTeams()
      .then(function(data){
        var newData = {
          'tab': 'myteams',
          'data': data
        };
        self.setState({'newTeams': newData, 'selectedTeam': pathId || self.state.selectedTeam});
        // self.setState({'searchTeamSelected': ''});
        $('#searchCancel').click();
        return null;
      })
      .catch(function(err){
        self.tabClickedEnd();
        $('#newTeamTree').empty();
        console.log(err);
        return null;
      })
    } else {
      // $('#searchFieldDiv').show();
      $('#allTeams').attr('data-state','open');
      $('#myTeams').attr('data-state','');
      $('#navSearchBtn').show();
      api.getAllTeams()
      .then(function(data){
        var newData = {
          'tab': 'allteams',
          'data': data
        };
        self.setState({'newTeams': newData, 'selectedTeam': pathId || self.state.selectedTeam});
        return null;
      })
      .catch(function(err){
        self.tabClickedEnd();
        $('#newTeamTree').empty();
        console.log(err);
        return null;
      });
    }
  },

  showHomeNav: function() {
    $('#homeNavDiv').show();
    $('.home-nav-show-btn').prop('disabled',true);
    $('#homeNavDiv').animate({
      left: '-2%',
    },200,function(){
      $('.home-nav-show-btn').prop('disabled',false);
    });
  },

  updateTeamLink: function(teamId, linkData) {
    var self = this;
    var currentLinkData = self.state.loadDetailTeam;
    if (teamId === currentLinkData.team._id) {
      var updatedLinkData = update(currentLinkData, {
        team: {
          links: {
            $set: linkData
          }
        }
      });
      self.setState({loadDetailTeam: updatedLinkData});
    }
  },

  updateTeamDetails: function(teamId, data) {
    var self = this;
    var currentTeam = self.state.loadDetailTeam;
    if (teamId === currentTeam.team._id) {
      var updatedTeam = update(currentTeam, {
        team: {$set: data}
      });
      self.setState({loadDetailTeam: updatedTeam});
    }
  },

  realodTeamMembers: function(members, membersContent) {
    var self = this;
    // var newTeam = this.state.loadDetailTeam;
    var newTeam = JSON.parse(JSON.stringify(this.state.loadDetailTeam));
    newTeam.team.members = members;
    newTeam.members = membersContent;
    self.setState({'loadDetailTeam': newTeam}, function(){
    });
  },

  reloadTeamIterations: function() {
    var self = this;
    api.getIterations(self.state.loadDetailTeam.team._id)
      .then(function(iterations){
        var teamDetail = JSON.parse(JSON.stringify(self.state.loadDetailTeam));
        teamDetail.iterations = iterations;
        self.setState({'loadDetailTeam': teamDetail, 'selectedIter': ''});
      })
      .catch(function(err){
        console.log(err);
      });
  },

  updateTeamIteration: function(iteration) {
    var self = this;
    var forUpdate = _.clone(iteration);
    var teamDetail = JSON.parse(JSON.stringify(self.state.loadDetailTeam));
    _.find(teamDetail.iterations, function(data, index){
      if (data._id === forUpdate._id){
        teamDetail.iterations[index] = forUpdate;
        return data;
      }
    });
    
    self.setState({'loadDetailTeam': teamDetail});

    api.updateIteration(iteration)
      .then(function(result){
        return api.getIterationInfo(iteration._id);
      })
      .then(function(result){
        var teamDetail = JSON.parse(JSON.stringify(self.state.loadDetailTeam));
        _.find(teamDetail.iterations, function(data, index){
          if (data._id === iteration._id){
            teamDetail.iterations[index] = result;
            return data;
          }
        })
        self.setState({'loadDetailTeam': teamDetail});
      })
      .catch(function(err){
        utils.handleIterationErrors(err);
      });
  },

  render: function() {
    var pageStyle = {
      'width': '100%',
      'height': '100%'
    }
    var columnsStyle = {
      'position': 'relative',
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
    var src = require('../../../img/Att-icons/att-icons-Chevron-right.svg');
    return (
      <div style={pageStyle}>
        <HomeHeader/>

        <div class='ibm-columns' style={columnsStyle}>
          <div id='mainContent' class='ibm-col-6-4' style={sectionTwoStyle}>
            <HomeContent loadDetailTeam={this.state.loadDetailTeam} selectedTeamChanged={this.selectedTeamChanged} tabClickedHandler={this.tabClickedHandler} realodTeamMembers={this.realodTeamMembers} roles={this.state.roles} handleChartResize={this.handleChartResize} updateTeamLink={this.updateTeamLink} updateTeamDetails={this.updateTeamDetails} />
          </div>
          <div id='iterContent' class='ibm-col-6-2' style={sectionOneStyle}>
            <HomeIterContent loadDetailTeam={this.state.loadDetailTeam} selectedIter={this.state.selectedIter} iterChangeHandler={this.iterChangeHandler} iterListHandler={this.reloadTeamIterations} updateTeamIteration={this.updateTeamIteration}/>
          </div>
        </div>
        <div id='homeNavShowBtnDiv' class='home-nav-show-btn-div' onClick={this.showHomeNav}>
          <div class='home-nav-show-btn'>
            <InlineSVG src={src}></InlineSVG>
          </div>
          <div class='home-nav-show-text'>
            Teams
          </div>
          <div class='home-nav-show-btn2'>
            <InlineSVG src={src}></InlineSVG>
          </div>
        </div>
        <div id='homeNavDiv' class='home-nav-div' hidden='true'>
          <HomeNav loadDetailTeam={this.state.loadDetailTeam} loadDetailTeamChanged={this.loadDetailTeamChanged} selectedTeam={this.state.selectedTeam} selectedTeamChanged={this.selectedTeamChanged} newTeams={this.state.newTeams} newTeamsChanged={this.newTeamsChanged} tabClickedHandler={this.tabClickedHandler}/>
        </div>
      </div>
    )
  }
});
module.exports = HomePage;
