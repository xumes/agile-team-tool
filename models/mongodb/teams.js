'use strict';
var _ = require('underscore');
var Promise = require('bluebird');
var mongoose = require('mongoose');
var Schema   = mongoose.Schema;
var util = require('../../helpers/util');
var Users = require('./users');
var Iterations = require('./iterations');
var Assessments = require('./assessments');
var loggers = require('../../middleware/logger');
var async = require('async');

// Just needed so that corresponding test could run
require('../../settings');

/*
  Team Schema
*/
var memberSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Member name is required.']
  },
  allocation: {
    type: Number,
    default: 0,
    min: [0, 'Allocation must be between 0 and 100.'],
    max: [100, 'Allocation must be between 0 and 100.']
  },
  userId: {
    type: String,
    required: [true, 'Member userId is required.']
  },
  email: {
    type: String,
    required: [true, 'Member email is required.']
  }
});

var TeamSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Name is required.'],
    unique: true //declares unique index if collection is empty
  },
  pathId: {
    type: String,
    unique: true, //declares unique index if collection is empty
    required: true
  },
  path: {
    type: String,
    default: null
  },
  members: [memberSchema],
  type: {
    type: String,
    default: null
  },
  description: {
    type: String,
    default: null
  },
  createdDate: {
    type: Date,
    default: new Date()
  },
  createdByUserId: {
    type: String,
    required: [true, 'UserId of creator required.']
  },
  createdBy: {
    type: String,
    required: [true, 'Name of creator required.']
  },
  updateDate: {
    type: Date,
    default: new Date()
  },
  updateByUserId: {
    type: String,
    default: null
  },
  updateBy: {
    type: String,
    default: null
  },
  docStatus: {
    type: String,
    default:null
  }
});

var Team = mongoose.model('Team', TeamSchema);

/*
  middleware
*/

//validate hooks on path. might be better to use a pre hook if this causes issues
TeamSchema.path('name').validate(function(value, done) {
  this.model('Team').count({name: value}, function(err, count) {
    if (err) return done(err);
    done(!count);
  });
}, 'This team name already exists. Please enter a different team name.');
TeamSchema.path('pathId').validate(function(value, done) {
  this.model('Team').count({pathId: value}, function(err, count) {
    if (err) return done(err);
    done(!count);
  });
}, 'This team name is too similar to another team. Please enter a different team name.');

/*
  model helper functions
*/
var getAllUniquePaths = function(){
  return new Promise(function(resolve, reject){
    Team.find({path: {$ne: null}}, {path: 1})
    .then(function(paths) {
      resolve(_.uniq(_.pluck(paths, 'path')));
    })
    .catch(function(err) {
      reject(err);
    });
  });
};

var createPathId = function(teamName) {
  return teamName.toLowerCase().replace(/[^a-z1-9]/g, '');
};

var getChildren = function(pathId) {
  if (_.isEmpty(pathId)) return [];
  else return Team.find({path:new RegExp(','+pathId+',')}).exec();
};

/*
   exported model functions
*/
//using for search filter in home page, regular expression for team name
module.exports.searchTeamWithName = function(string) {
  var searchQuery = {
    'name': {
      '$regex': new RegExp('.*' + string.toLowerCase() + '.*', 'i')
    }
  };
  return Team.find(searchQuery).sort('pathId').exec();
};

//using for snapshot roll up data, get all non squads
module.exports.getNonSquadTeams = function(proj) {
  return Team.find({type: {$ne:'squad'}}).select(proj).exec();
};

//using for snapshot roll up data, get all squads
module.exports.getSquadTeams = function(proj, filter) {
  return Team.find({type: 'squad'}, filter).select(proj).exec();
};

/**
 * If email is empty, get all root teams. Otherwise, get all user's root teams.
 * root teams are teams with no parent, non-squad with children.
 * @param user email
 * @return array of root teams
 */
