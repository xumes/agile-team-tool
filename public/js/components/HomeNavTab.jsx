var React = require('react');
var api = require('../api.jsx');
var HomeSearchField = require('./HomeSearchField.jsx');

var HomeNavTab = React.createClass({
  getInitialState: function() {
    return {
      myTeamsState: 'open',
      allTeamsState: '',
      tabClicked: 'none'
    }
  },

  myTeamsClicked: function() {
    if (this.state.myTeamsState != 'open') {
      this.setState({'myTeamsState': 'open'});
      this.state.tabClicked = 'none';
      this.setState({'allTeamsState': ''});
    }
  },

  allTeamsClicked: function() {
    if (this.state.allTeamsState != 'open') {
      this.setState({'myTeamsState': ''});
      this.state.tabClicked = 'block';
      this.setState({'allTeamsState': 'open'});
    }
  },

  componentDidMount: function() {
    $('input[name="homeSearchField"]').change(this.searchFieldChanged);
  },

  searchFieldChanged: function(e) {
    console.log(e.target.value);
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
        <HomeSearchField />
      </nav>
    )
  }
});

module.exports = HomeNavTab;
