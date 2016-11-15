var React = require('react');
var Header = require('../Header.jsx');
var TeamSquadForm = require('../team/TeamSquadForm.jsx');
var Datepicker = require('./Datepicker.jsx');
var _ = require('underscore');

var AssessmentPageFormTwo = React.createClass({
  componentDidMount: function() {
    $('select[name="teamTypeSelectList"]').select2();
    //$('select[name='teamTypeSelectList']').change();

    $('select[name="softwareYesNo"]').select2();
    //$('select[name='softwareYesNo']').change();

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
    if (this.props.selectedAssessment.isNew == false) {
      var isDisabled = true;
    } else {
      isDisabled = false;
    }
    var assessmentType = 'Project';
    var software = 'Yes';

    if (!_.isEmpty(this.props.selectedAssessment.assessment)) {
      assessmentType = this.props.selectedAssessment.assessment.type;
      if (!this.props.selectedAssessment.assessment.deliversSoftware) {
        software = false
      }
    }

    return (
      <div>
        <div class='ibm-rule ibm-alternate-2'><hr /></div>
        <p>
          <label for='teamTypeSelectList'>
            Is this team primarily a Project or Operations team? <span class='ibm-required'>*</span>
            <a style={anchorInfo} class='ibm-information-link' id='teamTypeTT' data-widget='tooltip' data-contentid='teamTypeToolTip' title='Operations teams support a repeatable process that delivers value to the customer.  Unlike a project, it normally has no definite start and end date.  Operation examples include recruitment, budgeting, call centers, supply chain and software operations.'></a>
          </label>
          <span>
            <select defaultValue={assessmentType} name='teamTypeSelectList' style={selectFieldWidth} disabled={isDisabled} >
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
            <select defaultValue={software} name='softwareYesNo' style={selectFieldWidth} disabled={isDisabled} >
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
            <Datepicker enableDatepicker={!isDisabled} size='44' />
          </span>
        </p>
      </div>
    )
  }
});

module.exports = AssessmentPageFormTwo;
