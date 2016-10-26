var React = require('react');
var api = require('../api.jsx');
var HomeIterChart = require('./HomeIterChart.jsx');
var iteationHandler = require('./HomeIterationsHandler.jsx');
var HomeFallBox = require('./HomeFallBox.jsx');
var HomeSnapshotPull = require('./HomeSnapshotPull.jsx');

var HomeIterSection = React.createClass({
  componentWillUpdate: function(nextProps, nextState) {
  },
  componentDidUpdate: function() {
    if (this.props.selectedTeam.length > 2) {
      $('#contentSpinner').hide();
      $('#bodyContent').show();
      $('#iterationFallBox').show();
      var teamId = this.props.selectedTeam[0]._id;
      var iterationData = this.props.selectedTeam[1];
      var teamAccess = this.props.selectedTeam[3];
      iteationHandler.squadIterationsHandler(teamId, iterationData, teamAccess);
    } else {
      $('#contentSpinner').hide();
      $('#bodyContent').show();
      $('#snapshotPull').show();
      var teamId = this.props.selectedTeam[0]._id;
      var teamName = this.props.selectedTeam[0].name;
      var snapshotData = this.props.selectedTeam[1];
      iteationHandler.iterationSnapshotHandler(teamId, teamName, snapshotData);
    }
  },
  render: function() {
    var iterationFallBoxComponents = {
      'id': 'iterationFallBox',
      'selectId': 'gotoIterationList',
      'label': 'Go to iteration:',
      'goBtnId': 'GoIterationBtn',
      'createBtnId': 'CreateIterationBtn',
      'createBtnTitle': 'Create iteration'
    };
    return (
      <div data-widget='showhide' data-type='panel' class='ibm-show-hide' id='iterationSection'>
        <HomeSnapshotPull />
        <h2 class='agile-section-title' data-open='true' id='agile-section-title'>
          <a href='#show-hide' class='ibm-show-active'>
            Iteration trends
          </a>
        </h2>
        <HomeFallBox component={iterationFallBoxComponents}/>
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
            <div id="chartgrp2">
              <div class='ibm-columns' style={{'marginBottom': '3em'}}>
                <HomeIterChart id={'defectsChart'} />
                <HomeIterChart id={'wipBacklogChart'} />
              </div>
            </div>
            <div id="chartgrp3">
              <div class='ibm-columns' style={{'marginBottom': '3em'}}>
                <HomeIterChart id={'pizzaChart'} />
                <HomeIterChart id={'unitCostChart'} />
              </div>
            </div>
            <div id="chartgrp4">
              <div class='ibm-columns' style={{'marginBottom': '3em'}}>
                <HomeIterChart id={'statisfactionChart'} />
                <HomeIterChart id={''} />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
});

module.exports = HomeIterSection;
