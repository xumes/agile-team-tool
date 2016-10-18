var React = require('react');
var api = require('../api.jsx');

var HomeSearchTree = React.createClass({
  getInitialState: function() {
    return {
    }
  },

  render: function() {
    var treeStyle = {
      'display': this.props.searchTreeHide
    };
    var self = this;

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
          <a class={isSquad} id={linkId} onClick={()=>self.props.clickedTeam(objectId)}>{label}</a>
          <span class='ibm-access'>{team.pathId}</span>
        </li>
      )
    });
    return (
      <div id='searchTree' style={treeStyle}>
        <ul class='ibm-twisty' id='searchTreeMain'>
          {populateTeams}
        </ul>
      </div>
    )
  }
});

module.exports = HomeSearchTree;