module.exports.getRootTeams = function(userEmail) {
  return new Promise(function(resolve, reject){
    if (userEmail) {
      var query = {
        'members': {
          '$elemMatch': {
            'email': userEmail.toLowerCase()
          }
        }
      };
      var promiseArray = [];
      promiseArray.push(Team.find(query).sort('pathId').exec());
      promiseArray.push(getAllUniquePaths());
      Promise.all(promiseArray)
        .then(function(results){
          var rootedTeams = results[0];
          var uniquePaths = results[1];
          uniquePaths = uniquePaths.join(',');
          var tempTeams = [];
          _.each(rootedTeams, function(team){
            _.find(rootedTeams, function(compareTeam){
              if (team.path == null) {
                if (team.type == 'squad') {
                  return tempTeams.push(team.pathId);
                } else {
                  if (uniquePaths.indexOf(','+team.pathId+',') < 0) {
                    return tempTeams.push(team.pathId);
                  }
                }
              } else {
                if (team.path != compareTeam.path) {
                  var comparePath = '';
                  if (compareTeam.path == null) {
                    comparePath = ',' + compareTeam.pathId + ',';
                  } else {
                    comparePath = compareTeam.path;
                  }
                  if (team.path.indexOf(comparePath) >= 0) {
                    return tempTeams.push(team.pathId);
                  }
                }
              }
            });
          });
          var returnTeams = [];
          _.each(rootedTeams, function(team){
            if (!_.contains(tempTeams, team.pathId)) {
              var newTeam = {
                '_id': team._id,
                'type': team.type,
                'name': team.name,
                'path': team.path,
                'pathId': team.pathId,
                'hasChild': null,
                'docStatus': team.docStatus
              };
              if (uniquePaths.indexOf(','+team.pathId+',') >= 0) {
                newTeam.hasChild = true;
              } else {
                newTeam.hasChild = false;
              }
              returnTeams.push(newTeam);
            }
          });
          resolve(returnTeams);
        })
        .catch(function(err){
          reject(err);
        });
    } else {
      return Promise.join(
        Team.find({path: null, type:{$ne:'squad'}}).sort('pathId').exec(),
        getAllUniquePaths(),
      function(rootedTeams, uniquePaths) {
        uniquePaths = uniquePaths.join(',');
        //indexOf is faster than match apparently
        var res = _.filter(rootedTeams, function(team){
          return uniquePaths.indexOf(','+team.pathId+',') >= 0;
        });
        resolve(res);
      });
    }
  });
};

/**
 * If email is empty, get all standalone teams. Otherwise, get all user's standalone teams.
 * standalone teams are non-squad teams without chiilren and parent, and squad team without parent.
 * @param user email
 * @return array of standalone teams
 */
module.exports.getStandalone = function(userEmail) {
  if (userEmail) {
    var query = {
      'path': null,
      'members': {
        '$elemMatch': {
          'email': userEmail.toLowerCase()
        }
      }
    };
    return Promise.join(
      Team.find(query).sort('pathId').exec(),
      getAllUniquePaths(),
    function(rootedTeams, uniquePaths) {
      uniquePaths = uniquePaths.join(',');
      //indexOf is faster than match apparently
      var res = _.filter(rootedTeams, function(team){
        return uniquePaths.indexOf(','+team.pathId+',') < 0;
      });
      return res;
    });
  } else {
    return Promise.join(
      Team.find({path: null}).sort('pathId').exec(),
      getAllUniquePaths(),
    function(rootedTeams, uniquePaths) {
      uniquePaths = uniquePaths.join(',');
      //indexOf is faster than match apparently
      var res = _.filter(rootedTeams, function(team){
        return uniquePaths.indexOf(','+team.pathId+',') < 0;
      });
      return res;
    });
  }
};

//list of NON-SQUAD teams that are not part of teamId's subtree
module.exports.getSelectableParents = function(teamId) {
  return new Promise(function(resolve, reject){
    if (_.isEmpty(teamId)) return reject(Error('Id of team is required.'));

    Team.findOne({_id: teamId})
    .then(function(team){
      if (_.isEmpty(team)) return reject(Error(teamId + ' is not a team.'));

      var regEx = new RegExp('^((?!'+team.pathId+').)*$');
      return Team.find({type:{$ne:'squad'}, path: regEx});
    })
    .then(function(result){
      resolve(result);
    })
    .catch(function(err) {
      reject(err);
    });
  });
};

