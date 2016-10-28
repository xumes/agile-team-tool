var React = require('react');

var AssessmentButtons = React.createClass({
  render: function() {
    return (
      <div class="ibm-btn-row" style={{"textAlign": "right"}}>
        <input type="button" class="ibm-btn-pri ibm-btn-small" name="submitAssessBtn" value="Submit" disabled="disabled" />
        <input type="button" class="ibm-btn-sec ibm-btn-small" name="saveAssessBtn" value="Save as draft" disabled="disabled" />
        <input type="button" class="ibm-btn-sec ibm-btn-small" name="deleteAssessBtn" value="Delete draft" disabled="disabled" />
        <input type="button" class="ibm-btn-sec ibm-btn-small" name="cancelAssessBtn" value="Cancel current changes" disabled="disabled" />
        <span id="progressIndicatorTop"></span>
      </div>
    )
  }
});

module.exports = AssessmentButtons;
