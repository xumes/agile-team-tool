var React = require('react');
var ReactDOM = require('react-dom');
var AssessmentSummary = require('./components/assessment_summary/AssessmentSummary.jsx');

$(document).ready(function() {
  ReactDOM.render(
    <AssessmentSummary />,
    document.getElementById('app-content')
  );
});
