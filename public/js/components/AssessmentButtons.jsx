var React = require('react');

var AssessmentButtons = React.createClass({
  render: function() {
    return (
      <div class="ibm-btn-row" style={{"textAlign": "right"}}>
        <input type="button" class="ibm-btn-pri ibm-btn-small" name="submitAssessBtn" value="Submit" onclick="assessmentAction(this);"  />
        <input type="button" class="ibm-btn-sec ibm-btn-small" name="saveAssessBtn" value="Save as draft" onclick="assessmentAction(this);" />
        <input type="button" class="ibm-btn-sec ibm-btn-small" name="deleteAssessBtn" value="Delete draft" onclick="assessmentAction(this);" />
        <input type="button" class="ibm-btn-sec ibm-btn-small" name="cancelAssessBtn" value="Cancel current changes" onclick="assessmentAction(this);" />
        <span id="progressIndicatorTop"></span>
      </div>
    )
  }
});

module.exports = AssessmentButtons;
