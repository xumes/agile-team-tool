var React = require('react');
var api = require('../api.jsx');
var HomeIterChart = require('./HomeIterChart.jsx');
var iterationHandler = require('./HomeIterationsHandler.jsx');
var HomeSnapshotPull = require('./HomeSnapshotPull.jsx');
var chartStatus = require('./chartStatus.jsx').chartStatus;

var HomeIterSection = React.createClass({
  componentWillUpdate: function(nextProps, nextState) {
  },
  componentDidUpdate: function() {
    if (this.props.loadDetailTeam.type == 'squad') {
      $('#contentSpinner').hide();
      $('#bodyContent').show();
      var teamId = this.props.loadDetailTeam.team._id;
      var iterationData = this.props.loadDetailTeam.iterations;
      var teamAccess = this.props.loadDetailTeam.access;
      _.each(Object.keys(chartStatus.squad.btns), function(key){
        if (!chartStatus.squad.btns[key])
          $('#'+key+'Chart_block').hide();
      });
      iterationHandler.squadIterationsHandler(teamId, iterationData, this.props.setSelectedIteration);
      this.props.iterationGraphArea('squad_team_scard');
    } else {
      $('#contentSpinner').hide();
      $('#bodyContent').show();
      $('#snapshotPull').show();
      var teamId = this.props.loadDetailTeam.team._id;
      var teamName = this.props.loadDetailTeam.team.name;
      var snapshotData = this.props.loadDetailTeam.snapshot;
      _.each(Object.keys(chartStatus.nonSquad.btns), function(key){
        if (!chartStatus.nonSquad.btns[key])
          $('#'+key+'Chart_block').hide();
      });
      iterationHandler.iterationSnapshotHandler(teamId, teamName, snapshotData);
      this.props.iterationGraphArea('nsquad_team_scard');
    }
  },
  render: function() {
    if (this.props.loadDetailTeam.team && ((this.props.loadDetailTeam.iterations && this.props.loadDetailTeam.iterations.length > 0) || this.props.loadDetailTeam.snapshot)) {
      return (
        <div id='iterationSection'>
          <div style={{'height':'100%'}} class='ibm-container-body'>
            <div id='squad_team_scard' style={{'display':'none','height':'100%', 'position':'relative', 'top':'1%'}}>
              <HomeIterChart id={'velocityChart'} />
              <HomeIterChart id={'throughputChart'} />
              <HomeIterChart id={'defectsChart'} />
              <HomeIterChart id={'wipBacklogChart'} />
              <HomeIterChart id={'pizzaChart'} />
              <HomeIterChart id={'unitCostChart'} />
              <HomeIterChart id={'statisfactionChart'} />
            </div>
            <div id='nsquad_team_scard' style={{'display':'none', 'height':'100%', 'position':'relative', 'top':'1%'}}>
              <HomeIterChart id={'pvelocityChart'} />
              <HomeIterChart id={'pthroughputChart'} />
              <HomeIterChart id={'pdefectsChart'} />
              <HomeIterChart id={'pwipBacklogChart'} />
              <HomeIterChart id={'pPizzaChart'} />
              <HomeIterChart id={'piePizzaChart'} />
              <HomeIterChart id={'pstatisfactionChart'} />
            </div>
          </div>
        </div>
      )
    } else if (this.props.loadDetailTeam.team) {
      return (
        <div id='iterationSection'>
          <div class='no-trends-message-block'>
            <p>No trending data available.</p>
            <p>Once iteration data has been input in the Iteration Overview section it will be displayed here.</p>
          </div>
        </div>
      )
    } else
      return null;
  }
});

module.exports = HomeIterSection;
