var React = require('react');
var api = require('../api.jsx');
var HomeSpinner = require('./HomeSpinner.jsx');
var _ = require('underscore');

var HomeTeamTree = React.createClass({
  componentDidMount: function() {
    $('.nano').nanoScroller();
    $('#spinnerContainer-search').hide();
    $('#teamTree').show();
  },

  componentWillUpdate: function() {
    $('.nano').nanoScroller({ destroy: true });
    $('#spinnerContainer-search').show();
    $('#teamTree').hide();
  },

  componentDidUpdate: function() {
    $('.nano').nanoScroller();
    $('#spinnerContainer-search').hide();
    $('#teamTree').show();
  },
  render: function() {
    var teamTreeStyle = {
      'display': this.props.teamTreeHide
    };
    if (_.isUndefined(this.props.newTeams.teams)) {
      return null;
    } else {
      var myteams = this.props.newTeams.teams.map(function(team) {
        if (team.docStatus == 'delete') {
          return;
        }
        var teamId = team.pathId;
        var linkId = 'link_' + team.pathId;
        var bodyId = 'body_' + team.pathId;
        var label = team.name;
        var objectId = team._id;
        if (team.type == 'squad') {
          var isSquad = 'agile-team-link agile-team-standalone agile-team-squad';
        } else {
          isSquad = 'agile-team-link agile-team-standalone';
        }
        if (team.hasChild == false) {
          var hasChild = 'agile-team-standalone';
        } else {
          var hasChild = '';
        }
        var title = 'view ' + team.name + ' information';
        return (
          <li class={hasChild} key={objectId} data-open='false' id={teamId}>
            <a class='ibm-twisty-trigger' href='#toggle' title='Expand/Collapse'>
              <span class='ibm-access'>{label}</span>
            </a>
            <a class={isSquad} title={title} id={linkId}>{label}</a>
            <span class='ibm-access'>{teamId}</span>
            <div class='ibm-twisty-body' id={bodyId} style={{'display':'none'}}></div>
          </li>
        );
      });
      // standalone teams
      var standaloneTeams = this.props.newTeams.standalone.map(function(team) {
        if (team.docStatus == 'delete') {
          return null;
        }
        var teamId = team.pathId;
        var linkId = 'link_' + team.pathId;
        var bodyId = 'body_' + team.pathId;
        var label = team.name;
        var objectId = team._id;
        if (team.type == 'squad') {
          var isSquad = 'agile-team-link agile-team-standalone agile-team-squad';
        } else {
          isSquad = 'agile-team-link agile-team-standalone';
        }
        var title = 'view ' + team.name + ' information';
        return (
          <li class='agile-team-standalone' key={objectId} data-open='false' id={teamId}>
            <a class={isSquad} title={title} id={linkId}>{label}</a>
          </li>
        );
      })
      if (_.isEmpty(this.props.newTeams.standalone)) {
        return (
          <div id='teamTree' style={teamTreeStyle}>
            <ul class='ibm-twisty  ibm-widget-processed' id='teamTreeMain'>
              {myteams}
            </ul>
          </div>
        );
      } else {
        return (
          <div id='teamTree' style={teamTreeStyle}>
            <ul class='ibm-twisty  ibm-widget-processed' id='teamTreeMain'>
              {myteams}
              <li data-open='true' id='agteamstandlone' class='ibm-active'>
                <a class='ibm-twisty-trigger' href='#toggle' title='Expand/Collapse'>
                  <span class='ibm-access'>Standalone Teams</span>
                </a>
                <a class='agile-team-link'>Standalone Teams</a>
                <span class='ibm-access'>agteamstandalone</span>
                <div class='ibm-twisty-boddy' id='body_agteamstandalone' style={{'display':'block'}}>
                  <ul class='ibm-twisty ' id='main_agteamstandalone'>
                    {standaloneTeams}
                  </ul>
                </div>
              </li>
            </ul>
          </div>
        );
      }
    }
  }
});

module.exports = HomeTeamTree;
