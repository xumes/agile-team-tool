var React = require('react');
var api = require('../api.jsx');
var InlineSVG = require('svg-inline-react');
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
  findTeamInAllTeams: function(pathId) {
    selectedTeam = pathId;
    this.props.tabClickedHandler('allteams', pathId);
  },
  render: function() {
    //console.log(this.props.selectedTeam);
    var self = this
    var headerStyle= {
      'display': 'inline'
    };
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
              <a class='hierarchy-link' title='View parent team information' alt='View parent team information' id={plink} href='#' onClick={()=>self.props.selectedTeamChanged(h.pathId)}>{h.name}</a>
              <h class='hierarchy-mark'>  &#10095;  </h>
            </div>
          );
        } else {
          return (
            <div key={plink} style={{'display':'inline'}}>
              <a class='hierarchy-link' title='View parent team information' alt='View parent team information' id={plink} href='#' onClick={()=>self.findTeamInAllTeams(h.pathId)}>{h.name}</a>
              <h class='hierarchy-mark'>  &#10095;  </h>
            </div>
          );
        }
      });
      var teamHierarchy2 = teamName;
    }
    var src = require('../../../img/Att-icons/att-icons_tribe.svg');
    return (
      <div class='home-team-header'>
        {/*<h2 class='heading-teamType' id="teamType">{teamType}</h2>*/}
        <div class='home-team-header-title'>
          <div class='home-team-header-img-div'>
            <InlineSVG class='home-team-header-img' src={src}></InlineSVG>
          </div>
          <div class='home-team-header-teamname-div'>
            <h class='home-team-header-teamname' style={headerStyle} id="teamName">{teamName}</h>
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
          <div class='home-team-header-btns'>
            <InlineSVG class='home-team-header-bookmark' src={require('../../../img/Att-icons/att-icons_metric.svg')}></InlineSVG>
          </div>
        </div>
      </div>
    )
  }
});

module.exports = HomeTeamHeader;
