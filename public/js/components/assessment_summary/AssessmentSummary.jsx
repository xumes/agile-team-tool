var React = require('react');
var AssessmentTabNav = require('../AssessmentTabNav.jsx');
var AssessmentSummaryInfo = require('./AssessmentSummaryInfo.jsx');
var AssessmentProgressForm = require('./AssessmentProgressForm.jsx');

var AssessmentSummary = React.createClass({
  render: function() {
    return (
      <div>
        <AssessmentTabNav />
        <AssessmentSummaryInfo />
        <AssessmentProgressForm />
      </div>
    );
  }
});

module.exports = AssessmentSummary;
