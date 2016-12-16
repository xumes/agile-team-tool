var React = require('react');
var api = require('../api.jsx');

var HomeNavTab = React.createClass({
  myTeamsClicked: function() {
    if ($('#myTeams').attr('data-state') != 'open') {
      this.props.tabClicked('mytab');
    }
  },

  allTeamsClicked: function() {
    if ($('#allTeams').attr('data-state') != 'open') {
      this.props.tabClicked('alltab');
    }
  },

  render: function() {
    var tabStyle = {
      'width': '100%'
    };

    var indicateStyle = {
      'position': 'absolute',
      'fontSize': '8pt',
      'textAlign': 'right',
      'display': 'inline-block',
      'float': 'right',
      'left': '0px',
      'width': '100%',
      'top': '25px',
      'paddingBottom': '0px'
    };

    return (
      <nav class="tab-nav">
        <ul class='tab-ul' role='tablist' style={tabStyle}>
            <li id='myTeams' class='tab-ul--item' role='tab' data-state={'open'} tabIndex='0' onClick={this.myTeamsClicked}>My teams</li>
            <li id='allTeams' class='tab-ul--item' role='tab' data-state={''} onClick={this.allTeamsClicked}>All teams</li>
        </ul>
        <i style={indicateStyle}>
          <i class="agile-team-squad">*</i>
            indicates squad team
        </i>
      </nav>
    )
  }
});

module.exports = HomeNavTab;
