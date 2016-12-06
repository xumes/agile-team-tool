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
    };
    if (this.props.loadDetailTeam.hierarchy == undefined || this.props.loadDetailTeam.hierarchy.error || this.props.loadDetailTeam.hierarchy.length == 0) {
      var teamHierarchy = 'No parent infomation';
      var teamHierarchy2 = null;
    } else {
      var hierarchy = this.props.loadDetailTeam.hierarchy;
      teamHierarchy = hierarchy.map(function(h){
        var plink = 'plink_' + h.pathId;
        if ($('#' + h.pathId).length) {
          return (
            <div key={plink} style={{'display':'inline', 'fontSize': '1.4em', 'color': '#EFF9FF'}}>
              <a class='wlink' style={{'display':'inline','paddingLeft':'0px', 'fontSize': '1.4em', 'color': '#EFF9FF'}} title='View parent team information' alt='View parent team information' id={plink} href='#' onClick={()=>self.props.selectedTeamChanged(h.pathId)}>{h.name}</a>
              <h> &#10095; </h>
            </div>
          );
        } else {
          return (
            <div key={plink} style={{'display':'inline', 'fontSize': '1.4em', 'color': '#EFF9FF'}}>
              <a class='wlink' style={{'display':'inline','paddingLeft':'0px', 'fontSize': '1.4em', 'color': '#EFF9FF'}} title='View parent team information' alt='View parent team information' id={plink} href='#' onClick={()=>self.findTeamInAllTeams(h.pathId)}>{h.name}</a>
              <h> &#10095; </h>
            </div>
          );
        }
      });
      var teamHierarchy2 = teamName;
    }
    return (
      <div class='home-team-header'>
        {/*<h2 class='heading-teamType' id="teamType">{teamType}</h2>*/}
        <div class='home-team-header-title'>
          <img class='home-team-header-img' src='../../../img/Att-icons/att-icons_tribe.svg'></img>
          <h class='home-team-header-teamname' style={headerStyle} id="teamName">{teamName}</h>
        </div>
        <div class='home-team-header-hierarchy'>
          <tr id='Hierarchy'>
            <td>
              {teamHierarchy}{teamHierarchy2}
            </td>
          </tr>
        </div>
      </div>
    )
  }
});

module.exports = HomeTeamHeader;
