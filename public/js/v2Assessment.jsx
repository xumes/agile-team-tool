var React = require('react');
var ReactDOM = require('react-dom');
var AssessmentPage = require('./components/assessment/AssessmentPage.jsx');

$(document).ready(function() {
  ReactDOM.render(
    <AssessmentPage/>,
    document.getElementById('app-content')
  );
});
