'use strict';
var _ = require('underscore');
var Promise = require('bluebird');
var mongoose = require('mongoose');
var crypto = require('crypto');
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
var teamModel = require('./teams');
var userTimezone = require('./data/uniqueUserTimezone.js');
var ulocation = {};
_.each(userTimezone, function(tz) {
  ulocation[tz.location] = tz.timezone;
});

/*
  Team Schema
*/
var MemberSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Member name is required.']
  },
  role: {
    type: String,
    required: [true, 'Member role is required.']
  },
  allocation: {
    type: Number,
    required: [true, 'Member allocation is required.'],
    min: [0, 'Allocation must be between 0 and 100.'],
    max: [100, 'Allocation must be between 0 and 100.']
  },
  userId: {
    type: String,
    required: [true, 'Member UID is required.']
  },
  email: {
    type: String,
    default: null
    //required: [true, 'Member email is required.'] // allow for BP profiles that does not have email
  }
},{_id : false});

var errURLInvalidMsg = '{VALUE} is not a valid url.';
var LinkSchema = new Schema({
  id: {
    type: String,
    required: [true, 'URL link id is required.']
  },
  linkLabel: {
    type: String,
    required: [true, 'URL link label is required.'],
    validate: validators.matches({message: 'URL link label is required.'}, /^(?!.*(Select label|Other...))/ig)
  },
  linkUrl: {
    type: String,
    required: [true, 'URL is required.'],
    validate: validators.isURL({message: errURLInvalidMsg})
  }
},{_id : false});

var TeamSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Team name is required.']
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
  members: [MemberSchema],
  type: {
    type: String,
    default: null
  },
  description: {
    type: String,
    default: null
  },
  links: [LinkSchema],
  createDate: {
    type: Date,
    default: new Date(moment.utc())
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
    default: new Date(moment.utc())
  },
  updatedByUserId: {
    type: String,
    required: [true, 'UserId of updater required.']
  },
  updatedBy: {
    type: String,
    required: [true, 'Name of updater required.']
  },
  docStatus: {
    type: String,
    default:null
  }
});

// var EventSchema = new Schema({
//   _id: {
//     type: String,
//     required: [true, 'Team ID is required.']
//   },
//   userAllowed: {
//     type: Boolean
//     required: [true,
//     validate: {
//       validator: function(v) {
//         return v;
//       },
//       message: 'User is not allowed'
//     }
//   }

// });

var Team = mongoose.model('Team', TeamSchema);
var Links = mongoose.model('Links', LinkSchema);
var Members = mongoose.model('Members', MemberSchema);

/*
  middleware
*/
// TeamSchema.pre('validate', true, function(next, done) {
//   // calling next kicks off the next middleware in parallel
//   console.log('pre validate team');
//   next();
//   setTimeout(done, 100);
// });
// TeamSchema.post('update', function(error, res, next) {
//   console.log('post update team');
//   if (error.name === 'MongoError' && error.code === 11000) {
//     next(new Error('This team name already exists. Please enter a different team name.'));
//   } else {
//     next(error);
//   }
// });
/* istanbul ignore next */
TeamSchema.pre('update', function() {
  /* istanbul ignore next */
  console.log('pre update team');
});
//validate hooks on path. might be better to use a pre hook if this causes issues
TeamSchema.path('name').validate(function(value, done) {
  // console.log('team name validation', this.pathId);
  this.model('Team').count({name: value, docStatus:{$ne:'delete'}}, function(err, count) {
    if (err) return done(err);
    done(!count);
  });
}, 'This team name already exists. Please enter a different team name.');
TeamSchema.path('pathId').validate(function(value, done) {
  // console.log('team pathId validation', this.pathId);
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
    Team.find({path: {$ne: null}, docStatus:{$ne:'delete'}}, {path: 1})
    .then(function(paths) {
      resolve(_.uniq(_.pluck(paths, 'path')));
    })
    .catch( /* istanbul ignore next */ function(err) {
      reject(err);
    });
  });
};

var createPathId = function(teamName) {
  teamName = teamName || '';
  return  teamName.toLowerCase().replace(/[^a-z0-9]/g, '')+'-'+crypto.randomBytes(2).toString('hex');
};

// //********** BEGIN UNCOMMENT THIS SECTION IF WE NEED pathId IN-SYNC WITH ACTUAL TEAM NAME **********************
// var updateTeamPathIds = function(currPath, oldPathId, newPathId) {
//   return new Promise(function(resolve, reject) {
//     if (!_.isEqual(oldPathId, newPathId)) {
//       var oldParentPath = null;
//       var newParentPath = null;
//       if (currPath == null) {
//         oldParentPath = ',' + oldPathId + ',';
//         newParentPath = ',' + newPathId + ',';
//       } else {
//         oldParentPath = currPath + oldPathId + ',';
//         newParentPath = currPath + newPathId + ',';
//       }
//       var query = {
//         'path' : {
//           '$regex' : oldPathId
//         }, docStatus:{$ne:'delete'}
//       };
//       var promiseArray = [];
//       var currentTeam = null;
//       promiseArray.push(Team.findOne({pathId: newPathId, docStatus:{$ne:'delete'}}));
//       promiseArray.push(Team.find(query));
//       Promise.all(promiseArray)
//         .then(function(results) {
//           currentTeam = results[0];
//           var teams = results[1];
//           var promiseArray = [];
//           _.each(teams, function(team){
//             var updateTeamDoc = {};
//             var tid = team._id;
//             var tpath = team.path;
//             if (_.isEmpty(tpath)) {
//               tpath = null;
//             } else {
//               tpath = tpath.replace(oldParentPath, newParentPath);
//             }
//             updateTeamDoc.path = tpath;
//             console.log(tid,tpath);
//             promiseArray.push(Team.update({'_id': tid}, {'$set': updateTeamDoc}));
//           });
//           return Promise.all(promiseArray);
//         })
//         .then(function(results) {
//           resolve(currentTeam);
//         })
//         .catch(function(err) {
//           reject(err);
//         })
//     }
//   });
// };
// // //********** END UNCOMMENT THIS SECTION IF WE NEED pathId IN-SYNC WITH ACTUAL TEAM NAME **********************

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
    }, docStatus:{$ne:'delete'}
  };
  return Team.find(searchQuery).sort('pathId').exec();
};

