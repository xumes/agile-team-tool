"use strict";

var Cloudant = require('cloudant');
var Promise = require('bluebird');
var settings = require('../settings');
var helper = require('../utils/helper');
var common = require('./common-cloudant');
var otherModels = require('../models/others');
var _ = require('underscore');
var loggers = require('../middleware/logger');
var validate = require('validate.js');
var moment = require('moment');

var formatErrMsg = function(msg){
  loggers.get('models').info('Error: ', msg);
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
        .catch( /* istanbul ignore next */ function(err) {
          /* cannot simulate Cloudant error during testing */
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
        .catch( /* istanbul ignore next */ function(err) {
          /* cannot simulate Cloudant error during testing */
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
      .catch( /* istanbul ignore next */ function(err) {
        /* cannot simulate Cloudant error during testing */
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
      .catch( /* istanbul ignore next */ function(err) {
        /* cannot simulate Cloudant error during testing */
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

  add: function(data, user) {
    var cleanData = {};
    data['last_updt_dt'] = otherModels.getServerTime();
    data['last_updt_user'] = user['shortEmail'];
    data['created_user'] = user['shortEmail'];
    data['created_dt'] = otherModels.getServerTime();
    data['type'] = 'iterationinfo';
    cleanData = helper.trimData(data);
    var user_id = user['shortEmail'];
    var team_id = cleanData['team_id'];
    var checkParent = true;
    console.log('ADD cleanData:', cleanData);
    return new Promise(function(resolve, reject) {
      var validationErrors = validate(cleanData, iterationDocRules);
      if (validationErrors) {
        reject(formatErrMsg(validationErrors));
      } else {
        otherModels.isValidUser(user_id, team_id, checkParent)
        .then(function(validUser) {
          console.log('[add] isValidUser:', validUser);
          if (validUser) {
            var iteration_name = cleanData['iteration_name'];
            iteration.getByIterInfo(team_id)
            .then(function(iterData) {
              if (iterData != undefined && iterData.rows) {
                var duplicate = iteration.isIterationNumExist(iteration_name, iterData);
                if (duplicate) {
                  var msg = {
                    iteration_name: ["Iteration number/identifier already exists"]
                  }
                  reject(formatErrMsg(msg));
                } else {
                  common.addRecord(cleanData)
                  .then(function(body) {
                    resolve(body);
                    // console.log('ADD body:', body);
                    successLogs('[add] New iteration doc created');
                  })
                  .catch( /* istanbul ignore next */ function(err) {
                    /* cannot simulate Cloudant error during testing */
                    formatErrMsg('[add] Err1:', err);
                    loggers.get('models').error('[add] Err1: %s', err);
                    var msg = err.message;
                    reject(formatErrMsg(msg));
                  });
                }
              }
            })
            .catch( /* istanbul ignore next */ function(err) {
              /* cannot simulate Cloudant error during testing */
              formatErrMsg('[add] Err2:', err);
              loggers.get('models').error('[add] Err2: %s', err);
              var msg = err.message;
              reject(formatErrMsg(msg));
            });
          }
        })
        .catch( /* istanbul ignore next */ function(err) {
          /* cannot simulate Cloudant error during testing */
          formatErrMsg('[add] Err1:', err);
          loggers.get('models').error('[add] Err1: %s', err);
          var msg = err.message;
          reject(formatErrMsg(msg));
        });
      }
    });
  },

  edit: function(iterationId, data, user) {
    var cleanData = {};
    data['last_updt_dt'] = otherModels.getServerTime();
    data['last_updt_user'] = user['shortEmail'];
    cleanData = helper.trimData(data);
    console.log('EDIT iterationId:', iterationId);
    console.log('EDIT cleanData:', cleanData);
    var user_id = user['shortEmail'];
    var team_id = cleanData['team_id'];
    var checkParent = true;
    return new Promise(function(resolve, reject){
      var validationErrors = validate(cleanData, iterationDocRules);
      if (validationErrors) {
        reject(formatErrMsg(validationErrors));
      } else {
        otherModels.isValidUser(user_id, team_id, checkParent)
        .then(function(validUser) {
          console.log('[edit] isValidUser:', validUser);
          if (validUser) {
            common.getRecord(iterationId)
            .then(function(body) {
              if (!_.isEmpty(body)) {
                // loggers.get('models').info('[edit] Team iteration info obtained: ', JSON.stringify(body, null, 4));
                var _rev = body._rev;
                var _id = body._id;
                cleanData._rev = _rev;
                cleanData._id = _id;

                var old_iteration_name = body['iteration_name'].trim();
                var new_iteration_name = cleanData['iteration_name'].trim();
                var team_id = body['team_id'];
                var isNewIterationName = false;
                if (old_iteration_name != new_iteration_name) {
                  isNewIterationName = true;
                }
                if (isNewIterationName == false) {
                  common.updateRecord(cleanData)
                  .then(function(result) {
                    resolve(result);
                    // console.log('EDIT result1:', result);
                    successLogs('Team iteration doc updated');
                  })
                  .catch( /* istanbul ignore next */ function(err) {
                    /* cannot simulate Cloudant error during testing */
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
                        var msg = {
                          iteration_name: ["Iteration number/identifier already exists"]
                        }
                        reject(formatErrMsg(msg));
                      } else {
                        common.updateRecord(cleanData)
                        .then(function(result) {
                          resolve(result);
                          // console.log('EDIT result2:', result);
                          successLogs('Team iteration doc updated');
                        })
                        .catch( /* istanbul ignore next */ function(err) {
                          /* cannot simulate Cloudant error during testing */
                          // console.log('[edit] Err2:', err);
                          loggers.get('models').error('[edit] Err2: %s', err);
                          var msg = err.message;
                          reject(formatErrMsg(msg));
                        });
                      }
                    }
                  })
                  .catch( /* istanbul ignore next */ function(err) {
                    /* cannot simulate Cloudant error during testing */
                    // console.log('[edit] Err3:', err);
                    loggers.get('models').error('[edit] Err3: %s', err);
                    var msg = err.message;
                    reject(formatErrMsg(msg));
                  });
                }
              } else {
                var msg = "not_found";
                reject(formatErrMsg(msg));
              }
            })
            .catch( /* istanbul ignore next */ function(err) {
              /* cannot simulate Cloudant error during testing */
              // console.log('[edit] Err4:', err);
              // var msg = err.error;
              var msg = err.message;
              loggers.get('models').error('[edit] Err4:', err);
              reject(formatErrMsg(msg));
            });
          }
        })
        .catch( /* istanbul ignore next */ function(err) {
          /* cannot simulate Cloudant error during testing */
          formatErrMsg('[add] Err1:', err);
          loggers.get('models').error('[add] Err1: %s', err);
          var msg = err.message;
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
      .catch( /* istanbul ignore next */ function(err) {
        /* cannot simulate Cloudant error during testing */
        var msg = err.message;
        // console.log('iteration.delete err:', err);
        loggers.get('models').error('[delete]: %s', err);
        reject(formatErrMsg(msg));
      });
    });
  }
};

module.exports = iteration;
