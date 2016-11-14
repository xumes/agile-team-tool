var React = require('react');
var TeamChildAddSection = require('./TeamChildAddSection.jsx');
var TeamChildRemoveSection = require('./TeamChildRemoveSection.jsx');
var api = require('../api.jsx');
var currentTeam = '';
var Promise = require('bluebird');

var TeamChildAssociation = React.createClass({
  getInitialState: function() {
    return {
      childrenTeams: {
        'teamId': null,
        'children': [],
        'selectableChildren': []
      },
    }
  },
  componentDidUpdate: function() {
    var self = this;
    if (self.props.selectedTeam.team._id && currentTeam != self.props.selectedTeam.team._id.toString()) {
      self.childTeamInit(self.props.selectedTeam.team)
        .then(function(result){
          return self.setState({childrenTeams: result});
        })
        .catch(function(err){
          console.log(err);
          return err;
        })
    }
  },
  childTeamsUpdateHandler: function() {
    var self = this;
    self.childTeamInit(self.props.selectedTeam.team)
      .then(function(result){
        return self.setState({childrenTeams: result});
      })
      .catch(function(err){
        console.log(err);
        return err;
      })
  },
  childTeamInit: function(team) {
    return new Promise(function(resolve, reject){
      var promiseArray = [];
      promiseArray.push(api.getChildrenTeams(team.pathId));
      promiseArray.push(api.getSelectableChildren(team._id));
      Promise.all(promiseArray)
        .then(function(results){
          currentTeam = team._id.toString();
          var returnObject = {
            'teamId': team._id,
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
  render: function() {
    var self = this;
    return (
      <div class='ibm-show-hide ibm-widget-processed' id='childAssociationSection'>
        <h2 class='ibm-bold ibm-h4'>
          <a class='' title='Expand/Collapse' onClick={()=>self.props.showHideSection('childAssociationSection')}>
            Team Child Association
          </a>
        </h2>
        <div class='ibm-container-body' style={{'display':'none'}}>
          <TeamChildAddSection childrenTeams={self.state.childrenTeams} childTeamsUpdateHandler={self.childTeamsUpdateHandler}/>
          <TeamChildRemoveSection childrenTeams={self.state.childrenTeams} childTeamsUpdateHandler={self.childTeamsUpdateHandler}/>
        </div>
      </div>
    )
  }



});

module.exports = TeamChildAssociation;
