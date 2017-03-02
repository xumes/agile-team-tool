var React = require('react');
var api = require('../api.jsx');
var moment = require('moment');
var InlineSVG = require('svg-inline-react');

var HomeAseSummary = React.createClass({
  // componentDidUpdate: function() {
  //   var self = this;
  //   if (self.props.loadDetailTeam != undefined) {
  //     if (self.props.loadDetailTeam.type == '') {
  //
  //     } else {
  //       if (self.props.loadDetailTeam.assessments != undefined && self.props.loadDetailTeam.assessments.length > 0) {
  //         var summaryHeight = (self.props.loadDetailTeam.assessments[0].componentResults.length + 1) * 9 + '%';
  //         var contentHeight = 100/(self.props.loadDetailTeam.assessments[0].componentResults.length + 1) + '%';
  //         $('.home-assessment-summary').css('height',summaryHeight);
  //         $('.home-assessment-summary-content').css('height',contentHeight);
  //         if (self.props.loadDetailTeam.assessments[0].componentResults.length == 1) {
  //           if (window.innerWidth < 1900) {
  //             $('.home-assessment-summary').css('background-position','150% 80%');
  //           } else {
  //             $('.home-assessment-summary').css('background-position','150% 72%');
  //           }
  //         } else if (self.props.loadDetailTeam.assessments[0].componentResults.length == 2) {
  //           if (window.innerWidth < 1900) {
  //             $('.home-assessment-summary').css('background-position','150% 100%');
  //           } else {
  //             $('.home-assessment-summary').css('background-position','150% 85%');
  //           }
  //         }
  //       } else {
  //         summaryHeight = '10%';
  //         contentHeight = '100%';
  //         $('.home-assessment-summary').css('height',summaryHeight);
  //         $('.home-assessment-summary-content').css('height',contentHeight);
  //         if (window.innerWidth < 1900) {
  //           $('.home-assessment-summary').css('background-position','150% 70%');
  //         } else {
  //           $('.home-assessment-summary').css('background-position','150% 63%');
  //         }
  //       }
  //       $('.home-assessment-summary').show();
  //     }
  //   }
  // },
  componentDidMount: function() {
  },
  componentDidUpdate: function() {
    if (window.innerWidth < 1900) {
      $('.home-assessment-summary').css('background-position','150% 100%');
    } else {
      $('.home-assessment-summary').css('background-position','150% 85%');
    }
    $('.home-assessment-summary').show();
    $('.home-assessment-summary .select2').remove();
    $('.select-box > select').select2({'width':'100%'});
  },
  render: function() {
    var self = this;
    if (self.props.loadDetailTeam.type != 'squad') {
      return null;
    } else {
      var haveAccess = true;
      if (self.props.loadDetailTeam != undefined && self.props.loadDetailTeam.access) {
        haveAccess = false
      }
      if (self.props.loadDetailTeam != undefined && self.props.loadDetailTeam.assessments != undefined && self.props.loadDetailTeam.assessments.length > 0) {
        if (self.props.loadDetailTeam.assessments.length == 1 && self.props.loadDetailTeam.assessments[0].assessmentStatus == 'Draft') {
          var updateDate = moment(self.props.loadDetailTeam.assessments[0].updateDate).format('DD MMM YYYY');
          return (
            <div class='home-assessment-summary' style={{'display':'none'}}>
              <div>
                <div class='first-title'>
                  <h1>Agile Maturity Overview</h1>
                </div>
                <div class='last-opened'>
                  <h1>{'Last Opened:'}</h1>
                  <h2>{updateDate}</h2>
                </div>
              </div>
              <div>
                <div class='second-title'>
                  <h1>{'Your team is so close!'}</h1>
                </div>
              </div>
              <div>
                <div class='third-title'>
                  <h1>{'Unfortunately drafts do not count towards your maturity assessment rating. Use a few more'}</h1>
                  <h1>{'minutes to complete the assessment and we will give you an idea of where your team rates.'}</h1>
                </div>
                <div class='start-btn'>
                  <button type='button' class='ibm-btn-pri ibm-btn-blue-50' disabled={haveAccess}>{'Continue Assessment'}</button>
                </div>
              </div>
            </div>
          )
        } else {
          if (self.props.loadDetailTeam.assessments[0].assessmentStatus == 'Draft') {
            var tempAssess = self.props.loadDetailTeam.assessments[1];
          } else {
            tempAssess = self.props.loadDetailTeam.assessments[0];
          }
          var submitDate = '(Averaging last submitted: ' + moment(tempAssess.submittedDate).format('DD MMM YYYY') + ')';
          var updateDate = moment(tempAssess.updateDate).format('MMM DD YYYY');
          if (tempAssess.componentResults.length == 2) {
            var middleLineClass = 'middle-line';
          } else {
            middleLineClass = '';
          }
          var assessContent = tempAssess.componentResults.map(function(assessment, index){
            var assessKey = 'assess_'+index;
            if (assessment.componentName == 'Team Agile Leadership and Collaboration - Projects') {
              var assessmentName = 'Leadership & Collaboration';
            } else if (assessment.componentName == 'Team Delivery') {
              assessmentName = 'Delivery (Dev Ops)';
            } else {
              assessmentName = 'Leadership & Collaboration';
            }
            if (tempAssess.componentResults.length == 2 && index == 0) {
              var middleLineClass = 'middle-line';
            } else {
              middleLineClass = '';
            }
            var lineWidth = (assessment.currentScore)/4 * 95 + '%';
            return (
              <div key={assessKey}>
                <div class={middleLineClass}>
                  <div class='summary-title'>
                    <h1>{assessmentName}</h1>
                  </div>
                  <div class='summary-ponts'>
                    <div class='points-block'>
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
                    <div class='points-block'>
                      <h1>Initiating</h1>
                      <h1 style={{'left':'3%'}}>Practicing</h1>
                      <h1 style={{'left':'10%'}}>Transforming</h1>
                      <h1 style={{'left':'0%','textAlign':'right'}}>Scaling</h1>
                    </div>
                  </div>
                </div>
              </div>
            );
          });
          var assessSelect = self.props.loadDetailTeam.assessments.map(function(assess){
            if (assess.assessmentStatus == 'Submitted') {
              return(
                <option key={assess._id} value={assess._id}>{moment.utc(assess.createDate).format('DDMMMYYYY')}</option>
              )
            }
          });
          return (
            <div class='home-assessment-summary' style={{'display':'none'}}>
              <div class='main-content'>
                <div>
                  <div class='content-title'>
                    <h1>Agile Maturity Overview</h1>
                  </div>
                  <div class='submit-date'>
                    <h1>{submitDate}</h1>
                  </div>
                </div>
                {assessContent}
              </div>
              <div class='select-content-bg'>
              </div>
              <div class='select-content'>
                <div class='select-box'>
                  <select id='pAsseSelect' defaultValue='pa'>
                    <option value='pa'>{'Previous Assessments'}</option>
                    {assessSelect}
                  </select>
                </div>
                <div class='review-box'>
                  <h1>{'Not sure what to do next?'}</h1>
                  <button type='button' class='ibm-btn-sec ibm-btn-blue-50' disabled={haveAccess}>{'Review Action Plan'}</button>
                  <h2>{'Last Updated:'}</h2>
                  <h2 style={{'textAlign':'right'}}>{updateDate}</h2>
                </div>
                <div class='draft-box'>
                  <h1>{'Or show your improvement!'}</h1>
                  <button type='button' class='ibm-btn-pri ibm-btn-blue-50' disabled={haveAccess}>{'Work with Draft'}</button>
                  <h2>{'Last Updated:'}</h2>
                  <h2 style={{'textAlign':'right'}}>{updateDate}</h2>
                </div>
              </div>
            </div>
          )
        }
      } else {
        return (
          <div class='home-assessment-summary' style={{'display':'none'}}>
            <div>
              <div class='first-title'>
                <h1>Agile Maturity Overview</h1>
              </div>
            </div>
            <div>
              <div class='second-title'>
                <h1>{'How Agile is your team?'}</h1>
              </div>
            </div>
            <div>
              <div class='third-title'>
                <h1>{'The Agile Team Tool\'s purpose is to help you through the Agile Process.'}</h1>
                <h1>{'Take the Agile Maturity Assessment often to see where your team should focus its efforts.'}</h1>
              </div>
              <div class='start-btn'>
                <button type='button' class='ibm-btn-pri ibm-btn-blue-50' disabled={haveAccess}>{'Let\'s get started'}</button>
              </div>
            </div>
          </div>
        )
      }
    }
  }
});

module.exports = HomeAseSummary;
