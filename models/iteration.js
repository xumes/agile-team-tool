'use strict';

var Cloudant = require('cloudant');
var Promise = require('bluebird');
var settings = require('../settings');
var common = require('./cloudant-driver');
var util = require('../helpers/util');
var _ = require('underscore');
var loggers = require('../middleware/logger');
var validate = require('validate.js');
var moment = require('moment');
var sprintf = require('sprintf-js').sprintf;
var generator = require('lucene-query-generator');

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

var iteration = {
  getByIterInfo: function(teamId, includeDocs) {
    return new Promise(function(resolve, reject) {
      if (teamId) {
        infoLogs('[getByIterInfo] Getting team iteration for ' + teamId);
        common.getByViewKey('iterations', 'teamIteration', teamId, includeDocs)
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
        common.getByView('iterations', 'teamIteration', includeDocs)
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
    return new Promise(function(resolve, reject) {
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
    return new Promise(function(resolve, reject) {
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

  add: function(data, user) {
    var iterationDocRules = require('./validate_rules/iteration.js');
    var cleanData = {};
    data['last_updt_dt'] = util.getServerTime();
    data['iterationinfo_status'] = iteration.calculateStatus(data);
    data['last_updt_user'] = user['shortEmail'];
    data['created_user'] = user['shortEmail'];
    data['created_dt'] = util.getServerTime();
    data['type'] = 'iterationinfo';
    cleanData = util.trimData(data);
    var newIterationId = settings.prefixes.iteration + cleanData['team_id'] + ' ' + cleanData['iteration_name'] + '_' + new Date().getTime();
    newIterationId = newIterationId.replace(/^[^a-z]+|[^\w:.-]+/gi, '');
    cleanData['_id'] = newIterationId;
    var user_id = user['shortEmail'];
    var team_id = cleanData['team_id'];
    // console.log('ADD cleanData:', cleanData);

    return new Promise(function(resolve, reject) {
      var validationErrors = validate(cleanData, iterationDocRules);
      if (validationErrors) {
        return reject(formatErrMsg(validationErrors));
      } else {
        util.isUserAllowed(user_id, team_id)
        .then(function(validUser) {
          if (validUser) {
            return iteration.getByIterInfo(team_id);
          }
        })
        .then(function(iterData) { // get results from iteration.getByIterInfo()
          if (iterData != undefined && iterData.rows) {
            var iteration_name = cleanData['iteration_name'];
            var duplicate = iteration.isIterationNumExist(iteration_name, iterData);
            if (duplicate) {
              var msg = {
                iteration_name: ['Iteration number/identifier already exists']
              };
              return reject(formatErrMsg(msg));
            } else {
              return common.addRecord(cleanData);
            }
          }
        })
        .then(function(body) { // get results from common.addRecord()
          resolve(body);
          // console.log('ADD body:', body);
          successLogs('[iterationModels.add] New iteration doc created');
        })
        .catch( /* istanbul ignore next */ function(err) {
          loggers.get('models').error('[iterationModel.add] Err:', err);
          var msg = err.message;
          reject(formatErrMsg(msg));
        });
      }
    });
  },

  edit: function(iterationId, data, user) {
    var iterationDocRules = require('./validate_rules/iteration.js');
    var cleanData = {};
    data['last_updt_dt'] = util.getServerTime();
    data['last_updt_user'] = user['shortEmail'];
    data['iterationinfo_status'] = iteration.calculateStatus(data);
    cleanData = util.trimData(data);
    // console.log('EDIT iterationId:', iterationId);
    // console.log('EDIT cleanData:', cleanData);
    var user_id = user['shortEmail'];
    var team_id = cleanData['team_id'];
    var old_iteration_name = '';
    var new_iteration_name = '';
    var isNewIterationName = false;
    return new Promise(function(resolve, reject) {
      var validationErrors = validate(cleanData, iterationDocRules);
      if (validationErrors) {
        return reject(formatErrMsg(validationErrors));
      } else {
        util.isUserAllowed(user_id, team_id)
        .then(function(validUser) { // results from util.isUserAllowed
          if (validUser) {
            return common.getRecord(iterationId);
          }
        })
        .then(function(body) {
          if (!_.isEmpty(body) && (body._id != undefined)) { // get results from common.getRecord()
            var _rev = body._rev;
            var _id = body._id;
            cleanData._rev = _rev;
            cleanData._id = _id;

            old_iteration_name = body['iteration_name'].trim();
            new_iteration_name = cleanData['iteration_name'].trim();
            if (old_iteration_name != new_iteration_name) {
              isNewIterationName = true;
            }
            return isNewIterationName;
          }
          else { /* istanbul ignore next */
            var msg = 'not_found';
            /* istanbul ignore next */
            return reject(formatErrMsg(msg));
          }
        })
        .then(function(isNewIterationName) {
          if (isNewIterationName === true) {
            return iteration.getByIterInfo(team_id);
          } else {
            return common.updateRecord(cleanData);
          }
        })
        .then(function(results) {
          if (results != undefined && results.rows) { // get results coming from iteration.getByIterInfo()
            var duplicate = iteration.isIterationNumExist(new_iteration_name, results);
            if (duplicate) {
              var msg = {
                iteration_name: ['Iteration number/identifier already exists']
              };
              return reject(formatErrMsg(msg));
            } else {
              return common.updateRecord(cleanData);
            }
          } else { // here we get the results coming from common.updateRecord()
            successLogs('Team iteration doc updated');
            return resolve(results);
          }
        })
        .then(function(results) {
          successLogs('Team iteration doc updated');
          return resolve(results);
        })
        .catch( /* istanbul ignore next */ function(err) {
          loggers.get('models').error('[iterationModel.edit] Err:', err);
          // console.log('EDIT Error msg:', msg);
          var msg = err.message;
          return reject(formatErrMsg(msg));
        });
      }
    });
  },

  delete: function(docId, revId) {
    // console.log('iteration.delete docId: '+docId + ' revId:'+revId);
    return new Promise(function(resolve, reject) {
      if (!docId && !revId) {
        var msg = {
          _id: ['_id/_rev is missing']
        };
        reject(formatErrMsg(msg));
      } else {
        common.deleteRecord(docId, revId)
          .then(function(body) {
            // console.log('iteration.delete RESULT:', body);
            loggers.get('models').verbose('[iterationModel.delete] result:', body);
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
    var dateFormat = 'MM/DD/YYYY';
    var status;
    var nbr_cycletime_WIP = data['nbr_cycletime_WIP'];
    var nbr_cycletime_in_backlog = data['nbr_cycletime_in_backlog'];
    var endDate = new Date(iteration_end_dt);
    var d1 = moment(endDate).format(dateFormat);
    var d2 = util.getServerTime();
    d2 = moment(d2).format(dateFormat);
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
        client_sat != 0 ||
        nbr_cycletime_WIP != 0 ||
        nbr_cycletime_in_backlog !=0) {
        status = 'Completed';
      } else {
        status = 'Not complete';
      }
    } else {
      status = 'Not complete';
    }

    return status;
  },

  searchTeamIteration: function(p) {
    loggers.get('models').verbose('[iterationModel.searchTeamIteration] params: ', JSON.stringify(p, null, 1));
    return new Promise(function(resolve, reject) {
      var iterationSearchAllDocRules = require('./validate_rules/iterationSearchAll.js');
      var team_id = util.specialCharsHandler(p.id);
      var status = p.status;
      var startdate = p.startdate;
      var enddate = p.enddate;
      var limit = p.limit;
      var include_docs = p.includeDocs;
      var sortBy = '-end_dt';
      var lucene_query = '';
      var operands = {};
      var validationErrors = validate(p, iterationSearchAllDocRules);
      validationErrors = iteration.isValidStartEndDate(startdate, enddate, 'YYYYMMDD', validationErrors);

      if (validationErrors) {
        reject(formatErrMsg(validationErrors));
      } else {
        // teamId
        // lucene_query = lucene_query + sprintf("team_id:%s", team_id);
        operands = _.extend(operands, {team_id: team_id});
        // completed status
        if (status) {
          // lucene_query = lucene_query + sprintf(" AND completed:%s", status);
          operands = _.extend(operands, {completed: status});
        }
        // earliest and latest end date
        if (startdate && enddate) {
          // lucene_query = lucene_query + sprintf(" AND end_dt:[%s TO %s]", startdate, enddate);
          operands = _.extend(operands, {
            end_dt: {$from: startdate, $to: enddate}
          });
        } else {
          if (startdate) {
            // lucene_query = lucene_query + sprintf(" AND end_dt:%s", startdate);
            operands = _.extend(operands, {end_dt: startdate});
          }
          if (enddate) {
            // lucene_query = lucene_query + sprintf(" AND end_dt:%s", enddate);
            operands = _.extend(operands, {end_dt: enddate});
          }
        }

        lucene_query = generator.convert({
          $operands: [operands]
        });

        var params = {
          'q': lucene_query,
          'include_docs': include_docs,
          'sort': sortBy,
          'limit': limit
        };
        loggers.get('models').verbose('[iterationModel.searchTeamIteration] lucene_query: ' + lucene_query);
        common.Search('iterations', 'searchAll', params)
          .then(function(body) {
            resolve(body);
          })
          .catch( /* istanbul ignore next */ function(err) {
            /* cannot simulate Cloudant error during testing */
            loggers.get('models').error('[iterationModel.searchTeamIteration]:', err);
            var msg = err.error;
            reject(formatErrMsg(msg));
          });
      }
    });
  },

  isValidStartEndDate: function(startdate, enddate, dateFormat, validationErrors) {
    var isvalid_startdate = moment(startdate, dateFormat, true).isValid();
    var isvalid_enddate = moment(enddate, dateFormat, true).isValid();
    if (startdate && !isvalid_startdate) {
      if (validationErrors === undefined) {
        validationErrors = new Object();
      }
      if (validationErrors && !validationErrors['startdate']) {
        validationErrors['startdate'] = [];
      }
      validationErrors['startdate'].push('Start date is not a valid date');
    }
    if (enddate && !isvalid_enddate) {
      if (validationErrors === undefined) {
        validationErrors = new Object();
      }
      if (validationErrors && !validationErrors['startdate']) {
        validationErrors['enddate'] = [];
      }
      validationErrors['enddate'].push('End date is not a valid date');
    }

    return validationErrors;
  },

  setApiIterationAction:  /* istanbul ignore next */ function(apiData, user, action) {
    return new Promise(function(resolve, reject) {
      //TODO: adjust for mongo db implementation
      var userObj = {
        'shortEmail' : user.email
      };
      var data = new Object();
      data.type = 'iterationinfo';
      data._id = apiData._id;
      data.team_id = apiData.teamId;
      data.iteration_name = apiData.iterationName;
      data.iteration_start_dt = apiData.startDate;
      data.iteration_end_dt = apiData.endDate;
      data.iterationinfo_status = '';
      data.team_mbr_cnt = apiData.memberCount;
      data.nbr_committed_stories = apiData.committedStories;
      data.nbr_stories_dlvrd = apiData.deliveredStories;
      data.nbr_committed_story_pts = apiData.commitedStoryPoints;
      data.nbr_story_pts_dlvrd = apiData.storyPointsDelivered;
      data.iteration_comments = apiData.comment;
      data.team_mbr_change = apiData.memberChanged;
      data.fte_cnt = apiData.memberFTECount;
      data.nbr_dplymnts = apiData.deployments;
      data.nbr_defects = apiData.defects;
      data.nbr_cycletime_WIP = apiData.cycleTimeWIP;
      data.nbr_cycletime_in_backlog = apiData.cycleTimeInBacklog;
      data.client_sat = apiData.clientSatisfaction;
      data.team_sat = apiData.teamSatisfaction;
      data.doc_status = apiData.docStatus;

      if (_.isEqual(action, 'add')) {
        var updatedData = {};
        _.each(data, function(v, i, l) {
          if (_.isUndefined(data[i]))
            updatedData[i] = '';
          else
            updatedData[i] = data[i];
        });
        iteration.add(data, userObj)
          .then(function(data) {
            updatedData._id = data.id;
            resolve(updatedData);
          })
          .catch( /* istanbul ignore next */ function(err) {
            loggers.get('models').error('[iterationModel.setApiIterationAction]:', err);
            var msg = err.error;
            reject(formatErrMsg(msg));
          });

      } else if (_.isEqual(action, 'edit')) {
        loggers.get('models').verbose('[iterationModel.setApiIterationAction]: retrieving: ' + apiData._id);
        iteration.get(apiData._id)
          .then(function(oldData) {
            var updatedData = {};
            _.each(oldData, function(v, i, l) {
              if (_.isUndefined(data[i]))
                updatedData[i] = oldData[i];
              else
                updatedData[i] = data[i];
            });
            return updatedData;
          })
          .then(function(updatedData) {
            iteration.edit(apiData._id, updatedData, userObj)
              .then(function(data) {
                resolve(updatedData);
              });
          })
          .catch( /* istanbul ignore next */ function(err) {
            loggers.get('models').error('[iterationModel.setApiIterationAction]:', err);
            var msg = err.error;
            reject(formatErrMsg(msg));
          });

      } else if (_.isEqual(action, 'delete')) {
        data.doc_status = 'delete';
        iteration.edit(apiData._id, data, userObj)
          .then(function(data) {
            resolve(iteration.setApiIterationObject(data));
          })
          .catch( /* istanbul ignore next */ function(err) {
            loggers.get('models').error('[iterationModel.setApiIterationAction]:', err);
            var msg = err.error;
            reject(formatErrMsg(msg));
          });

      }
    });
  },

  setApiIterationObject:  /* istanbul ignore next */ function(data) {
    var apiData = new Object();
    apiData._id = data._id;
    apiData.teamId = data.team_id;
    apiData.iterationName = data.iteration_name;
    apiData.startDate = data.iteration_start_dt;
    apiData.endDate = data.iteration_end_dt;
    apiData.status = data.iterationinfo_status;
    apiData.memberCount = data.team_mbr_cnt;
    apiData.memberFTECount = data.fte_cnt;
    apiData.memberChanged = data.team_mbr_change;
    apiData.committedStories = data.nbr_committed_stories;
    apiData.deliveredStories = data.nbr_stories_dlvrd;
    apiData.commitedStoryPoints = data.nbr_committed_story_pts;
    apiData.storyPointsDelivered = data.nbr_story_pts_dlvrd;
    apiData.deployments = data.nbr_dplymnts;
    apiData.defects = data.nbr_defects;
    apiData.cycleTimeWIP = data.nbr_cycletime_WIP;
    apiData.cycleTimeInBacklog = data.nbr_cycletime_in_backlog;
    apiData.clientSatisfaction = data.client_sat;
    apiData.teamSatisfaction = data.team_sat;
    apiData.comment = data.iteration_comments;
    apiData.docStatus = data.doc_status;
    apiData.updateDate = data.last_updt_dt;
    apiData.updatedBy = data.last_updt_user;
    return apiData;
  }
};

module.exports = iteration;
