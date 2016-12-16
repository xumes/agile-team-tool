var React = require('react');
var api = require('../api.jsx');
var _ = require('underscore');

var HomeSearchTree = React.createClass({
  shouldComponentUpdate: function(nextProps, nextState) {
    if (nextProps.searchTeams == this.props.searchTeams) {
      return false;
    } else {
      return true;
    }
  },

  componentDidUpdate: function() {
    $('#navSpinner').hide();
    $('#searchTree').show();
    $('#newTeamTree').hide();
    $('.nano').nanoScroller();

  },

  render: function() {
    var treeStyle = {
      'display': 'none'
    };
    var self = this;

    if (_.isEmpty(this.props.searchTeams)) {
      var populateTeams = (
        <div>
          <h>Not Found!</h>
        </div>
      );
    } else {
      var populateTeams = this.props.searchTeams.map(function(team) {
        var subTwistyId = 'search_' + team.pathId;
        var linkId = 'link_' + subTwistyId;
        var label = team.name;
        var isSquad = false;
        var objectId = team._id;
        if (team.type == 'squad') {
          isSquad = 'agile-team-link agile-team-standalone agile-team-squad'
        } else {
          isSquad = 'agile-team-link agile-team-standalone'
        }
        return (
          <li key={objectId} data-open='false' class='agile-team-standalone' id={subTwistyId}>
            <a class='ibm-twisty-trigger' href='#toggle'>
              <span class='ibm-access'>{label}</span>
            </a>
            <a class={isSquad} id={linkId} onClick={self.props.selectedTeamChanged.bind(null, team.pathId)}>{label}</a>
            <span class='ibm-access'>{team.pathId}</span>
          </li>
        )
      });
    }
    return (
      <div id='searchTree' style={treeStyle}>
        <ul class='ibm-twisty' id='searchTreeMain'>
          {populateTeams}
        </ul>
      </div>
    );
  }
});

module.exports = HomeSearchTree;
