var React = require('react');
var api = require('../api.jsx');

var HomeNavTab = React.createClass({
  getInitialState: function() {
    return {
      myTeamsState: 'open',
      allTeamsState: '',
    }
  },

  myTeamsClicked: function() {
    if (this.state.myTeamsState != 'open') {
      this.setState({'myTeamsState': 'open'});
      this.setState({'allTeamsState': ''});
      this.props.tabClicked('mytab');
    }
  },

  allTeamsClicked: function() {
    if (this.state.allTeamsState != 'open') {
      this.setState({'myTeamsState': ''});
      this.setState({'allTeamsState': 'open'});
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

    var myTeamsState = this.state.myTeamsState;
    var allTeamsState = this.state.allTeamsState;

    return (
      <nav class="tab-nav">
        <ul class='tab-ul' role='tablist' style={tabStyle}>
            <li id='myTeams' class='tab-ul--item' role='tab' data-state={myTeamsState} tabIndex='0' onClick={this.myTeamsClicked}>My teams</li>
            <li id='allTeams' class='tab-ul--item' role='tab' data-state={allTeamsState} onClick={this.allTeamsClicked}>All teams</li>
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