//using for snapshot roll up data, get all non squads
module.exports.getNonSquadTeams = function(proj) {
  return Team.find({type: {$ne:'squad'}, docStatus:{$ne:'delete'}}).select(proj).exec();
};

//using for snapshot roll up data, get all squads
module.exports.getSquadTeams = function(proj, filter) {
  return Team.find({type: 'squad', docStatus:{$ne:'delete'}}, filter).sort({name:1}).select(proj).exec();
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
        }, docStatus:{$ne:'delete'}
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
                if (team.path != compareTeam.path && compareTeam.type != 'squad') {
                  var comparePath = '';
                  if (compareTeam.path == null) {
                    comparePath = ',' + compareTeam.pathId + ',';
                  } else {
                    comparePath = compareTeam.path + compareTeam.pathId + ',';
                  }
                  if (team.path.indexOf(comparePath) >= 0) {
                    // console.log(team.pathId);
                    // console.log(team.path);
                    // console.log(comparePath);
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
                'docStatus': team.docStatus,
                'description': (!_.isEmpty(team.description)) ? team.description : null
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
        Team.find({path: null, type:{$ne:'squad'}, docStatus:{$ne:'delete'}}).sort('pathId').exec(),
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
      }, docStatus:{$ne:'delete'}
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
      Team.find({path: null, docStatus:{$ne:'delete'}}).sort('pathId').exec(),
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
    if (_.isEmpty(teamId)) reject({'error':'Id of team is required.'});

    Team.findOne({_id: teamId, docStatus:{$ne:'delete'}})
    .then(function(team){
      if (_.isEmpty(team)) reject({'error': teamId + ' is not a team.'});

      var regEx = new RegExp('^((?!'+team.pathId+').)*$');
      return Team.find({
        $or: [
          {type:{$ne:'squad'}, path: regEx, docStatus:{$ne:'delete'}},
          {type:{$ne:'squad'}, path: {$eq:null}, docStatus:{$ne:'delete'}, _id: {$ne:teamId}}
        ]
      },{_id:1,name:2});
    })
    .then(function(result){
      resolve(result);
    })
    .catch( /* istanbul ignore next */ function(err) {
      reject(err);
    });
  });
};

//list of all teams (any team type; no parents)
module.exports.getSelectableChildren = function(teamId) {
  return new Promise(function(resolve, reject) {
    if (_.isEmpty(teamId))
      return reject({'error':'Team ID is required.'});
    else
      Team.find({_id: {$ne: teamId}, path:null, docStatus:{$ne:'delete'}}).exec()
        .then(function(result) {
          resolve(result);
        })
        .catch( /* istanbul ignore next */ function(err) {
          reject(err);
        });
  });
  // return new Promise(function(resolve, reject){
  //   if (_.isEmpty(teamId)) return reject({'error':'Id of team is required.'});

  //   // Team.findOne({_id: teamId, docStatus:{$ne:'delete'}}).exec()
  //   // .then(function(team){
  //   //   if (_.isEmpty(team)) return reject({'error': teamId + ' is not a team.'});
  //   //   if (team.type==='squad') return resolve([]);
  //   //   if (team.path == null) {
  //   //     var parentPathId = [team.pathId];
  //   //     var parentPath = ',' + team.pathId + ',';
  //   //   } else {
  //   //     parentPathId = team.path.substring(1,team.path.length-2).split(',');
  //   //     parentPath = team.path + team.pathId + ',';
  //   //   }
  //   //   return Team.find({path: {$ne: parentPath}, pathId: {$nin: parentPathId}, docStatus:{$ne:'delete'}}).exec();
  //   // })
  //   // Team.find({_id: {$ne: teamId}, path:null}, docStatus:{$ne:'delete'}).exec()
  //   // .then(function(teams){
  //   //   return resolve(teams);
  //   // })
  //   // .then(function(pathId){
  //   //   //this might be expensive if theres a boat load of teams
  //   //   return Promise.join(
  //   //     Team.find({path:null, docStatus:{$ne:'delete'}}), //root teams of any type
  //   //     getAllUniquePaths(),
  //   //   function(rootedTeams, uniquePaths) {
  //   //     uniquePaths = _.filter(uniquePaths, function(path){return path.indexOf(pathId)<0;});
  //   //     var rootedPathIds = [];
  //   //     _.each(uniquePaths, function(path){
  //   //       var pId = path.substring(1, path.indexOf(',',1));
  //   //       if (!_.contains(rootedPathIds, pId))
  //   //         rootedPathIds.push(pId);
  //   //     });
  //   //     var res = [];
  //   //     _.each(rootedTeams, function(team){
  //   //       if (_.contains(rootedPathIds, team.pathId))
  //   //         res.push(team);
  //   //     });
  //   //     return resolve(res);
  //   //   });
  //   // })
  //   .catch( /* istanbul ignore next */ function(err) {
  //     reject(err);
  //   });
  // });
};