//list of root teams (any team type; no parents) where teamId is not in their subtree.
//if teamId is a squad team, return none
module.exports.getSelectableChildren = function(teamId) {
  return new Promise(function(resolve, reject){
    if (_.isEmpty(teamId)) return reject(Error('Id of team is required.'));

    Team.findOne({_id: teamId}).exec()
    .then(function(team){
      if (_.isEmpty(team)) return reject(Error(teamId + ' is not a team.'));
      if (team.type==='squad') return resolve([]);
      return team.pathId;
    })
    .then(function(pathId){
      //this might be expensive if theres a boat load of teams
      return Promise.join(
        Team.find({path:null}), //root teams of any type
        getAllUniquePaths(),
      function(rootedTeams, uniquePaths) {
        uniquePaths = _.filter(uniquePaths, function(path){return path.indexOf(pathId)<0;});
        var rootedPathIds = [];
        _.each(uniquePaths, function(path){
          var pId = path.substring(1, path.indexOf(',',1));
          if (!_.contains(rootedPathIds, pId))
            rootedPathIds.push(pId);
        });
        var res = [];
        _.each(rootedTeams, function(team){
          if (_.contains(rootedPathIds, team.pathId))
            res.push(team);
        });
        return resolve(res);
      });
    })
    .catch(function(err) {
      reject(err);
    });
  });
};

module.exports.getSquadsOfParent = function(pathId) {
  if (_.isEmpty(pathId)) return [];
  else return Team.find({path:new RegExp(','+pathId+','), type:'squad'}).exec();
};

//TODO fix front-end js so teamDoc comes through the api in a correct format
module.exports.createTeam = function(teamDoc, creator) {
  return new Promise(function(resolve, reject){
    if (_.isEmpty(teamDoc.name))
      return reject(Error('Team name is required.'));
    teamDoc['pathId'] = createPathId(teamDoc.name);
    var newTeamDoc = new Team(teamDoc);
    Team.create(newTeamDoc)
    .then(function(result){
      resolve(result);
    })
    .catch(function(err){
      reject(err);
    });
  });
};

/**
 * Get first level children using parent's pathId.
 */
module.exports.getChildrenByPathId = function(pathId) {
  return new Promise(function(resolve, reject){
    if (_.isEmpty(pathId)) {
      resolve([]);
    }
    else {
      var promiseArray = [];
      promiseArray.push(Team.find({path:new RegExp(','+pathId+',$')}).sort('pathId').exec());
      promiseArray.push(getAllUniquePaths());
      Promise.all(promiseArray)
        .then(function(results){
          var childrenTeams = results[0];
          var uniquePaths = results[1];
          uniquePaths = uniquePaths.join(',');
          var returnTeams = [];
          _.each(childrenTeams, function(team){
            var newTeam = {
              '_id': team._id,
              'type': team.type,
              'name': team.name,
              'path': team.path,
              'pathId': team.pathId,
              'hasChild': null,
              'docStatus': team.docStatus
            };
            if (uniquePaths.indexOf(','+team.pathId+',') >= 0) {
              newTeam.hasChild = true;
            } else {
              newTeam.hasChild = false;
            }
            returnTeams.push(newTeam);
          });
          resolve(returnTeams);
        })
        .catch(function(err){
          reject(err);
        });
    }
  });
  // if (_.isEmpty(pathId)) return [];
  // else return Team.find({path:new RegExp(','+pathId+',$')}).sort('pathId').exec();
};

