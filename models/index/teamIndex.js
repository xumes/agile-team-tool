var Promise = require('bluebird');
var _       = require('underscore');
var common  = require('../cloudant-driver');
var logger  = require('../../middleware/logger');
var util    = require('../../helpers/util');


var getAllChildren = function(teamId, teamList) {
  var children = _.isEmpty(children) ? [] : children;
  var team = teamList[teamId];
  if (!_.isEmpty(team)) {
    if (!_.isEmpty(team.child_team_id)) {
      // remove cyclic references
      children = _.union(children, _.difference(team.child_team_id, [team._id]));
      _.each(_.difference(team.child_team_id, [team._id]), function(id) {
        children = _.union(children, getAllChildren(id, teamList, children));
      });
    }
  }
  return children;
}

var getAllParents = function(teamId, teamList) {
  var parents = _.isEmpty(parents) ? [] : parents;
  var team = teamList[teamId];
  if (!_.isEmpty(team) && !_.isEmpty(team.parent_team_id)) {
    parents = _.union(parents, [team.parent_team_id]);
    parents = _.union(parents, getAllParents(team.parent_team_id, teamList));
  }
  return parents;
}

var index = {
  initIndex: function() {
    return new Promise(function(resolve, reject) {
      var indexDocument = new Object();
      indexDocument._id = "ag_ref_team_index";
      indexDocument.domains = [];
      indexDocument.tribes = [];
      indexDocument.squads = [];

      logger.get('models').verbose("Processing all teams for lookup index.");
      common.getByView('teams', 'teams')
      .then(function(allTeams) {
        var allTeams = util.returnObject(allTeams);
        var teamList = _.indexBy(allTeams, function(team) {return team._id});

        allTeams = _.groupBy(allTeams, function(team) {
          var level =  "squads";
          if (_.isEmpty(team.parent_team_id) && (!_.isEmpty(team.squadteam) && team.squadteam.toLowerCase() == 'no'))
            level = "domains";
          else if (!_.isEmpty(team.parent_team_id) && (!_.isEmpty(team.squadteam) && team.squadteam.toLowerCase() == 'no'))
            level = "tribes";
          return level;
        });

        if (_.has(allTeams, 'domains'))
          allTeams.domains = _.sortBy(allTeams.domains, function(team) {return team.name});
        if (_.has(allTeams, 'tribes'))
          allTeams.tribes = _.sortBy(allTeams.tribes, function(team) {return team.name});
        if (_.has(allTeams, 'squads')) 
          allTeams.squads = _.sortBy(allTeams.squads, function(team) {return team.name});

        _.each(allTeams.domains, function(team) {
          var indexObj = new Object();
          indexObj._id = team._id;
          indexObj.name = team.name;
          indexObj.squadteam = team.squadteam;
          indexObj.parents = !_.isEmpty(team.parent_team_id) ? [team.parent_team_id] : [];
          indexObj.children = _.union(team.child_team_id, getAllChildren(team._id, teamList));
          indexDocument.domains.push(indexObj);
        });

        _.each(allTeams.tribes, function(team) {
          var indexObj = new Object();
          indexObj._id = team._id;
          indexObj.name = team.name;
          indexObj.squadteam = team.squadteam;
          indexObj.parents = _.union([team.parent_team_id], getAllParents(team._id, teamList));
          indexObj.children = _.union(team.child_team_id, getAllChildren(team._id, teamList));
          indexDocument.tribes.push(indexObj);
        });

        _.each(allTeams.squads, function(team) {
          var indexObj = new Object();
          indexObj._id = team._id;
          indexObj.name = team.name;
          indexObj.squadteam = team.squadteam;
          indexObj.parents = !_.isEmpty(team.parent_team_id) ? [team.parent_team_id] : [];
          indexObj.children = team.child_team_id;

          var tribeIndex = _.findWhere(indexDocument.tribes, {_id : team.parent_team_id});
          if (!_.isEmpty(tribeIndex)) {
            indexObj.parents = _.union(indexObj.parents, tribeIndex.parents);
          }

          indexDocument.squads.push(indexObj);
        });

        var lookupIndex = _.union(indexDocument.domains, indexDocument.tribes, indexDocument.squads);
        logger.get('models').verbose("Index size: " + _.size(lookupIndex));
        
        index.updateIndexDocument(lookupIndex)
          .then(function(result) {
            resolve(result);
          })
          .catch( /* istanbul ignore next */ function(err) {
            logger.get('models').error('Error retrieving lookup document ' + err);
            reject(err);
          });        
      });
    });
  },

  getIndexDocument: function() {
    return new Promise(function(resolve, reject) {
      common.getRecord("ag_ref_team_index")
        .then(function(result) {
          resolve(result);     
        })
        .catch( /* istanbul ignore next */ function(err) {
          reject(err);  
        });        
    });
  },

  /* istanbul ignore next */
  createLookupObj: function(_id, name, squadteam, doc_status, newParentId, oldParentId) {
    var obj = {
      '_id'         : _id,
      'name'        : name,
      'squadteam'   : squadteam,
      'doc_status'   : doc_status || '',
      'newParentId' : newParentId || '',
      'oldParentId' : oldParentId || ''
    };
    return obj;
  },

  updateIndexDocument: function(lookupIndex) {
    return new Promise(function(resolve, reject) {
      index.getIndexDocument()
        .then(function(indexDocument) {
          indexDocument.lookup = lookupIndex;
          common.updateRecord(indexDocument)
          .then(function(result) {
            logger.get('models').debug("Document based team indexing updated.");
            resolve(result);
          })
          .catch( /* istanbul ignore next */ function(err) {
            logger.get('models').debug("Document based team indexing not created.");
            // try to rebuild index again
            index.initIndex()
            .then(function(result) {
              resolve(result);
            })
            .catch( /* istanbul ignore next */ function(err) {
              reject(err);
            })
          });        
        })
        .catch( /* istanbul ignore next */ function(err) {
          var indexDocument = new Object();
          indexDocument._id = "ag_ref_team_index";
          indexDocument.lookup = lookupIndex;

          common.addRecord(indexDocument)
          .then(function(result) {
            logger.get('models').verbose("Document based team indexing updated.");
            resolve(result);
          })
          .catch( /* istanbul ignore next */ function(err) {
            logger.get('models').verbose("Document based team indexing not created.");
            // try to rebuild index again
            index.initIndex()
            .then(function(result) {
              resolve(result);
            })
            .catch( /* istanbul ignore next */ function(err) {
              reject(err);
            })
          });  
        });        
    });
  },

  /**
    teamAssociations accepts an array of object with the following format 
    {
      _id: current team ID,
      name: current team name
      squadteam: Yes | No
      doc_status: deleted | ""
      oldParentId: oldParent ID,
      newParentId: newParent ID
    }
  */
  updateLookup: function(indexDocument, teamAssociations) {
    return new Promise(function(resolve, reject) {
      var allTeams = indexDocument.lookup;
      var deleteTeams = [];
      logger.get('models').verbose('Success: All teams lookup document count: ' + _.size(allTeams));
      if (!_.isEmpty(allTeams)) {
        _.each(teamAssociations, function(teamAssociation) {
          var currentTeam = _.findWhere(allTeams, {_id: teamAssociation._id});
          var updateRequired = false;
          if (!_.isEmpty(currentTeam)) {
            logger.get('models').verbose('Success: current team found ' + teamAssociation._id);
            if (!_.isEqual(currentTeam.name, teamAssociation.name) 
              || !_.isEqual(currentTeam.squadteam, teamAssociation.squadteam)
              || _.isEqual(teamAssociation.doc_status, "delete"))
              updateRequired = true;

            currentTeam.name = teamAssociation.name;
            currentTeam.squadteam = teamAssociation.squadteam;            
            /* 
              there is an existing team lookup data, and association needs to be updated
              to remove old parent association 
                get current team parents as P
                get current team children as C
                iterate P teams and remove C + current team id ids in P.children
                iterate C teams and remove P + current team id ids in C.parents
            */
            if (!_.isEmpty(teamAssociation.oldParentId) && currentTeam.parents.indexOf(teamAssociation.oldParentId) > -1) {
              logger.get('models').verbose('Removing old lookup data for ' + currentTeam.name);
              updateRequired = true;
              var parents = currentTeam.parents;
              var children = currentTeam.children;
              var childrenList = _.union([currentTeam._id], currentTeam.children);
              // for all parents of the current team, remove current team and children 
              var pCount = 0;
              _.each(parents, function(parentId) {
                var parentTeam = _.findWhere(allTeams, {_id: parentId});
                if (!_.isEmpty(parentTeam)) {
                  parentTeam.children = _.difference(parentTeam.children, childrenList);
                  pCount += 1; 
                }
              });

              var oldParentTeam = _.findWhere(allTeams, {_id: teamAssociation.oldParentId});
              var parentList = _.union(currentTeam.parents, [currentTeam._id]);
              // for all children of the current team, remove current team and parents
              var cCount = 0;
              _.each(children, function(childId) {
                var childTeam = _.findWhere(allTeams, {_id: childId});
                if (!_.isEmpty(childTeam)) {
                  if (_.isEqual(teamAssociation.doc_status, "delete"))
                    childTeam.parents = _.difference(childTeam.parents, parentList);
                  else
                    childTeam.parents = _.difference(childTeam.parents, currentTeam.parents);
                  cCount += 1; 
                }
              });
              // now we remove its old parent association
              currentTeam.parents = _.difference(currentTeam.parents, [teamAssociation.oldParentId], oldParentTeam.parents);
              logger.get('models').verbose('Done removing old lookup data for ' + currentTeam.name + 
                ".  Removed " + pCount + " relationship(s) from parent record(s).  Removed " + cCount + " relationship(s) from child record(s).");
              
            }
          }
          if (!_.isEmpty(currentTeam) && !_.isEmpty(teamAssociation.newParentId) && !_.isEqual(teamAssociation.doc_status, "delete")) {
            /*
              to add parent association
                get current team children as currentTeam
                get new parent team parents as NP
                get new parent team children as NC
                set new parent team id and NP as parents for currentTeam
                set new parent team NC to include currentTeam._id and currentTeam.children
                iterate NP teams to include currentTeam._id and currentTeam.children as new children
                iterate currentTeam.children to include NP as parents 
            */
            var newParentTeam = _.findWhere(allTeams, {_id: teamAssociation.newParentId});
            if (!_.isEmpty(newParentTeam)) {
              updateRequired = true;
              logger.get('models').verbose('Updating new lookup data for ' + currentTeam.name);
              var parents = newParentTeam.parents;
              var children = newParentTeam.children;
              // add new parent team as a parent of the current team
              var parentList = _.union(newParentTeam.parents, [newParentTeam._id], currentTeam.parents);
              currentTeam.parents = parentList;
              // add current team as child of the parent team
              var childrenList = _.union(newParentTeam.children, [currentTeam._id], currentTeam.children);
              newParentTeam.children = childrenList;
              
              // for all children of the current team, add new parent list as parents
              var pCount = 0;
              _.each(currentTeam.children, function(childId) {
                var childTeam = _.findWhere(allTeams, {_id: childId});
                if (!_.isEmpty(childTeam)) {
                  childTeam.parents = _.union(childTeam.parents, parentList);
                  pCount += 1;
                }
              });
              // for all parents of the parent team, add current team children as new children.
              var cCount = 0;
              _.each(newParentTeam.parents, function(parentId) {
                var parentTeam = _.findWhere(allTeams, {_id: parentId});
                if (!_.isEmpty(parentTeam)) {
                  parentTeam.children = _.union(parentTeam.children, childrenList);
                  cCount += 1;
                }
              });
              logger.get('models').verbose('Done updating new lookup data for ' + currentTeam.name + 
                ".  Updated " + pCount + " relationship(s) from parent record(s).  Updated " + cCount + " relationship(s) from child record(s).");
              
            } 
          }
          if (!_.isEqual(teamAssociation.doc_status, "delete") && _.isEmpty(currentTeam) 
            && _.isEmpty(teamAssociation.newParentId) && _.isEmpty(teamAssociation.oldParentId)) {
            // this is a new team 
            logger.get('models').verbose('Creating new lookup object for ' + teamAssociation.name);
            updateRequired = true;
            var lookupObj = new Object();
            lookupObj._id = teamAssociation._id;
            lookupObj.name = teamAssociation.name;
            lookupObj.squadteam = teamAssociation.squadteam;
            lookupObj.parents = [];
            lookupObj.children = [];

            allTeams = _.union(allTeams, [lookupObj]);
          }
          if (_.isEqual(teamAssociation.doc_status, "delete")) {
            logger.get('models').verbose('Need to delete lookup object for ' + teamAssociation.name);
            deleteTeams.push(teamAssociation._id);
          }

        }); // _.each
      } // if (!_.isEmpty(allTeams)
      if (!_.isEmpty(deleteTeams)) {
        allTeams = _.reject(allTeams, function(team) {
          return (deleteTeams.indexOf(team._id) > -1);
        });
      }
      resolve(allTeams);
    });
  }
}

module.exports = index;