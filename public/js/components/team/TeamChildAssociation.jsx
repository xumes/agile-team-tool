var React = require('react');
var TeamChildAddSection = require('./TeamChildAddSection.jsx');
var TeamChildRemoveSection = require('./TeamChildRemoveSection.jsx');
var api = require('../api.jsx');
var teamApi = require('./TeamApi.jsx');
var currentTeam = '';
var _ = require('underscore');
var Promise = require('bluebird');

var TeamChildAssociation = React.createClass({
  getInitialState: function() {
    return {
      childTeams: {
        'teamId': null,
        'children': [],
        'selectableChildren': [],
        'access': false
      },
    }
  },
  componentDidUpdate: function() {
    var self = this;
    if (self.props.selectedTeam.team && self.props.selectedTeam.team._id && currentTeam != self.props.selectedTeam.team._id.toString()) {
      self.childTeamInit(self.props.selectedTeam)
        .then(function(result){
          return self.setState({childTeams: result});
        })
        .catch(function(err){
          console.log(err);
          return err;
        })
    }
  },
  childTeamsUpdateHandler: function() {
    this.childTeamInit(self.props.selectedTeam)
      .then(function(result){
        return self.setState({childTeams: result});
      })
      .catch(function(err){
        console.log(err);
        return err;
      })
  },
  childTeamInit: function(selectedTeam) {
    return new Promise(function(resolve, reject){
      var promiseArray = [];
      promiseArray.push(api.getChildrenTeams(selectedTeam.team.pathId));
      promiseArray.push(teamApi.getSelectableChildren(selectedTeam.team._id));
      Promise.all(promiseArray)
        .then(function(results){
          currentTeam = selectedTeam.team._id.toString();
          var returnObject = {
            'teamId': selectedTeam.team._id,
            'children': results[0],
            'selectableChildren': results[1],
            'access': selectedTeam.access
          };
          return resolve(returnObject);
        })
        .catch(function(err){
          return reject(err);
        });
    });
  },
  render: function() {
    var self = this;
    if (!_.isEmpty(self.props.selectedTeam) && self.props.selectedTeam.team.type == 'squad') {
      var squadStyle = {
        'display': 'block'
      };
      var nonSquadStyle = {
        'display': 'none'
      };
    } else {
      var squadStyle = {
        'display': 'none'
      };
      var nonSquadStyle = {
        'display': 'block'
      };
    }
    return (
      <div class='ibm-show-hide ibm-widget-processed' id='childAssociationSection'>
        <h2 class='ibm-bold ibm-h4'>
          <a class='' title='Expand/Collapse' onClick={()=>self.props.showHideSection('childAssociationSection')}>
            Team Child Association
          </a>
        </h2>
        <div class='ibm-container-body' style={{'display':'none'}}>
          <div id='squadChildPageSection' style={squadStyle}>
            <p>Squad team cannot have a child team association</p>
          </div>
          <div id='nonSquadChildPageSection' style={nonSquadStyle}>
            <TeamChildAddSection childTeams={self.state.childTeams} childTeamsUpdateHandler={self.childTeamsUpdateHandler}/>
              <div class="ibm-rule ibm-alternate">
                <hr />
              </div>
            <TeamChildRemoveSection childTeams={self.state.childTeams} childTeamsUpdateHandler={self.childTeamsUpdateHandler}/>
          </div>
        </div>
      </div>
    )
  }
});

module.exports = TeamChildAssociation;
