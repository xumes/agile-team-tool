'use strict';
var _ = require('underscore');
var Promise = require('bluebird');
var mongoose = require('mongoose');
var Schema   = mongoose.Schema;
var Users = require('./users');
var Iterations = require('./iterations');
var Assessments = require('./assessments');
var loggers = require('../../middleware/logger');
var crypto = require('crypto');
var validators = require('mongoose-validators');
var moment = require('moment');
var self = this;
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

var errURLInvalidMsg = 'is not a valid url.';
var linkSchema = new Schema({
  id: {
    type: String,
    required: [true, 'URL link id is required.']
  },
  linkLabel: {
    type: String,
    required: [true, 'URL link label is required.']
  },
  linkUrl: {
    type: String,
    required: [true, 'URL is required.'],
    validate: validators.isURL({message: errURLInvalidMsg})
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
  links: [linkSchema],
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
  updatedByUserId: {
    type: String,
    default: null
  },
  updatedBy: {
    type: String,
    default: null
  },
  docStatus: {
    type: String,
    default:null
  }
});

var Team = mongoose.model('Team', TeamSchema);
var Links = mongoose.model('Links', linkSchema);

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
    .catch( /* istanbul ignore next */ function(err) {
      reject(err);
    });
  });
};

var createPathId = function(teamName) {
  return teamName.toLowerCase().replace(/[^a-z1-9]/g, '');
};

// var getChildren = function(pathId) {
//   if (_.isEmpty(pathId)) return [];
//   else return Team.find({path:new RegExp(','+pathId+',')}).exec();
// };

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
  return Team.find({type: {$ne:'squad'}, docStatus: {$ne: 'delete'}}).select(proj).exec();
};

//using for snapshot roll up data, get all squads
module.exports.getSquadTeams = function(proj, filter) {
  return Team.find({type: 'squad', docStatus: {$ne: 'delete'}}, filter).select(proj).exec();
};

/**
 * If email is empty, get all root teams. Otherwise, get all user's root teams.
 * root teams are teams with no parent, non-squad with children.
 * @param user email
 * @return array of root teams
 */
