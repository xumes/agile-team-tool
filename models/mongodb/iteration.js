var _ = require('underscore');
var Promise = require('bluebird');
var mongoose = require('mongoose');
var loggers = require('../../middleware/logger');
var userModel = require('./users.js');
var moment = require('moment');
var util = require('../../helpers/util');
var dateFormat = 'YYYY-MM-DD HH:mm:ss';
var Schema   = mongoose.Schema;
require('../../settings');

var iterationSchema = {
  cloudantId: {
    type: String
  },
  createDate: {
    type: Date,
    required: [true, 'Creation date is required.']
  },
  createdByUserId: {
    type: String,
    required: [true, 'UserId of creator is required.']
  },
  createdBy: {
    type: String,
    required: [true, 'Name of creator is required.']
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
    required: [true, 'Start date of iteration is required.']
  },
  endDate: {
    type: Date,
    required: [true, 'End date of iteration is required.']
  },
  name: {
    type: String,
    required: [true, 'Name of iteration is required.']
  },
  teamId: {
    type: Schema.Types.ObjectId,
    required: [true, 'TeamId of iteration is required.']
  },
  memberCount: {
    type: Number,
    required: [true, 'Member count is required.']
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
};

var formatErrMsg = function(msg) {
  loggers.get('model-iteration').error('Error: ', msg);
  return {
    error: msg
  };
};

var successLogs = function(msg) {
  loggers.get('model-iteration').info('Success: ' + msg);
  return;
};

var infoLogs = function(msg) {
  loggers.get('model-iteration').info(msg);
  return;
};

function isIterationNumExist(iteration_name, iterData, updateId) {
  var duplicate = false;
  _.find(iterData, function(iter){
    if (iter.name == iteration_name) {
      if (updateId) {
        if (!updateId.equals(iter._id)) {
          duplicate = true;
        }
      } else {
        duplicate = true;
      }
    }
  });
  return duplicate;
};

var iteration_schema = new Schema(iterationSchema);

var iterationModel = mongoose.model('iterations', iteration_schema);

var iteration = {
  getByIterInfo: function(teamId, limit) {
    return new Promise(function(resolve, reject) {
      if (teamId) {
        var objTeamId = Schema.Types.ObjectId;
        if (mongoose.Types.ObjectId.isValid(teamId)) {
          objTeamId = teamId;
        } else {
          objTeamId = mongoose.Types.ObjectId(teamId);
        }
        var request = {
          'teamId': objTeamId
        };
        iterationModel.find(request).exec()
          .then(function(results){
            successLogs('[iterationModel.getByIterInfo] Team iteration docs obtained');
            resolve(results);
          })
          .catch( /* istanbul ignore next */ function(err){
            reject(formatErrMsg(err.message));
          });
      } else {
        infoLogs('[getByIterInfo] Getting all team iterations docs');
        if (limit) {
          iterationModel.find().limit(limit).exec()
            .then(function(results){
              successLogs('[iterationModel.getByIterInfo] Team iteration docs obtained by limit number');
              resolve(results);
            })
            .catch( /* istanbul ignore next */ function(err){
              reject(formatErrMsg(err.message));
            });
        } else {
          /* istanbul ignore next */ iterationModel.find().exec()
            .then( /* istanbul ignore next */ function(results){
              successLogs('[iterationModel.getByIterInfo] Team iteration docs obtained');
              resolve(results);
            })
            .catch( /* istanbul ignore next */ function(err){
              reject(formatErrMsg(err.message));
            });
        }
      }
    });
  },

  get: function(docId) {
    return new Promise(function(resolve, reject) {
      iterationModel.findOne({'_id':docId}).exec()
        .then(function(result) {
          resolve(result);
        })
        .catch( /* istanbul ignore next */ function(err) {
          /* cannot simulate Cloudant error during testing */
          var msg = err.message;
          reject(formatErrMsg(msg));
        });
    });
  },

  getCompletedIterationsByKey: function(startkey, endkey) {
    return new Promise(function(resolve, reject) {
      var queryrequest = {
        '$or': [
          {'docStatus': null},
          {'docStatus': {'$ne': 'delete'}}
        ],
        'status': 'Completed',
        'endDate': {
          '$gte': moment(new Date(startkey)).format(dateFormat),
          '$lte': moment(new Date(endkey)).format(dateFormat)
        }
      };
      iterationModel.find(queryrequest).exec()
        .then(function(body) {
          successLogs('[iterationModel.getCompletedIterationsByKey] Completed iteration docs obtained');
          resolve(body);
        })
        .catch( /* istanbul ignore next */ function(err) {
          /* cannot simulate Cloudant error during testing */
          var msg = err.message;
          reject(formatErrMsg(msg));
        });
    });
  },

  add: function(data, user, updateId) {
    return new Promise(function(resolve, reject) {
      data['createDate'] = moment().format(dateFormat);
      data['updateDate'] = moment().format(dateFormat);
      data['status'] = iteration.calculateStatus(data);
      userModel.findUserByEmail((user.shortEmail).toLowerCase())
      .then(function(userInfo){
        if (userInfo == null) {
          var msg = 'This user is not in the database: ' + (user.shortEmail).toLowerCase();
          return Promise.reject(formatErrMsg(msg));
        } else {
          data['createdBy'] = userInfo.email;
          data['createdByUserId'] = userInfo.userId;
          data['updatedBy'] = userInfo.email;
          data['updatedByUserId'] = userInfo.userId;
          return userModel.isUserAllowed(userInfo.email, data['teamId']);
        }
      })
      .then(function(validUser){
        if (validUser) {
          return iteration.getByIterInfo(data['teamId']);
        } else {
          var msg = 'This user is not allowed to add iteration: ' + (user.shortEmail).toLowerCase();
          return Promise.reject(formatErrMsg(msg));
        }
      })
      .then(function(iterData){
        if (iterData != undefined && iterData.length > 0) {
          var duplicate = isIterationNumExist(data['name'], iterData, updateId);
          if (duplicate) {
            var msg = 'Iteration number/identifier: ' + data['name'] + ' already exists';
            return Promise.reject(formatErrMsg(msg));
          }
        }
        if (updateId) {
          return iterationModel.where({'_id': updateId}).update({'$set':data});
        } else {
          return iterationModel.create(data);
        }
      })
      .then(function(result){
        if (!updateId) {
          successLogs('[iterationModels.add] New iteration doc created');
        }
        return resolve(result);
      })
      .catch( /* istanbul ignore next */ function(err){
        if (err.message) {
          var msg = err.message;
        } else {
          var msg = err.error;
        }
        if (!updateId) {
          loggers.get('models').error('[iterationModel.add] Err:', msg);
        }
        reject(formatErrMsg(msg));
      });
    });
  },

  delete: function(docId) {
    return new Promise(function(resolve, reject) {
      if (!docId) {
        var msg = {
          _id: ['_id/_rev is missing']
        };
        reject(formatErrMsg(msg));
      } else {
        iterationModel.remove({'_id': docId})
          .then(function(body) {
            // console.log('iteration.delete RESULT:', body);
            //loggers.get('models').verbose('[iterationModel.delete] result:', body._id);
            resolve(body);
          })
          .catch( /* istanbul ignore next */ function(err) {
          /* cannot simulate Cloudant error during testing */
            var msg = err.message;
            // console.log('iteration.delete err:', err);
            //loggers.get('models').error('[iterationModel.delete]:', err);
            reject(formatErrMsg(msg));
          });
      }
    });
  },

  deleteByFields: function(request) {
    return new Promise(function(resolve, reject) {
      if (!request) {
        var msg = 'request is missing';
        reject(formatErrMsg(msg));
      } else {
        iterationModel.findOneAndRemove(request).exec()
          .then(function(body) {
            // console.log('iteration.delete RESULT:', body);
            //loggers.get('models').verbose('[iterationModel.delete] result:', body._id);
            resolve(body);
          })
          .catch( /* istanbul ignore next */ function(err) {
          /* cannot simulate Cloudant error during testing */
            var msg = err.message;
            // console.log('iteration.delete err:', err);
            //loggers.get('models').error('[iterationModel.delete]:', err);
            reject(formatErrMsg(msg));
          });
      }
    });
  },

  edit: function(docId, data, user) {
    return new Promise(function(resolve, reject) {
      iteration.add(data, user, docId)
        .then(function(result){
          successLogs('[iterationModels.edit] Iteration doc has been eidted');
          return resolve(result);
        })
        .catch( /* istanbul ignore next */ function(err){
          loggers.get('models').error('[iterationModel.edit] Err:', err);
          reject(err);
        });
    });
  },

  searchTeamIteration: function(p) {
    return new Promise(function(resolve, reject) {
      var queryrequest = new Object();
      if (p.id) {
        var objTeamId = Schema.Types.ObjectId;
        if (mongoose.Types.ObjectId.isValid(p.id)) {
          queryrequest['teamId'] = p.id;
        } else {
          queryrequest['teamId'] = mongoose.Types.ObjectId(p.id);
        }
      }
      if (p.status) {
        queryrequest['status'] = p.status;
      }
      var startdate = p.startdate;
      var enddate = p.enddate;
      if (startdate && enddate) {
        queryrequest['endDate'] = {
          '$gte': moment(new Date(startdate)).format(dateFormat),
          '$lte': moment(new Date(enddate)).format(dateFormat)
        };
      } else if (startdate) {
        queryrequest['endDate'] = moment(new Date(startdate)).format(dateFormat);
      } else if (enddate) {
        queryrequest['endDate'] = moment(new Date(enddate)).format(dateFormat);
      }
      iterationModel.find(queryrequest).sort('-endDate').exec()
        .then(function(body) {
          successLogs('[iterationModel.searchTeamIteration] Completed iteration docs obtained');
          resolve(body);
        })
        .catch( /* istanbul ignore next */ function(err) {
          /* cannot simulate Cloudant error during testing */
          var msg = err.message;
          reject(formatErrMsg(msg));
        });
      // }
    });
  },

  calculateStatus: function(data) {
    var iteration_end_dt = data['endDate'];
    var nbr_stories_dlvrd = data['deliveredStories'] || 0;
    var nbr_story_pts_dlvrd = data['storyPointsDelivered'] || 0;
    var nbr_dplymnts = data['deployments'] || 0;
    var nbr_defects = data['defects'] || 0;
    var team_sat = data['teamSatisfaction'] || 0;
    var client_sat = data['clientSatisfaction'] || 0;
    var status;
    var endDate = new Date(iteration_end_dt);
    var d1 = moment(endDate).format(dateFormat);
    //var d2 = util.getServerTime();
    var d2 = moment().format(dateFormat);
    var d1 = moment(d1, dateFormat);
    var d2 = moment(d2, dateFormat);
    if (d1 <= d2) {
      // console.log('endDate is <= than serDate');
      var diffDays = d2.diff(d1, 'days');
      // updating status for only having more than 3 days from iteration end date
      if (diffDays > 3) {
        // console.log("diffDays > 3");
        status = 'Completed';
      } else if (nbr_stories_dlvrd != 0 ||
        nbr_story_pts_dlvrd != 0 ||
        nbr_dplymnts != 0 ||
        nbr_defects != 0 ||
        team_sat != 0 ||
        client_sat != 0) {
        status = 'Completed';
      } else {
        status = 'Not complete';
      }
    } else {
      status = 'Not complete';
    }

    return status;
  },

  getNotCompletedIterations: function() {
    return new Promise(function(resolve, reject) {
      var request = {
        'status': 'Not complete',
        'docStatus': {
          '$ne': 'delete'
        }
      };
      iterationModel.find(request).exec()
        .then(function(results){
          resolve(results);
        })
        .catch( /* istanbul ignore next */ function(err){
          reject(err);
        });
    });
  },

  bulkUpdateIterations: function(iterations) {
    return new Promise(function(resolve, reject) {
      var bulk = iterationModel.collection.initializeUnorderedBulkOp();
      if (_.isEmpty(iterations)) {
        resolve([]);
      } else {
        _.each(iterations, function(iteration){
          bulk.find({'_id':iteration._id}).update({'$set':iteration.set});
        });
        bulk.execute(function(error, result){
          if (error) {
            /* istanbul ignore next */
            reject(error);
          } else {
            resolve(result);
          }
        });
      }
    });
  },

  // isValidStartEndDate: function(startdate, enddate, dateFormat, validationErrors) {
  //   var isvalid_startdate = moment(startdate, dateFormat, true).isValid();
  //   var isvalid_enddate = moment(enddate, dateFormat, true).isValid();
  //   if (startdate && !isvalid_startdate) {
  //     if (validationErrors === undefined) {
  //       validationErrors = new Object();
  //     }
  //     if (validationErrors && !validationErrors['startdate']) {
  //       validationErrors['startdate'] = [];
  //     }
  //     validationErrors['startdate'].push('Start date is not a valid date');
  //   }
  //   if (enddate && !isvalid_enddate) {
  //     if (validationErrors === undefined) {
  //       validationErrors = new Object();
  //     }
  //     if (validationErrors && !validationErrors['startdate']) {
  //       validationErrors['enddate'] = [];
  //     }
  //     validationErrors['enddate'].push('End date is not a valid date');
  //   }
  //
  //   return validationErrors;
  // }
};

module.exports = iteration;
