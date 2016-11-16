var React = require('react');

var AssessmentButtons = React.createClass({

  render: function() {
    var spanStyle = {
      float: 'left',
      display: 'block'
    };

    var statusColor = { color : 'blue'};

    if(this.props.assessmentStatus.status == '')
      var isVisible = { display: 'none'};
    else
      var isVisible = { display: 'block'};

    return (
      <div>
        <div style={isVisible}>
          <span style={spanStyle}>
            Team assessment status: <span style={statusColor}>{this.props.assessmentStatus.status}</span>
          </span>
        </div>
        <div class="ibm-btn-row" style={{"textAlign": "right"}}>
          <input type="button" class="ibm-btn-pri ibm-btn-small" name="submitAssessBtn" value="Submit" disabled={this.props.assessmentStatus.disabledButtons[0]} />
          <input type="button" class="ibm-btn-sec ibm-btn-small" name="saveAssessBtn" value="Save as draft" disabled={this.props.assessmentStatus.disabledButtons[1]} />
          <input type="button" class="ibm-btn-sec ibm-btn-small" name="deleteAssessBtn" value="Delete draft" disabled={this.props.assessmentStatus.disabledButtons[2]} />
          <input type="button" class="ibm-btn-sec ibm-btn-small" name="cancelAssessBtn" value="Cancel current changes" disabled={this.props.assessmentStatus.disabledButtons[3]} />
          <span id="progressIndicatorTop"></span>
        </div>
      </div>
    )
  }
});

module.exports = AssessmentButtons;
