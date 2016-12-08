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
      //$('#iterationFallBox').show();
      //$('#assessmentFallBox').show();
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
        {/*
          <HomeSnapshotPull />
          <h2 class='agile-section-title ibm-showing' data-open='true' id='agile-section-title'>
          <a href='#show-hide' class='ibm-show-active' title='Expand/Collapse' onClick={()=>this.expandCollapseSection('iterationSection')}>
            Iteration trends
          </a>
        </h2>
        <HomeFallBox component={iterationFallBoxComponents}/>
        */}
        <HomeFallBox component={iterationFallBoxComponents}/>
        <div style={{'height':'100%'}} class='ibm-container-body'>
          <div id='nsquad_team_scard' style={{'display':'none', 'height':'100%'}}>
            <div class='container-body-columns'>
              <HomeIterChart id={'pvelocityChart'} />
              <HomeIterChart id={'pthroughputChart'} />
            </div>
            <div class='container-body-columns' style={{'top':'2%'}}>
              <HomeIterChart id={'pdefectsChart'} />
              <HomeIterChart id={'pwipBacklogChart'} />
            </div>
            <div class='container-body-columns' style={{'top':'4%'}}>
              <HomeIterChart id={'pPizzaChart'} />
              <HomeIterChart id={'piePizzaChart'} />
            </div>
            <div class='container-body-columns' style={{'top':'6%'}}>
              <HomeIterChart id={'pstatisfactionChart'} />
            </div>
          </div>
          <div id='squad_team_scard' style={{'display':'none','height':'100%'}}>
            <div class='container-body-columns'>
              <HomeIterChart id={'velocityChart'} />
              <HomeIterChart id={'throughputChart'} />
            </div>
            <div class='container-body-columns' style={{'top':'2%'}}>
              <HomeIterChart id={'defectsChart'} />
              <HomeIterChart id={'wipBacklogChart'} />
            </div>
            <div class='container-body-columns' style={{'top':'4%'}}>
              <HomeIterChart id={'pizzaChart'} />
              <HomeIterChart id={'unitCostChart'} />
            </div>
            <div class='container-body-columns' style={{'top':'6%'}}>
              <HomeIterChart id={'statisfactionChart'} />
            </div>
          </div>
        </div>
      </div>
    )
  }
});

module.exports = HomeIterSection;