module.exports.getRootTeams = function(uid) {
  return new Promise(function(resolve, reject){
    if (uid) {
      var query = {
        'members': {
          '$elemMatch': {
            'userId': uid.toUpperCase()
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
        .catch( /* istanbul ignore next */ function(err){
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
module.exports.getStandalone = function(uid) {
  if (uid) {
    var query = {
      'path': null,
      'members': {
        '$elemMatch': {
          'userId': uid.toUpperCase()
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
    if (_.isEmpty(teamId)) return reject({'error':'Id of team is required.'});

    Team.findOne({_id: teamId})
    .then(function(team){
      if (_.isEmpty(team)) return reject({'error': teamId + ' is not a team.'});

      var regEx = new RegExp('^((?!'+team.pathId+').)*$');
      return Team.find({type:{$ne:'squad'}, path: regEx, docStatus: {$ne: 'delete'}});
    })
    .then(function(result){
      resolve(result);
    })
    .catch( /* istanbul ignore next */ function(err) {
      reject(err);
    });
  });
};

//list of root teams (any team type; no parents) where teamId is not in their subtree.
//if teamId is a squad team, return none
module.exports.getSelectableChildren = function(teamId) {
  return new Promise(function(resolve, reject){
    if (_.isEmpty(teamId)) return reject({'error':'Id of team is required.'});

    Team.findOne({_id: teamId}).exec()
    .then(function(team){
      if (_.isEmpty(team)) return reject({'error': teamId + ' is not a team.'});
      if (team.type==='squad') return resolve([]);
      if (team.path == null) {
        var parentPathId = [team.pathId];
        var parentPath = ',' + team.pathId + ',';
      } else {
        parentPathId = team.path.substring(1,team.path.length-2).split(',');
        parentPath = team.path + team.pathId + ',';
      }
      return Team.find({path: {$ne: parentPath}, pathId: {$nin: parentPathId}, docStatus: {$ne: 'delete'}}).exec();
    })
    .then(function(teams){
      return resolve(teams);
    })
    // .then(function(pathId){
    //   //this might be expensive if theres a boat load of teams
    //   return Promise.join(
    //     Team.find({path:null, docStatus: {$ne: 'delete'}}), //root teams of any type
    //     getAllUniquePaths(),
    //   function(rootedTeams, uniquePaths) {
    //     uniquePaths = _.filter(uniquePaths, function(path){return path.indexOf(pathId)<0;});
    //     var rootedPathIds = [];
    //     _.each(uniquePaths, function(path){
    //       var pId = path.substring(1, path.indexOf(',',1));
    //       if (!_.contains(rootedPathIds, pId))
    //         rootedPathIds.push(pId);
    //     });
    //     var res = [];
    //     _.each(rootedTeams, function(team){
    //       if (_.contains(rootedPathIds, team.pathId))
    //         res.push(team);
    //     });
    //     return resolve(res);
    //   });
    // })
    .catch( /* istanbul ignore next */ function(err) {
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
      return reject({'error':'Team name is required.'});
    var newTeam = {
      'name': teamDoc.name,
      'createdByUserId': creator.ldap.uid.toUpperCase(),
      'createdBy': creator.shortEmail.toLowerCase(),
      'pathId': createPathId(teamDoc.name),
      'docStatus': null,
      'updatedBy': creator.shortEmail.toLowerCase(),
      'updatedByUserId': creator.ldap.uid.toUpperCase(),
      'updateDate': new Date(moment.utc()),
      'members': teamDoc.members,
      'type': teamDoc.type,
    };
    // teamDoc['pathId'] = createPathId(teamDoc.name);
    var newTeamDoc = new Team(newTeam);
    Team.create(newTeamDoc)
    .then(function(result){
      resolve(result);
    })
    .catch( /* istanbul ignore next */ function(err){
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
              'description': team.description,
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
        .catch( /* istanbul ignore next */ function(err){
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
      .catch( /* istanbul ignore next */ function(err){
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
module.exports.loadTeamDetails = function(id) {
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
      .catch( /* istanbul ignore next */ function(err){
        reject(err);
      });
  });
};

// module.exports.getSquadsByPathId = function(pathId) {
//   return new Promise(function(resolve, reject){
//     Team.findOne({pathId: pathId}).exec()
//       .then(function(team){
//         if (team.path) {
//           var query = {
//             type: 'squad',
//             path: {
//               $regex: team.path + team.pathId + ',.*'
//             }
//           };
//         } else {
//           var query = {
//             type: 'squad',
//             path: {
//               $regex: '^,' + team.pathId + ',.*'
//             }
//           };
//         }
//         return Team.find(query).exec();
//       })
//       .then(function(teams){
//         resolve(teams);
//       })
//       .catch(function(err){
//         reject(err);
//       });
//   });
// };

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
    return Team.findOne({name:teamName}).exec();
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
// module.exports.getUserTeams = function(memberEmail) {
//   return new Promise(function(resolve, reject){
//     Team.find({members: {$elemMatch:{email:memberEmail}}, docStatus:{$ne:'delete'}}, {pathId:1})
//       .then(function(teams){
//         var pathIds = _.pluck(teams, 'pathId');
//
//         //build a query string to match all, ex: a|b|c to query for all docs with
//         //paths a or b or c
//         var q = '';
//         _.each(pathIds, function(pId){
//           q += pId + '|';
//         });
//         q = q.slice(0, -1); //remove last |
//         return q;
//       })
//       .then(function(q){
//         if (q==='') resolve([]);//prevent matching on ''
//         return Team.distinct('_id', {'$or':[{path:new RegExp(q)}, {pathId:new RegExp(q)}]}).exec();
//       })
//       .then(function(result){
//         resolve(result);
//       })
//       .catch( /* istanbul ignore next */ function(err){
//         reject(err);
//       });
//   });
// };

module.exports.getUserTeamsByUserId = function(uid) {
  return new Promise(function(resolve, reject){
    Team.find({members: {$elemMatch:{userId:uid}}, docStatus:{$ne:'delete'}}, {pathId:1})
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
        return Team.distinct('_id', {'$or':[{path:new RegExp(q)}, {pathId:new RegExp(q)}]}).exec();
      })
      .then(function(result){
        resolve(result);
      })
      .catch( /* istanbul ignore next */ function(err){
        reject(err);
      });
  });
};

module.exports.modifyTeamMembers = function(teamId, user, newMembers) { //TODO this should use userId
  return new Promise(function(resolve, reject){
    if (_.isEmpty(user)){
      return reject({'error':'User is required'});
    }
    var userId = user['ldap']['uid'].toUpperCase();
    var userEmail = user['shortEmail'].toLowerCase();
    if (_.isEmpty(teamId)){
      return reject({'error':'Team ID is required'});
    }
    if (_.isEmpty(newMembers)){
      return reject({'error':'Member lists is required'});
    }
    if (!_.isArray(newMembers)){
      return reject({'error':'Invalid member lists'});
    }
    //check if user is allowed to edit team
    Users.isUserAllowed(userId, teamId)//TODO this should use userId
    .then(function(isAllowed){
      if (!isAllowed)
        return Promise.reject({'error':'Not allowed to modify team members'});
      else
        return true;
    })
    .then(function(){
      return Team.update({_id: teamId},{
        $set:
        {
          members: newMembers,
          updatedBy: userEmail,
          updatedByUserId: userId,
          updateDate: new Date(moment.utc())
        }
      }).exec();
    })
    .then(function(){
      return resolve({'ok':'Updated successfully.'});
    })
    .catch( /* istanbul ignore next */ function(err){
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
      .catch( /* istanbul ignore next */ function(err){
        reject(err);
      });
  });
};

// module.exports.getParentByTeamId = function(teamId) {
//   return new Promise(function(resolve, reject) {
//     Team.findOne({_id: teamId}).lean().exec()
//       .then(function(team) {
//         if (_.isEmpty(team)) {
//           return reject(new Error('Cannot find parent info'));
//         }
//         if (!_.isEmpty(team.path)) {
//           var paths = team.path.split(',');
//           return paths[_.findLastIndex(paths)];
//         }
//         else {
//           return resolve();
//         }
//       })
//       .then(function(parentPathId) {
//         return Team.findOne({pathId: parentPathId}).exec();
//       })
//       .then(function(parentTeam) {
//         resolve(parentTeam);
//       })
//       .catch( /* istanbul ignore next */ function(err) {
//         reject(err);
//       });
//   });
// };

module.exports.getTeamHierarchy = function(path) {
  return new Promise(function(resolve, reject) {
    if (path == '' || path == null) {
      resolve([]);
    } else {
      var tempPath = path.substring(1, path.length - 1);
      var paths = tempPath.split(',');
      Team.find({'pathId': {'$in': paths}}).exec()
      .then(function(teams){
        if (teams.length < paths.length) {
          resolve({'error': 'cannot get the whole hierarchy'});
        } else {
          var returnTeams = [];
          _.each(paths, function(p){
            _.find(teams, function(t){
              if (t.pathId == p) {
                var returnTeam = {
                  'pathId': t.pathId,
                  '_id': t._id,
                  'name': t.name
                };
                return returnTeams.push(returnTeam);
              }
            });
          });
          resolve(returnTeams);
        }
      })
      .catch( /* istanbul ignore next */ function(err){
        reject(err);
      });
    }
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

module.exports.updateTeam = function(teamId, user, newDoc) {
  return new Promise(function(resolve, reject){
    var updateDoc = {};
    if (_.isEmpty(teamId)) {
      return reject({'error': 'Team ID is required.'});
    }
    if (_.isEmpty(user)) {
      return reject({'error': 'User ID is required.'});
    }
    if (newDoc.name == undefined || newDoc.name == '') {
      return reject({'error': 'Team name is required.'});
    } else {
      updateDoc.name = newDoc.name;
    }
    var userId = user['ldap']['uid'].toUpperCase();
    var userEmail = user['shortEmail'].toLowerCase();
    updateDoc.description = newDoc.description;
    updateDoc.updatedByUserId = userId;
    updateDoc.updatedBy = userEmail;
    updateDoc.updateDate = new Date(moment.utc());
    Users.isUserAllowed(userId, teamId)
      .then(function(result){
        if (!result) {
          return Promise.reject({'error':'Not allowed to modify team.'});
        }
        return Team.update({'_id': teamId}, {'$set': updateDoc}).exec();
      })
      .then(function(result){
        return resolve(result);
      })
      .catch( /* istanbul ignore next */ function(err){
        return reject(err);
      });
  });
};

module.exports.softDelete = function(teamId, user) {
  return new Promise(function(resolve, reject){
    if (_.isEmpty(teamId)) {
      return reject({'error': 'Team ID is required.'});
    }
    if (_.isEmpty(user)) {
      return reject({'error': 'User ID is required.'});
    }
    var updateDoc = {};
    var userId = user['ldap']['uid'].toUpperCase();
    var userEmail = user['shortEmail'].toLowerCase();
    updateDoc.docStatus = 'delete';
    updateDoc.updatedByUserId = userId;
    updateDoc.updatedBy = userEmail;
    updateDoc.updateDate = new Date(moment.utc());
    var parentPathId = '';
    var parentPath = '';
    Users.isUserAllowed(userId, teamId)
      .then(function(result){
        if (!result) {
          return Promise.reject({'error':'Not allowed to delete team.'});
        }
        var promiseArray = [];
        promiseArray.push(self.getTeam(teamId));
        promiseArray.push(Iterations.getByIterInfo(teamId));
        promiseArray.push(Assessments.getTeamAssessments(teamId));
        return Promise.all(promiseArray);
      })
      .then(function(results){
        var team = results[0];
        var iterations = results[1];
        var assessments = results[2];
        parentPathId = team.pathId;
        if (team.path == null) {
          parentPath = ',' + parentPathId + ',';
        } else {
          parentPath = team.path + parentPathId + ',';
        }
        var query = {
          'path' : {
            '$regex' : parentPath
          }
        };
        var promiseArray = [];
        promiseArray.push(Team.find(query).exec());
        _.each(iterations, function(iter){
          promiseArray.push(Iterations.softDelete(iter._id, user));
        });
        _.each(assessments, function(as){
          promiseArray.push(Assessments.softDelete(as._id, user));
        });
        promiseArray.push(Team.update({'_id': teamId}, {'$set': updateDoc}).exec());
        return Promise.all(promiseArray);
      })
      .then(function(results){
        var teams = results[0];
        var promiseArray = [];
        _.each(teams, function(team){
          var updateTeamDoc = {};
          var tid = team._id;
          var tpath = team.path;
          tpath = tpath.replace(parentPath, '');
          if (tpath == '') {
            tpath = null;
          } else {
            tpath = ',' + tpath;
          }
          updateTeamDoc.path = tpath;
          updateTeamDoc.updatedByUserId = userId;
          updateTeamDoc.updatedBy = userEmail;
          updateTeamDoc.updateDate = new Date(moment.utc());
          promiseArray.push(Team.update({'_id': tid}, {'$set': updateTeamDoc}).exec());
        });
        return Promise.all(promiseArray);
      })
      .then(function(result){
        return resolve({'ok': 'Delete successfully'});
      })
      .catch(function(err){
        return reject(err);
      });
  });
};

module.exports.modifyImportantLinks = function(teamId, user, links) {
  return new Promise(function(resolve, reject){
    /**
     *
     * @param teamId - team id to modify
     * @param user - user id of the one who is doing the action
     * @param links - array of links
     * @returns - modified team document
     */
    var userId = user['ldap']['uid'].toUpperCase();
    var userEmail = user['shortEmail'].toLowerCase();
    var validResult = validateUpdateImportantLinks(teamId, userEmail, links);
    if (validResult && validResult['error'] !== undefined) return reject(validResult);

    //check if user is allowed to edit team
    Users.isUserAllowed(userId.toUpperCase(), teamId)
    .then(function(allowed){
      if (!allowed) {
        return Promise.reject({'error':'Not allowed to modify team links'});
      }
      var tmpLinks = [];
      var pattern = /^((http|https):\/\/)/;
      _.each(links, function(data,idx,ls) {
        var str = data.linkUrl + process.hrtime().toString();
        var hashId = crypto.createHash('md5').update(str).digest('hex');
        var obj = {};
        obj.id = (data.id !== undefined) ? data.id : hashId;
        var url = data.linkUrl;
        if (!pattern.test(url)) {
          url = 'http://' + url;
        }
        obj.linkLabel = data.linkLabel;
        obj.linkUrl = url;
        tmpLinks.push(obj);
      });
      var updateTeam = {
        'links': tmpLinks,
        'updatedByUserId': userId,
        'updatedBy': userEmail,
        'updateDate': new Date(moment.utc())
      };
      return Team.update({'_id': teamId},{'$set': updateTeam}).exec();
    })
    .then(function(result){
      return resolve(result);
    })
    .catch( /* istanbul ignore next */ function(err){
      return reject(err);
    });
  });
};

// module.exports.deleteImportantLinks = function(teamId, user, links) {
//   return new Promise(function(resolve, reject){
//     /**
//      *
//      * @param teamId - team id to modify
//      * @param user - user id of the one who is doing the action
//      * @param links - array of link IDs
//      * @returns - modified team document
//      */
//     var errorLists = {};
//     errorLists['error'] = {};
//     var userId = user['ldap']['uid'].toUpperCase();
//     var userEmail = user['shortEmail'].toLowerCase();
//     var validResult = validateDelImportantLinks(teamId, userId, links);
//     if (validResult && validResult['error'] !== undefined) return reject(validResult);
//
//     //check if user is allowed to edit team
//     Users.isUserAllowed(userId, teamId)
//     .then(function(allowed){
//       loggers.get('models').verbose('User ' + userEmail + ' is allowed to edit team ' + teamId + '. Proceed with modification');
//       return allowed;
//     })
//     .then(function(){
//       return module.exports.getTeam(teamId);
//     })
//     .then(function(teamDetails){
//       if (!_.isEmpty(teamDetails.links)){
//         var curlinkData = teamDetails.links;
//         var tmpcurlinkData = _.clone(teamDetails.links);
//         var tmpLinks = [];
//         var deletedIds = _.pluck(links, 'id');
//         var failDeleteLinkIds = [];
//         var errmsg;
//         _.each(curlinkData, function(value, key, list){
//           if (_.contains(deletedIds, value.id)){
//             delete curlinkData[key];
//           }
//         });
//
//         _.each(curlinkData, function(value, key, list){
//           if (value !== undefined){
//             tmpLinks.push(value);
//           }
//         });
//
//         var currlinkData = _.pluck(tmpcurlinkData, 'id');
//         _.each(deletedIds, function(value, key, list) {
//           if (!_.contains(currlinkData, value)) {
//             failDeleteLinkIds.push(value);
//           }
//         });
//
//         if (failDeleteLinkIds.length > 0) {
//           failDeleteLinkIds = _.reject(failDeleteLinkIds, _.isUndefined);
//           if (failDeleteLinkIds && failDeleteLinkIds.length > 0) {
//             errmsg = 'The following Link ID does not exist in the database: ' + failDeleteLinkIds.join(',');
//           } else {
//             errmsg = 'Link ID not found';
//           }
//           errorLists['error']['links'] = [errmsg];
//           return reject(errorLists);
//         } else {
//           teamDetails['links'] = tmpLinks;
//           teamDetails['updatedByUserId'] = userId;
//           teamDetails['updatedBy'] = userEmail;
//           teamDetails['updateDate'] = new Date(moment.utc());
//           return Team.findByIdAndUpdate(teamId, teamDetails);
//         }
//       } else {
//         var deletedIds = _.pluck(links, 'id');
//         var errmsg;
//         deletedIds = _.reject(deletedIds, _.isUndefined);
//         if (deletedIds && deletedIds.length > 0) {
//           errmsg = 'The following Link ID does not exist in the database: ' + deletedIds.join(',');
//         } else {
//           errmsg = 'Link ID not found';
//         }
//         errorLists['error']['links'] = [errmsg];
//         return reject(errorLists);
//       }
//     })
//     .then(function(savingResult){
//       return module.exports.getUserTeams(userEmail);
//     })
//     .then(function(userTeams){
//       return module.exports.getTeam(teamId)
//       .then(function(result){
//         return resolve(
//           {
//             userTeams : userTeams,
//             teamDetails : result
//           }
//         );
//       });
//     })
//     .catch( /* istanbul ignore next */ function(err){
//       return reject(err);
//     });
//   });
// };
//
// var validateDelImportantLinks = function(teamId, userId, links) {
//   var errorLists = {};
//   errorLists['error'] = {};
//   if (_.isEmpty(teamId)){
//     errorLists['error']['teamId'] = ['Team ID is required'];
//     loggers.get('models').verbose(errorLists);
//     return errorLists;
//   }
//   if (_.isEmpty(userId)){
//     errorLists['error']['userId'] = ['User ID is required'];
//     loggers.get('models').verbose(errorLists);
//     return errorLists;
//   }
//   if (_.isEmpty(links)){
//     errorLists['error']['links'] = ['Link ID is required'];
//     loggers.get('models').verbose(errorLists);
//     return errorLists;
//   } else {
//     if (!_.isArray(links)){
//       errorLists['error']['links'] = ['Invalid links'];
//       loggers.get('models').verbose(errorLists);
//       return errorLists;
//     }
//   }
//   return true;
// };

var validateUpdateImportantLinks = function(teamId, userId, links) {
  var errorLists = {};
  errorLists['error'] = {};
  if (_.isEmpty(teamId)){
    errorLists['error']['teamId'] = ['Team ID is required'];
    loggers.get('models').verbose(errorLists);
    return errorLists;
  }
  if (_.isEmpty(userId)){
    errorLists['error']['userId'] = ['User ID is required'];
    loggers.get('models').verbose(errorLists);
    return errorLists;
  } else {
    if (!_.isArray(links)){
      errorLists['error']['links'] = ['Invalid links'];
      loggers.get('models').verbose(errorLists);
      return errorLists;
    } else {
      var tmpError = [];
      var errorLinks = '';
      var errmsg;
      _.each(links, function(value, index, list) {
        var LinksData = new Links(value);
        errorLinks = LinksData.validateSync();
        if (errorLinks && errorLinks['errors'] && errorLinks['errors']['linkUrl']) {
          if (errorLinks['errors']['linkUrl'].message === errURLInvalidMsg) {
            errmsg = value['linkUrl'] + ' ' + errorLinks['errors']['linkUrl'].message;
          } else {
            errmsg = errorLinks['errors']['linkUrl'].message;
          }
          tmpError.push({linkUrl: errmsg});
        }
        if (errorLinks && errorLinks['errors'] && errorLinks['errors']['linkLabel']) {
          tmpError.push({linkLabel: errorLinks['errors']['linkLabel'].message});
        }
      });
      if (tmpError.length > 0) {
        errorLists['error']['links'] = tmpError;
        return errorLists;
      }
    }
  }
  return true;
};

module.exports.associateTeams = function(parentTeamId, childTeamId, uid) {
  return new Promise(function(resolve, reject){
    if (_.isEmpty(uid)) {
      return reject({'error':'The user id cannot be empty.'});
    } else if (_.isEmpty(childTeamId)){
      return reject({'error':'The child team id cannot be empty.'});
    } else if (_.isEmpty(parentTeamId)) {
      return reject({'error':'The parent team id cannot be empty.'});
    } else {
      var promiseArray = [];
      var oldChildPath = '';
      var newChildPath = '';
      // promiseArray.push(Users.isUserAllowed(uid, parentTeamId));
      // promiseArray.push(Users.isUserAllowed(uid, childTeamId));
      promiseArray.push(self.getTeam(parentTeamId));
      promiseArray.push(self.getTeam(childTeamId));
      Promise.all(promiseArray)
        // .then(function(results){
        //   if (results[0] == false) {
        //     return Promise.reject({'error':'You dont have access to parent team.'});
        //   } else if (results[1] == false) {
        //     return Promise.reject({'error':'You dont have access to child team.'});
        //   } else {
        //     var promiseArray = [];
        //     promiseArray.push(self.getTeam(parentTeamId));
        //     promiseArray.push(self.getTeam(childTeamId));
        //     return Promise.all(promiseArray);
        //   }
        // })
        .then(function(results) {
          if (results[0] == null || results[0].type == 'squad') {
            return Promise.reject({'error':'Parent team cannot be associated.'});
          } else if (results[1] == null) {
            return Promise.reject({'error':'Child team cannot be associated.'});
          }
          var parentPath = results[0].path;
          var parentPathId = results[0].pathId;
          var childPathId = results[1].pathId;
          var childPath = results[1].path;
          if (parentPath != null && parentPath.indexOf(','+childPathId+',') > 0) {
            return Promise.reject({'error':'Child team cannot be higher level than parent team.'});
          } else {
            if (childPath == null) {
              oldChildPath = ',' + childPathId + ',';
            } else {
              oldChildPath = childPath + childPathId + ',';
            }
            if (parentPath == null) {
              newChildPath = ',' + parentPathId + ',' + childPathId + ',';
              var newChildTeamPath = ',' + parentPathId + ',';
            } else {
              newChildPath = parentPath + parentPathId + ',' + childPathId + ',';
              newChildTeamPath = parentPath + parentPathId + ',';
            }
            var query = {
              'path' : {
                '$regex' : oldChildPath
              }
            };
            var promiseArray = [];
            promiseArray.push(Team.update({_id: results[1]._id}, {$set: {path: newChildTeamPath}}).exec());
            promiseArray.push(Team.find(query).exec());
            return Promise.all(promiseArray);
          }
        })
        .then(function(results) {
          if (!_.isEmpty(results[1])) {
            var promiseArray = [];
            _.each(results[1], function(team){
              var oldPath = team.path;
              var newPath = oldPath.replace(oldChildPath, newChildPath);
              promiseArray.push(Team.update({_id: team._id}, {$set: {path: newPath}}).exec());
            });
            return Promise.all(promiseArray);
          } else {
            return true;
          }
        })
        .then(function(result){
          return resolve({'ok':'Updated Successfully'});
        })
        .catch( /* istanbul ignore next */ function(err) {
          return reject(err);
        });
    }
  });
};
