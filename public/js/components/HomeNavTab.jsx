var React = require('react');
var api = require('../api.jsx');

var HomeNavTab = React.createClass({
  myTeamsClicked: function() {
    if (this['data-state'] != 'open') {
    }
  },
  render: function() {
    var tabStyle = {
      'width': '100%'
    };
    return (
      <ul class='tab-ul' role='tablist' style={tabStyle}>
          <li id='myTeams' class='tab-ul--item' role='tab' data-state='open' tabIndex='0' onClick={this.myTeamsClicked}>My teams</li>
          <li id='allTeams' class='tab-ul--item' role='tab'>All teams</li>
      </ul>
    )
  }
});

module.exports = HomeNavTab;
