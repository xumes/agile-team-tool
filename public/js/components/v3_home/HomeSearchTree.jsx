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
    $('#newSearchTree').show();
    $('#newTeamTree').hide();
    $('.home-team-nav').nanoScroller();

  },

  render: function() {
    var treeStyle = {
      'display': 'none'
    };
    var self = this;

    if (_.isEmpty(this.props.searchTeams)) {
      var populateTeams = null;
    } else {
      var populateTeams = this.props.searchTeams.map(function(team) {
        var subTwistyId = 'search_' + team.pathId;
        var linkId = 'link_' + subTwistyId;
        var label = team.name;
        var isSquad = false;
        var objectId = team._id;
        if (team.type == 'squad') {
          var triggerSquad = 'ibm-twisty-trigger trigger-squad';
          var isSquad = 'agile-team-link agile-team-standalone agile-team-squad';
        } else {
          triggerSquad = 'ibm-twisty-trigger';
          isSquad = 'agile-team-link agile-team-standalone';
        }
        return (
          <li key={objectId} data-open='false' class='agile-team-standalone' id={subTwistyId}>
            <a class={triggerSquad} href='#toggle'>
              <span class='ibm-access'>{label}</span>
            </a>
            <a class={isSquad} id={linkId} onClick={self.props.selectedTeamChanged.bind(null, team.pathId)}><span class='agile-team-title'>{label}</span></a>
            <span class='ibm-access'>{team.pathId}</span>
          </li>
        )
      });
    }
    return (
      <div id='newSearchTree' style={treeStyle}>
        <ul class='ibm-twisty' id='newSearchTreeMain'>
          {populateTeams}
        </ul>
      </div>
    );
  }
});

module.exports = HomeSearchTree;
