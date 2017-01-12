var React = require('react');
var api = require('../api.jsx');
var HomeMemberTable = require('./HomeMemberTable.jsx');
var HomeBookmark = require('./HomeBookmark.jsx');
var HomeTeamDescription = require('./HomeTeamDescription.jsx');
var InlineSVG = require('svg-inline-react');
var Promise = require('bluebird');
var _ = require('underscore');
var teamName = ''
var teamType = ''

var HomeTeamHeader = React.createClass({
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
  },
  componentDidUpdate: function() {
    if (this.props.loadDetailTeam.team != undefined && this.props.loadDetailTeam.team.type == 'squad') {
      $('#homeHeaderAseBtn').show();
    } else {
      $('#homeHeaderAseBtn').hide();
    }
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
    if ($('#teamMemberTable').css('display') == 'none') {
      $('#teamMemberTable').fadeIn();
    } else {
      $('#teamMemberTable').fadeOut();
    }
  },
  showDescriptionBlock: function() {
    if ($('.home-team-header-description-div').css('display') == 'none') {
      $('.home-team-header-description-div').fadeIn();
    } else {
      $('.home-team-header-description-div').fadeOut();
    }
  },
  showBookmark: function() {
    if ($('#teamBookmark').css('display') == 'none') {
      $('#teamBookmark').fadeIn();
    } else {
      $('#teamBookmark').fadeOut();
    }
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
            var src = 'http://dpev027.innovate.ibm.com:10000/image/' + member.userId.toUpperCase();
            return (
              <div key={faceImageId} class='home-header-image'>
                <a class='ibm-padding-content' style={{'padding': '0', 'borderRadius': '50%'}} title={member.name}>
                  <img id={faceImageId} class='home-team-header-member-image' src={src}></img>
                </a>
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
              <div class='home-team-header-teamname-btn' id='homeHeaderDesBtn' onClick={self.showDescriptionBlock}>
                <InlineSVG class='home-team-header-teamname-btn-img' src={require('../../../img/Att-icons/att-icons_info.svg')}></InlineSVG>
              </div>
              <div class='home-team-header-teamname-btn'>
                <InlineSVG class='home-team-header-teamname-btn-img' src={require('../../../img/Att-icons/att-icons_team-settings-21.svg')}></InlineSVG>
              </div>
              <HomeTeamDescription teamName={teamName} teamDescription={teamDescription} showDescriptionBlock={self.showDescriptionBlock}/>
            </div>
          </div>
          <div class='home-team-header-hierarchy'>
            <tr id='Hierarchy'>
              <td>
                {teamHierarchy}
                <div class='hierarchy-lastteam'>
                  {teamHierarchy2}
                </div>
              </td>
            </tr>
          </div>
          <div class='home-team-header-btns-div'>
            <div class='home-team-header-btns' onClick={self.showBookmark}>
              <InlineSVG class='home-team-header-btn-img' src={require('../../../img/Att-icons/att-icons_main-nav-bookmark.svg')}></InlineSVG>
              <div class='home-team-header-btn-title'>
                <h>Team Bookmarks</h>
              </div>
            </div>
            <HomeBookmark loadDetailTeam={self.props.loadDetailTeam} showBookmark={self.showBookmark}/>
            <div class='home-team-header-btns' onClick={self.showAssessments} id='homeHeaderAseBtn'>
              <InlineSVG class='home-team-header-btn-img' src={require('../../../img/Att-icons/att-icons_main-nav-maturity.svg')}></InlineSVG>
              <div class='home-team-header-btn-title'>
                <h>Maturity Assessment</h>
              </div>
            </div>
            <div class='home-team-header-btns2'>
              <InlineSVG onClick={self.showTeamTable} class='home-team-header-btn-img2' src={require('../../../img/Att-icons/att-icons_main-nav-team.svg')}></InlineSVG>
              <div class='home-team-header-btn-title2'>
                <h>}</h>
              </div>
              <div class='home-team-header-members-div'>
                {faceImages}
              </div>
            </div>
          </div>
          <HomeMemberTable loadDetailTeam={self.props.loadDetailTeam} showTeamTable={self.showTeamTable} realodTeamMembers={self.props.realodTeamMembers}/>
        </div>
      )
    }
  }
});

module.exports = HomeTeamHeader;