module.exports.getAllChildrenOnPath = function(path) {
  return new Promise(function(resolve, reject){
    var promiseArray = [];
    var pathString = ',';
    _.each(path, function(p) {
      pathString = pathString + p + ',';
      var query = {
        'path' : {
          '$regex' : pathString + '$'
        }
      };
      promiseArray.push(Team.find(query).sort('pathId').exec());
    });
    promiseArray.push(getAllUniquePaths());
    Promise.all(promiseArray)
      .then(function(results){
        var uniquePaths = results[results.length-1];
        uniquePaths = uniquePaths.join(',');
        results.pop();
        var returnArray = [];
        _.each(results, function(teams){
          var returnTeams = [];
          _.each(teams, function(team){
            var newTeam = {
              '_id': team._id,
              'type': team.type,
              'name': team.name,
              'path': team.path,
              'pathId': team.pathId,
              'hasChild': null,
              'docStatus': team.docStatus
            };
            if (uniquePaths.indexOf(','+team.pathId+',') >= 0) {
              newTeam.hasChild = true;
            } else {
              newTeam.hasChild = false;
            }
            returnTeams.push(newTeam);
          });
          returnArray.push(returnTeams);
        });
        resolve(returnArray);
      })
      .catch(function(err){
        reject(err);
      });
  });
};

//TODO refactor into 2 seperate functions
// module.exports.getTeam = function(id) {
//   return Team.find({_id:id}).exec();
// };
// module.exports.getAllTeams = function() {
//   return Team.find({}).exec();
// };
//TODO refactor getTeam(id)
module.exports.getTeam = function(id) {
  if (_.isEmpty(id))
    return Team.find({}).exec();
  else
    return Team.findOne({_id:id}).exec();
};

/**
 * Get team by pathId
 */
module.exports.getTeamByPathId = function(pathId) {
  if (_.isEmpty(pathId))
    return Team.find({}).exec();
  else
    return Team.findOne({pathId:pathId}).exec();
};
/**
 * Using in home page, getting the team info and if it has a child team
 * @param team's objectId
 * @return team's info and child info
 */
module.exports.getTeamAndChildInfo = function(id) {
  return new Promise(function(resolve, reject){
    var promiseArray = [];
    if (mongoose.Types.ObjectId.isValid(id)) {
      promiseArray.push(Team.findOne({_id:id}).exec());
    } else {
      promiseArray.push(Team.findOne({pathId:id}).exec());
    }
    promiseArray.push(getAllUniquePaths());
    Promise.all(promiseArray)
      .then(function(results){
        var team = results[0];
        var uniquePaths = results[1];
        uniquePaths = uniquePaths.join(',');
        if (team == null || team.docStatus == 'delete') {
          resolve(null);
        } else {
          var newTeam = {
            '_id': team._id,
            'type': team.type,
            'name': team.name,
            'path': team.path,
            'pathId': team.pathId,
            'hasChild': null,
            'docStatus': team.docStatus
          };
          if (uniquePaths.indexOf(','+team.pathId+',') >= 0) {
            newTeam.hasChild = true;
          } else {
            newTeam.hasChild = false;
          }
          resolve(newTeam);
        }
      })
      .catch(function(err){
        reject(err);
      });
  });
};

module.exports.getSquadsByPathId = function(pathId) {
  return new Promise(function(resolve, reject){
    Team.findOne({pathId: pathId}).exec()
      .then(function(team){
        if (team.path) {
          var query = {
            type: 'squad',
            path: {
              $regex: team.path + team.pathId + ',.*'
            }
          };
        } else {
          var query = {
            type: 'squad',
            path: {
              $regex: '^,' + team.pathId + ',.*'
            }
          };
        }
        return Team.find(query).exec();
      })
      .then(function(teams){
        resolve(teams);
      })
      .catch(function(err){
        reject(err);
      });
  });
};

module.exports.getRole = function() {
  return Team.distinct('members.role').exec();
};

//TODO refactor into 2 seperate functions
// module.exports.getByName = function(teamName) {
//   return Team.find({name:teamName}).exec();
// };
// module.exports.getAllTeamNames = function() {
//   return Team.find({},{name:1}).exec();
// };
//TODO refactor getByName(id)
module.exports.getByName = function(teamName) {
  if (_.isEmpty(teamName))
    return Team.find({},{name:1}).exec();
  else
    return Team.find({name:teamName}).exec();
};

