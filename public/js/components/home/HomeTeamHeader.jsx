var React = require('react');
var api = require('../api.jsx');
var teamName = ''
var teamType = ''

var HomeTeamHeader = React.createClass({
  componentWillUpdate: function(nextProps, nextState){
    if (nextProps.loadDetailTeam.type == 'squad') {
      teamType = 'Squad: ';
    } else {
      teamType = 'Team: ';
    }
    teamName = nextProps.loadDetailTeam.team.name;
  },
  componentDidUpdate: function() {
  },
  render: function() {
    //console.log(this.props.selectedTeam);
    var headerStyle= {
      'display': 'inline'
    }
    return (
      <div class='home-team-header'>
        {/*<h2 class='heading-teamType' id="teamType">{teamType}</h2>*/}
        <div class='home-team-header-title'>
          <img class='home-team-header-img' src='../../../img/Att-icons/att-icons_tribe.svg'></img>
          <h class='home-team-header-teamname' style={headerStyle} id="teamName">{teamName}</h>
        </div>
      </div>
    )
  }
});

module.exports = HomeTeamHeader;
