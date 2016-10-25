var React = require('react');
var api = require('../api.jsx');
var HomeIterChart = require('./HomeIterChart.jsx');
var iteationHandler = require('../homeIterationsHandler.jsx');

var HomeIterSection = React.createClass({
  componentWillUpdate: function(nextProps, nextState) {
  },
  componentDidUpdate: function() {
    if (this.props.selectedTeam.length > 2) {
      $('#contentSpinner').hide();
      $('#squad_team_scard').show();
      var teamId = this.props.selectedTeam[0]._id;
      iteationHandler.squadIterationsHandler(teamId,this.props.selectedTeam[1]);
    } else {
      $('#contentSpinner').hide();
      $('#nsquad_team_scard').show();
      var teamId = this.props.selectedTeam[0]._id;
      var teamName = this.props.selectedTeam[0].name;
      var iterationData = this.props.selectedTeam[1].iterationData;
      var squadScore = this.props.selectedTeam[1].teamMemberData;
      iteationHandler.snapshotIterationHandler(teamId, teamName, iterationData, squadScore);
    }
  },
  render: function() {
    console.log(this.props.selectedTeam);
    return (
      <div data-widget='showhide' data-type='panel' class='ibm-show-hide' id='iterationSection'>
        <h2 class='agile-section-title' data-open='true' id='agile-section-title'>Iteration trends</h2>
        <div style={{'marginTop':'2em'}} class='ibm-container-body'>
          <div id='nsquad_team_scard' style={{'display':'none'}}>
            <div class='ibm-columns' style={{'marginBottom': '3em'}}>
              <HomeIterChart id={'pvelocityChart'} />
              <HomeIterChart id={'pthroughputChart'} />
            </div>
            <div class='ibm-columns' style={{'marginBottom': '3em'}}>
              <HomeIterChart id={'pdefectsChart'} />
              <HomeIterChart id={'pwipBacklogChart'} />
            </div>
            <div class='ibm-columns' style={{'marginBottom': '3em'}}>
              <HomeIterChart id={'pPizzaChart'} />
              <HomeIterChart id={'piePizzaChart'} />
            </div>
            <div class='ibm-columns' style={{'marginBottom': '3em'}}>
              <HomeIterChart id={'pstatisfactionChart'} />
              <HomeIterChart id={''} />
            </div>
          </div>
          <div id='squad_team_scard' style={{'display':'none'}}>
            <div class='ibm-columns' style={{'marginBottom': '3em'}}>
              <HomeIterChart id={'velocityChart'} />
              <HomeIterChart id={'throughputChart'} />
            </div>
            <div class='ibm-columns' style={{'marginBottom': '3em'}}>
              <HomeIterChart id={'defectsChart'} />
              <HomeIterChart id={'wipBacklogChart'} />
            </div>
            <div class='ibm-columns' style={{'marginBottom': '3em'}}>
              <HomeIterChart id={'pizzaChart'} />
              <HomeIterChart id={'unitCostChart'} />
            </div>
            <div class='ibm-columns' style={{'marginBottom': '3em'}}>
              <HomeIterChart id={'statisfactionChart'} />
              <HomeIterChart id={''} />
            </div>
          </div>
        </div>
      </div>
    )
  }
});

module.exports = HomeIterSection;
