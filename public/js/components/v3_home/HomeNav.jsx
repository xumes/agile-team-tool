var React = require('react');
var api = require('../api.jsx');
var HomeNavTab = require('./HomeNavTab.jsx');
var HomeSpinner = require('./HomeSpinner.jsx');
var HomeSearchTree = require('./HomeSearchTree.jsx');
var HomeTeamTree = require('./HomeTeamTree.jsx');

var HomeNav = React.createClass({
  getInitialState: function() {
    return {
      searchTeams: []
    }
  },

  searchStart: function() {
    $('#navSpinner').show();
    $('#newSearchTree').hide();
    $('#newTeamTree').hide();
  },

  searchEnd: function() {
    $('#navSpinner').hide();
    $('#newSearchTree').show();
    $('#newTeamTree').hide();
  },

  tabClickedStart: function() {
    $('#navSpinner').show();
    $('#newSearchTree').hide();
    $('#newTeamTree').hide();
  },

  tabClickedEnd: function() {
    $('#navSpinner').hide();
    $('#newSearchTree').hide();
    $('#newTeamTree').show();
  },

  searchTeamClickedHandler: function(teamId) {
    console.log(teamId);
    this.setState({'searchTeamSelected':teamId});
  },

  componentDidMount: function() {
    var self = this;
    self.props.tabClickedHandler('myteams');
    $('#nameSearchField').on('input',function() {
      var inputText = $('#nameSearchField').val();
      if (inputText.length > 1 && inputText != ' ') {
        self.searchStart();
        api.searchTeams(inputText)
          .then(function(teams){
            self.setState({'searchTeams':teams});
          })
          .catch(function(err){
            console.log(err);
            self.setState({'searchTeams':[]});
          });
      }
    });
  },

  render: function() {
    return (
      <div id='agileHomeNav' style={{'height': '100%'}}>
        <HomeNavTab searchStart={this.searchStartHandler} tabClicked={this.props.tabClickedHandler} loadDetailTeam={this.props.loadDetailTeam}/>
        {/*<HomeSearchField style={{'marginTop': '20px'}}/>*/}
        <HomeSpinner id={'navSpinner'}/>
        <div class='home-team-nav nano' data-widget='scrollable' data-height='600'>
          <div class='nano-content'>
            <HomeSearchTree searchTeams={this.state.searchTeams} selectedTeamChanged={this.props.selectedTeamChanged}/>
            <HomeTeamTree newTeams={this.props.newTeams} selectedTeam={this.props.selectedTeam} loadDetailTeamChanged={this.props.loadDetailTeamChanged}/>
          </div>
        </div>
      </div>
    )
  }
});

module.exports = HomeNav;
