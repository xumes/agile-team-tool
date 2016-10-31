var React = require('react');
var api = require('../api.jsx');
var teamName = ''
var teamType = ''

var HomeTeamHeader = React.createClass({
  componentWillUpdate: function(nextProps, nextState){
    if (nextProps.selectedTeam.type == 'squad') {
      teamType = 'Squad: ';
    } else {
      teamType = 'Team: ';
    }
    teamName = nextProps.selectedTeam.team.name;
  },
  componentDidUpdate: function() {
  },
  render: function() {
    //console.log(this.props.selectedTeam);
    var headerStyle= {
      'display': 'inline'
    }
    return (
      <div class="div--team">
        <h2 class="heading-teamType" id="teamType">{teamType}</h2>
        <h2 style={headerStyle} id="teamName">{teamName}</h2>
      </div>
    )
  }
});

module.exports = HomeTeamHeader;
