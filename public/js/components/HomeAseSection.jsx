var React = require('react');
var api = require('../api.jsx');
var HomeIterChart = require('./HomeIterChart.jsx');
var assessmentHandler = require('./HomeAssessmentsHandler.jsx');
var HomeFallBox = require('./HomeFallBox.jsx');
var HomeSnapshotPull = require('./HomeSnapshotPull.jsx');

var HomeAseSection = React.createClass({
  componentWillUpdate: function(nextProps, nextState) {
  },
  componentDidUpdate: function() {
    if (this.props.selectedTeam.type == 'squad') {
      $('#assessmentFallBox').show();
      $('#squad_assessment_card').show();
      var teamId = this.props.selectedTeam.team._id;
      var assessmentData = this.props.selectedTeam.assessments;
      var teamAccess = this.props.selectedTeam.access;
      assessmentHandler.teamAssessmentListHander(teamId, assessmentData, teamAccess);
    } else {
      $('#assessmentFallBox').show();
      $('#nsquad_assessment_card').show();
      var teamId = this.props.selectedTeam.team._id;
      var teamName = this.props.selectedTeam.team.name;
      var snapshotData = this.props.selectedTeam.snapshot;
      assessmentHandler.assessmentParentRollup(snapshotData);
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
      <div data-widget='showhide' data-type='panel' class='ibm-show-hide' id='assessmentSection'>
        <h2 class='agile-section-title' data-open='true' id='agile-assessment-section-title'>
          <a href='#show-hide' class='ibm-show-active'>
            Maturity assessment trends
          </a>
        </h2>
        <HomeFallBox component={assessmentFallBoxComponents} />
        <div class='ibm-rule ibm-alternate'>
          <hr></hr>
        </div>
        <div class='ibm-container-body'>
          <div id='nsquad_assessment_card' style={{'display': 'none'}}>
            <div class='ibm-columns' style={{'marginBottom': '3em'}}>
              <HomeIterChart id={'assessmentTrend'} />
              <HomeIterChart id={'assessmentEval'} />
            </div>
          </div>
          <div id='squad_assessment_card' style={{'display': 'none'}}>
            <div class='ibm-columns' style={{'marginBottom': '3em'}}>
              <div class='ibm-col-6-4'>
                <div id={'assessmentCharts'} style={{'width': '100%','minHeight':'280px'}}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
});

module.exports = HomeAseSection;
