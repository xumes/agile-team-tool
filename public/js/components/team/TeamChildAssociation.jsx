var React = require('react');
var TeamChildAddSection = require('./TeamChildAddSection.jsx');
var TeamChildRemoveSection = require('./TeamChildRemoveSection.jsx');
var api = require('../api.jsx');
var teamApi = require('./TeamApi.jsx');
var currentTeamId = '';
var _ = require('underscore');
var Promise = require('bluebird');

var TeamChildAssociation = React.createClass({
  getInitialState: function() {
    return {
      childTeams: {
        'access': false,
        'currentTeamId': '',
        'children': [],
        'selectableChildren': []
      },
    }
  },
  componentDidUpdate: function() {
    var self = this;
    if (!_.isEmpty(self.props.selectedTeam) && currentTeamId != self.props.selectedTeam.team._id && self.props.selectedTeam.type != 'squad') {
      self.childTeamInit(self.props.selectedTeam)
        .then(function(result){
          return self.setState({childTeams: result});
        })
        .catch(function(err){
          return err;
        })
    } else
      currentTeamId = '';
  },
  childTeamsUpdateHandler: function(msg) {
    var self = this;
    this.childTeamInit(self.props.selectedTeam)
      .then(function(result){
        self.setState({childTeams: result});
        if (!_.isEmpty(msg))
          alert(msg);
      })
      .catch(function(err){
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
          currentTeamId = selectedTeam.team._id;
          var returnObject = {
            'access': selectedTeam.access,
            'currentTeamId': selectedTeam.team._id,
            'children': results[0],
            'selectableChildren': results[1]
          };
          return resolve(returnObject);
        })
        .catch(function(err){
          return reject(err);
        });
    });
  },
  showHideSection: function() {
    this.props.showHideSection('childAssociationSection');
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
          <a class='' title='Expand/Collapse' style={{'cursor':'pointer'}} onClick={self.showHideSection}>
            Child team association
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
