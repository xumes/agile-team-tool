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
          var summaryHeight = self.props.loadDetailTeam.assessments[0].componentResults.length * 10 + '%';
          var contentHeight = 100/self.props.loadDetailTeam.assessments[0].componentResults.length + '%';
          $('.home-assessment-summary').css('height',summaryHeight);
          $('.home-assessment-summary-content').css('height',contentHeight);
        } else {
          summaryHeight = '10%';
          contentHeight = '100%';
          $('.home-assessment-summary').css('height',summaryHeight);
          $('.home-assessment-summary-content').css('height',contentHeight);
        }

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
        var assessContent = self.props.loadDetailTeam.assessments[0].componentResults.map(function(assessment, index){
          var assessKey = 'assess_'+index;
          if (assessment.componentName == 'Team Agile Leadership and Collaboration - Projects') {
            var assessmentName = ' Project';
          } else if (assessment.componentName == 'Team Delivery') {
            assessmentName = ' DevOps';
          } else {
            assessmentName = ' Operations';
          }
          var lineWidth = (assessment.currentScore-1)/3 * 95 + '%'
          return (
            <div key={assessKey} class='home-assessment-summary-content'>
              <div class='home-assessment-summary-title'>
                <h1>Assessment:{assessmentName}</h1>
                <h2>{submitDate}</h2>
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
              <div class='home-assessment-summary-btn'>
                <button type='button' class='ibm-btn-pri ibm-btn-blue-50'>Update Action Plan</button>
              </div>
            </div>
          );
        });
      } else {
        assessContent = (
          <div class='home-assessment-summary-content'>No Assessment Info</div>
        )
      }
      return (
        <div class='home-assessment-summary' style={{'display':'none'}}>
          {assessContent}
        </div>
      )
    }
  }
});

module.exports = HomeAseSummary;