// module.exports.getSquadsOfParent = function(pathId) {
//   if (_.isEmpty(pathId)) return [];
//   else return Team.find({path:new RegExp(','+pathId+','), type:'squad', docStatus:{$ne:'delete'}}).exec();
// };

//TODO fix front-end js so teamDoc comes through the api in a correct format
module.exports.createTeam = function(teamDoc, creator) {
  return new Promise(function(resolve, reject){
    // creators are defaulted as the first member of the team
    if (_.isEmpty(teamDoc.members) && !_.isEmpty(creator)) {
      teamDoc.members = [{
        name: creator ? creator['ldap']['hrFirstName'] + ' ' + creator['ldap']['hrLastName'] : '',
        allocation: 0,
        role: _.isEqual(teamDoc.type, 'squad') ? 'Iteration Manager' : 'Team Lead',
        userId: creator ? creator['ldap']['uid'].toUpperCase() : '',
        email: creator ? creator['shortEmail'].toLowerCase() : ''
      }];
    }
    var newTeam = {
      'name': teamDoc.name,
      'createdByUserId': creator.ldap.uid.toUpperCase(),
      'createdBy': creator.shortEmail.toLowerCase(),
      'pathId': createPathId(teamDoc.name),
      'path': teamDoc.path || teamDoc.path,
      'docStatus': null,
      'updatedBy': creator ? creator['shortEmail'].toLowerCase() : '',
      'updatedByUserId': creator ? creator['ldap']['uid'].toUpperCase() : '',
      'updateDate': new Date(moment.utc()),
      'members': teamDoc.members,
      'type': _.isEqual(teamDoc.type, 'squad') ? 'squad' : null,
      'description': (!_.isEmpty(teamDoc.description)) ? teamDoc.description : null
    };
    var newTeamDoc = new Team(newTeam);
    Team.create(newTeamDoc)
      .then(function(result){
        teamDoc = result;
        return self.createUsers(teamDoc.members);
      })
      .then(function() {
        resolve(teamDoc);
      })
      .catch( /* istanbul ignore next */ function(err){
        reject(err);
      });
  });
};

module.exports.createUsers = function(members) {
  return new Promise(function(resolve,reject) {
    var ids = [''];
    if (!_.isEmpty(members)) {
      _.each(members, function(member){
        ids.push(member.userId);
      });
    } else {
      resolve(null);
    }
    Users.getUsersInfo(_.uniq(ids))
      .then(function(users) {
        if (!_.isEmpty(members)) {
          var promiseArray = [];
          var user = new Object();
          _.each(members, function(member) {
            user = _.find(users, function(user) {
              if (_.isEqual(member.userId, user.userId))
                return user;
            });
            if (_.isEmpty(user)) {
              if (!_.isEmpty(member.location)) {
                member.location.timezone = ulocation[member.location.site];
              }
              promiseArray.push(Users.create(member));
            }
          });
          return Promise.all(promiseArray);
        }
        return null;
      })
      .then(function(result) {
        resolve({'ok':'New users created successfully.'});
      })
      .catch( /* istanbul ignore next */ function(err) {
        reject(err);
      });
  });
};

