var React = require('react');
var ReactDOM = require('react-dom');
var IterationPage = require('./components/iteration/IterationPage.jsx');

$(document).ready(function() {
  ReactDOM.render(
    <IterationPage/>,
    document.getElementById('app-content')
  );
});