module.exports.getTeamsByEmail = function(memberEmail, proj) {
  return Team.find({members: {$elemMatch:{email:memberEmail}}, docStatus:{$ne:'delete'}}).select(proj).exec();
};
//look at all the first pathId in all the paths
//query all those pathIds
//[_id, _id]
module.exports.getTeamsByUserId = function(uid, proj) {
  return Team.find({members: {$elemMatch:{userId:uid}}, docStatus:{$ne:'delete'}}).select(proj).exec();
};
//returns an array of team ids where the user is a member of the team + the team's subtree
//this uses user email
module.exports.getUserTeams = function(memberEmail) {
  return new Promise(function(resolve, reject){
    Team.find({members: {$elemMatch:{email:memberEmail}}}, {pathId:1})
      .then(function(teams){
        var pathIds = _.pluck(teams, 'pathId');

        //build a query string to match all, ex: a|b|c to query for all docs with
        //paths a or b or c
        var q = '';
        _.each(pathIds, function(pId){
          q += pId + '|';
        });
        q = q.slice(0, -1); //remove last |
        return q;
      })
      .then(function(q){
        if (q==='') resolve([]);//prevent matching on ''
        return Team.distinct('_id', {path:new RegExp(q)}).exec();
      })
      .then(function(result){
        resolve(result);
      })
      .catch(function(err){
        reject(err);
      });
  });
};

module.exports.modifyTeamMembers = function(teamId, userEmail, userId, newMembers) { //TODO this should use userId
  return new Promise(function(resolve, reject){
    if (_.isEmpty(teamId)){
      return reject('Team ID is required');
    }
    if (_.isEmpty(userId)){
      return reject('User ID is required');
    }
    if (_.isEmpty(members)){
      return reject('Member lists is required');
    }
    if (!_.isArray(members)){
      return reject('Invalid member lists');
    }
    //check if user is allowed to edit team
    Users.isUserAllowed(userEmail, teamId)//TODO this should use userId
    .then(function(isAllowed){
      if (!isAllowed)
        return reject('Not allowed to modify team members');
      else
        return true;
    })
    .then(function(){
      Team.update({_id: teamId},{
        $set:
        {
          members: newMembers,
          updatedBy: userEmail,
          updatedByUserId: userId,
          updateDate: util.getServerTime()
        }
      }).exec();
    })
    //TODO no idea why we are doing these extra queries in an update.
    //left them here to refactor after the mongo migration
    .then(function(savingResult){
      return Team.getUserTeams(userEmail);
    })
    .then(function(userTeams){
      return Team.getTeam(teamId)
      .then(function(result){
        return resolve(
          {
            userTeams : userTeams,
            teamDetails : result
          }
        );
      });
    })
    .catch(function(err){
      return reject(err);
    });
  });
};

module.exports.deleteTeamByName = function(name) {
  return new Promise(function(resolve, reject){
    Team.remove({'name': name})
      .then(function(result){
        resolve(result);
      })
      .catch(function(err){
        reject(err);
      });
  });
};

/*
How tree structure changes when a team is deleted:
A->B-C->D->E
A->B-C->X->Y->Z
*X and D are child teams of C
if C gets deleted, team docStatus will be "delete".. all related iterations and assessments of C will also have docStatus of "delete"
surviving structure would be
A->B
D->E
X->Y->Z
All affected team that had a path relation to C, will have to be updated.
*/

