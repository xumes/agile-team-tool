var React = require('react');
var api = require('../api.jsx');
var HomeNavTab = require('./HomeNavTab.jsx');

var HomeNav = React.createClass({
  render: function() {
    return (
      <HomeNavTab />
    )
  }
});

module.exports = HomeNav;
