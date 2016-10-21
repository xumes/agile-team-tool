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
      spinnerHide: 'none',
      searchTreeHide: 'none',
      teamTreeHide: 'block',
      searchHide: 'none',
      searchTeams: [],
      tabClicked: 'mytab',
      newTeams: new Object()
    }
  },

  searchStart: function() {
    this.setState({'spinnerHide': 'block'});
    this.setState({'searchTreeHide': 'none'});
    this.setState({'teamTreeHide': 'none'});
  },

  searchEnd: function() {
    this.setState({'spinnerHide': 'none'});
    this.setState({'searchTreeHide': 'block'});
    this.setState({'teamTreeHide': 'none'});
  },

  tabClickedStart: function() {
    this.searchStart();
  },

  tabClickedEnd: function() {
    this.setState({'spinnerHide': 'none'});
    this.setState({'teamTreeHide': 'block'});
    this.setState({'searchTreeHide': 'hide'});
  },

  tabClickedHandler: function(tab) {
    var self = this;
    if (tab == 'mytab') {
      self.setState({'searchHide': 'none'});
      //self.setState({'tabClicked': 'mytab'});
      self.tabClickedStart();
      api.getMyTeams()
      .then(function(data){
        self.setState({'newTeams':data});
        self.tabClickedEnd();
      })
      .catch(function(err){
        self.tabClickedEnd();
        $('#teamTree').empty();
        console.log(err);
      })
    } else {
      self.setState({'searchHide': 'block'});
      //self.setState({'tabClicked': 'alltab'});
      api.getAllTeams()
      .then(function(data){
        self.setState({'newTeams':data});
      })
      .catch(function(err){
        console.log(err);
      });
    }
  },

  searchTeamClickedHandler: function(teamId) {
    this.setState({'spinnerHide': 'block'});
    this.setState({'searchTreeHide': 'none'});
    this.setState({'teamTreeHide': 'none'});
  },

  componentDidMount: function() {
    var self = this;
    // self.tabClickedHandler('mytab');
    $('#nameSearchField').on('input',function() {
      var inputText = $('#nameSearchField').val();
      if (inputText.length > 0 && inputText != ' ') {
        self.searchStart();
        api.searchTeams(inputText)
          .then(function(teams){
            self.setState({'searchTeams':teams});
            self.searchEnd();
          })
          .catch(function(err){
            console.log(err);
            self.setState({'searchTeams':[]});
            self.searchEnd();
          });
      }
    });
  },

  render: function() {
    var nanoPaneStyle = {
      'display': 'block',
      'opacity': 1,
      'visibility': 'visible'
    };
    var nanoSliderStyle = {
      'height': '182px',
      'transform': 'translate(0px, 0px)'
    };
    var agileTeamNavStyle = {
      'height': '600px'
    }
    return (
      <div>
        <HomeNavTab sendSearchTeams={this.searchChangeHandler} searchStart={this.searchStartHandler} tabClicked={this.tabClickedHandler}/>
        <HomeSearchField searchHide={this.state.searchHide}/>
        <HomeSpinner spinnerHide={this.state.spinnerHide}/>
        <div class='agile-team-nav nano' data-widget='scrollable' data-height='600' style={agileTeamNavStyle}>
          <div class="nano-content">
            <HomeSearchTree searchTeams={this.state.searchTeams} searchTreeHide={this.state.searchTreeHide} clickedTeam={this.searchTeamClickedHandler}/>
            <HomeTeamTree newTeams={this.state.newTeams} teamTreeHide={this.state.teamTreeHide}/>
          </div>
        </div>
      </div>
    )
  }
});

module.exports = HomeNav;
