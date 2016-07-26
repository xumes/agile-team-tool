"use strict";

var Cloudant = require('cloudant');
var Promise = require('bluebird');
var settings = require('../settings');
var common = require('./common-cloudant');
var _ = require('underscore');
var loggers = require('../middleware/logger');
var validate = require('validate.js');
var moment = require('moment');

var formatErrMsg = function(msg){
  loggers.get('models').info('Error: ' + msg);
  return { error : msg };
};

var successLogs = function(msg){
  loggers.get('models').info('Success: ' + msg);
  return;
};

var infoLogs = function(msg){
  loggers.get('models').info(msg);
  return;
};

var iterationDocRules = require('./validate_rules/iteration.js');

var iteration = {
  getByIterInfo: function(teamId) {
    return new Promise(function(resolve, reject){
      if (!(_.isEmpty(teamId))) {
        infoLogs('[getByIterInfo] Getting team iteration for ' + teamId);
        common.getByViewKey('teams', 'iterinfo', teamId)
        .then(function(body) {
          successLogs('[getByIterInfo] Team iteration docs obtained');
          resolve(body);
        })
        .catch(function(err) {
          /* istanbul ignore next */
          var msg = err.error;
          reject(formatErrMsg(msg));
        });
      } else {
        infoLogs('[getByIterInfo] Getting all team iterations docs');
        common.getByView('teams', 'iterinfo')
        .then(function(body) {
          successLogs('[getByIterInfo] Team iteration docs obtained');
          resolve(body);
        })
        .catch(function(err) {
          /* istanbul ignore next */
          var msg = err.error;
          reject(formatErrMsg(msg));
        });
      }
    });
  },

  get: function(docId) {
    return new Promise(function(resolve, reject){
      common.getRecord(docId)
      .then(function(body) {
        resolve(body);
      })
      .catch(function(err) {
        var msg = err.error;
        reject(formatErrMsg(msg));
      });
    });
  },

  getCompletedIterationsByKey: function(startkey, endkey) {
    return new Promise(function(resolve, reject){
      common.getByViewWithStartOrEndKey('teams', 'getCompletedIterations', startkey, endkey)
      .then(function(body) {
        successLogs('[getCompletedIterationsByKey] Completed iteration docs obtained');
        resolve(body);
      })
      .catch(function(err) {
        /* istanbul ignore next */
        var msg = err.error;
        reject(formatErrMsg(msg));
      });
    });
  },

  isIterationNumExist: function(iteration_name, iterData) {
    var list = [];
    var teamIterInfo = [];
    var tmplist = [];
    for (var i = 0; i < iterData.rows.length; i++) {
      list.push(iterData.rows[i].value);
    }
    teamIterInfo = list;
    var duplicate = false;
    for (var i = 0; i < teamIterInfo.length; i++) {
      tmplist.push(teamIterInfo[i].iteration_name);
      if (teamIterInfo[i].iteration_name == iteration_name) {
        duplicate = true;
        break;
      }
    }
    // console.log('teamIterInfo list:', tmplist);
    return duplicate;
  },

  add: function(data) {
    return new Promise(function(resolve, reject){
      var validationErrors = validate(data, iterationDocRules);
      if (validationErrors) {
        reject(validationErrors);
      } else {
        var iteration_name = data['iteration_name'];
        var team_id = data['team_id'];
        iteration.getByIterInfo(team_id)
        .then(function(iterData) {
          if (iterData != undefined && iterData.rows) {
            var duplicate = iteration.isIterationNumExist(iteration_name, iterData);
            if (duplicate) {
              var msg = "Iteration number/identifier already exists";
              reject(formatErrMsg(msg));
            } else {
              common.addRecord(data)
              .then(function(body) {
                resolve(body);
                // console.log('ADD body:', body);
                successLogs('[add] New iteration doc created');
              })
              .catch(function(err) {
                // formatErrMsg('[add] Err1:', err);
                loggers.get('models').error('[add] Err1: %s', err);
                var msg = err.message;
                reject(formatErrMsg(msg));
              });
            }
          }
        })
        .catch(function(err) {
          // formatErrMsg('[add] Err2:', err);
          loggers.get('models').error('[add] Err2: %s', err);
          var msg = err.message;
          reject(formatErrMsg(msg));
        });
      }
    });
  },

  edit: function(iterationId, data) {
    console.log('EDIT iterationId:', iterationId);
    // console.log('EDIT data:', data);
    return new Promise(function(resolve, reject){
      var validationErrors = validate(data, iterationDocRules);
      if (validationErrors) {
        reject(validationErrors);
      } else {
        common.getRecord(iterationId)
        .then(function(body) {
          if (!_.isEmpty(body)) {
            // loggers.get('models').info('[edit] Team iteration info obtained: ', JSON.stringify(body, null, 4));
            var _rev = body._rev;
            var _id = body._id;
            data._rev = _rev;
            data._id = _id;

            var old_iteration_name = body['iteration_name'].trim();
            var new_iteration_name = data['iteration_name'].trim();
            var team_id = body['team_id'];
            var isNewIterationName = false;
            if (old_iteration_name != new_iteration_name) {
              isNewIterationName = true;
            }
            if (isNewIterationName == false) {
              common.updateRecord(data)
              .then(function(result) {
                resolve(result);
                // console.log('EDIT result1:', result);
                successLogs('Team iteration doc updated');
              })
              .catch(function(err) {
                // console.log('[edit] Err1:', err);
                loggers.get('models').error('[edit] Err1: %s', err);
                var msg = err.message;
                reject(formatErrMsg(msg));
              });
            } else {
              iteration.getByIterInfo(team_id)
              .then(function(iterData) {
                if (iterData != undefined && iterData.rows) {
                  var duplicate = iteration.isIterationNumExist(new_iteration_name, iterData);
                  if (duplicate) {
                    var msg = "Iteration number/identifier already exists";
                    reject(formatErrMsg(msg));
                  } else {
                    common.updateRecord(data)
                    .then(function(result) {
                      resolve(result);
                      // console.log('EDIT result2:', result);
                      successLogs('Team iteration doc updated');
                    })
                    .catch(function(err) {
                      // console.log('[edit] Err2:', err);
                      loggers.get('models').error('[edit] Err2: %s', err);
                      var msg = err.message;
                      reject(formatErrMsg(msg));
                    });
                  }
                }
              })
              .catch(function(err) {
                // console.log('[edit] Err3:', err);
                loggers.get('models').error('[edit] Err3: %s', err);
                var msg = err.message;
                reject(formatErrMsg(msg));
              });
            }
          } else {
            reject("not_found");
          }
        })
        .catch(function(err) {
          // console.log('[edit] Err4:', err);
          var msg = err.error;
          loggers.get('models').error('[delete] Err4: %s', msg);
          reject(formatErrMsg(msg));
        });
      }
    });
  },

  delete: function(docId, revId) {
    console.log('iteration.delete docId: '+docId + ' revId:'+revId);
    return new Promise(function(resolve, reject){
      common.deleteRecord(docId, revId)
      .then(function(body) {
        // console.log('iteration.delete RESULT:', body);
        loggers.get('models').info('[delete] result: %s', body);
        resolve(body);
      })
      .catch(function(err) {
        var msg = err.message;
        // console.log('iteration.delete err:', err);
        loggers.get('models').error('[delete]: %s', err);
        reject(formatErrMsg(msg));
      });
    });
  }
};

module.exports = iteration;
