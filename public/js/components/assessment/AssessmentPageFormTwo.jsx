var React = require('react');
var Header = require('../Header.jsx');
var TeamSquadForm = require('../team/TeamSquadForm.jsx');
var Datepicker = require('./Datepicker.jsx');

var AssessmentPageFormTwo = React.createClass({
  getInitialState: function() {
    return {
      enableDatepickerState: false
    }
  },

  componentDidMount: function(){
    $('select[name="teamTypeSelectList"]').select2();
    //$('select[name="teamTypeSelectList"]').change();

    $('select[name="softwareYesNo"]').select2();
    //$('select[name="softwareYesNo"]').change();
    
  },

  enableDatepicker: function (enable) {
    return this.props.disabledFormTwo == '' ? true : false;
  },

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
                  <span>
                    <select name="teamTypeSelectList" style={selectFieldWidth} disabled={this.props.disabledFormTwo} >
                    <option value="Project" selected="selected">Project</option>
                      <option value="Operations">Operations</option>
                  </select>
                 </span>
                </p>

                <p>
                  <label for="softwareYesNo">Does the team deliver software? <span class="ibm-required">*</span>
                    <a class="ibm-information-link" id="softwareTT" data-widget="tooltip" data-contentid="softwareToolTip" style={anchorInfo} title="Answering yes to this will add the optional DevOps software delivery practices."></a>
                  </label>
                  <span>
                    <select name="softwareYesNo" style={selectFieldWidth} disabled={this.props.disabledFormTwo} >
                    <option value="Yes" selected="selected">Yes</option>
                    <option value="No">No</option>
                  </select>
                 </span>
                 </p>

                <p>
                  <label for="assessmentDate">Enter assessment date, or date will be assigned at submission:
                    <a class="ibm-information-link" id="assDateTT" data-widget="tooltip" data-contentid="assDateToolTip" style={anchorInfo} title="The assessment date is assigned when the Submit action is taken.  To assign a specific date, i.e. when recording a previously completed assessment, select the date to use as the assessment date."></a>
                  </label>
                  <span style={selectFieldHolder}>
                    <Datepicker enableDatepicker={this.enableDatepicker} size="44" />
                  </span>
                </p>
                </div>)
  }
});

module.exports = AssessmentPageFormTwo;
