var React = require('react');
var api = require('../api.jsx');
var HomeMemberTable = require('./HomeMemberTable.jsx');
var HomeBookmark = require('./HomeBookmark.jsx');
var HomeTeamDescription = require('./HomeTeamDescription.jsx');
var HomeTeamSetup = require('./HomeTeamSetup.jsx');
var InlineSVG = require('svg-inline-react');
var Promise = require('bluebird');
var _ = require('underscore');
var teamName = ''
var teamType = ''

var HomeTeamHeader = React.createClass({
  getInitialState: function() {
    return { showModal: false };
  },
  componentWillUpdate: function(nextProps, nextState){
    // if (nextProps.loadDetailTeam.type == 'squad') {
    //   teamType = 'Squad: ';
    // } else {
    //   teamType = 'Team: ';
    // }
    // teamName = nextProps.loadDetailTeam.team.name;
  },
  componentDidMount: function() {
    if (this.props.loadDetailTeam.team != undefined && this.props.loadDetailTeam.team.type == 'squad') {
      $('#homeHeaderAseBtn').show();
    } else {
      $('#homeHeaderAseBtn').hide();
    }
    setTimeout(function() {
      var height = $('.home-team-header-members-div').height()*0.9;
      $('.home-header-image').css({'width':height+'px','height':height+'px'});
      $('.home-team-header-member-image').css({'width': height*0.9+'px', 'height': height*0.9+'px'});
    }, 0);

  },

  componentDidUpdate: function() {
    if (this.props.loadDetailTeam.team != undefined && this.props.loadDetailTeam.team.type == 'squad') {
      $('#homeHeaderAseBtn').show();
    } else {
      $('#homeHeaderAseBtn').hide();
    }
    setTimeout(function() {
      var height = $('.home-team-header-members-div').height()*0.9;
      $('.home-header-image').css({'width':height+'px','height':height+'px'});
      $('.home-team-header-member-image').css({'width': height*0.9+'px', 'height': height*0.9+'px'});
    }, 0);

    $('.home-team-header-btn-img, .home-team-header-btn-title, #teamBookmark, .home-team-header-btns, .home-team-header-btn-img2, .home-team-header-btn-title3, #teamMemberTable').unbind('mouseenter mouseleave');
    // bookmarks button
    $('.home-team-header-btn-img, .home-team-header-btn-title').bind('mouseenter', function() {
      if ($('#teamBookmark').css('display') == 'none') {
        $('.home-team-header-btn-img svg > path').css('fill', '#325C80');
        $('.home-team-header-btn-title h').css('color', '#325C80');
        $('#teamBookmark').fadeIn();
        $('#teamMemberTable').trigger('mouseleave');
      }
    });
    $('#teamBookmark, .home-team-header-btns').bind('mouseleave', function() {
      if ($('#teamBookmark').css('display') != 'none' && $('#teamBookmark').attr('data-open') != 'true') {
        $('.home-team-header-btn-img svg > path').css('fill', '#FFFFFF');
        $('.home-team-header-btn-title h').css('color', '#FFFFFF');
        $('#teamBookmark').fadeOut();
      }
    });
    //members button
    $('.home-team-header-btn-img2, .home-team-header-btn-title3').bind('mouseenter', function() {
      if ($('#teamMemberTable').css('display') == 'none') {
        $('.home-team-header-btn-img2 svg > path').css('fill', '#325C80');
        $('.home-team-header-btn-title3 h').css('color', '#325C80');
        $('#teamMemberTable').fadeIn();
        $('#teamBookmark').trigger('mouseleave');
      }
    });
    $('#teamMemberTable').bind('mouseleave', function() {
      if ($('#teamMemberTable').css('display') != 'none' && $('#teamMemberTable').attr('data-open') != 'true') {
        $('.home-team-header-btn-img2 svg > path').css('fill', '#FFFFFF');
        $('.home-team-header-btn-title3 h').css('color', '#FFFFFF');
        $('#teamMemberTable').fadeOut();
      }
    });
    // workaround handler for member button hover out
    $('.home-nav-div, .home-team-header-teamname-div, .home-team-header-hierarchy, #iterContent').unbind('mouseenter');
    $('.home-nav-div, .home-team-header-teamname-div, .home-team-header-hierarchy, #iterContent').bind('mouseenter', function() {
      if ($('#teamMemberTable').css('display') != 'none' && $('#teamMemberTable').attr('data-open') != 'true') {
        $('.home-team-header-btn-img2 svg > path').css('fill', '#FFFFFF');
        $('.home-team-header-btn-title3 h').css('color', '#FFFFFF');
        $('#teamMemberTable').fadeOut();
      }
    });
  },

  findTeamInAllTeams: function(pathId) {
    selectedTeam = pathId;
    this.props.tabClickedHandler('allteams', pathId);
  },
  teamMemFTE: function(teamMembers) {
     var teamCount = 0;
     var tmArr = [];
     _.each(teamMembers, function(member) {
       teamCount += parseInt(member.allocation);
     });
     return (teamCount / 100);
  },
  showTeamTable: function() {
    $('#teamMemberTable').attr('data-open', 'true');
    $('.home-team-header-btn-img2').trigger('mouseenter');
  },
  closeTeamTable: function() {
    $('#teamMemberTable').attr('data-open', 'false');
    $('#teamMemberTable').trigger('mouseleave');
  },
  showBookmark: function() {
    $('#teamBookmark').attr('data-open', 'true');
    $('.home-team-header-btn-img').trigger('mouseenter');
  },
  closeBookmark: function() {
    $('#teamBookmark').attr('data-open', 'false');
    $('#teamBookmark').trigger('mouseleave');
  },
  showAssessments: function() {
    if ($('.home-assessment-summary').css('display') == 'none') {
      $('.home-assessment-summary').fadeIn();
    } else {
      $('.home-assessment-summary').fadeOut();
    }
  },
  render: function() {
    //console.log(this.props.selectedTeam);
    var self = this
    var headerStyle= {
      'display': 'inline'
    };

    if (this.props.loadDetailTeam.team == undefined) {
      return null;
    } else {
      var team = this.props.loadDetailTeam.team;
      var teamNameFontSize = '3em'
      var teamNameFontLingHeight = '';
      if (team.name != undefined) {
        var teamName = team.name;
        if (team.name.length > 50) {
          teamNameFontSize = 50/team.name.length * 3 + 'em';
          // teamNameFontLingHeight = teamNameFontSize;
          // teamNameFontLingHeight = 5/team.name.length * 3 + 'em';
        }
      } else {
        teamName = '';
      }
      if (team.description != undefined) {
        var teamDescription = team.description;
      } else {
        teamDescription = '';
      }
      var squadMarkDisplay = {
        'display': 'none'
      };
      if (team.type == 'squad') {
        squadMarkDisplay['display'] = 'block';
      }
      if (self.props.loadDetailTeam.hierarchy == undefined || self.props.loadDetailTeam.hierarchy.error || self.props.loadDetailTeam.hierarchy.length == 0) {
        var teamHierarchy = '';
        var teamHierarchy2 = null;
      } else {
        var hierarchy = self.props.loadDetailTeam.hierarchy;
        teamHierarchy = hierarchy.map(function(h){
          var plink = 'plink_' + h.pathId;
          if ($('#' + h.pathId).length) {
            return (
              <div key={plink} style={{'display':'inline'}}>
                <a class='hierarchy-link' title='View parent team information' alt='View parent team information' id={plink} href='#' onClick={self.props.selectedTeamChanged.bind(null, h.pathId)}>{h.name}</a>
                <h class='hierarchy-mark'>&nbsp;&nbsp;&#10095;&nbsp;&nbsp;</h>
              </div>
            );
          } else {
            return (
              <div key={plink} style={{'display':'inline'}}>
                <a class='hierarchy-link' title='View parent team information' alt='View parent team information' id={plink} href='#' onClick={self.findTeamInAllTeams.bind(null, h.pathId)}>{h.name}</a>
                <h class='hierarchy-mark'>&nbsp;&nbsp;&#10095;&nbsp;&nbsp;</h>
              </div>
            );
          }
        });
        var teamHierarchy2 = teamName;
      }
      var faceImages = null;
      if (team.members != undefined) {
        team.members = _.sortBy(team.members, function(m){
          return m.name.replace(/\s/g,'');
        });
        var teamMemNumber = team.members.length;
        var teamFTE = self.teamMemFTE(team.members);
        var faceImages = team.members.map(function(member, index){
          if (index < 9) {
            var faceImageId = 'faceImage_' + index;
            //var src = 'http://dpev027.innovate.ibm.com:10000/image/' + member.userId.toUpperCase();
            // var src = '//images.w3ibm.mybluemix.net/image/' + member.userId.toUpperCase();
            var src = '//faces-cache.mybluemix.net/image/' + member.userId.toUpperCase();
            return (
              <div key={faceImageId} class='home-header-image'>
                <a title={member.name}><img id={faceImageId} class='home-team-header-member-image' src={src}></img></a>
              </div>
            )
          } else if (index == 9) {
            var faceImageId = 'faceImage_' + index;
            var count = '+' + (teamMemNumber - index);
            return (
              <div key={faceImageId} class='home-header-image' onClick={self.showTeamTable}>
                  <div class='more-image'>{count}</div>
              </div>
            )
          }
        })
      } else {
        teamMemNumber = 0;
        teamFTE = 0;
      }
      return (
        <div class='home-team-header'>
          {/*<h2 class='heading-teamType' id="teamType">{teamType}</h2>*/}
          <div class='home-team-header-title'>
            <div class='home-team-header-img-div' style={squadMarkDisplay}>
              <InlineSVG class='home-team-header-img' src={require('../../../img/Att-icons/att-icons_tribe.svg')}></InlineSVG>
            </div>
            <div class='home-team-header-teamname-div'>
              <h class='home-team-header-teamname' style={{'fontSize': teamNameFontSize, 'lineHeight': teamNameFontLingHeight}} id="teamName">{teamName}</h>

              <HomeTeamDescription teamName={teamName} teamDescription={teamDescription} showDescriptionBlock={self.showDescriptionBlock} loadDetailTeam={self.props.loadDetailTeam} updateTeamDetails={self.props.updateTeamDetails} />

              <HomeTeamSetup loadDetailTeam={self.props.loadDetailTeam} selectedTeamChanged={self.props.selectedTeamChanged} tabClickedHandler={self.props.tabClickedHandler}/>
            </div>
          </div>
          <div class='home-team-header-hierarchy'>
            <span id='Hierarchy'>
                {teamHierarchy}
                <div class='hierarchy-lastteam'>
                  {teamHierarchy2}
                </div>
            </span>
          </div>
          <div class='home-team-header-btns-div'>
            <div id='homeTeamHeaderBookmarkBtn' class='home-team-header-btns'>
              <InlineSVG class='home-team-header-btn-img' onClick={self.showBookmark} src={require('../../../img/Att-icons/att-icons_main-nav-bookmark.svg')}></InlineSVG>
              <div class='home-team-header-btn-title' onClick={self.showBookmark}>
                <h>Team Bookmarks</h>
              </div>
              <HomeBookmark loadDetailTeam={self.props.loadDetailTeam} closeBookmark={self.closeBookmark} updateTeamLink={self.props.updateTeamLink} />
            </div>

            {/*<div class='home-team-header-btns' onClick={self.showAssessments} id='homeHeaderAseBtn'>
              <InlineSVG class='home-team-header-btn-img' src={require('../../../img/Att-icons/att-icons_main-nav-maturity.svg')}></InlineSVG>
              <div class='home-team-header-btn-title'>
                <h>Maturity Assessment</h>
              </div>
            </div>*/}
            <div id='homeTeamHeaderMemberBtn' class='home-team-header-btns2'>
              <InlineSVG onClick={self.showTeamTable} class='home-team-header-btn-img2' src={require('../../../img/Att-icons/att-icons_main-nav-team.svg')}></InlineSVG>
              <div class='home-team-header-btn-title3' onClick={self.showTeamTable}>
                <h>Team Members</h>
              </div>
              <div class='home-team-header-btn-title2'>
                <InlineSVG src={require('../../../img/Att-icons/att_icons_curly-bracket-right.svg')}></InlineSVG>
              </div>
              <div class='home-team-header-members-div'>
                {faceImages}
              </div>
            </div>
          </div>
          <HomeMemberTable loadDetailTeam={self.props.loadDetailTeam} closeTeamTable={self.closeTeamTable} realodTeamMembers={self.props.realodTeamMembers} roles={self.props.roles}/>
        </div>
      )
    }
  }
});

module.exports = HomeTeamHeader;
