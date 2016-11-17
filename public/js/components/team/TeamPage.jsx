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
var ModalLinkLabelForm = require('./ModalLinkLabelForm.jsx');
var api = require('../api.jsx');
var update = require('immutability-helper');

var TeamPage = React.createClass({
  getInitialState: function() {
    console.log('getInitialState TeamPage');
    var urlParams = getJsonParametersFromUrl();
    var id =  _.isEmpty(urlParams) || _.isEmpty(urlParams.id) ? 'new' : urlParams.id;
    return {
      defaultTeam: id,
      selectedTeam: new Object(),
      teamInfoVisible: false,
      initSelectLabel: [
        {id: '-1', text: 'Select label'},
        {id: 'Wall of work', text: 'Wall of work'},
        {id: 'Backlog', text: 'Backlog'},
        {id: 'Retrospectives', text: 'Retrospectives'},
        {id: 'Defects', text: 'Defects'},
        {id: 'Standup schedule', text: 'Standup schedule'},
        {id: 'Other', text: 'Other...'}
      ],
      selectedLinkLabel: ''
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
  updateSelectLabel: function(obj) {
    console.log('TeamPage updateSelectLabel obj:', obj)
    // console.log('TeamPage updateSelectLabel this.state.initSelectLabel:', JSON.stringify(this.state.initSelectLabel,null,1))
    // console.log('TeamPage updateSelectLabel obj:', JSON.stringify(obj,null,1))
    var selectLabels = this.state.initSelectLabel.concat(obj);
    // console.log('TeamPage updateSelectLabel selectLabels:', JSON.stringify(selectLabels,null,1))
    this.setState({initSelectLabel: selectLabels})
  },
  updateLink: function(teamId, linkData) {
    console.log('TeamPage updateLink...', JSON.stringify(linkData))
    var self = this;
    var currentLinkData = self.state.selectedTeam;
    if (teamId === currentLinkData.team._id) {
      var updatedLinkData = update(currentLinkData, {
        team: {
          links: {
            $set: linkData
          }
        }
      });
      self.setState({selectedTeam: updatedLinkData});
    }
  },
  setSelectedLinkLabel: function(objLabel) {
    console.log('TeamPage setSelectedLinkLabel objLabel:',objLabel)
    this.setState({selectedLinkLabel: objLabel});
    // return this.state.selectedLinkLabel;
  },
  getSelectedLinkLabel: function() {
    return this.state.selectedLinkLabel;
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
            <TeamLinks selectedTeam={this.state.selectedTeam} showHideSection={this.showHideSection} initSelectLabel={this.state.initSelectLabel} getSelectedLinkLabel={this.getSelectedLinkLabel} setSelectedLinkLabel={this.setSelectedLinkLabel} updateSelectLabel={this.updateSelectLabel} updateLink={this.updateLink} />
            <TeamParentAssociation selectedTeam={this.state.selectedTeam} showHideSection={this.showHideSection}/>
            <TeamChildAssociation selectedTeam={this.state.selectedTeam} showHideSection={this.showHideSection}/>
            <TeamIteration selectedTeam={this.state.selectedTeam} showHideSection={this.showHideSection}/>
            <TeamAssessment selectedTeam={this.state.selectedTeam} showHideSection={this.showHideSection}/>
            <TeamLastUpdate selectedTeam={this.state.selectedTeam} showHideSection={this.showHideSection}/>
          </div>
        </form>
        <ModalLinkLabelForm initSelectLabel={this.state.initSelectLabel} getSelectedLinkLabel={this.getSelectedLinkLabel} setSelectedLinkLabel={this.setSelectedLinkLabel} />
      </div>
    )
  }
});

module.exports = TeamPage;
