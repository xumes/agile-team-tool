var React = require('react');
var ReactDOM = require('react-dom');
var TeamPage = require('./components/TeamPage.jsx');

$(document).ready(function() {
  ReactDOM.render(
    <TeamPage/>,
    document.getElementById('app-content')
  );
});