//TODO should split this into 2 functions to make it cleaner.
module.exports.updateOrDeleteTeam = function(newDoc, userEmail, userId, action) {
  var teamId = newDoc._id;
  return new Promise(function(resolve, reject){
    Promise.join(
      module.exports.getTeam(teamId),
      Iterations.getByIterInfo(teamId),
      Assessments.getTeamAssessments(teamId),
      function(oldTeamDoc, iterations, assessments){
        Users.isUserAllowed(userEmail, teamId)
        .then(function(isAllowed){
          if (!isAllowed) return Promise.reject(Error('User not allowed to preform action.')); //for some reason have to use static reject here o.w next thens() get called
          else return;
        })
        //use is allowed to update or delete
        .then(function(){
          if (action==='delete') {
            var iterationIds = _.pluck(iterations, '_id');
            var assessmentIds = _.pluck(assessments, '_id');
            //delete team, iterations, and assessment docs by setting docStatus: delete
            //logger will say 0 deleted if they were already deleted (mongodb doesnt update docs if theres no change)
            loggers.get('model-teams').info('Deleting the following team: ' +teamId);
            return Team.update({_id : teamId}, {$set: {docStatus: 'delete', updatedByUserId:userId, updatedBy:userEmail, updateDate:util.getServerTime()}}).exec()
            .then(function(res){
              loggers.get('model-teams').verbose('Deleted '+res.nModified+ ' team; docStatus: delete');
              loggers.get('model-teams').info('Removing '+oldTeamDoc.pathId+' from team paths');
              return Team.find({path: new RegExp(','+oldTeamDoc.pathId+',')}).exec();
            })
            .then(function(teams){
              if (_.isEmpty(teams)) return;
              else {
                //now we have the teams that have paths we need to update.
                //I couldn't find a way to dynamically update multi docs in mongoose so using async library
                //this takes almost a minute if it has to update ~2k paths
                async.each(teams, function(team, callback) {
                  var newPath = team.path.split(','+oldTeamDoc.pathId).pop();
                  newPath = (newPath===',') ? undefined : newPath;
                  return Team.update({_id : team._id}, {$set: {path:newPath}}).exec()
                  .then(function(r){
                    loggers.get('model-teams').verbose('updated a team path. oldPath: '+team.path+', new path: '+newPath );
                    return callback();
                  })
                  .catch(function(e){
                    return callback(e);
                  });
                },function(err) {
                  if ( err ) {
                    loggers.get('model-teams').error(Error(err));
                  }
                  else
                    loggers.get('model-teams').info(teams.length+' team paths were updated.');
                });
              }
            })
            .then(function(){
              loggers.get('model-teams').verbose('Done modifying team paths');
              loggers.get('model-teams').info('Deleting the following assessment docs: ' +assessmentIds);
              return Assessments.getModel().update({_id : {'$in':assessmentIds}}, {$set: {docStatus: 'delete', updatedByUserId:userId, updatedBy:userEmail, updateDate:util.getServerTime()}}, {multi: true}).exec();
            })
            .then(function(res){
              loggers.get('model-teams').verbose('Set '+res.nModified+ ' assessment documents docStatus: delete');
              loggers.get('model-teams').info('Deleting the following iteration docs: ' +iterationIds);
              return Iterations.getModel().update({_id : {'$in':iterationIds}}, {$set: {docStatus: 'delete', updatedByUserId:userId, updatedBy:userEmail, updateDate:util.getServerTime()}}, {multi: true}).exec();
            })
            .then(function(res){
              loggers.get('model-teams').verbose('Set '+res.nModified+ ' iteration documents docStatus: delete');
              return resolve('Successfully deleted the team: '+oldTeamDoc.name+' updated children paths, deleted associated iteration and assessment docs.');
            })
            .catch(function(e){
              return reject(e);
            });
          }
          //else update the team  ... no delete
          else {
            if (oldTeamDoc.pathId !== newDoc.pathId || oldTeamDoc.path !== newDoc.path)
              return Promise.reject(Error('Changing pathId or path is not supported currently'));
            else {
              newDoc.updatedByUserId = userId;
              newDoc.updatedBy = userEmail;
              newDoc.updateDate = util.getServerTime();
              return Team.update({_id : teamId}, newDoc, {runValidators: true}).exec();
            }
          }
        })
        .catch(function(e){
          return reject(e);
        });
      }
    );
  });
};

// module.exports.updateOrDeleteTeam('57ead48d027c6a5a884c7ec4','jeffsmit@us.ibm.com','jeff smith', 'delete').then(function(res) {
//   console.log(res);
// }).catch(function(e){
//   console.log(e);
// });

//I think we can refactor the clientside js to use other model functions
module.exports.getLookupIndex = function() {
};
module.exports.getLookupTeamByType = function() {
};

var associateActions = function() {
};
module.exports.associateTeams = function() {
};
