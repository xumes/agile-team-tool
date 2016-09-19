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


/*
  Schema getter methods
*/

module.exports.searchTeamWithName = function(string) {
  return Team.findOne({name: string});
};

module.exports.getNonSquadTeams = function() {
  return Team.find({type: {$ne:'squad'}});
};

module.exports.getSquadTeams = function() {
  return Team.find({type: 'squad'});
};

//root teams are teams with no parent, non-squad with children
module.exports.getRootTeams = function() {
  return Promise.join(
    Team.find({path: null, type:{$ne:'squad'}}),
    Team.find({path: {$ne:null}}, {path:1}),
  function(rootedTeams, subtreeTeams) {
    var uniquePaths = _.uniq(_.pluck(subtreeTeams, 'path'));
    uniquePaths = uniquePaths.join(',');
    //indexOf is faster than match apparently
    var res = _.filter(rootedTeams, function(team){
      return uniquePaths.indexOf(team.pathId) >= 0;
    });
    return res;
  });
};

/*
  Schema setter methods
*/

