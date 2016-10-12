'use strict';
var _ = require('underscore');
var Promise = require('bluebird');
var mongoose = require('mongoose');
var ObjectId = require('mongodb').ObjectID;
var loggers = require('../../middleware/logger');
var Users = require('./users.js');
var moment = require('moment');
var util = require('../../helpers/util');
var dateFormat = 'YYYY-MM-DD HH:mm:ss';
var Schema   = mongoose.Schema;
require('../../settings');

var IterationSchema = {
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
    required: [true, 'Start date of Iteration is required.']
  },
  endDate: {
    type: Date,
    required: [true, 'End date of Iteration is required.']
  },
  name: {
    type: String,
    required: [true, 'Name of Iteration is required.']
  },
  teamId: {
    type: Schema.Types.ObjectId,
    required: [true, 'TeamId of Iteration is required.']
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

function isIterationNumExist(iterationName, iterData, updateId) {
  var duplicate = false;
  _.find(iterData, function(iter){
    if (iter.name == iterationName) {
      if (updateId) {
        if (updateId.toString() != (iter._id).toString()) {
          duplicate = true;
        }
      } else {
        duplicate = true;
      }
    }
  });
  return duplicate;
};

var iterationSchema = new Schema(IterationSchema);

var Iteration = mongoose.model('iterations', iterationSchema);

var IterationExport = {
  getModel: function() {
    return Iteration;
  },

  getByIterInfo: function(teamId, limit) {
    return new Promise(function(resolve, reject) {
      if (teamId) {
        Iteration.find({'teamId': teamId}).sort('endDate').exec()
          .then(function(results){
            loggers.get('model-iteration').verbose('getByIterInfo() - Team Iteration docs obtained. teamId: ' + teamId);
            resolve(results);
          })
          .catch( /* istanbul ignore next */ function(err){
            reject(Error(err));
          });
      }
      else {
        loggers.get('model-iteration').verbose('getByIterInfo() - no teamId, Getting all team Iteration docs');
        if (limit) {
          Iteration.find().limit(limit).exec()
            .then(function(results){
              loggers.get('model-iteration').verbose('getByIterInfo() - Team Iteration docs obtained with limit: ' + limit);
              resolve(results);
            })
            .catch( /* istanbul ignore next */ function(err){
              reject(Error(err));
            });
        }
        else {
          /* istanbul ignore next */ Iteration.find().exec()
            .then( /* istanbul ignore next */ function(results){
              loggers.get('model-iteration').verbose('getByIterInfo() - All team iteration docs obtained');
              resolve(results);
            })
            .catch( /* istanbul ignore next */ function(err){
              reject(Error(err));
            });
        }
      }
    });
  },

  get: function(docId) {
    return Iteration.findOne({'_id':docId}).exec();
  },

  getCompletedIterationByKey: function(startkey, endkey) {
    return new Promise(function(resolve, reject) {
      var qReq = {
        '$or': [
          {'docStatus': null},
          {'docStatus': {'$ne': 'delete'}}
        ],
        'status': 'Completed'
      };
      if (startkey && endkey) {
        qReq['endDate'] = {
          '$gte': moment(new Date(startkey)).format(dateFormat),
          '$lte': moment(new Date(endkey)).format(dateFormat)
        };
      } else if (startkey) {
        qReq['endDate'] = {
          '$gte': moment(new Date(startkey)).format(dateFormat)
        };
      } else if (endkey) {
        qReq['endDate'] = {
          '$lte': moment(new Date(endkey)).format(dateFormat)
        };
      }
      Iteration.find(qReq).exec()
        .then(function(body) {
          loggers.get('model-iteration').verbose('getCompletedIterationByKey() - '+body.length+' Completed Iteration docs obtained');
          resolve(body);
        })
        .catch( /* istanbul ignore next */ function(err) {
          /* cannot simulate Cloudant error during testing */
          reject(Error(err));
        });
    });
  },

  add: function(data, userId) {
    return new Promise(function(resolve, reject) {
      data['createDate'] = moment().format(dateFormat);
      data['updateDate'] = moment().format(dateFormat);
      data['status'] = Iteration.calculateStatus(data);
      Users.findUserByUserId(userId.toUpperCase())
      .then(function(userInfo){
        if (userInfo == null) {
          var msg = 'This user is not in the database: ' + (user.shortEmail).toLowerCase();
          loggers.get('model-iteration').error(msg);
          return Promise.reject(Error(msg));
        }
        else {
          data['createdBy'] = userInfo.email;
          data['createdByUserId'] = userInfo.userId;
          data['updatedBy'] = userInfo.email;
          data['updatedByUserId'] = userInfo.userId;
          return Users.isUserAllowed(userInfo.email, data['teamId']);
        }
      })
      .then(function(validUser){
        if (validUser) {
          return Iteration.getByIterInfo(data['teamId']);
        } else {
          var msg = 'This user is not allowed to add Iteration: ' + (user.shortEmail).toLowerCase();
          loggers.get('model-iteration').error(msg);
          return Promise.reject(msg);
        }
      })
      .then(function(iterData){
        if (iterData != undefined && iterData.length > 0) {
          var duplicate = isIterationNumExist(data['name'], iterData);
          if (duplicate) {
            var msg = 'Iteration number/identifier: ' + data['name'] + ' already exists';
            loggers.get('model-iteration').error(msg);
            return Promise.reject(Error(msg));
          }
        }
      })
      .then(function(result){
        loggers.get('model-iteration').verbose('Iteration added ' + result);
        return resolve(result);
      })
      .catch( /* istanbul ignore next */ function(err){
        loggers.get('model-iteration').error('Iteration add error: ' + err);
        reject(Error(err));
      });
    });
  },

  edit: function(docId, data, userId) {
    return new Promise(function(resolve, reject) {
      Users.isUserAllowed(userId, data['teamId'])
      .then(function(isAllowed){
        if (isAllowed)
          return Iteration.add(data, user, updateId).exec();
        else
          return 'Not allowed';
      })
      .then(function(result){
        return resolve(result);
      })
      .catch( /* istanbul ignore next */ function(err){
        loggers.get('model-iteration').error('Iteration edit error: ' + err);
        return reject(err);
      });
    });
  },

  searchTeamIteration: function(p) {
    var qReq = {};
    if (!_.isEmpty(p.id))
      qReq['teamId'] = new ObjectId(p.id);

    if (!_.isEmpty(p.status))
      qReq['status'] = p.status;

    if (!_.isEmpty(p.startDate) || !_.isEmpty(p.endDate)){
      var startDate = p.startDate;
      var endDate = p.endDate;
      if (startDate && endDate)
        qReq['endDate'] = {
          '$gte': moment(new Date(startDate)).format(dateFormat),
          '$lte': moment(new Date(endDate)).format(dateFormat)
        };
      else if (startDate)
        qReq['endDate'] = {
          '$gte': moment(new Date(startDate)).format(dateFormat)
        };
      else if (enddate)
        qReq['endDate'] = {
          '$lte': moment(new Date(endDate)).format(dateFormat)
        };
    }
    loggers.get('model-iteration').verbose('Querying Iteration:' + JSON.stringify(qReq));
    return Iteration.find(qReq).sort('-endDate').exec();
  },

  calculateStatus: function(data) {
    var Iteration_end_dt = data['endDate'];
    var nbr_stories_dlvrd = data['deliveredStories'] || 0;
    var nbr_story_pts_dlvrd = data['storyPointsDelivered'] || 0;
    var nbr_dplymnts = data['deployments'] || 0;
    var nbr_defects = data['defects'] || 0;
    var team_sat = data['teamSatisfaction'] || 0;
    var client_sat = data['clientSatisfaction'] || 0;
    var status;
    var endDate = new Date(Iteration_end_dt);
    var d1 = moment(endDate).format(dateFormat);
    //var d2 = util.getServerTime();
    var d2 = moment().format(dateFormat);
    var d1 = moment(d1, dateFormat);
    var d2 = moment(d2, dateFormat);
    if (d1 <= d2) {
      // console.log('endDate is <= than serDate');
      var diffDays = d2.diff(d1, 'days');
      // updating status for only having more than 3 days from Iteration end date
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

  getNotCompletedIteration: function() {
    return Iteration.find({'status': 'Not complete', 'docStatus': {'$ne': 'delete'}}).exec();
  },

  bulkUpdateIteration: function(Iteration) {
    return new Promise(function(resolve, reject) {
      var bulk = Iteration.collection.initializeUnorderedBulkOp();
      if (_.isEmpty(Iteration)) {
        resolve([]);
      } else {
        _.each(Iteration, function(Iteration){
          bulk.find({'_id':Iteration._id}).update({'$set':Iteration.set});
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
  // used in tests
  delete: function(docId, userId) {
    return new Promise(function(resolve, reject) {
      if (!docId) {
        var msg = {
          _id: ['_id/_rev is missing']
        };
        loggers.get('model-iteration').error('delete() ' + err);
        reject(Error(err));
      } else {
        Iteration.remove({'_id': docId})
          .then(function(body) {
            resolve(body);
          })
          .catch( /* istanbul ignore next */ function(err) {
          /* cannot simulate Cloudant error during testing */
            loggers.get('model-iteration').error('delete() ' + err);
            reject(Error(err));
          });
      }
    });
  },
  deleteByFields: function(request) {
    return new Promise(function(resolve, reject) {
      if (!request) {
        var msg = 'request is missing';
        loggers.get('model-iteration').error('delete() ' + msg);
        reject(Error(msg));
      }
      else {
        Iteration.findOneAndRemove(request).exec()
          .then(function(body) {
            resolve(body);
          })
          .catch( /* istanbul ignore next */ function(err) {
          /* cannot simulate Cloudant error during testing */
            loggers.get('model-iteration').error('deleteByFields() ' + err);
            reject(Error(err));
          });
      }
    });
  }
};

module.exports = IterationExport;
