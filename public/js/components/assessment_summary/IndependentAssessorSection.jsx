var React = require('react');

var IndependentAssessorSection = React.createClass({
  render: function() {
    var assessorUserId = this.props.selectedAssessment.assessorUserId;
    return (
      <h3 class="ibm-h3 agile-summary">
        Independent Assessor: <span id="indpAssessor">{assessorUserId}</span>
      </h3>
    );
  }
});

module.exports = IndependentAssessorSection;
