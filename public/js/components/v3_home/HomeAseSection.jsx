var React = require('react');
var api = require('../api.jsx');
var assessmentHandler = require('./HomeAssessmentsHandler.jsx');
var HomeFallBox = require('./HomeFallBox.jsx');
var HomeSnapshotPull = require('./HomeSnapshotPull.jsx');

var HomeAseSection = React.createClass({
  componentWillUpdate: function(nextProps, nextState) {
  },
  componentDidUpdate: function() {
    if (this.props.loadDetailTeam.type == 'squad') {
      $('#squad_assessment_card').show();
      var teamId = this.props.loadDetailTeam.team._id;
      var assessmentData = this.props.loadDetailTeam.assessments;
      var teamAccess = this.props.loadDetailTeam.access;
      assessmentHandler.plotAssessmentSeries(assessmentData);
      this.props.assessmentGraphArea('squad_assessment_card')
    } else {
      $('#nsquad_assessment_card').show();
      var teamId = this.props.loadDetailTeam.team._id;
      var teamName = this.props.loadDetailTeam.team.name;
      var snapshotData = this.props.loadDetailTeam.snapshot;
      this.props.assessmentGraphArea('nsquad_assessment_card');
      assessmentHandler.assessmentParentRollup(snapshotData);
    }
    $(Highcharts.charts).each(function(i,chart) {
      if (chart == null) return;
      if ($('#' + $(chart.container).attr('id')).length > 0) {
        var height = chart.renderTo.clientHeight;
        var width = chart.renderTo.clientWidth;
        chart.setSize(width, height);
      }
    });
  },
  render: function() {
    if (this.props.loadDetailTeam.team && ((this.props.loadDetailTeam.assessments && this.props.loadDetailTeam.assessments.length > 0) || this.props.loadDetailTeam.snapshot)) {
      return (
        <div id='assessmentSection'>
          <div style={{'height':'100%'}} class='ibm-container-body'>
            <div id='squad_assessment_card' style={{'display': 'none', 'height':'100%', 'position':'relative', 'top':'1%'}} />
            <div id='nsquad_assessment_card' style={{'display': 'none', 'height':'100%', 'position':'relative', 'top':'1%'}}>
              <div class='container-body-columns-ase' style={{'height':'35%'}}>
                <div class='container-body-col-2-2' >
                  <div id='assessmentTrend'></div>
                </div>
                <div class='container-body-col-2-2' >
                  <div id='assessmentEval'></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    } else
      return null;
  }
});

module.exports = HomeAseSection;
