var React = require('react');
var ReactDOM = require('react-dom');
var HomePage = require('./components/index/HomePage.jsx');
require('../css/base.scss');

$(document).ready(function() {
  ReactDOM.render(
    <HomePage/>, document.getElementById('app-content')
  );
});
