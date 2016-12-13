var React = require('react');
var api = require('../api.jsx');
var assessmentHandler = require('./HomeAssessmentsHandler.jsx');
var HomeFallBox = require('./HomeFallBox.jsx');
var HomeSnapshotPull = require('./HomeSnapshotPull.jsx');

var HomeAseSection = React.createClass({
  componentWillUpdate: function(nextProps, nextState) {
  },
  componentDidUpdate: function() {
    if(!$('#' + 'assessmentSection' + ' .agile-section-title').hasClass('ibm-showing')) {
      $('#' + 'assessmentSection' + ' .agile-section-title').addClass('ibm-showing');
      $('#' + 'assessmentSection' + ' .agile-section-title a').addClass('ibm-show-active');
      $('#' + 'assessmentSection' + ' div.ibm-container-body').css('display','block');
    }
    if (this.props.loadDetailTeam.type == 'squad') {
      //$('#assessmentFallBox').show();
      $('#squad_assessment_card').show();
      var teamId = this.props.loadDetailTeam.team._id;
      var assessmentData = this.props.loadDetailTeam.assessments;
      var teamAccess = this.props.loadDetailTeam.access;
      assessmentHandler.teamAssessmentListHander(teamId, assessmentData, teamAccess);
    } else {
      $('#nsquad_assessment_card').show();
      var teamId = this.props.loadDetailTeam.team._id;
      var teamName = this.props.loadDetailTeam.team.name;
      var snapshotData = this.props.loadDetailTeam.snapshot;
      assessmentHandler.assessmentParentRollup(snapshotData);
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
    var assessmentFallBoxComponents = {
      'id': 'assessmentFallBox',
      'selectId': 'gotoAssesmentList',
      'label': 'Go to assessment:',
      'goBtnId': 'GoAssesmentBtn',
      'createBtnId': 'CreateAssesmentBtn',
      'createBtnTitle': 'Create assessment'
    };
    return (
      <div data-widget='showhide' data-type='panel' class='ibm-show-hide' id='assessmentSection' style={{'top': '2%'}}>
        {/*
        <h2 class='agile-section-title ibm-showing' data-open='true' id='agile-section-title'>
          <a href='#show-hide' class='ibm-show-active' onClick={this.expandCollapseSection.bind(null, 'assessmentSection')}>
            Maturity assessment trends
          </a>
        </h2>
        */}
        <HomeFallBox component={assessmentFallBoxComponents} />
        <div style={{'height':'100%'}} class='ibm-container-body'>
          <div id='nsquad_assessment_card' style={{'display': 'none', 'height':'100%'}}>
            <div class='container-body-columns-ase' style={{'height':'35%'}}>
              <div id={'trend_Block'} class='container-body-col-2-2' >
                <div id={'assessmentTrend'}></div>
              </div>
              <div id={'eval_Block'} class='container-body-col-2-2' >
                <div id={'assessmentEval'}></div>
              </div>
            </div>
          </div>
          <div id='squad_assessment_card' style={{'display': 'none', 'height':'100%'}}>
              <div id={'assessmentCharts'} style={{'height':'100%'}}></div>
          </div>
        </div>
      </div>
    )
  }
});

module.exports = HomeAseSection;
