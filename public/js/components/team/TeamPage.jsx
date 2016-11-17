var _ = require('underscore');
var React = require('react');
var Header = require('../Header.jsx');
var TeamForm = require('./TeamForm.jsx');
var TeamMembers = require('./TeamMembers.jsx');
var TeamLinks = require('./TeamLinks.jsx');
var TeamParentAssociation = require('./TeamParentAssociation.jsx');
var TeamChildAssociation = require('./TeamChildAssociation.jsx');
var TeamIteration = require('./TeamIteration.jsx');
var TeamAssessment = require('./TeamAssessment.jsx');
var TeamLastUpdate = require('./TeamLastUpdate.jsx');
var api = require('../api.jsx');

var TeamPage = React.createClass({
  getInitialState: function() {
    console.log('getInitialState TeamPage');
    var urlParams = getJsonParametersFromUrl();
    var id =  _.isEmpty(urlParams) || _.isEmpty(urlParams.id) ? 'new' : urlParams.id;
    return {
      defaultTeam: id,
      selectedTeam: new Object(),
      teamInfoVisible: false
    }
  },
  componentDidMount: function() {
    console.log('componentDidMount TeamPage');
    if (this.state.defaultTeam != 'new')
      this.getSelectedTeam(this.state.defaultTeam);
  },
  showHideSection: function(id) {
    if ($('#' + id + ' a').hasClass('ibm-show-active')) {
      $('#' + id + ' a').removeClass('ibm-show-active');
      $('#' + id + ' h2').removeClass('ibm-showing');
      $('#' + id + ' .ibm-container-body').css('display','none');
    } else {
      $('.squad-sections h2 a').removeClass('ibm-show-active');
      $('.squad-sections h2').removeClass('ibm-showing');
      $('.squad-sections .ibm-container-body').css('display','none');
      $('#' + id + ' a').addClass('ibm-show-active');
      $('#' + id + ' h2').addClass('ibm-showing');
      $('#' + id + ' .ibm-container-body').css('display','block');
    }
  },
  teamChangeHandler: function(event) {
    return this.getSelectedTeam(event.target.value);
  },
  getSelectedTeam: function(teamId) {
    var self = this;
    if (teamId == 'new' || teamId == 'delete') {
      self.setState({
        defaultTeam: teamId,
        selectedTeam: new Object(),
        teamInfoVisible: false
      });
    } else {
      var teamResult = new Object();
      var isSquad = false;
      api.loadTeam(teamId)
      .then(function(team){
        teamResult = team;
        var promiseArray = [];
        promiseArray.push(api.getTeamHierarchy(team.path)); //results[0]
        promiseArray.push(api.isUserAllowed(teamId)); //results[1]
        var ids = [''];
        if (team.members != null && team.members.length > 0) {
          _.each(team.members, function(member){
            ids.push(member.userId);
          });
        }
        promiseArray.push(api.getUsersInfo(ids)); //results[2]
        if (team.type == 'squad') {
          isSquad = true;
          promiseArray.push(api.getSquadIterations(teamId)); //results[3]
          promiseArray.push(api.getSquadAssessments(teamId)); //results[4]
        } else {
          isSquad = false;
          //promiseArray.push(api.getChildrenTeams(team.pathId));  //results[3]
          //promiseArray.push(api.getTeamSnapshots(teamId)); //results[4]
        }
        return Promise.all(promiseArray)
      })
      .then(function(results){
        if (isSquad) {
          var rObject = {
            'type': 'squad',
            'team': teamResult,
            'hierarchy': results[0],
            'access': results[1],
            'members': results[2],
            'iterations': results[3],
            'assessments': results[4],
          };
        } else {
          var rObject = {
            'type': '',
            'team': teamResult,
            'hierarchy': results[0],
            'access': results[1],
            'members': results[2],
            //'children': results[3],
            //'snapshot': results[4],
          };
        }
        return self.setState({
          defaultTeam: teamId,
          selectedTeam: rObject,
          teamInfoVisible: true
        });
      })
      .catch(function(err){
        return console.log(err);
      });
    }
  },
  render: function() {
    var overallStyle = {
      'display': this.state.teamInfoVisible == false ? 'none': 'block'
    };
    return (
      <div>
        <Header title="Agile Team" />
        <form id='createTeamForm' class='ibm-column-form'>
          <TeamForm teamChangeHandler={this.teamChangeHandler} selectedTeam={this.state.selectedTeam} defaultTeam={this.state.defaultTeam} getSelectedTeam={this.getSelectedTeam}/>
          <div id='teamDetailSection' class='squad-sections' style={overallStyle}>
            <TeamMembers selectedTeam={this.state.selectedTeam} showHideSection={this.showHideSection}/>
            <TeamLinks selectedTeam={this.state.selectedTeam} showHideSection={this.showHideSection}/>
            <TeamParentAssociation selectedTeam={this.state.selectedTeam} showHideSection={this.showHideSection}/>
            <TeamChildAssociation selectedTeam={this.state.selectedTeam} showHideSection={this.showHideSection}/>
            <TeamIteration selectedTeam={this.state.selectedTeam} showHideSection={this.showHideSection}/>
            <TeamAssessment selectedTeam={this.state.selectedTeam} showHideSection={this.showHideSection}/>
            <TeamLastUpdate selectedTeam={this.state.selectedTeam} showHideSection={this.showHideSection}/>
          </div>
        </form>
      </div>
    )
  }
});

module.exports = TeamPage;
