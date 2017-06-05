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
    var self = this;
    api.getAssessmentTemplate(null, 'active')
      .then(function(assessmentTemplates) {
        self.setState({
          activeTemplate: assessmentTemplates[0]
        });
      });
  },
});

module.exports = HomeAseSummary2;
