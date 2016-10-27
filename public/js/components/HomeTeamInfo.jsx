var React = require('react');
var api = require('../api.jsx');
var _ = require('underscore');

var HomeTeamInfo = React.createClass({
  componentDidUpdate: function() {
    var team = this.props.selectedTeam.team;
    var hierarchy = this.props.selectedTeam.hierarchy;
    this.updateTeamTable(team, hierarchy);
  },

  updateTeamTable: function(team, hierarchy) {
    var self = this;
    var isLeafTeam = false;
    if (team != undefined) {
      $('#levelDetail').empty();
      var keyLabel = '';
      var keyValue = '';
      if (team['_id'] != undefined) {
        keyLabel = 'Team Id';
        keyValue = team['_id'];
      }
      if (team['name'] != undefined) {
        keyLabel = 'Team Name';
        var tn = team['name'];
        if (tn.trim() == '')
          tn = '&nbsp;';
        keyValue = "<a class='wlink' href='team?id=" + encodeURIComponent(team['_id']) + "' title='Manage team information'>" + tn + '</a>';
        self.appendRowDetail(keyLabel, keyValue);
      }
      if (team['type'] != undefined) {
        keyLabel = 'Squad Team?';
        if (team['type'] == 'squad') {
          isLeafTeam = true;
          keyValue = 'yes';
        } else {
          keyValue = 'no';
        }
      }
      if (team['description'] != undefined) {
        keyLabel = 'Description';
        keyValue = team['description'];
        self.appendRowDetail(keyLabel, keyValue);
      }
      if (hierarchy.error || hierarchy.length == 0) {
        keyLabel = 'Hierarchy';
        keyValue = '(No parent team infomation)';
        self.appendRowDetail(keyLabel, keyValue);
      } else {
        keyLabel = 'Hierarchy';
        keyValue = '<div class="ibm-spinner"></div>';
        self.appendRowDetail(keyLabel, keyValue);
        self.hierarchyTeamHandler(hierarchy, team['name']);
      }
      if (team['links'] != undefined) {
        keyLabel = 'Important links';
        var links = team['links'];
        var tr = '';
        if (links.length > 0) {
          _.each(links, function(value, key, list){
            tr = tr + '<tr>';
            tr = tr + '<td>' + value.linkLabel + '</td>';
            tr = tr + '<td><a href="'+value.linkUrl+'" target="_blank" class="wlink" >'+value.linkUrl+'</a></td>';
            tr = tr + '</tr>';
          });
          var html = '<table class=\'tImportantlink\'>';
          html = html + tr;
          html = html + '</table>';
          keyValue = html;
          self.appendRowDetail(keyLabel, keyValue, true);
        }
      }
      if (team['members'] != undefined) {
        keyLabel = 'Number of members';
        keyValue =team['members'].length;
        self.appendRowDetail(keyLabel, keyValue);
      }
      if (team['members'] != undefined) {
        keyLabel = 'FTE';
        keyValue = self.teamMemFTE(team['members']);
        self.appendRowDetail(keyLabel, keyValue);
      }
    }
  },

 appendRowDetail: function(keyLabel, keyValue, noParagraph) {
    var rowId = keyLabel;
    var row = '<tr id="'+rowId+'">';
    if (noParagraph) {
      row = row + '<td><p>' + keyLabel + '</p></td>';
      row = row + '<td>' + keyValue + '</td>';
    } else {
      row = row + '<td><p>' + keyLabel + '</p></td>';
      row = row + '<td><p>' + keyValue + '</p></td>';
    }
    row = row + '</tr>';
    $('#levelDetail').append(row);
  },

  hierarchyTeamHandler: function(linkedTeams, teamName) {
    var strHierarchy = '';
    var separator = '&nbsp;&gt;&nbsp;';
    _.each(linkedTeams, function(team){
      var linkId = $('#link_' + team.pathId);
      if (linkId && linkId.html() != undefined) {
        strHierarchy = strHierarchy + team.name + separator;
      } else {
        strHierarchy = strHierarchy + team.name + separator;
      }
    });
    strHierarchy = strHierarchy + teamName
    $('#Hierarchy td')[1].innerHTML = strHierarchy;
  },

 teamMemFTE: function(teamMembers) {
    var teamCount = 0;
    var tmArr = [];
    _.each(teamMembers, function(member) {
      teamCount += parseInt(member.allocation);
    });
    return (teamCount / 100);
  },

  render: function() {
    return (
      <div>
        <div>
          <h2 class='ibm-bold ibm-h4' style={{'display':'inline-block', 'width':'50%', 'float':'left'}}>Team Information</h2>
        </div>
        <table class="ibm-data-table" id="levelTable" summary="__REPLACE_ME__">
          <thead class="ibm-access">
            <tr>
              <th scope="col" colSpan="2">Team Information</th>
            </tr>
          </thead>
          <tbody id="levelDetail">
          </tbody>
        </table>
      </div>
    )
  }
});

module.exports = HomeTeamInfo;