module.exports.hasChildrenByPathId = function(pathId) {
  return new Promise(function(resolve, reject) {
    Team.find({path:new RegExp(','+pathId+',$'), docStatus:{$ne:'delete'}}, {_id:1})
      .then(function(results) {
        if (_.isEmpty(results))
          resolve(false);
        else
          resolve(true);
      })
      .catch( /* istanbul ignore next */ function(err){
        reject({'error':err});
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
      promiseArray.push(Team.find({path:new RegExp(','+pathId+',$'), docStatus:{$ne:'delete'}}).sort('pathId').exec());
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
              'docStatus': team.docStatus,
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
        }, docStatus:{$ne:'delete'}
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
    return Team.find({docStatus:{$ne:'delete'}}).exec();
  else
    return Team.findOne({_id:id, docStatus:{$ne:'delete'}}).exec();
};

/**
 * Get team by pathId
 */
module.exports.getTeamByPathId = function(pathId) {
  if (_.isEmpty(pathId))
    return Team.find({docStatus:{$ne:'delete'}}).exec();
  else
    return Team.findOne({pathId:pathId, docStatus:{$ne:'delete'}}).exec();
};
/**
 * Using in home page, getting the team info and if it has a child team
 * @param team's objectId
 * @return team's info and child info
 */
module.exports.loadTeamChildDetails = function(id) {
  return new Promise(function(resolve, reject){
    var promiseArray = [];
    // if (mongoose.Types.ObjectId.isValid(id)) {
    //   console.log('id');
    //   promiseArray.push(Team.findOne({_id:id, docStatus:{$ne:'delete'}}).exec());
    // } else {
    //   console.log('path');
    //   promiseArray.push(Team.findOne({pathId:id, docStatus:{$ne:'delete'}}).exec());
    // }
    promiseArray.push(Team.findOne({pathId:id, docStatus:{$ne:'delete'}}).exec());
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
    return Team.find({docStatus:{$ne:'delete'}},{name:1}).sort({name:1}).exec();
  else
    return Team.findOne({name:teamName, docStatus:{$ne:'delete'}}).exec();
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

//getAllUserTeamByUserId returns all member's team and children of member's team in full team's do document
module.exports.getAllUserTeamsByUserId = function(uid) {
  return new Promise(function(resolve, reject){
    teamModel.getUserTeamsByUserId(uid)
     .then(function(ids){
       Team.find({_id: {$in: ids}}).exec()
       .then(function(teams){
         //console.log('team result: '+JSON.stringify(teams));
         var ids = [''];
         var memberTemp = {};

         _.each(teams, function(team) {
           if (!_.isEmpty(team.members) && team.members.length != 0 && team.members != undefined) {
             var members = team.members;
             //console.log('Members in team: '+JSON.stringify(members));
             if (!_.isEmpty(members)) {
               _.each(members, function(member){
                 ids.push(member.userId);
               });
             }
           }
         });
         var user = new Object();
         var teamsTemp = [];
         var teamTemp = new Object();
         Users.getUsersInfo(_.uniq(ids))
          .then(function(users) {
            _.each(teams, function(team) {
              teamTemp =
              {
                '_id':team._id,
                'name':team.name,
                'pathId':team.pathId,
                'createDate':team.createdDate,
                'createdByUserId':team.createdByUserId,
                'createdBy':team.createdBy,
                'updatedByUserId':team.updatedByUserId,
                'updatedBy':team.updatedBy,
                'docStatus':team.docStatus,
                'updateDate':team.updateDate,
                'createdDate':team.createDate,
                'links':team.links,
                'description':team.description,
                'members':[],
                'path':team.parentTeamId
              };

              if (!_.isEmpty(team.members) && team.members.length != 0 && team.members != undefined) {
                var members = team.members;
                _.each(members, function(member){
                  memberTemp =
                 {'name':member.name,
                  'role':member.role,
                  'allocation':member.allocation,
                  'userId':member.userId,
                  'email':member.email,
                  'location':{
                    'site': '',
                    'timezone': ''
                  }
                 };
                  user = _.find(users, function(user) {
                    if (_.isEqual(member.userId, user.userId)){
                      memberTemp.location.site = user.location.site;
                      memberTemp.location.timezone = user.location.timezone;
                      teamTemp.members.push(memberTemp);
                    }
                  });
                });
              }
              return teamsTemp.push(teamTemp);
            });
            resolve (teamsTemp);
          });
       });
     })
     .catch( /* istanbul ignore next */ function(err){
       reject(err);
     });
  });
};

//getuserTeambyUserId returns object id of all members team and children of members's team in only array of _id
module.exports.getUserTeamsByUserId = function(uid) {
  return new Promise(function(resolve, reject){
    Team.find({members: {$elemMatch:{userId:uid}}, docStatus:{$ne:'delete'}}, {pathId:1})
      // .then(function(teams){
      //   var pathIds = _.pluck(teams, 'pathId');
      //   //build a query string to match all, ex: a|b|c to query for all docs with
      //   //paths a or b or c
      //   var q = '';
      //   _.each(pathIds, function(pId){
      //     q += pId + '|';
      //   });
      //   q = q.slice(0, -1); //remove last |
      //   return q;
      // })
      // .then(function(q){
      //   if (q==='') resolve([]);//prevent matching on ''
      //   return Team.distinct('_id', {'$or':[{path:new RegExp(q)}, {pathId:new RegExp(q)}]}).exec();
      // })
      .then(function(teams){
        return _.pluck(teams, 'pathId');
      })
      .then(function(pathIds){
        if (_.isEmpty(pathIds)) resolve([]);//prevent matching on ''
        var orPaths = [];
        var orPathIds = [];
        _.each(pathIds, function(pId) {
          orPaths.push({path: new RegExp(','+pId+',')});
          orPathIds.push({pathId: pId});
        });
        return Team.distinct('_id', {'$or': _.union(orPaths, orPathIds)}).exec();
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
      return reject({'error':'User is required.'});
    }
    var userId = user['ldap']['uid'].toUpperCase();
    var userEmail = user['shortEmail'].toLowerCase();
    if (_.isEmpty(teamId)){
      return reject({'error':'Team ID is required.'});
    }
    if (_.isEmpty(newMembers)){
      return reject({'error':'Member lists is required.'});
    }
    if (!_.isArray(newMembers)){
      return reject({'error':'Invalid member lists.'});
    }
    var updatedMembers = [];
    var error = {};
    _.each(newMembers, function(member) {
      updatedMembers.push({
        name: member.name,
        allocation: member.allocation,
        role: member.role,
        userId: member.userId,
        email: member.email
      });
    });
    for (var i=0; i<updatedMembers.length; i++) {
      var memberData = new Members(updatedMembers[i]);
      error = memberData.validateSync();
      if (!_.isEmpty(error))
        i = updatedMembers.length;
    }
    if (!_.isEmpty(error))
      return reject(error);
    //check if user is allowed to edit team
    Users.isUserAllowed(userId, teamId)//TODO this should use userId
    .then(function(isAllowed){
      if (!isAllowed)
        return Promise.reject({'error':'User is not allowed to modify team members.'});
      else
        return true;
    })
    .then(function() {
      var promiseArray = [];
      promiseArray.push(self.createUsers(newMembers));
      promiseArray.push(Team.findByIdAndUpdate({_id: teamId},{
        $set:
        {
          members: updatedMembers,
          updatedBy: userEmail,
          updatedByUserId: userId,
          updateDate: new Date(moment.utc())
        }
      }, {new:true}));
      return Promise.all(promiseArray);
    })
    // .then(function() {
    //   return self.createUsers(newMembers);
    // })
    .then(function(results){
      // return resolve({'ok':'Updated successfully.'});
      resolve(results[1]);
    })
    .catch( /* istanbul ignore next */ function(err){
      reject(err);
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
      Team.find({'pathId': {'$in': paths}, docStatus:{$ne:'delete'}}).exec()
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
All affected team that had a path relation to C, will have to be _.isEmpty(teamDoc) || updated.teamDoc._id*/
module.exports.updateTeam = function(teamDoc, user) {
  return new Promise(function(resolve, reject) {
    var updatedDoc = {};
    if (_.isEmpty(teamDoc) || _.isEmpty(teamDoc._id)) {
      reject({'error': 'Team ID is required.'});
    }
    var teamId = teamDoc._id;
    var userId = user ? user['ldap']['uid'].toUpperCase() : '';
    var userEmail = user ? user['shortEmail'].toLowerCase() : '';
    var oldPathId = '';
    // var newPathId = createPathId(teamDoc.name);
    var parentPath = null;
    updatedDoc.name = teamDoc.name;
    // updatedDoc.pathId = newPathId;
    updatedDoc.description = teamDoc.description;
    updatedDoc.type = teamDoc.type;
    updatedDoc.updatedByUserId = userId;
    updatedDoc.updatedBy = userEmail;
    updatedDoc.updateDate = new Date(moment.utc());
    Users.isUserAllowed(userId, teamId)
      .then(function(result){
        if (!result) {
          return Promise.reject({'error':'User is not allowed to modify team.'});
        }
        if (_.isEmpty(updatedDoc.name)) {
          return Promise.reject({
            errors: {
              name: {message:'This team name is required.'}
            }
          });
        }
        var promiseArray = [];
        promiseArray.push(self.getTeam(teamId));
        promiseArray.push(self.hasChildrenByPathId(teamDoc.pathId));
        promiseArray.push(Iterations.hasIterations(teamId));
        promiseArray.push(Assessments.hasAssessments(teamId));
        return Promise.all(promiseArray);
      })
      .then(function(results){
        var team = results[0];
        var hasChildren = results[1];
        var hasIterations = results[2];
        var hasAssessments = results[3];
        oldPathId = team.pathId;
        parentPath = team.path;
        if (updatedDoc.type == 'squad' && team.type == null && hasChildren)
          return Promise.reject({
            errors: {
              type: {message:'Cannot change this team into a squad team. Child team has been entered for this team.'}
            }
          });
        if (updatedDoc.type != 'squad' && team.type == 'squad' && (hasIterations || hasAssessments))
          return Promise.reject({
            errors: {
              type: {message:'Cannot change this team into a non squad team. Iteration and/or assessment information has been entered for this team.'}
            }
          });
        return Team.findByIdAndUpdate({'_id': teamId}, {'$set': updatedDoc}, {new:true}).exec();
      })
      .then(function(result){
        // //********** BEGIN UNCOMMENT THIS SECTION IF WE NEED pathId IN-SYNC WITH ACTUAL TEAM NAME **********************
        // if (!_.isEqual(oldPathId, newPathId))
        //   resolve (updateTeamPathIds(parentPath, oldPathId, newPathId, user));
        // else
        // //********** END UNCOMMENT THIS SECTION IF WE NEED pathId IN-SYNC WITH ACTUAL TEAM NAME **********************
        resolve (result);
      })
      .catch( /* istanbul ignore next */ function(err){
        if (err.name === 'MongoError' && err.code === 11000)
          reject({
            errors: {
              name: {message:'This team name already exists or is too similar to another team. Please enter a different team name.'}
            }
          });
        else
          reject(err);
      });
  });
};

module.exports.softDelete = function(teamDoc, user) {
  return new Promise(function(resolve, reject){
    var updatedDoc = {};
    if (_.isEmpty(teamDoc) || _.isEmpty(teamDoc._id)) {
      reject({'error': 'Team ID is required.'});
    }
    var teamId = teamDoc._id;
    var userId = user ? user['ldap']['uid'].toUpperCase() : '';
    var userEmail = user ? user['shortEmail'].toLowerCase() : '';
    updatedDoc.docStatus = 'delete';
    updatedDoc.updatedByUserId = userId;
    updatedDoc.updatedBy = userEmail;
    updatedDoc.updateDate = new Date(moment.utc());
    var parentPathId = '';
    var parentPath = '';
    Users.isUserAllowed(userId, teamId)
      .then(function(result){
        if (!result) {
          return Promise.reject({'error':'User is not allowed to delete team.'});
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
          }, docStatus:{$ne:'delete'}
        };
        var promiseArray = [];
        promiseArray.push(Team.find(query).exec());
        _.each(iterations, function(iter){
          promiseArray.push(Iterations.softDelete(iter._id, user));
        });
        _.each(assessments, function(as){
          console.log(as._id, user);
          promiseArray.push(Assessments.softDelete(as._id, user));
        });
        return Promise.all(promiseArray);
      })
      .then(function(results){
        var teams = results[0];
        var promiseArray = [];
        promiseArray.push(Team.update({'_id': teamId}, {'$set': updatedDoc}).exec());
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
        resolve({'ok': 'Delete successfully'});
      })
      .catch(function(err){
        reject(err);
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
    Users.isUserAllowed(userId, teamId)
    .then(function(allowed){
      if (!allowed) {
        return Promise.reject({'error':'User is not allowed to modify team links.'});
      }
      var tmpLinks = [];
      var pattern = /^((http|https):\/\/)/;
      _.each(links, function(data,idx,ls) {
        var str = data.linkUrl + process.hrtime().toString();
        var hashId = crypto.createHash('md5').update(str).digest('hex');
        var obj = {};
        obj.id = (data.id !== undefined) ? data.id : hashId;
        if (data._id !== undefined) {
          obj._id = data._id;
        }
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
      // return Team.update({'_id': teamId},{'$set': updateTeam}).exec();
      return Team.findByIdAndUpdate({'_id': teamId},{'$set': updateTeam},{new:true}).exec();
    })
    .then(function(result){
      return resolve(result);
    })
    .catch( /* istanbul ignore next */ function(err){
      return reject(err);
    });
  });
};

module.exports.deleteImportantLinks = function(teamId, user, links) {
  return new Promise(function(resolve, reject){
    /**
     *
     * @param teamId - team id to modify
     * @param user - user id of the one who is doing the action
     * @param links - array of link IDs
     * @returns - modified team document
     */
    var errorLists = {};
    errorLists['error'] = {};
    var userId = user['ldap']['uid'].toUpperCase();
    var userEmail = user['shortEmail'].toLowerCase();
    var validResult = validateDelImportantLinks(teamId, userId, links);
    if (validResult && validResult['error'] !== undefined) return reject(validResult);

    //check if user is allowed to edit team
    Users.isUserAllowed(userId, teamId)
    .then(function(allowed){
      loggers.get('models').verbose('User ' + userEmail + ' is allowed to edit team ' + teamId + '. Proceed with modification');
      if (!allowed) {
        return Promise.reject({'error':'User is not allowed to modify team links.'});
      }
      return allowed;
    })
    .then(function(){
      return module.exports.getTeam(teamId);
    })
    .then(function(teamDetails){
      if (!_.isEmpty(teamDetails.links)){
        var curlinkData = teamDetails.links;
        var tmpcurlinkData = _.clone(teamDetails.links);
        var tmpLinks = [];
        var deletedIds = _.pluck(links, 'id');
        var failDeleteLinkIds = [];
        var errmsg;
        _.each(curlinkData, function(value, key, list){
          if (_.contains(deletedIds, value.id)){
            delete curlinkData[key];
          }
        });

        _.each(curlinkData, function(value, key, list){
          if (value !== undefined){
            tmpLinks.push(value);
          }
        });

        var currlinkData = _.pluck(tmpcurlinkData, 'id');
        _.each(deletedIds, function(value, key, list) {
          if (!_.contains(currlinkData, value)) {
            failDeleteLinkIds.push(value);
          }
        });
        if (failDeleteLinkIds.length > 0) {
          failDeleteLinkIds = _.reject(failDeleteLinkIds, _.isUndefined);
          if (failDeleteLinkIds && failDeleteLinkIds.length > 0) {
            errmsg = 'The following Link ID does not exist in the database: ' + failDeleteLinkIds.join(',');
          } else {
            errmsg = 'Link ID not found';
          }
          errorLists['error']['links'] = [errmsg];
          return Promise.reject(errorLists);
        } else {
          var updateTeam = {
            'links': tmpLinks,
            'updatedByUserId': userId,
            'updatedBy': userEmail,
            'updateDate': new Date(moment.utc())
          };
          // return Team.update({'_id': teamId},{'$set': updateTeam}).exec();
          return Team.findByIdAndUpdate({'_id': teamId},{'$set': updateTeam},{new:true}).exec();
        }
      } else {
        var deletedIds = _.pluck(links, 'id');
        var errmsg;
        deletedIds = _.reject(deletedIds, _.isUndefined);
        if (deletedIds && deletedIds.length > 0) {
          errmsg = 'The following Link ID does not exist in the database: ' + deletedIds.join(',');
        } else {
          errmsg = 'Link ID not found';
        }
        errorLists['error']['links'] = [errmsg];
        return Promise.reject(errorLists);
      }
    })
    .then(function(result) {
      return resolve(result);
    })
    .catch( /* istanbul ignore next */ function(err){
      return reject(err);
    });
  });
};

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
          tmpError.push({linkUrl: errorLinks['errors']['linkUrl'].message});
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

var validateDelImportantLinks = function(teamId, userId, links) {
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
  }
  if (_.isEmpty(links)){
    errorLists['error']['links'] = ['Link ID is required'];
    loggers.get('models').verbose(errorLists);
    return errorLists;
  } else {
    if (!_.isArray(links)){
      errorLists['error']['links'] = ['Invalid links'];
      loggers.get('models').verbose(errorLists);
      return errorLists;
    }
  }
  return true;
};

module.exports.associateTeams = function(parentTeamId, childTeamId, user) {
  return new Promise(function(resolve, reject){
    var userId = user ? user['ldap']['uid'].toUpperCase() : '';
    var userEmail = user ? user['shortEmail'].toLowerCase() : '';
    if (_.isEmpty(userId)) {
      reject({
        errors: {
          userId: {message: 'The user id cannot be empty.'}
        }
      });
    } else if (_.isEmpty(childTeamId)){
      reject({
        errors: {
          path: {message:'Child team ID is required.'}
        }
      });
    } else if (_.isEmpty(parentTeamId)) {
      reject({
        errors: {
          path: {message:'Parent team ID is required.'}
        }
      });
    } else {
      var promiseArray = [];
      var oldChildPath = '';
      var newChildPath = '';
      var parentPath = '';
      var parentPathId = '';
      var childPathId = '';
      var childPath = '';
      promiseArray.push(Users.isUserAllowed(userId, parentTeamId));
      promiseArray.push(Users.isUserAllowed(userId, childTeamId));
      promiseArray.push(self.getTeam(parentTeamId));
      promiseArray.push(self.getTeam(childTeamId));
      Promise.all(promiseArray)
        .then(function(results){
          var hasParentAccess = results[0];
          var hasChildAccess = results[1];
          var parentTeam = results[2];
          var childTeam = results[3];
          if (_.isEmpty(parentTeam)) {
            return Promise.reject({
              errors: {
                path: {message:'Parent team was already deleted.'}
              }
            });
          } else if (_.isEmpty(childTeam)) {
            return Promise.reject({
              errors: {
                path: {message:'Child team was already deleted.'}
              }
            });
          } else  if (!hasParentAccess && !hasChildAccess) {
            return Promise.reject({'error':'User is not allowed to modify relationships for either ' + parentTeam.name + ' or ' + childTeam.name + '.'});
          } else if (parentTeam.type == 'squad') {
            return Promise.reject({
              errors: {
                path: {message:'Parent team has been updated as a squad team.  Squad teams cannot be selected as parent team.'}
              }
            });
          // } else if (!_.isEmpty(childTeam.path)) {
          //   return reject({
          //     errors: {
          //       path: {message:'Child team has been updated with another parent team.'}
          //     }
          //   });
          }
          parentPath = parentTeam.path;
          parentPathId = parentTeam.pathId;
          childPathId = childTeam.pathId;
          childPath = childTeam.path;
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
              }, docStatus:{$ne:'delete'}
            };
            var promiseArray = [];
            promiseArray.push(
              Team.update({_id: childTeam._id}, {
                $set:
                {
                  path: newChildTeamPath,
                  updatedBy: userEmail,
                  updatedByUserId: userId,
                  updateDate: new Date(moment.utc())
                }
              }).exec());
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
              if (_.isEqual(team.pathId, parentPathId)) {
                promiseArray.push(
                  Team.update({_id: team._id}, {
                    $set:
                    {
                      path: newPath,
                      updatedBy: userEmail,
                      updatedByUserId: userId,
                      updateDate: new Date(moment.utc())
                    }
                  }).exec());
              } else
                promiseArray.push(Team.update({_id: team._id}, {$set: {path: newPath}}).exec());
            });
            return Promise.all(promiseArray);
          } else {
            return true;
          }
        })
        .then(function(results){
          return Team.find({$or: [{_id:parentTeamId}, {_id:childTeamId}]}).exec();
        })
        .then(function(results){
          //resolve({'ok':'Updated Successfully'});
          resolve(results);
        })
        .catch( /* istanbul ignore next */ function(err) {
          reject(err);
        });
    }
  });
};

// module.exports.getDesigner = function() {
//   return new Promise(function(resolve, reject){
//     var designer = [];
//     // var dlist = ['Designer', 'UX Designer', 'UX Visual Designer', 'FE Developer', 'Lead designer'];
//     // var dlist = ['Developer'];
//     // var regex = new RegExp(',agileandtalentdomain-1753,');
//     // Team.find({'path': regex, 'docStatus': {$ne:'delete'}}).exec()
//     //   .then(function(teams){
//     //     _.each(teams, function(team){
//     //       _.each(team.members, function(member){
//     //         if (dlist.indexOf(member.role) >= 0) {
//     //           var pd = {
//     //             'name': member.name,
//     //             'id': member.userId,
//     //             'email': member.email,
//     //             'role': member.role
//     //           };
//     //           var dup = false;
//     //           _.find(designer, function(d){
//     //             if (d.id == pd.id) {
//     //               dup = true;
//     //               return;
//     //             }
//     //           });
//     //           if (!dup) {
//     //             designer.push(pd);
//     //           }
//     //         }
//     //       });
//     //     });
//     //     resolve(designer);
//     //   })
//     //   .catch(function(err){
//     //     reject(err);
//     //   });
//     var allPath = [];
//     Team.find({'docStatus': {$ne:'delete'}}).exec()
//       .then(function(teams){
//         var pps = [];
//         allPath = _.uniq(_.pluck(teams, 'pathId'));
//         _.each(teams, function(team){
//           if (team.path != null) {
//             var parray = (team.path.substring(1, team.path.length-1)).split(',');
//             if (parray.length > 0) {
//               _.each(parray, function(a){
//                 if (allPath.indexOf(a) < 0) {
//                   pps.push(a);
//                 }
//               });
//             }
//           }
//         });
//         resolve(pps);
//       })
//       .catch(function(err){
//         reject(err);
//       });
//   });
// };

module.exports.removeAssociation = function(childTeamId, user) {
  return new Promise(function(resolve, reject){
    var userId = user ? user['ldap']['uid'].toUpperCase() : '';
    var userEmail = user ? user['shortEmail'].toLowerCase() : '';
    if (_.isEmpty(userId)) {
      reject({
        errors: {
          userId: {message: 'The user id cannot be empty.'}
        }
      });
    } else if (_.isEmpty(childTeamId)){
      reject({
        errors: {
          path: {message:'Child team ID is required.'}
        }
      });
    } else {
      // var promiseArray = [];
      // var oldChildPath = '';
      // var newChildPath = '';
      // var parentPathId = '';
      // // promiseArray.push(Users.isUserAllowed(userId, parentTeamId));
      // promiseArray.push(Users.isUserAllowed(userId, childTeamId));
      // // promiseArray.push(self.getTeam(parentTeamId));
      // promiseArray.push(self.getTeam(childTeamId));
      // Promise.all(promiseArray)
      //   .then(function(results){
      //     // var hasParentAccess = results[0];
      //     var hasChildAccess = results[0];
      //     // var parentTeam = results[2];
      //     var childTeam = results[1];
      //     // if (_.isEmpty(parentTeam)) {
      //     //   return reject({
      //     //     errors: {
      //     //       path: {message:'Parent team was already deleted.'}
      //     //     }
      //     //   });
      //     // } else
      //     if (_.isEmpty(childTeam)) {
      //       return reject({
      //         errors: {
      //           path: {message:'Child team was already deleted.'}
      //         }
      //       });
      //     // } else  if (!hasParentAccess && !hasChildAccess) {
      //     } else  if (!hasChildAccess) {
      //       return reject({'error':'User is not allowed to modify relationships for ' + childTeam.name + '.'});
      //     // } else if (parentTeam.type == 'squad') {
      //     //   return reject({
      //     //     errors: {
      //     //       path: {message: parentTeam.name + ' team was updated as a squad team.  Squad teams cannot be selected as parent team.'}
      //     //     }
      //     //   });
      //     }
      //     else if (_.isEmpty(childTeam.path)) {
      //       return reject({
      //         errors: {
      //           path: {message:'Child team was updated and any team association was removed.'}
      //         }
      //       });
      //     // } else if (!_.isEmpty(childTeam.path) && childTeam.path.indexOf(parentPathId) == -1) {
      //     //   return reject({
      //     //     errors: {
      //     //       path: {message: childTeam.name + ' team was updated and is currently not related to ' + parentTeam.name + '.'}
      //     //     }
      //     //   });
      //     }
      //     // parentPathId = parentTeam.pathId;
      //     oldChildPath = childTeam.path + childTeam.pathId + ',';
      //     newChildPath = ',' + childTeam.pathId + ',';
      //     var query = {
      //       'path' : {
      //         '$regex' : oldChildPath
      //       }, docStatus:{$ne:'delete'}
      //     };
      //     var promiseArray = [];
      //     promiseArray.push(Team.update({_id: childTeam._id}, {$set: {path: null}}).exec());
      //     promiseArray.push(Team.find(query).exec());
      //     return Promise.all(promiseArray);
      //   })
      //   .then(function(results) {
      //     if (!_.isEmpty(results[1])) {
      //       var promiseArray = [];
      //       _.each(results[1], function(team){
      //         var oldPath = team.path;
      //         var newPath = oldPath.replace(oldChildPath, newChildPath);
      //         // if (_.isEqual(team.pathId, parentPathId)) {
      //         //   promiseArray.push(
      //         //     Team.update({_id: team._id}, {
      //         //       $set:
      //         //       {
      //         //         path: newPath,
      //         //         updatedBy: userEmail,
      //         //         updatedByUserId: userId,
      //         //         updateDate: new Date(moment.utc())
      //         //       }
      //         //     }).exec());
      //         // } else
      //           promiseArray.push(Team.update({_id: team._id}, {$set: {path: newPath}}).exec());
      //       });
      //       return Promise.all(promiseArray);
      //     } else {
      //       return true;
      //     }
      //   })
      //   .then(function(results){
      //     return Team.find({$or: [{_id:parentTeamId}, {_id:childTeamId}]}).exec();
      //   })
      //   .then(function(results){
      //     //resolve({'ok':'Updated Successfully'});
      //     resolve(results);
      //   })
      //   .catch( /* istanbul ignore next */ function(err){
      //     reject(err);
      //   });

      var promiseArray = [];
      var oldChildPath = '';
      var newChildPath = '';
      var oldParentPathId = null;
      Users.isUserAllowed(userId, childTeamId)
        .then(function(result){
          if (!result) {
            return Promise.reject({
              errors: {
                path: {message: 'You dont have access to remove parent association for this team.'}
              }
            });
          }
          return self.getTeam(childTeamId);
        })
        .then(function(team){
          if (_.isEmpty(team))
            return Promise.reject({
              errors: {
                path: {message:'Child team was already deleted.'}
              }
            });
          else if (_.isEmpty(team.path))
            return Promise.reject({
              errors: {
                path: {message:'Child team may have been updated and any team association was removed.'}
              }
            });
          oldChildPath = team.path + team.pathId + ',';
          newChildPath = ',' + team.pathId + ',';
          var parents = team.path.split(',');
          oldParentPathId = parents[parents.length - 2];
          var query = {
            'path' : {
              '$regex' : oldChildPath
            }, docStatus:{$ne:'delete'}
          };
          var promiseArray = [];
          promiseArray.push(
            Team.update({_id: team._id}, {
              $set:
              {
                path: null,
                updatedBy: userEmail,
                updatedByUserId: userId,
                updateDate: new Date(moment.utc())
              }
            }).exec());
          promiseArray.push(Team.find(query).exec());
          return Promise.all(promiseArray);
        })
        .then(function(results) {
          if (!_.isEmpty(results[1])) {
            var promiseArray = [];
            _.each(results[1], function(team){
              var oldPath = team.path;
              var newPath = oldPath.replace(oldChildPath, newChildPath);
              if (_.isEqual(team.pathId, oldParentPathId)) {
                promiseArray.push(
                  Team.update({_id: team._id}, {
                    $set:
                    {
                      path: newPath,
                      updatedBy: userEmail,
                      updatedByUserId: userId,
                      updateDate: new Date(moment.utc())
                    }
                  }).exec());
              } else
                promiseArray.push(Team.update({_id: team._id}, {$set: {path: newPath}}).exec());
            });
            return Promise.all(promiseArray);
          } else {
            return true;
          }
        })
        .then(function(results){
          return Team.find({$or: [{pathId:oldParentPathId}, {_id:childTeamId}]}).exec();
        })
        .then(function(results){
          //resolve({'ok':'Updated Successfully'});
          resolve(results);
        })
        .catch( /* istanbul ignore next */ function(err){
          return reject(err);
        });
    }
  });
};
