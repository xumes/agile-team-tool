var React = require('react');
var api = require('../api.jsx');

var HomeNavTab = React.createClass({
  getInitialState: function() {
    return {
      myTeamsState: 'open',
      allTeamsState: ''
    }
  },

  myTeamsClicked: function() {
    if (this.state.myTeamsState != 'open') {
      this.setState({'myTeamsState': 'open'});
      this.setState({'allTeamsState': ''});
    }
  },

  allTeamsClicked: function() {
    if (this.state.allTeamsState != 'open') {
      this.setState({'myTeamsState': ''});
      this.setState({'allTeamsState': 'open'});
    }
  },

  render: function() {
    var tabStyle = {
      'width': '100%'
    };

    var myTeamsState = this.state.myTeamsState;
    var allTeamsState = this.state.allTeamsState;

    return (
      <ul class='tab-ul' role='tablist' style={tabStyle}>
          <li id='myTeams' class='tab-ul--item' role='tab' data-state={myTeamsState} tabIndex='0' onClick={this.myTeamsClicked}>My teams</li>
          <li id='allTeams' class='tab-ul--item' role='tab' data-state={allTeamsState} onClick={this.allTeamsClicked}>All teams</li>
      </ul>
    )
  }
});

module.exports = HomeNavTab;
