var _ = require('underscore');
var Promise = require('bluebird');
var mongoose = require('mongoose');
var loggers = require('../../middleware/logger');
var userModel = require('./users.js');
var moment = require('moment');
var iteration_schema = require('./validate_rules/iteration.js');
var util = require('../../helpers/util');
var dateFormat = 'YYYY-MM-DD HH:mm:ss';
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

function isIterationNumExist(iteration_name, iterData) {
  var duplicate = false;
  _.find(iterData, function(iter){
    if (iter.name == iteration_name) {
      duplicate = true;
    }
  });
  return duplicate;
};

var iterationSchema = new Schema(iteration_schema.iterationSchema);

var iterationModel = mongoose.model('iterations', iterationSchema);

var iteration = {
  getByIterInfo: function(teamId) {
    return new Promise(function(resolve, reject) {
      if (teamId) {
        iterationModel.find({'teamId':teamId})
          .then(function(results){
            successLogs('[iterationModel.getByIterInfo] Team iteration docs obtained');
            resolve(results);
          })
          .catch(function(err){
            reject(formatErrMsg(err.message));
          });
      } else {
        infoLogs('[getByIterInfo] Getting all team iterations docs');
        iterationModel.find()
          .then(function(results){
            successLogs('[iterationModel.getByIterInfo] Team iteration docs obtained');
            resolve(results);
          })
          .catch(function(err){
            reject(formatErrMsg(err.message));
          });
      }
    });
  },

  get: function(docId) {
    return new Promise(function(resolve, reject) {
      iterationModel.find({'_id':docId})
        .then(function(body) {
          resolve(body);
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
        'startDate': {
          '$gte': moment(new Date(startkey)).format(dateFormat)
        },
        'endDate': {
          '$lte': moment(new Date(endkey)).format(dateFormat)
        }
      };
      iterationModel.find(queryrequest)
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

  add: function(data, user) {
    return new Promise(function(resolve, reject) {
      data['createDate'] = moment(new Date()).format(dateFormat);
      data['updateDate'] = moment(new Date()).format(dateFormat);
      userModel.findUserByEmail((user.shortEmail).toLowerCase())
      .then(function(userInfo){
        if (userInfo == null) {
          var msg = 'This user is not in the database: ' + (user.shortEmail).toLowerCase();
          reject(formatErrMsg(msg));
        } else {
          data['createdBy'] = userInfo.email;
          data['createdByUserId'] = userInfo.userId;
          data['updatedBy'] = userInfo.email;
          data['updatedByUserId'] = userInfo.userId;
          return util.isUserAllowed(userInfo.email, data['teamId']);
        }
      })
      .then(function(validUser){
        if (validUser) {
          return iteration.getByIterInfo(data['teamId']);
        } else {
          var msg = 'This user is not allowed to add iteration: ' + (user.shortEmail).toLowerCase();
          reject(formatErrMsg(msg));
        }
      })
      .then(function(iterData){
        if (iterData != undefined && iterData.length > 0) {
          var duplicate = isIterationNumExist(data['name'], iterData);
          if (duplicate) {
            var msg = 'Iteration number/identifier: ' + data['name'] + ' already exists';
            return reject(formatErrMsg(msg));
          }
        } else {
          return iterationModel.create(data);
        }
      })
      .then(function(result){
        successLogs('[iterationModels.add] New iteration doc created');
        resolve(body);
      })
      .catch( /* istanbul ignore next */ function(err){
        loggers.get('models').error('[iterationModel.add] Err:', err);
        var msg = err.message;
        reject(formatErrMsg(msg));
      });
    });
  }
};

module.exports = iteration;
