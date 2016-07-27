var common = require('./common-cloudant');
var Promise = require('bluebird');
var settings = require('../settings');
var loggers = require('../middleware/logger');
var _ = require('underscore');
var msg;

var formatErrMsg = function(msg) {
  loggers.get('models').info('Error: ' + msg);
  return { error : msg };
};

var successLogs = function(msg) {
  loggers.get('models').info('Success: ' + msg);
  return;
};

var infoLogs = function(msg) {
  loggers.get('models').info(msg);
  return;
};

// Get users with administrative/support access
module.exports.getAdmins = function (accessId) {
  return new Promise(function(resolve, reject) {
    if(!(_.isEmpty(accessId))) {
      infoLogs('Getting all admins and supports');
      common.getRecord(accessId).then(function(body){
        successLogs('Admin records obtained');
        resolve(body);
      }).catch(function(err) {
        msg = err.error;
        reject(formatErrMsg(msg));
      });
    } else {
      msg = 'admin access id is empty';
      reject(formatErrMsg(msg));
    }
  });
};

// Get system status
module.exports.getSystemStatus = function (accessId) {
  return new Promise(function(resolve, reject) {
    if(!(_.isEmpty(accessId))) {
      infoLogs('Getting system status');
      common.getRecord(accessId)
        .then(function(body) {
          successLogs('System status records obtained');
          resolve(body);
        })
        .catch(function(err) {
          msg = err.error;
          reject(formatErrMsg(msg));
        });
    } else {
      msg = 'system status access id is empty';
      reject(formatErrMsg(msg));
    }
  });
};

// Get server time (in million sec)
module.exports.getServerTime = function () {
  return new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
};

/**
 * Reformat document to delete document structure for BULK operation
 * 
 * @param docs - array of documents
 * @param email - email address as last update user, ie logged in user
 * @returns - reformatted object that will be passed directly to updateBulk
 */
module.exports.formatForBulkDelete = function(docs, email){
  var reformatDocu = [];
  _.each(docs, function(v, i, l){
    var doc2 = v;
    doc2['last_updt_user'] = email;
    doc2['last_updt_dt'] = module.exports.getServerTime();
    doc2['doc_status'] = 'delete';
    reformatDocu.push(doc2);
  });
  return {
    docs : reformatDocu
  };
}

/**
 * Check if user is member on set of documents to edit
 * 
 * @param teamId - team document id to check if user is member
 * @param checkParent - set to true if we need to check the parent team documents for user membership.
 * @param teamLists - array of all team document
 * @param userTeams - array of all team document with email ie from api/teams/member/:email endpoint
 * @returns {Boolean}
 */
module.exports.isUserMemberOfTeam = function(teamId, checkParent, teamLists, userTeams) {
  var userExist = false;
  if (teamLists == null)
    return userExist;

  if (userTeams != null) {
    for (var i in userTeams) {
      if (userTeams[i]['id'] == teamId) {         
        userExist = true;
        break;
      }
    }
  } 

  if (!userExist && checkParent) {
    for ( var i = 0; i < teamLists.length; i++) {
      if (teamLists[i]['id'] == teamId && teamLists[i].parent_team_id != "") 
        return module.exports.isUserMemberOfTeam(teamLists[i].parent_team_id, checkParent, teamLists, userTeams);
    }
  }

  return userExist;
}