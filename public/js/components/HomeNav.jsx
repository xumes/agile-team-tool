var React = require('react');
var api = require('../api.jsx');
var HomeNavTab = require('./HomeNavTab.jsx');
var HomeSpinner = require('./HomeSpinner.jsx');
var HomeSearchField = require('./HomeSearchField.jsx');
var HomeSearchTree = require('./HomeSearchTree.jsx');
var HomeTeamTree = require('./HomeTeamTree.jsx');

var HomeNav = React.createClass({
  getInitialState: function() {
    return {
      searchTeams: [],
      newTeams: new Object(),
      searchTeamSelected: ''
    }
  },

  searchStart: function() {
    $('#navSpinner').show();
    $('#searchTree').hide();
    $('#teamTree').hide();
  },

  searchEnd: function() {
    $('#navSpinner').hide();
    $('#searchTree').show();
    $('#teamTree').hide();
  },

  tabClickedStart: function() {
    $('#navSpinner').show();
    $('#searchTree').hide();
    $('#teamTree').hide();
  },

  tabClickedEnd: function() {
    $('#navSpinner').hide();
    $('#searchTree').hide();
    $('#teamTree').show();
  },

  tabClickedHandler: function(tab) {
    var self = this;
    self.tabClickedStart();
    if (tab == 'mytab') {
      $('#searchFieldDiv').hide();
      api.getMyTeams()
      .then(function(data){
        var newData = {
          'tab': 'myteams',
          'data': data
        };
        self.setState({'searchTeamSelected': ''});
        self.setState({'newTeams':newData});
        $('#searchCancel').click();
      })
      .catch(function(err){
        self.tabClickedEnd();
        $('#teamTree').empty();
        console.log(err);
      })
    } else {
      $('#searchFieldDiv').show();
      api.getAllTeams()
      .then(function(data){
        var newData = {
          'tab': 'allteams',
          'data': data
        };
        self.setState({'newTeams':newData});
      })
      .catch(function(err){
        self.tabClickedEnd();
        $('#teamTree').empty();
        console.log(err);
      });
    }
  },

  searchTeamClickedHandler: function(teamId) {
    console.log(teamId);
    this.setState({'searchTeamSelected':teamId});
  },

  componentDidMount: function() {
    var self = this;
    self.tabClickedHandler('mytab');
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
    var agileTeamNavStyle = {
      'height': '600px'
    }
    return (
      <div>
        <HomeNavTab searchStart={this.searchStartHandler} tabClicked={this.tabClickedHandler}/>
        <HomeSearchField />
        <HomeSpinner id={'navSpinner'}/>
        <div class='agile-team-nav nano' data-widget='scrollable' data-height='600' style={agileTeamNavStyle}>
          <div class="nano-content">
            <HomeSearchTree searchTeams={this.state.searchTeams} clickedTeam={this.searchTeamClickedHandler}/>
            <HomeTeamTree newTeams={this.state.newTeams} searchTeamSelected={this.state.searchTeamSelected} selectedTeam={this.props.selectedTeam}/>
          </div>
        </div>
      </div>
    )
  }
});

module.exports = HomeNav;
