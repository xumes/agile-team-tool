var React = require('react');
var api = require('../api.jsx');
var HomeHeader = require('./HomeHeader.jsx');
var HomeNav = require('./HomeNav.jsx');
var HomeContent = require('./HomeContent.jsx');
var HomeIterContent = require('./HomeIterContent.jsx');
var FirstLoginPopover = require('./FirstLoginPopover.jsx');
var InlineSVG = require('svg-inline-react');
var update = require('immutability-helper');
var Modal = require('react-overlays').Modal;
var utils = require('../utils.jsx');
var _ = require('underscore');
var moment = require('moment');
var windowSize = {
  'height': 768,
  'width': 1440,
  'fontSize': 0.625
};
var windowSize2 = {
  'height': 1080,
  'width': 1900,
  'fontSize': 0.625
};

var HomePage = React.createClass({
  getInitialState: function() {
    return {
      searchTeamSelected: '',
      selectedTeam: '',
      newTeams: new Object(),
      loadDetailTeam: new Object(),
      selectedIter: '',
      roles: [],
      firstLogin: false
    }
  },

  componentWillMount: function() {
    var self = this;
    api.fetchTeamMemberRoles()
      .then(function(roles){
        // self.setState({'roles': roles});
        self.state.roles = roles;
      })
      .catch(function(err){
        console.log(err);
      });
    api.getUsersInfo([(user.ldap.uid).toUpperCase()])
      .then(function(result){
        if (_.isEmpty(result[0])) {
          return;
        } else {
          var loginUser = result[0];
          var now = new Date();
          var now_utc = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),  now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
          if (loginUser.lastLogin == null) {
            self.state.firstLogin = true;
          } else {
            var lastLogin = moment.utc(loginUser.lastLogin);
            var isAfter = lastLogin.isAfter(uiReleaseDate);
            if (!isAfter) {
              self.state.firstLogin = true;
            }
          }
          loginUser.lastLogin = now_utc;
          return api.updateUser(loginUser);
        }
      })
      .then(function(result){
        console.log(result);
      })
      .catch(function(err){
        console.log(err);
      });
  },

  componentDidUpdate: function() {
    window.scrollTo(0, 0);
    if (!_.isEmpty(this.state.loadDetailTeam) && $('.first-login-block').css('display') == 'block') {
      if (this.state.loadDetailTeam.team.type == 'squad') {
        $('#firstLoginCard_5').css('left', '27vw');
        $('#firstLoginCard_6').css('top', '12vw');
        $('#firstLoginCard_7').css('left', '3vw');
        $('#firstLoginCard_7 > .pointer').css('transform','rotate(315deg)');
        $('#firstLoginCard_7 > .pointer').css('-ms-transform','rotate(315deg)');
        $('#firstLoginCard_7 > .pointer').css('-webkit-transform','rotate(315deg)');
        $('#firstLoginCard_7 > .pointer').css('top','0');
      }
    }
  },

  componentDidMount: function() {
    this.handleResize();
    window.addEventListener('resize', this.handleResize);
    $('.home-nav-show-btn svg, .home-nav-show-btn2 svg').attr('title', 'Expand Team Hierarchy Navigation')
  },

  componentWillUnmount: function() {
    window.removeEventListener('resize', this.handleResize);
  },

  hideFirstLoginPopover: function() {
    this.setState({firstLogin: false});
  },

  showFirstLoginPopover: function() {
    this.setState({firstLogin: true});
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
      $('html').css('height', '56.49vw');
      $('#homeNavShowBtnDiv').show();
      $('.ibm-columns').css('width', '96.6%');
      $('.ibm-columns').css('left', '0');
      $('#homeNavDiv').css('width', '30%');
      var fontSize = (window.innerWidth/windowSize['width']) * windowSize['fontSize'];
      var changeSize = fontSize*100 + '%';
      if (!_.isEmpty(self.state.loadDetailTeam)) {
        if (self.state.loadDetailTeam.team.type == 'squad') {
          $('#homeNavDiv').hide();
          // $('#homeNavDiv').css('left','-6%');
          $('#homeNavDiv').css('left','0');
          // $('#homeNavDiv').css('top','-205.4%');
          $('#homeNavDiv').css('top','6.3%');
          $('#homeNavDiv').css('box-shadow', 'rgba(0, 0, 0, 0.219608) 0.1em 0.3em 0.4em 0px');
          $('#iterContent').show();
          $('#mainContent').css('left', '0');
          $('#hideNavBtn').show();
        } else {
          $('#homeNavDiv').show();
          $('#homeNavDiv').css('left','0');
          // $('#homeNavDiv').css('top','-130%');
          $('#homeNavDiv').css('top','6.3%');
          $('#homeNavDiv').css('box-shadow', '');
          $('#iterContent').hide();
          $('#mainContent').css('left', '28.5%');
          $('#hideNavBtn').hide();
        }
      }
      var backgroundImageP = $('.home-assessment-summary').css('background-position');
      if (backgroundImageP == '150% 85%') {
        $('.home-assessment-summary').css('background-position','150% 100%');
      } else if (backgroundImageP == '150% 63%') {
        $('.home-assessment-summary').css('background-position','150% 70%');
      } else if (backgroundImageP == '150% 72%') {
        $('.home-assessment-summary').css('background-position','150% 80%');
      }
      $('html').css('font-size', changeSize);
    } else if (window.innerWidth >= 1900) {
      $('html').css('width', '100vw');
      $('html').css('height', '37.5vw');
      fontSize = (window.innerWidth/windowSize2['width']) * windowSize2['fontSize'];
      $('.ibm-columns').css('width', '72.7%');
      $('.ibm-columns').css('left', '22.7%');
      $('#homeNavShowBtnDiv').hide();
      $('#homeNavDiv').css('width', '22.5%');
      $('#homeNavDiv').css('left', '2.4%');
      $('#homeNavDiv').css('top', '6.3%');
      $('#homeNavDiv').css('box-shadow', '');

      var backgroundImageP = $('.home-assessment-summary').css('background-position');
      if (backgroundImageP == '150% 100%') {
        $('.home-assessment-summary').css('background-position','150% 85%');
      } else if (backgroundImageP == '150% 70%') {
        $('.home-assessment-summary').css('background-position','150% 63%');
      } else if (backgroundImageP == '150% 80%') {
        $('.home-assessment-summary').css('background-position','150% 72%');
      }
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

  setSelectedIteration: function(id) {
    this.setState({'selectedIter': id});
  },

  loadDetailTeamChanged: function(team) {
    if (window.innerWidth < 1900) {
      if (team.team.type != 'squad') {
        $('#homeNavDiv').show();
        $('#homeNavDiv').css('box-shadow', '');
        $('#homeNavDiv').css('left','0');
        // $('#homeNavDiv').css('top','-130%');
        $('#homeNavDiv').css('top','6.3%');
        $('#iterContent').hide();
        $('#mainContent').css('left', '28.5%');
        $('#hideNavBtn').hide();

      } else {
        $('#homeNavDiv').hide();
        $('#homeNavDiv').css('box-shadow', '0.1em 0.3em 0.4em 0 rgba(0,0,0,0.22)');
        // $('#homeNavDiv').css('left','-6%');
        $('#homeNavDiv').css('left','0');
        // $('#homeNavDiv').css('top','-205.4%');
        $('#homeNavDiv').css('top','6.3%');
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
    var currentPath = pathId || (self.state.loadDetailTeam.team ? self.state.loadDetailTeam.team.pathId : self.state.selectedTeam);
    //console.log('tabClickedHandler', tab, currentPath);
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
        self.setState({
          'newTeams': newData,
          'selectedTeam': currentPath
        });
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
        self.setState({
          'newTeams': newData,
          'selectedTeam': currentPath
        });
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
      left: '0',
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

      // front end sort
      $('#'+updatedTeam.team.pathId+ ' > a > span.agile-team-title').html(updatedTeam.team.name);
      var li = $('#'+updatedTeam.team.pathId).parent('ul').children('li');
      var liSorted = _.sortBy(li,function(element){
        if (element.id == 'agteamstandalone')
          return 'zzzzzzzzzz'

        var name = $('#'+ element.id + ' > a > span.agile-team-title').html();
        return name.toLowerCase();
      });
      _.each(liSorted, function(element) {
        $('#'+updatedTeam.team.pathId).parent('ul').append(element);
      });
      $('.home-team-nav').nanoScroller();
      $('.home-team-nav').nanoScroller({
        scrollTo: $('#link_'+updatedTeam.team.pathId)
      });
    }
  },

  reloadTeamMembers: function(members, membersContent) {
    var self = this;
    // var newTeam = this.state.loadDetailTeam;
    var newTeam = JSON.parse(JSON.stringify(this.state.loadDetailTeam));
    newTeam.team.members = _.sortBy(members, function(m) {
      return m.name.replace(/\s/g,'').toLowerCase();
    });
    newTeam.members = membersContent;
    var userMember = _.find(members, function(member) {
      return member.userId == user.ldap.uid;
    })
    if (_.isEmpty(userMember) && $('#myTeams').attr('data-state') == 'open') {
      newTeam.access = false;
      // front end to hide team from my teams view and disable any other edit blocks on members
      $('#memberTable h.team-member-table-content-block-hide').removeClass('team-member-table-content-block-hide')
      $('#memberTable div.modify-field').removeClass('team-member-table-content-block-show')
      $('#'+newTeam.team.pathId).hide();  //need to hide, removing it would cause react to complain of node not found
    }
    self.setState({'loadDetailTeam': newTeam});
  },

  reloadTeamIterations: function(id) {
    var self = this;
    api.getIterations(self.state.loadDetailTeam.team._id)
      .then(function(iterations){
        var teamDetail = JSON.parse(JSON.stringify(self.state.loadDetailTeam));
        teamDetail.iterations = iterations;
        if (id != null && !_.isEmpty(id))
          self.setState({'loadDetailTeam': teamDetail, 'selectedIter': id});
        else
          self.setState({'loadDetailTeam': teamDetail, 'selectedIter': ''});
      })
      .catch(function(err){
        console.log(err);
      });
  },

  updateTeamIteration: function(iteration) {
    var self = this;
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
        self.refs['iterContent'].alertDisplay(utils.handleIterationErrors(err),'error');
      });
  },

  render: function() {
    var pageStyle = {
      'width': '100%',
      'height': '100%'
    };
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
      'height': '205%'
    };
    var sectionTwoStyle = {
      'width': '69.09%',
      'height': '100%',
      'position': 'relative'
    };
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
      minWidth: '1280px',
      minHeight: '720px',
      zIndex: 1040,
      top: 0, bottom: 0, left: 0, right: 0,
    };
    var src = require('../../../img/Att-icons/att-icons-Chevron-right.svg');
    return (
      <div style={pageStyle}>
        <HomeHeader/>

        <div class='ibm-columns' style={columnsStyle}>
          <div id='mainContent' class='ibm-col-6-4' style={sectionTwoStyle}>
            <HomeContent loadDetailTeam={this.state.loadDetailTeam} selectedTeamChanged={this.selectedTeamChanged} tabClickedHandler={this.tabClickedHandler} reloadTeamMembers={this.reloadTeamMembers} roles={this.state.roles} handleChartResize={this.handleChartResize} updateTeamLink={this.updateTeamLink} updateTeamDetails={this.updateTeamDetails} setSelectedIteration={this.setSelectedIteration}/>
          </div>
          <div id='iterContent' class='ibm-col-6-2' style={sectionOneStyle}>
            <HomeIterContent loadDetailTeam={this.state.loadDetailTeam} selectedIter={this.state.selectedIter} iterChangeHandler={this.iterChangeHandler} iterListHandler={this.reloadTeamIterations} updateTeamIteration={this.updateTeamIteration} ref="iterContent"/>
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
          <HomeNav loadDetailTeam={this.state.loadDetailTeam} loadDetailTeamChanged={this.loadDetailTeamChanged} selectedTeam={this.state.selectedTeam} selectedTeamChanged={this.selectedTeamChanged} newTeams={this.state.newTeams} newTeamsChanged={this.newTeamsChanged} tabClickedHandler={this.tabClickedHandler} roles={this.state.roles} />
        </div>
        <Modal aria-labelledby='modal-label' style={modalStyle} backdropStyle={backdropStyle} show={this.state.firstLogin} onHide={this.hideFirstLoginPopover}>
          <FirstLoginPopover hideFirstLoginPopover={this.hideFirstLoginPopover}/>
        </Modal>
      </div>
    )
  }
});
module.exports = HomePage;
