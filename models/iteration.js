"use strict";

var Cloudant    = require('cloudant');
var Promise     = require('bluebird');
var settings    = require('../settings');
var common      = require('./cloudant-driver');
var util        = require('../helpers/util');
var _           = require('underscore');
var loggers     = require('../middleware/logger');
var validate    = require('validate.js');
var moment      = require('moment');

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
      if (teamId) {
        infoLogs('[getByIterInfo] Getting team iteration for ' + teamId);
        common.getByViewKey('iterations', 'teamIteration', teamId)
        .then(function(body) {
          successLogs('[iterationModel.getByIterInfo] Team iteration docs obtained');
          resolve(body);
        })
        .catch( /* istanbul ignore next */ function(err) {
          /* cannot simulate Cloudant error during testing */
          var msg = err.error;
          reject(formatErrMsg(msg));
        });
      } else {
        infoLogs('[getByIterInfo] Getting all team iterations docs');
        common.getByView('iterations', 'teamIteration')
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
      common.getByViewWithStartOrEndKey('iterations', 'completed', startkey, endkey)
      .then(function(body) {
        successLogs('[iterationModel.getCompletedIterationsByKey] Completed iteration docs obtained');
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

  add: function(data, user, allTeams, userTeams) {
    // loggers.get('models').info('[iterationModel.add] allTeams:', JSON.stringify(allTeams));
    loggers.get('models').info('[iterationModel.add] userTeams:', JSON.stringify(userTeams));
    var cleanData = {};
    data['last_updt_dt'] = util.getServerTime();
    data['iterationinfo_status'] = iteration.calculateStatus(data);
    data['last_updt_user'] = user['shortEmail'];
    data['created_user'] = user['shortEmail'];
    data['created_dt'] = util.getServerTime();
    data['type'] = 'iterationinfo';
    cleanData = util.trimData(data);
    var user_id = user['shortEmail'];
    var team_id = cleanData['team_id'];
    var checkParent = true;
    // console.log('ADD cleanData:', cleanData);
    return new Promise(function(resolve, reject) {
      var validationErrors = validate(cleanData, iterationDocRules);
      if (validationErrors) {
        reject(formatErrMsg(validationErrors));
      } else {
        util.isUserAllowed(user_id, team_id, checkParent, allTeams, userTeams)
        .then(function(validUser) {
          // console.log('[add] isValidUser:', validUser);
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
                    successLogs('[iterationModels.add] New iteration doc created');
                  })
                  .catch( /* istanbul ignore next */ function(err) {
                    /* cannot simulate Cloudant error during testing */
                    loggers.get('models').error('[iterationModel.add] Err1:', err);
                    var msg = err.message;
                    reject(formatErrMsg(msg));
                  });
                }
              }
            })
            .catch( /* istanbul ignore next */ function(err) {
              /* cannot simulate Cloudant error during testing */
              formatErrMsg('[add] Err2:', err);
              loggers.get('models').error('[iterationModel.add] Err2:', err);
              var msg = err.message;
              reject(formatErrMsg(msg));
            });
          }
        })
        .catch( /* istanbul ignore next */ function(err) {
          /* cannot simulate Cloudant error during testing */
          formatErrMsg('[iterationModel.add] Err3:', err);
          loggers.get('models').error('[iterationModel.add] Err3:', err);
          var msg = err.message;
          reject(formatErrMsg(msg));
        });
      }
    });
  },

  edit: function(iterationId, data, user, allTeams, userTeams) {
    var cleanData = {};
    data['last_updt_dt'] = util.getServerTime();
    data['last_updt_user'] = user['shortEmail'];
    data['iterationinfo_status'] = iteration.calculateStatus(data);
    cleanData = util.trimData(data);
    // console.log('EDIT iterationId:', iterationId);
    // console.log('EDIT cleanData:', cleanData);
    var user_id = user['shortEmail'];
    var team_id = cleanData['team_id'];
    var checkParent = true;
    return new Promise(function(resolve, reject){
      var validationErrors = validate(cleanData, iterationDocRules);
      if (validationErrors) {
        reject(formatErrMsg(validationErrors));
      } else {
        util.isUserAllowed(user_id, team_id, checkParent, allTeams, userTeams)
        .then(function(validUser) {
          // console.log('[edit] isValidUser:', validUser);
          if (validUser) {
            common.getRecord(iterationId)
            .then(function(body) {
              if (!_.isEmpty(body) && (body._id != undefined)) {
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
                    loggers.get('models').error('[iterationModel.edit] Err1:', err);
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
                          loggers.get('models').error('[iterationModel.edit] Err2:', err);
                          var msg = err.message;
                          reject(formatErrMsg(msg));
                        });
                      }
                    }
                  })
                  .catch( /* istanbul ignore next */ function(err) {
                    /* cannot simulate Cloudant error during testing */
                    // console.log('[edit] Err3:', err);
                    loggers.get('models').error('[iterationModel.edit] Err3:', err);
                    var msg = err.message;
                    reject(formatErrMsg(msg));
                  });
                }
              } else { /* istanbul ignore next */
                var msg = "not_found";
                /* istanbul ignore next */
                reject(formatErrMsg(msg));
              }
            })
            .catch( /* istanbul ignore next */ function(err) {
              /* cannot simulate Cloudant error during testing */
              // console.log('[edit] Err4:', err);
              // var msg = err.error;
              var msg = err.message;
              // loggers.get('models').error('[iterationModel.edit] Err4:', err);
              reject(formatErrMsg(msg));
            });
          }
        })
        .catch( /* istanbul ignore next */ function(err) {
          /* cannot simulate Cloudant error during testing */
          formatErrMsg('[iterationModel.edit] Err1:', err);
          loggers.get('models').error('[iterationModel.edit] Err1:', err);
          var msg = err.message;
          reject(formatErrMsg(msg));
        });
      }
    });
  },

  delete: function(docId, revId) {
    // console.log('iteration.delete docId: '+docId + ' revId:'+revId);
    return new Promise(function(resolve, reject){
      if (!docId && !revId) {
        var msg = {
          _id: ["_id/_rev is missing"]
        }
        reject(formatErrMsg(msg));
      } else {
        common.deleteRecord(docId, revId)
        .then(function(body) {
          // console.log('iteration.delete RESULT:', body);
          loggers.get('models').info('[iterationModel.delete] result:', body);
          resolve(body);
        })
        .catch( /* istanbul ignore next */ function(err) {
          /* cannot simulate Cloudant error during testing */
          var msg = err.message;
          // console.log('iteration.delete err:', err);
          loggers.get('models').error('[iterationModel.delete]:', err);
          reject(formatErrMsg(msg));
        });
      }
    });
  },

  calculateStatus: function(data) {
    var iteration_end_dt = data['iteration_end_dt'];
    var nbr_stories_dlvrd = data['nbr_stories_dlvrd'];
    var nbr_story_pts_dlvrd = data['nbr_story_pts_dlvrd'];
    var nbr_dplymnts = data['nbr_dplymnts'];
    var nbr_defects = data['nbr_defects'];
    var team_sat = data['team_sat'];
    var client_sat = data['client_sat'];
    var dateFormat = "MM/DD/YYYY";
    var status;
    var endDate = new Date(iteration_end_dt);
    var serDate = new Date(util.getServerTime());
    var d1 = moment(endDate, dateFormat);
    var d2 = moment(serDate, dateFormat);

    if (d1 <= d2) {
      // console.log('endDate is <= than serDate');
      var diffDays = d2.diff(d1, 'days');
      // updating status for only having more than 3 days from iteration end date
      if(diffDays > 3) {
        // console.log("diffDays > 3");
        status = "Completed";
      } else if (nbr_stories_dlvrd != 0 ||
        nbr_story_pts_dlvrd != 0 ||
        nbr_dplymnts != 0 ||
        nbr_defects != 0 ||
        team_sat != 0 ||
        client_sat != 0) {
        status = "Completed";
      } else {
        status = "Not complete";
      }
    } else {
      status = "Not complete";
    }

    return status;
  },

  completedTeamIteration: function(q) {
    return new Promise(function(resolve, reject) {
      common.Search('iterations', 'searchAll', true, q)
      .then(function(body) {
        resolve(body);
      })
      .catch(function(err) {
        var msg = err.error;
        reject(formatErrMsg(msg));
      });
    });
  }

};

module.exports = iteration;
