'use strict';
var _ = require('underscore');
var Promise = require('bluebird');
var mongoose = require('mongoose');
var Schema   = mongoose.Schema;
var util = require('../../helpers/util');
var Users = require('./users');
var Iterations = require('./iterations');
var Assessments = require('./assessments');

// var loggers = require('../middleware/logger');

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
  cloudantId: {
    type: String
  },
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

/*
   exported model functions
*/
module.exports.searchTeamWithName = function(string) {
  return Team.findOne({name: string}).exec();
};

module.exports.getNonSquadTeams = function(optionalProjection) {
  return Team.find({type: {$ne:'squad'}}, optionalProjection).exec();
};

module.exports.getSquadTeams = function(optionalProjection) {
  return Team.find({type: 'squad'}, optionalProjection).exec();
};

//root teams are teams with no parent, non-squad with children
module.exports.getRootTeams = function() {
  return Promise.join(
    Team.find({path: null, type:{$ne:'squad'}}),
    getAllUniquePaths(),
  function(rootedTeams, uniquePaths) {
    uniquePaths = uniquePaths.join(',');
    //indexOf is faster than match apparently
    var res = _.filter(rootedTeams, function(team){
      return uniquePaths.indexOf(team.pathId) >= 0;
    });
    return res;
  });
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


var getChildren = function(pathId) {
  if (_.isEmpty(pathId)) return [];
  else return Team.find({path:new RegExp(','+pathId+',')}).exec();
};

module.exports.updateOrDeleteTeam = function(teamDoc, user, action) {
  return new Promise(function(resolve, reject){
    var userEmail = user['shortEmail'];
    var teamId = updatedTeamDoc['_id'];

    Promise.join(
      module.exports.getTeam(teamId),
      Iterations.getByIterInfo(teamId),
      Assessments.getTeamAssessments(teamId),
      module.exports.getTeam(teamDoc.name),
      getChildren(teamDoc.pathId),
      function(oldTeamDoc, iterations, assessments, teamDocByName, children){
        if (oldTeamDoc.docStatus === 'delete') return reject('Invalid action');
        User.isUserAllowed(userEmail, teamId)
        .then(function(isAllowed){
          if (!isAllowed) return reject('Not allowed');
        });
      }
    );

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
    return Team.find({_id:id}).exec();
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

module.exports.getTeamsByEmail = function(memberEmail) {
  return Team.find({members: {$elemMatch:{email:memberEmail}}}).exec();
};

module.exports.getTeamsByUid = function(uid) {
  return Team.find({members: {$elemMatch:{userId:uid}}}).exec();
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

/**
 * Reformat document to update/delete document structure for BULK operation
 *
 * @param teamId - team id to modify
 * @param userId - user id of the one who is doing the action
 * @param members - array of member user
 * @returns - modified tem document
 */
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

//I think we can refactor the clientside js to use other model functions
module.exports.getLookupIndex = function() {
};
module.exports.getLookupTeamByType = function() {
};

var associateActions = function() {
};
module.exports.associateTeams = function() {
};
