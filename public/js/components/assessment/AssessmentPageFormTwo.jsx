var React = require('react');
var Header = require('../Header.jsx');
var TeamSquadForm = require('../team/TeamSquadForm.jsx');
var Datepicker = require('./Datepicker.jsx');
var _ = require('underscore');
var moment = require('moment');
var assessId = '';

var AssessmentPageFormTwo = React.createClass({
  getInitialState: function() {
    return {
      submittedDate: null
    }
  },
  componentDidUpdate: function() {
    // if (_.isEmpty(this.props.assessment.assessment)) {
    //   if (assessId != '') {
    //
    //   }
    // }
    // if (assessId != _.isEmpty(this.props.assessment.assessment)?'':this.props.assessment.assessment._id.toString()) {
    //   $('#teamTypeSelectList').val(this.props.assessment.assessment.type).change();
    //   $('#softwareYesNo').val(this.props.assessment.assessment.deliversSoftware == true?'Yes':'No').change();
    //   assessId = this.props.selectedAssessment.assessId;
    // }
    // $('select[name="softwareYesNo"]').change(this.props.assessSoftwareChangeHandler);
    $('select[name="teamTypeSelectList"]').select2();
    $('select[name="softwareYesNo"]').select2();
  },
  componentDidMount: function() {
    $('select[name="teamTypeSelectList"]').select2();
    $('select[name="teamTypeSelectList"]').change(this.props.assessTypeChangeHandler);

    $('select[name="softwareYesNo"]').select2();
    $('select[name="softwareYesNo"]').change(this.props.assessSoftwareChangeHandler);

    $("a[data-widget='tooltip']").tooltip();
  },

  render: function() {
    var selectFieldHolder = {
      'width': '600px'
    };

    var selectFieldWidth = {
      'width': '300px'
    };

    var anchorInfo = {
      'cursor': 'default',
      'position': 'relative',
      'left': '5px',
      'top' :'0px',
      'display': 'inline'
    };

    if (!this.props.assessment.access) {
      var isDisabled = true;
    } else {
      if (_.isEmpty(this.props.assessment.assessment)) {
        if (this.props.assessment.squadAssessments.length > 0 && this.props.assessment.squadAssessments[0]['assessmentStatus'] == 'Draft') {
          isDisabled = true;
        } else {
          isDisabled = false;
        }
      } else {
        if (this.props.assessment.assessment.assessmentStatus == 'Draft') {
          isDisabled = false;
        } else {
          isDisabled = true;
        }
      }
    }
    // var assessmentDate = null;  
    // if (this.state.submittedDate != null) {
    //   assessmentDate = this.state.submittedDate;
    // } else {
    //   if (!_.isEmpty(this.props.assessment.assessment) && this.props.assessment.assessment.assessmentStatus == 'Submitted') {
    //     assessmentDate = this.props.assessment.assessment.submittedDate;
    //   }
    // }
    // this.state.submittedDate = null;

    var isSoftware = this.props.assessment.templateType.software?'Yes':'No';

    return (
      <div>
        <div class='ibm-rule ibm-alternate-2'><hr /></div>
        <p>
          <label for='teamTypeSelectList'>
            Is this team primarily a Project or Operations team? <span class='ibm-required'>*</span>
            <a style={anchorInfo} class='ibm-information-link' id='teamTypeTT' data-widget='tooltip' data-contentid='teamTypeToolTip'
            title='Operations teams support a repeatable process that delivers value to the customer.  Unlike a project, it normally has no definite start and end date.  Operation examples include recruitment, budgeting, call centers, supply chain and software operations.'></a>
          </label>
          <span>
            <select value={this.props.assessment.templateType.type} id='teamTypeSelectList' name='teamTypeSelectList' style={selectFieldWidth} disabled={isDisabled} >
              <option value='Project'>Project</option>
              <option value='Operations'>Operations</option>
            </select>
         </span>
        </p>
        <p>
          <label for='softwareYesNo'>Does the team deliver software? <span class='ibm-required'>*</span>
            <a class='ibm-information-link' id='softwareTT' data-widget='tooltip' data-contentid='softwareToolTip' style={anchorInfo} title='Answering yes to this will add the optional DevOps software delivery practices.'></a>
          </label>
          <span>
            <select value={isSoftware} id='softwareYesNo' name='softwareYesNo' style={selectFieldWidth} disabled={isDisabled} >
              <option value='Yes'>Yes</option>
              <option value='No'>No</option>
            </select>
         </span>
         </p>

        <p>
          <label for='assessmentDate'>Enter assessment date, or date will be assigned at submission:
            <a class='ibm-information-link' id='assDateTT' data-widget='tooltip' data-contentid='assDateToolTip' style={anchorInfo} title='The assessment date is assigned when the Submit action is taken.  To assign a specific date, i.e. when recording a previously completed assessment, select the date to use as the assessment date.'></a>
          </label>
          <span style={selectFieldHolder}>
            <Datepicker enableDatepicker={!isDisabled} submittedDate={this.props.assessment.templateType.submittedDate} dateChangeHandler={this.props.dateChangeHandler} size='44' />
          </span>
        </p>
        <div id='teamTypeToolTip' class='ibm-tooltip-content'>
          <p class='toolTip'>
            Operations teams support a repeatable process that delivers value to the customer.  Unlike a project, it normally has no definite start and end date.  Operation examples include recruitment, budgeting, call centers, supply chain and software operations.
          </p>
        </div>
        <div id='softwareToolTip' class='ibm-tooltip-content'>
          <p class='toolTip'>
            Answering yes to this will add the optional DevOps software delivery practices.
          </p>
        </div>
        <div id='assDateToolTip' class='ibm-tooltip-content'>
          <p class='toolTip'>
            The assessment date is assigned when the Submit action is taken.  To assign a specific date, i.e. when recording a previously completed assessment, select the date to use as the assessment date.
          </p>
        </div>
      </div>
    )
  }
});

module.exports = AssessmentPageFormTwo;
