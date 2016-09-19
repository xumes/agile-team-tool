var _ = require('underscore');
var Promise = require('bluebird');
var mongoose = require('mongoose');
var loggers = require('../../middleware/logger');
var Schema   = mongoose.Schema;
require('../../settings');

var formatErrMsg = function(msg) {
  loggers.get('models').error('Error: ', msg);
  return {
    error: msg
  };
};

var successLogs = function(msg) {
  loggers.get('models').verbose('Success: ' + msg);
  return;
};

var infoLogs = function(msg) {
  loggers.get('models').verbose(msg);
  return;
};

var iterationSchema = new Schema({
  cloudantId: {
    type: String
  },
  createDate: {
    type: Date,
    required: [true, 'createDate is required.']
  },
  createdByUserId: {
    type: String,
    required: [true, 'createdByUserId is required']
  },
  createdBy: {
    type: String,
    required: [true, 'createdBy is required']
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
  },
  startDate: {
    type: Date,
    required: [true, 'iteration start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'iteration end date is required']
  },
  name: {
    type: String,
    required: [true, 'iteration name is required']
  },
  teamId: {
    type: String,
    required: [true, 'iteration team id is required']
  },
  memberCount: {
    type: Number,
    required: [true, 'member # is required']
  },
  status: {
    type: String,
    default: 'Not complete'
  },
  committedStories: {
    type: Number,
    default: null
  },
  deliveredStories: {
    type: Number,
    default: null
  },
  commitedStoryPoints: {
    type: Number,
    default: null
  },
  storyPointsDelivered: {
    type: Number,
    default: null
  },
  locationScore: {
    type: Number,
    default: null
  },
  deployments: {
    type: Number,
    default: null
  },
  defects: {
    type: Number,
    default: null
  },
  clientSatisfaction: {
    type: Number,
    default: null
  },
  teamSatisfaction: {
    type: Number,
    default: null
  },
  comment: {
    type: String,
    default: null
  },
  memberChanged: {
    type: Boolean,
    default: false
  },
});

var iterationModel = mongoose.model('iterations', iterationSchema);

var iteration = {
  getByIterInfo: function(teamId) {
    return new Promise(function(resolve, reject) {
      if (teamId) {
        iterationModel.find({'teamId':teamId}, function(err, results){
          if (err) {
            reject(formatErrMsg(err));
          } else {
            successLogs('[iterationModel.getByIterInfo] Team iteration docs obtained');
            resolve(results);
          }
        });
      } else {
        infoLogs('[getByIterInfo] Getting all team iterations docs');
        iterationModel.find(function(err, results){
          if (err) {
            reject(formatErrMsg(err));
          } else {
            successLogs('[getByIterInfo] Team iteration docs obtained');
            resolve(results);
          }
        });
      }
    });
  }
};

module.exports = iteration;
