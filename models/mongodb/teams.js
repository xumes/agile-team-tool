'use strict';
var _ = require('underscore');
var Promise = require('bluebird');
var mongoose = require('mongoose');
var Schema   = mongoose.Schema;
// var loggers = require('../middleware/logger');

// Just needed so that corresponding test could run
require('../../settings');

/*
  Team Schema
*/

var memberSchema = {
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
};

var TeamSchema = new Schema({
  cloudantId: {
    type: String
  },
  name: {
    type: String,
    required: [true, 'Name is required.']
  },
  pathId: {
    type: String,
    unique: true, //declares unique index
    required: [true, 'Email is required.']
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

/*
  Schema getter methods
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

/*
  Schema setter methods
*/

