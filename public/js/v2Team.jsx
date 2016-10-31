var React = require('react');
var ReactDOM = require('react-dom');
var TeamPage = require('./components/team/TeamPage.jsx');

$(document).ready(function() {
  ReactDOM.render(
    <TeamPage/>,
    document.getElementById('app-content')
  );
});
