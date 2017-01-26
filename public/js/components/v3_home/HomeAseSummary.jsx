var React = require('react');
var api = require('../api.jsx');
var moment = require('moment');
var InlineSVG = require('svg-inline-react');

var HomeAseSummary = React.createClass({
  componentDidUpdate: function() {
    var self = this;
    if (self.props.loadDetailTeam != undefined) {
      if (self.props.loadDetailTeam.type == '') {

      } else {
        if (self.props.loadDetailTeam.assessments != undefined && self.props.loadDetailTeam.assessments.length > 0) {
          var summaryHeight = (self.props.loadDetailTeam.assessments[0].componentResults.length + 1) * 9 + '%';
          var contentHeight = 100/(self.props.loadDetailTeam.assessments[0].componentResults.length + 1) + '%';
          $('.home-assessment-summary').css('height',summaryHeight);
          $('.home-assessment-summary-content').css('height',contentHeight);
          if (self.props.loadDetailTeam.assessments[0].componentResults.length == 1) {
            $('.home-assessment-summary').css('background-position','150% 80%');
          } else if (self.props.loadDetailTeam.assessments[0].componentResults.length == 2) {
            $('.home-assessment-summary').css('background-position','150% 100%');
          }
        } else {
          summaryHeight = '10%';
          contentHeight = '100%';
          $('.home-assessment-summary').css('height',summaryHeight);
          $('.home-assessment-summary-content').css('height',contentHeight);
          $('.home-assessment-summary').css('background-position','150% 70%');
        }
        $('.home-assessment-summary').show();
      }
    }
  },
  render: function() {
    var self = this;
    if (self.props.loadDetailTeam.type == '') {
      return null;
    } else {
      if (self.props.loadDetailTeam != undefined && self.props.loadDetailTeam.assessments != undefined && self.props.loadDetailTeam.assessments.length > 0) {
        var submitDate = '(Last Submitted ' + moment(self.props.loadDetailTeam.assessments[0].submittedDate).format('MMM DD, YYYY') + ')';
        var updateDate = moment(self.props.loadDetailTeam.assessments[0].updateDate).format('MMM DD YYYY');
        if (self.props.loadDetailTeam.assessments[0].assessmentStatus == 'Submitted') {
          var assessType = 'Submitted';
          var assessSubmit = null;
        } else {
          assessType = 'In Draft';
          assessSubmit = 'Draft Shown';
        }
        var assessContent = self.props.loadDetailTeam.assessments[0].componentResults.map(function(assessment, index){
          var assessKey = 'assess_'+index;
          if (assessment.componentName == 'Team Agile Leadership and Collaboration - Projects') {
            var assessmentName = 'Leadership & Collaboration - Project';
          } else if (assessment.componentName == 'Team Delivery') {
            assessmentName = 'Delivery (Dev Ops)';
          } else {
            assessmentName = 'Leadership & Collaboration - Operation';
          }
          if (index == 0) {
            var assessClass = 'home-assessment-summary-content';
          } else {
            assessClass = 'home-assessment-summary-content last-summary-content';
          }
          var lineWidth = (assessment.currentScore)/4 * 95 + '%'
          return (
            <div key={assessKey} class={assessClass}>
              <div class='home-assessment-summary-title'>
                <h1>{assessmentName}</h1>
                <h2>{assessSubmit}</h2>
              </div>
              <div class='home-assessment-summary-ponts'>
                <div class='home-assessment-summary-ponts-block'>
                  <div class='arrow-right'>
                    <InlineSVG src={require('../../../img/Att-icons/play-arrow.svg')}></InlineSVG>
                  </div>
                  <div class='dot'>
                    <InlineSVG src={require('../../../img/Att-icons/att-icons_circle.svg')}></InlineSVG>
                  </div>
                  <div class='dot' style={{'left':'63%'}}>
                    <InlineSVG src={require('../../../img/Att-icons/att-icons_circle.svg')}></InlineSVG>
                  </div>
                  <div class='arrow-end'>
                    <InlineSVG src={require('../../../img/Att-icons/play-arrow.svg')}></InlineSVG>
                  </div>
                  <div class='dash'>
                  </div>
                  <div class='line' style={{'width':lineWidth}}>
                  </div>
                  <div class='current-dot' style={{'left':lineWidth}}>
                    <InlineSVG src={require('../../../img/Att-icons/att-icons_circle2.svg')}></InlineSVG>
                  </div>
                </div>
                <div class='home-assessment-summary-ponts-block'>
                  <h1>Initiating</h1>
                  <h1 style={{'left':'3%'}}>Practicing</h1>
                  <h1 style={{'left':'10%'}}>Transforming</h1>
                  <h1 style={{'left':'0%','textAlign':'right'}}>Scaling</h1>
                </div>
              </div>
            </div>
          );
        });
        return (
          <div class='home-assessment-summary' style={{'display':'none'}}>
            <div class='home-assessment-summary-content'>
              <div class='home-assessment-summary-header-title'>
                <h1>Agile Maturity Overview</h1>
              </div>
              <div class='home-assessment-summary-header-btn'>
                <button type='button' class='ibm-btn-pri ibm-btn-blue-50'>Work with Assessment</button>
              </div>
              <div class='home-assessment-summary-header-status'>
                <div>
                  <h1>Current Status:</h1>
                  <h2>{assessType}</h2>
                </div>
                <div>
                  <h1>Last Opened:</h1>
                  <h2>{updateDate}</h2>
                </div>
              </div>
            </div>
            {assessContent}
          </div>
        )
      } else {
        return (
          <div class='home-assessment-summary' style={{'display':'none'}}>
            <div class='home-assessment-summary-content'>
              <div class='home-assessment-summary-header-title'>
                <h1>Agile Maturity Overview</h1>
              </div>
              <div class='home-assessment-summary-header-btn'>
                <button type='button' class='ibm-btn-pri ibm-btn-blue-50'>Add New Assessment</button>
              </div>
            </div>
          </div>
        )
      }
    }
  }
});

module.exports = HomeAseSummary;
