var React = require('react');
var ReactDOM = require('react-dom');
var HomePage = require('./components/v3_home/HomePage.jsx');

$(document).ready(function() {
  ReactDOM.render(
    <HomePage/>, document.getElementById('app-content')
  );
});
