var React = require('react');
var AssessmentTabNav = require('../AssessmentTabNav.jsx');
var AssessmentSummaryInfo = require('./AssessmentSummaryInfo.jsx');
var ComponentResultAndChart = require('./ComponentResultAndChart.jsx');
var AssessmentProgressForm = require('./AssessmentProgressForm.jsx');

var AssessmentSummary = React.createClass({
  render: function() {
    return (
      <div>
        <AssessmentTabNav />
        <AssessmentSummaryInfo />
        <form id="progressForm" class="agile-maturity">
          <ComponentResultAndChart />
          <AssessmentProgressForm />
        </form>
      </div>
    );
  }
});

module.exports = AssessmentSummary;
