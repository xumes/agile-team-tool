var React = require('react');
var Header = require('./Header.jsx');
var TeamSquadForm = require('./TeamSquadForm.jsx');
var CreateSelectAssessment = require('./CreateSelectAssessment.jsx');
var Datepicker = require('./Datepicker.jsx');

var AssessmentPageFormTwo = React.createClass({
  render: function() {
    var selectFieldHolder = {
      'width': '600'
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

    return ( <div>
                <div class="ibm-rule ibm-alternate-2"><hr /></div>
                <p>
                  <label for="teamTypeSelectList">
                    Is this team primarily a Project or Operations team? <span class="ibm-required">*</span>
                    <a style={anchorInfo} class="ibm-information-link" id="teamTypeTT" data-widget="tooltip" data-contentid="teamTypeToolTip" title="Operations teams support a repeatable process that delivers value to the customer.  Unlike a project, it normally has no definite start and end date.  Operation examples include recruitment, budgeting, call centers, supply chain and software operations."></a>
                  </label>
                  <span style={selectFieldHolder}>
                    <select id="teamTypeSelectList" name="teamTypeSelectList" style={selectFieldWidth} tabindex="-1" class="select2-hidden-accessible ibm-widget-processed" aria-hidden="true" disabled="disabled">
                      <option value="Project" selected="selected">Project</option>
                      <option value="Operations">Operations</option>
                    </select>
                    <span class="select2 select2-container select2-container--default select2-container--disabled" dir="ltr" style={selectFieldWidth}>
                      <span class="selection">
                        <span class="select2-selection select2-selection--single" role="combobox" aria-haspopup="true" aria-expanded="false" tabindex="-1" aria-labelledby="select2-teamTypeSelectList-container">
                          <span class="select2-selection__rendered" id="select2-teamTypeSelectList-container" title="Project">Project</span>
                          <span class="select2-selection__arrow" role="presentation"><b role="presentation"></b></span>
                        </span>
                      </span>
                      <span class="dropdown-wrapper" aria-hidden="true"></span>
                    </span>
                  </span>
                </p>

                <p>
                  <label for="softwareYesNo">Does the team deliver software? <span class="ibm-required">*</span>
                    <a class="ibm-information-link" id="softwareTT" data-widget="tooltip" data-contentid="softwareToolTip" style={anchorInfo} title="Answering yes to this will add the optional DevOps software delivery practices."></a>
                  </label>
                  <span style={selectFieldHolder}>
                    <select id="softwareYesNo" name="softwareYesNo" style={selectFieldWidth} tabindex="-1" class="select2-hidden-accessible ibm-widget-processed" aria-hidden="true" disabled="disabled">
                      <option value="Yes" selected="selected">Yes</option>
                      <option value="No">No</option>
                    </select><span class="select2 select2-container select2-container--default select2-container--disabled" dir="ltr" style={selectFieldWidth}><span class="selection"><span class="select2-selection select2-selection--single" role="combobox" aria-haspopup="true" aria-expanded="false" tabindex="-1" aria-labelledby="select2-softwareYesNo-container"><span class="select2-selection__rendered" id="select2-softwareYesNo-container" title="Yes">Yes</span><span class="select2-selection__arrow" role="presentation"><b role="presentation"></b></span></span></span><span class="dropdown-wrapper" aria-hidden="true"></span></span>
                  </span>
                </p>

                <p>
                  <label for="assessmentDate">Enter assessment date, or date will be assigned at submission:
                    <a class="ibm-information-link" id="assDateTT" data-widget="tooltip" data-contentid="assDateToolTip" style={anchorInfo} title="The assessment date is assigned when the Submit action is taken.  To assign a specific date, i.e. when recording a previously completed assessment, select the date to use as the assessment date."></a>
                  </label>
                  <span style={selectFieldHolder}>
                    <Datepicker />
                    
                  </span>
                </p>
                </div>)
  }
});

module.exports = AssessmentPageFormTwo;
