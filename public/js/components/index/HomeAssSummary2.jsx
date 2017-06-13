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

var HomeAseSummary2 = React.createClass({
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
    // var self = this;
    // api.getAssessmentTemplate(null, 'active')
    //   .then(function(assessmentTemplates) {
    //     self.setState({
    //       activeTemplate: assessmentTemplates[0]
    //     });
    //   });
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
        haveAccess = false;
      }
      if (self.props.loadDetailTeam != undefined && self.props.loadDetailTeam.assessments != undefined && self.props.loadDetailTeam.assessments.length > 0) {
        return null;
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

module.exports = HomeAseSummary2;
