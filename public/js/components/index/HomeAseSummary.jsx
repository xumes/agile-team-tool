var React = require('react');
var api = require('../api.jsx');
var moment = require('moment');
var InlineSVG = require('svg-inline-react');
var Modal = require('react-overlays').Modal;
var AssessmentPopover = require('../assessments/AssessmentPopover.jsx');
var AssessmentSetupPopover = require('../assessments/AssessmentSetupPopover.jsx');
var AssessmentACPlanPopover = require('../assessments/AssessmentACPlanPopover.jsx');
var ConfirmDialog = require('./ConfirmDialog.jsx');
var chartStatus = require('./chartStatus.jsx').chartStatus;

var HomeAseSummary = React.createClass({
  getInitialState: function() {
    return {
      showModal: false,
      showSetupModel: false,
      showACPlanModel: false,
      selectedAssessment: '',
      activeTemplate: null,
      assessTemplate: null,
      shouldUpdate: false,
      type: '',
      software: ''
    };
  },
  componentDidMount: function() {
    var self = this;
    api.getAssessmentTemplate(null, 'active')
      .then(function(assessmentTemplates) {
        self.setState({
          activeTemplate: assessmentTemplates[0]
        });
      });
  },
  componentWillUpdate: function(preProps) {
    var self = this;
    if (!_.isEmpty(preProps.loadDetailTeam) && !_.isEmpty(self.props.loadDetailTeam)) {
      if (preProps.loadDetailTeam.team._id.toString() != self.props.loadDetailTeam.team._id.toString()) {
        self.state.selectedAssessment = '';
      }
    }
  },
  componentDidUpdate: function() {
    var self = this;
    if (window.innerWidth < 1900) {
      $('.home-assessment-summary').css('background-position','150% 100%');
    } else {
      $('.home-assessment-summary').css('background-position','150% 85%');
    }
    if (chartStatus.assessmentSummaryShow) {
      $('.home-assessment-summary').show();
    } else {
      $('.home-assessment-summary').hide();
    }
    if ($('.home-assessment-summary .select2').length > 0) {
      $('.home-assessment-summary .select2').remove();
    }
    $('#pAsseSelect').off('change');
    $('#pAsseSelect').val('ps').change();
    $('#pAsseSelect').select2({'width':'100%'});
    $('#pAsseSelect').change(this.assessmentChangeHandler);
    if (self.props.loadDetailTeam != undefined && self.props.loadDetailTeam.assessments != undefined && self.props.loadDetailTeam.assessments.length > 0 && self.props.loadDetailTeam.assessments[0].assessmentStatus == 'Draft') {
      api.getTemplateByVersion(self.props.loadDetailTeam.assessments[0].version)
        .then(function(template){
          self.state.assessTemplate = template;
        })
        .catch(function(err){
          console.log(err);
        })
    } else {
      self.state.assessTemplate = self.state.activeTemplate;
    }
  },
  assessmentChangeHandler: function(e) {
    var self = this;
    // var tempAssess = {};
    if (e.target.value == 'ps') {
      return;
    } else {
      var tempAssess = _.find(self.props.loadDetailTeam.assessments, function(assess){
        if (assess._id.toString() == e.target.value) {
          self.state.selectedAssessment = e.target.value;
          return assess;
          // return tempAssess = assess;
        }
      });
      var version = 'ag_ref_atma_components_v0' + tempAssess.version.charAt(tempAssess.version.length - 1);
      api.getTemplateByVersion(version)
        .then(function(template){
          self.state.assessTemplate = template;
          self.setState({ showACPlanModel: true });
        })
        .catch(function(err){
          console.log(err);
        })
    }
    // var submitDate = '(Averaging last submitted: ' + moment(tempAssess.submittedDate).format('DD MMM YYYY') + ')';
    // $('.home-assessment-summary > .main-content > div > .submit-date > h1').html(submitDate);
    // var updateDate = moment(tempAssess.updateDate).format('DD MMM YYYY');
    // $('.home-assessment-summary > .select-content > .review-box > h3').html(updateDate);
    // if (tempAssess.componentResults.length == 1) {
    //   $('#assess_1').hide();
    // }
    // _.each(tempAssess.componentResults, function(assess, index){
    //   var assessId = '#assess_' + index;
    //   $(assessId).show();
    //   if (assess.componentName == 'Team Agile Leadership and Collaboration - Projects') {
    //     var assessmentName = 'Leadership & Collaboration';
    //   } else if (assess.componentName == 'Team Delivery') {
    //     assessmentName = 'Delivery (Dev Ops)';
    //   } else {
    //     assessmentName = 'Leadership & Collaboration';
    //   }
    //   if (tempAssess.componentResults.length == 2 && index == 0) {
    //     var middleLineClass = 'middle-line';
    //   } else {
    //     middleLineClass = '';
    //   }
    //   var lineWidth = (assess.currentScore)/4 * 95 + '%';
    //   $(assessId + ' > div > .summary-title > h1').html(assessmentName);
    //   $(assessId + ' > div > .summary-ponts .line').css('width',lineWidth);
    //   $(assessId + ' > div > .summary-ponts .current-dot').css('left',lineWidth);
    // });
  },
  showAssessmentPopover: function() {
    this.setState({ showModal: true });
  },
  hideAssessmentPopover: function() {
    this.setState({ showModal: false });
  },
  showAssessmentSetupPopover: function() {
    this.setState({ showSetupModel: true });
  },
  hideAssessmentSetupPopover: function() {
    this.setState({ showSetupModel: false });
  },
  showAssessmentACPlanPopover: function() {
    this.setState({ showACPlanModel: true });
  },
  hideAssessmentACPlanPopover: function() {
    this.state.selectedAssessment = '';
    this.setState({ showACPlanModel: false });
  },
  updateAssessmentSummary: function() {
    this.setState({shouldUpdate:true});
    this.state.shouldUpdate = false;
  },
  continueAssessmentDraft: function(type, software) {
    this.state.type = type;
    this.state.software = software;
    this.showAssessmentPopover();
  },
  render: function() {
    var self = this;
    var backdropStyle = {
      top: 0, bottom: 0, left: 0, right: 0,
      zIndex: 'auto',
      backgroundColor: '#000',
      opacity: 0.5,
      width: '100%',
      height: '100%'
    };
    var modalStyle = {
      position: 'fixed',
      width: '100%',
      height: '100%',
      minWidth: '1280px',
      minHeight: '720px',
      zIndex: 1040,
      top: 0, bottom: 0, left: 0, right: 0,
    };
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
          // self.state.selectedAssessment = self.props.loadDetailTeam.assessments[0]._id.toString();
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
                <div class='hide-show-btn' onClick={self.props.showHideAseSummary}>
                  <InlineSVG src={require('../../../img/Att-icons/att-icons_hide.svg')}></InlineSVG>
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
                  <h1 style={{'top':'10%'}}>{'minutes to complete the assessment and we will give you an idea of where your team rates.'}</h1>
                </div>
                <div class='start-btn'>
                  <button type='button' onClick={self.showAssessmentPopover} class='ibm-btn-pri ibm-btn-blue-50' disabled={haveAccess}>{'Continue Assessment'}</button>
                </div>
              </div>
              <Modal aria-labelledby='modal-label' style={modalStyle} backdropStyle={backdropStyle} show={self.state.showModal}>
                <AssessmentPopover hideAssessmentPopover={self.hideAssessmentPopover} loadDetailTeam={self.props.loadDetailTeam} assessTemplate={self.state.assessTemplate} updateAssessmentSummary={self.updateAssessmentSummary} />
              </Modal>
            </div>
          )
        } else {
          if (self.state.selectedAssessment != '') {
            var tempAssess = _.find(self.props.loadDetailTeam.assessments, function(assess){
              if (assess._id.toString() == self.state.selectedAssessment) {
                return assess;
              }
            });
            if (self.props.loadDetailTeam.assessments[0].assessmentStatus == 'Draft') {
              var hasDraft = true;
              var draftUpdateDate = moment(self.props.loadDetailTeam.assessments[0].updateDate).format('DD MMM YYYY');
            } else {
              hasDraft = false;
              draftUpdateDate = '';
              self.state.type = self.props.loadDetailTeam.assessments[0].type;
              self.state.software = self.props.loadDetailTeam.assessments[0].deliversSoftware?'Yes':'No';
            }
          } else {
            if (self.props.loadDetailTeam.assessments[0].assessmentStatus == 'Draft') {
              var tempAssess = self.props.loadDetailTeam.assessments[1];
              var hasDraft = true;
              var draftUpdateDate = moment(self.props.loadDetailTeam.assessments[0].updateDate).format('DD MMM YYYY');
            } else {
              tempAssess = self.props.loadDetailTeam.assessments[0];
              hasDraft = false;
              draftUpdateDate = '';
              self.state.type = self.props.loadDetailTeam.assessments[0].type;
              self.state.software = self.props.loadDetailTeam.assessments[0].deliversSoftware?'Yes':'No';
            }
          }
          if (self.props.loadDetailTeam.assessments.length == 1 || (self.props.loadDetailTeam.assessments.length == 2 && self.props.loadDetailTeam.assessments[0].assessmentStatus == 'Draft')) {
            var showPreviousAssessment = 'none';
          } else {
            var showPreviousAssessment = 'block';
          }
          // self.state.selectedAssessment = tempAssess._id.toString();
          var defaultId = tempAssess._id.toString();
          var submitDate = '(Averaging last submitted: ' + moment.utc(tempAssess.submittedDate).format('DD MMM YYYY') + ')';
          var updateDate = moment(tempAssess.updateDate).format('DD MMM YYYY');
          if (tempAssess.componentResults.length == 2) {
            var middleLineClass = 'middle-line';
          } else {
            middleLineClass = '';
          }

          var assessContent = [0,1].map(function(i){
            var assessKey = 'assess_' + i;
            if (tempAssess.componentResults[i] != undefined) {
              var assessment = tempAssess.componentResults[i];
              if (assessment.componentName == 'Team Agile Leadership and Collaboration - Projects') {
                var assessmentName = 'Leadership & Collaboration';
              } else if (assessment.componentName == 'Team Delivery') {
                assessmentName = 'Delivery (Dev Ops)';
              } else {
                assessmentName = 'Leadership & Collaboration';
              }
              if (tempAssess.componentResults.length == 2 && i == 0) {
                var middleLineClass = 'middle-line';
              } else {
                middleLineClass = '';
              }
              var lineWidth = (assessment.currentScore)/4 * 95 + '%';
              var shouldShow = 'block';
            } else {
              assessmentName = '';
              middleLineClass = '';
              lineWidth = 0;
              shouldShow = 'none';
            }
            return (
              <div key={assessKey} id={assessKey} style={{'display':shouldShow}}>
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

          var submitAssessCount = 0;
          var assessSelect = self.props.loadDetailTeam.assessments.map(function(assess){
            if (assess.assessmentStatus == 'Submitted') {
              submitAssessCount ++ ;
              if (submitAssessCount > 1) {
                return(
                  <option key={assess._id} value={assess._id}>{moment.utc(assess.submittedDate).format('DD MMM YYYY')}</option>
                )
              }
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
                  <div style={{'display':showPreviousAssessment}}>
                    <h1>{'Previous Assessments'}</h1>
                    <select id='pAsseSelect' defaultValue={'ps'}>
                      <option value='ps'>{'Please select'}</option>
                      {assessSelect}
                    </select>
                  </div>
                </div>
                <div class='review-box'>
                  {/*<h1>{'Not sure what to do next?'}</h1>*/}
                  <button type='button' onClick={self.showAssessmentACPlanPopover} class={hasDraft?'ibm-btn-pri ibm-btn-blue-50':'ibm-btn-sec ibm-btn-blue-50'}>{'Review Action Plan'}</button>
                  <h2>{'Last Updated:'}</h2>
                  <h3 style={{'textAlign':'right'}}>{updateDate}</h3>
                </div>
                <div class='draft-box'>
                  {/*<h1>{'Or show your improvement!'}</h1>*/}
                  <button type='button' onClick={self.showAssessmentPopover} class={hasDraft?'ibm-btn-sec ibm-btn-blue-50':'ibm-btn-pri ibm-btn-blue-50'} disabled={haveAccess}>{hasDraft?'Work with Draft':'Create New Assessment'}</button>
                  <h2 hidden={hasDraft?false:true}>{'Last Updated:'}</h2>
                  <h2 style={{'textAlign':'right'}} hidden={hasDraft?false:true}>{draftUpdateDate}</h2>
                </div>
              </div>
              <div class='hide-show-btn' onClick={self.props.showHideAseSummary}>
                <InlineSVG src={require('../../../img/Att-icons/att-icons_hide.svg')}></InlineSVG>
              </div>
              <Modal aria-labelledby='modal-label' style={modalStyle} backdropStyle={backdropStyle} show={self.state.showACPlanModel} onHide={self.hideAssessmentACPlanPopover}>
                <AssessmentACPlanPopover hideAssessmentACPlanPopover={self.hideAssessmentACPlanPopover} updateAssessmentSummary={self.updateAssessmentSummary} loadDetailTeam={self.props.loadDetailTeam} tempAssess={tempAssess} assessTemplate={self.state.assessTemplate} />
              </Modal>
              <Modal aria-labelledby='modal-label' style={modalStyle} backdropStyle={backdropStyle} show={self.state.showModal}>
                <AssessmentPopover hideAssessmentPopover={self.hideAssessmentPopover} loadDetailTeam={self.props.loadDetailTeam} assessTemplate={self.state.assessTemplate} updateAssessmentSummary={self.updateAssessmentSummary} assessType={self.state.type} assessSoftware={self.state.software} />
              </Modal>
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
              <div class='hide-show-btn' onClick={self.props.showHideAseSummary}>
                <InlineSVG src={require('../../../img/Att-icons/att-icons_hide.svg')}></InlineSVG>
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
                <h1 style={{'top':'10%'}}>{'Take the Agile Maturity Assessment often to see where your team should focus its efforts.'}</h1>
              </div>
              <div class='start-btn'>
                <button onClick={self.showAssessmentSetupPopover} type='button' class='ibm-btn-pri ibm-btn-blue-50' disabled={haveAccess}>{'Let\'s get started'}</button>
              </div>
            </div>
            <Modal aria-labelledby='modal-label' style={modalStyle} backdropStyle={backdropStyle} show={self.state.showSetupModel} onHide={self.hideAssessmentSetupPopover}>
              <AssessmentSetupPopover hideAssessmentSetupPopover={self.hideAssessmentSetupPopover} continueAssessmentDraft={self.continueAssessmentDraft}/>
            </Modal>
            <Modal aria-labelledby='modal-label' style={modalStyle} backdropStyle={backdropStyle} show={self.state.showModal}>
              <AssessmentPopover hideAssessmentPopover={self.hideAssessmentPopover} loadDetailTeam={self.props.loadDetailTeam} assessTemplate={self.state.assessTemplate} updateAssessmentSummary={self.updateAssessmentSummary} assessType={this.state.type} assessSoftware={this.state.software} />
            </Modal>
          </div>
        )
      }
    }
  }
});

module.exports = HomeAseSummary;
