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
    if(!$('#' + 'iterationSection' + ' .agile-section-title').hasClass('ibm-showing')) {
      $('#' + 'iterationSection' + ' .agile-section-title').addClass('ibm-showing');
      $('#' + 'iterationSection' + ' .agile-section-title a').addClass('ibm-show-active');
      $('#' + 'iterationSection' + ' div.ibm-container-body').css('display','block');
    }
    if (this.props.loadDetailTeam.type == 'squad') {
      $('#contentSpinner').hide();
      $('#bodyContent').show();
      $('#iterationFallBox').show();
      var teamId = this.props.loadDetailTeam.team._id;
      var iterationData = this.props.loadDetailTeam.iterations;
      var teamAccess = this.props.loadDetailTeam.access;
      iteationHandler.squadIterationsHandler(teamId, iterationData, teamAccess);
    } else {
      $('#contentSpinner').hide();
      $('#bodyContent').show();
      $('#snapshotPull').show();
      var teamId = this.props.loadDetailTeam.team._id;
      var teamName = this.props.loadDetailTeam.team.name;
      var snapshotData = this.props.loadDetailTeam.snapshot;
      iteationHandler.iterationSnapshotHandler(teamId, teamName, snapshotData);
    }
  },

  expandCollapseSection: function(id) {
    if($('#' + id + ' .agile-section-title').hasClass('ibm-showing')) {
      $('#' + id + ' .agile-section-title').removeClass('ibm-showing');
      $('#' + id + ' .agile-section-title a').removeClass('ibm-show-active');
      $('#' + id + ' div.ibm-container-body').css('display','none');
    } else {
      $('#' + id + ' .agile-section-title').addClass('ibm-showing');
      $('#' + id + ' .agile-section-title a').addClass('ibm-show-active');
      $('#' + id + ' div.ibm-container-body').css('display','block');
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
        <h2 class='agile-section-title ibm-showing' data-open='true' id='agile-section-title'>
          <a href='#show-hide' class='ibm-show-active' title='Expand/Collapse' onClick={()=>this.expandCollapseSection('iterationSection')}>
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
