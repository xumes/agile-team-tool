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
    return {
      selectedTeam: new Object(),
      teamInfoVisible: false
    }
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
    var self = this;
    console.log('Selected parent:', event.target.value);
    if (event.target.value == 'new') {
      self.setState({
        teamInfoVisible: false
      });
    } else {
      var objectId = event.target.value;
      var teamResult = new Object();
      var isSquad = false;
      api.loadTeam(objectId)
      .then(function(team){
        teamResult = team;
        var promiseArray = [];
        if (team.type == 'squad') {
          isSquad = true;
          promiseArray.push(api.getSquadIterations(objectId));
          promiseArray.push(api.getSquadAssessments(objectId));
          promiseArray.push(api.isUserAllowed(objectId));
        } else {
          isSquad = false;
          promiseArray.push(api.getTeamSnapshots(objectId));
        }
        promiseArray.push(api.getTeamHierarchy(team.path));
        if (team.members != null && team.members.length > 0) {
          var ids = [];
          _.each(team.members, function(member){
            ids.push(member.userId);
          });
          promiseArray.push(api.getUsersInfo(ids));
        }
        return Promise.all(promiseArray)
      })
      .then(function(results){
        if (isSquad) {
          var rObject = {
            'type': 'squad',
            'team': teamResult,
            'iterations': results[0],
            'assessments': results[1],
            'access': results[2],
            'hierarchy': results[3],
            'members': results[4]
          };
        } else {
          var rObject = {
            'type': '',
            'team': teamResult,
            'snapshot': results[0],
            'hierarchy': results[1],
            'members': results[2]
          };
        }
        return self.setState({
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
    return (
      <div>
        <Header title="Agile Team" />
        <TeamForm teamChangeHandler={this.teamChangeHandler} />
        <form id='createTeamForm' class='ibm-column-form'>
          <div class='squad-sections'>
            <TeamMembers visible={this.state.teamInfoVisible} selectedTeam={this.state.selectedTeam} showHideSection={this.showHideSection}/>
            <TeamLinks visible={this.state.teamInfoVisible} selectedTeam={this.state.selectedTeam} showHideSection={this.showHideSection}/>
            <TeamParentAssociation visible={this.state.teamInfoVisible} selectedTeam={this.state.selectedTeam} showHideSection={this.showHideSection}/>
            <TeamChildAssociation visible={this.state.teamInfoVisible} selectedTeam={this.state.selectedTeam} showHideSection={this.showHideSection}/>
            <TeamIteration visible={this.state.teamInfoVisible} selectedTeam={this.state.selectedTeam} showHideSection={this.showHideSection}/>
            <TeamAssessment visible={this.state.teamInfoVisible} selectedTeam={this.state.selectedTeam} showHideSection={this.showHideSection}/>
            <TeamLastUpdate visible={this.state.teamInfoVisible} selectedTeam={this.state.selectedTeam} showHideSection={this.showHideSection}/>
          </div>
        </form>
      </div>
    )
  }
});

module.exports = TeamPage;
