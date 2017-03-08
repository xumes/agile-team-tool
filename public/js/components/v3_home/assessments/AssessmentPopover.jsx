var React = require('react');
var api = require('../../api.jsx');
var _ = require('underscore');
var moment = require('moment');
var ReactDOM = require('react-dom');
var InlineSVG = require('svg-inline-react');
var AssessmentActiveTemplates = require('./AssessmentActiveTemplates2.jsx');

var AssessmentPopover = React.createClass({
  getInitialState: function() {
    return {
      lcAssessTemplate: {},
      ddAssessTemplate: {}
    };
  },
  componentDidMount: function() {
    $('#assessmentTeamTypeSelector').select2({'width':'100%','dropdownParent':$('.assessment-popover-block')});
    $('#assessmentSoftwareTypeSelector').select2({'width':'100%','dropdownParent':$('.assessment-popover-block')});
  },
  render: function() {
    var self = this;
    // console.log(self.props.loadDetailTeam);
    // console.log(self.props.assessTemplate);
    var assessDraft = {};
    var lcAssessTemplate = {};
    var ddAssessTemplate = {};
    if (self.props.loadDetailTeam.assessments.length > 0 && self.props.loadDetailTeam.assessments[0].assessmentStatus == 'Draft') {
      assessDraft = self.props.loadDetailTeam.assessments[0];
    }
    if (self.props.loadDetailTeam.access) {
      var haveAccess = false;
    } else {
      haveAccess = true;
    }
    if (_.isEmpty(assessDraft)) {
      var submitDate = 'On Submission';
      var lastUpdatedBy = 'On Submission';
      var lastUpdated = null;
      if ($('#assessmentTeamTypeSelector').val() == 'p') {
        self.state.lcAssessTemplate = self.props.assessTemplate.components[0];
      } else {
        self.state.lcAssessTemplate = self.props.assessTemplate.components[1];
      }
      if ($('#assessmentSoftwareTypeSelector').val() == 'y') {
        self.state.ddAssessTemplate = self.props.assessTemplate.components[2];
      } else {
        self.state.ddAssessTemplate = {};
      }
    } else {
      submitDate = moment.utc(assessDraft.submittedDate).format('DD MMM YYYY');
      lastUpdatedBy = assessDraft.updatedBy;
      lastUpdated = ' (' + moment.utc(assessDraft.updateDate).format('DD MMM YYYY') + ')';
      if (assessDraft.type == 'Project') {
        self.state.lcAssessTemplate = self.props.assessTemplate.components[0];
      } else {
        self.state.lcAssessTemplate = self.props.assessTemplate.components[1];
      }
      if (assessDraft.deliversSoftware) {
        self.state.ddAssessTemplate = self.props.assessTemplate.components[2];
      } else {
        self.state.ddAssessTemplate = {};
      }
    }
    return (
      <div tabIndex='1' class='assessment-popover-block'>
        <div class='assessment-title'>
          <h1>{'Agile Maturity Team Assessment'}</h1>
          <div onClick={self.props.hideAssessmentPopover}>
            <InlineSVG src={require('../../../../img/Att-icons/att-icons-close.svg')}></InlineSVG>
          </div>
        </div>
        <div class='assessment-header'>
          <div class='header-title'>
            <h1>{self.props.loadDetailTeam.team.name}</h1>
          </div>
          <div class='assessment-status'>
            <div class='status-title'>
              <h1 style={{'width':'12%'}}>{'Team Type'}</h1>
              <h1 style={{'width':'17%','left':'10%'}}>{'Delivers Software'}</h1>
              <h1 style={{'width':'16%','left':'16%'}}>{'Submission Date'}</h1>
              <h1 style={{'width':'16%','left':'26%'}}>{'Last Updated By'}</h1>
            </div>
            <div class='status-selection'>
              <div class='team-type-selector'>
                <select id='assessmentTeamTypeSelector' disabled={haveAccess} defaultValue='p'>
                  <option value='p'>{'Project'}</option>
                  <option value='o'>{'Operations'}</option>
                </select>
              </div>
              <div class='team-type-selector' style={{'left':'3%'}}>
                <select id='assessmentSoftwareTypeSelector' disabled={haveAccess} defaultValue='y'>
                  <option value='y'>{'Yes'}</option>
                  <option value='n'>{'No'}</option>
                </select>
              </div>
              <div class='submit-date-selector'>
                <h1>{submitDate + ' ('}</h1>
                <h2 style={{'cursor':haveAccess?'none':'pointer'}}>{'override'}</h2>
                <h1>{')'}</h1>
              </div>
              <div class='last-updated-by'>
                <h1>{lastUpdatedBy}</h1>
                <h1>{lastUpdated}</h1>
              </div>
            </div>
          </div>
        </div>
        <div class='lc-header'>
          <div class='header-title'>
            <h1>{'Leadership and Collaboration'}</h1>
          </div>
        </div>
        <div class='agile-maturity' id='assessmentContainer1'>
          <AssessmentActiveTemplates assessTemplate={self.state.lcAssessTemplate} assessDraft={assessDraft} assessTemplateId={'0'}/>
        </div>
        <div class='lc-header'>
          <div class='header-title'>
            <h1>{'Delivery and DevOps'}</h1>
          </div>
        </div>
        <div class='agile-maturity' id='assessmentContainer2'>
          <AssessmentActiveTemplates assessTemplate={self.state.ddAssessTemplate} assessDraft={assessDraft} assessTemplateId={'1'}/>
        </div>
      </div>
    )
  }
});
module.exports = AssessmentPopover;
