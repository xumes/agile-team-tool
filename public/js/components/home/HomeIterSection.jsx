var React = require('react');
var api = require('../api.jsx');
var HomeIterChart = require('./HomeIterChart.jsx');
var iteationHandler = require('./HomeIterationsHandler.jsx');
var HomeFallBox = require('./HomeFallBox.jsx');
var HomeSnapshotPull = require('./HomeSnapshotPull.jsx');
var chartStatus = require('./chartStatus.jsx').chartStatus;

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
      $('#iterationSection').css('height', chartStatus.squad.charts.secHeight);
      $('#squad_team_scard > .container-body-col-2-1').css('height', chartStatus.squad.charts.chartHeight);
      _.each(Object.keys(chartStatus.squad.btns), function(key){
        console.log(key);
        if (!chartStatus.squad.btns[key]) {
          $('#'+key+'Chart_block').hide();
        }
      });
      iteationHandler.squadIterationsHandler(teamId, iterationData, teamAccess);
    } else {
      $('#contentSpinner').hide();
      $('#bodyContent').show();
      $('#snapshotPull').show();
      var teamId = this.props.loadDetailTeam.team._id;
      var teamName = this.props.loadDetailTeam.team.name;
      var snapshotData = this.props.loadDetailTeam.snapshot;
      $('#iterationSection').css('height', chartStatus.nonSquad.charts.secHeight);
      $('#nsquad_team_scard > .container-body-col-2-1').css('height', chartStatus.nonSquad.charts.chartHeight);
      _.each(Object.keys(chartStatus.nonSquad.btns), function(key){
        if (!chartStatus.nonSquad.btns[key]) {
          $('#'+key+'Chart_block').hide();
        }
      });
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
        <HomeFallBox component={iterationFallBoxComponents}/>
        <div style={{'height':'100%'}} class='ibm-container-body'>
          <div id='nsquad_team_scard' style={{'display':'none', 'height':'100%'}}>
            <HomeIterChart id={'pvelocityChart'} />
            <HomeIterChart id={'pthroughputChart'} />
            <HomeIterChart id={'pdefectsChart'} />
            <HomeIterChart id={'pwipBacklogChart'} />
            <HomeIterChart id={'pPizzaChart'} />
            <HomeIterChart id={'piePizzaChart'} />
            <HomeIterChart id={'pstatisfactionChart'} />
          </div>
          <div id='squad_team_scard' style={{'display':'none','height':'100%'}}>
            <HomeIterChart id={'velocityChart'} />
            <HomeIterChart id={'throughputChart'} />
            <HomeIterChart id={'defectsChart'} />
            <HomeIterChart id={'wipBacklogChart'} />
            <HomeIterChart id={'pizzaChart'} />
            <HomeIterChart id={'unitCostChart'} />
            <HomeIterChart id={'statisfactionChart'} />
          </div>
        </div>
      </div>
    )
  }
});

module.exports = HomeIterSection;
