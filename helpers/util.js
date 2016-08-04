var common = require('../models/cloudant-driver');
var Promise = require('bluebird');
var settings = require('../settings');
var loggers = require('../middleware/logger');
var _ = require('underscore');
var msg;
var teamLists = [];
var userTeams = [];
var teamModel;

var formatErrMsg = function(msg) {
  loggers.get('models').info('Error: ' + msg);
  return { error : msg };
};

var getTeams = function(userId){
  teamModel = require('../models/teams');
  return new Promise(function(resolve, reject){
    loggers.get('models').info('Getting user teams of '+userId);
    teamModel.getTeam('')
    .then(function(body){
      teamLists = body.rows;
      return teamModel.getTeamByEmail(userId);
    })
    .then(function(body){
      userTeams = body;
      resolve(body);
    })
    .catch(function(err){
      reject(formatErrMsg(err));
    });
  });
};


var isUserMemberOfTeam = function(teamId, checkParent) {
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
      if (teamLists[i]['id'] == teamId && teamLists[i].value.parent_team_id != "") {
        return isUserMemberOfTeam(teamLists[i].value.parent_team_id, checkParent);
      }
    }
  }

  return userExist;
}

module.exports.trimData = function(postData) {
  var cleanData = {};
  _.each(postData, function(element, index, list) {
    if (typeof element === 'string') {
      element = element.trim();
    }
    cleanData[index] = element;
  });
  return cleanData;
};


// Get users with administrative/support access
module.exports.getAdmins = function (accessId) {
  return new Promise(function(resolve, reject) {
    if(!(_.isEmpty(accessId))) {
      loggers.get('models').info('Getting all admins and supports');
      common.getRecord(accessId).then(function(body){
        loggers.get('models').info('Success: Admin records obtained');
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
      loggers.get('models').info('Getting system status');
      common.getRecord(accessId)
        .then(function(body) {
          loggers.get('models').info('Success: System status records obtained');
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
  //can use lodash cloneDeep
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
// console.log('exported..');
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
      if (teamLists[i]['id'] == teamId && teamLists[i].value.parent_team_id != "") {
        return module.exports.isUserMemberOfTeam(teamLists[i].value.parent_team_id, checkParent, teamLists, userTeams);
      }
    }
  }

  return userExist;
}

module.exports.isValidUser = function(userId, teamId, checkParent){
  return new Promise(function(resolve, reject){
    loggers.get('models').info('validating user '+userId+' for team '+teamId);
    module.exports.getAdmins('ag_ref_access_control')
    .then(function(body){
      return _.contains(body.ACL_Full_Admin, userId);
    })
    .then(function(isAdmin){
      if (!isAdmin){
        return getTeams(userId);
      }
      else{
        return isAdmin;
      }
    })
    .then(function(body){
      if (!_.isBoolean(body)){
        return isUserMemberOfTeam(teamId, checkParent);
      }
      else{
        return body;
      }
    })
    .then(function(allowedUser){
      if (!allowedUser){
        reject(formatErrMsg('Unauthorized user.'));
      }
      else{
        resolve(allowedUser);
      }
    })
    .catch(function(err){
      reject(err.error);
    });
  });
}

/**
 * Bulkdelete documents
 *
 * @param docIds Array of document Ids e.g. ['01a4073afd76c2cde8dcf42a56f25741', '10a4073afd76c2cde8dcf42a56f25741', ...]
 * @return JSONObject
 */
module.exports.BulkDelete = function(docIds) {
  return new Promise(function(resolve, reject) {
    var deletedIds = [];
    var failedIds = [];
    var _id;
    var _rev;
    _.each(docIds, function(docId) {
      common.getRecord(docId)
      .then(function(body) {
        if (!_.isEmpty(body)) {
          _id = body._id;
          _rev = body._rev;
          console.log('Attempt to delete Document _id: ' + _id + ' _rev: ' + _rev);
          common.deleteRecord(_id, _rev)
          .then(function(body) {
            // loggers.get('models').info('[otherModel.BulkDelete] Successfully deleted docId id: '+ _id);
            deletedIds.push(_id);
            var result = {
              'Failed to delete docIds': failedIds,
              'Successfully deleted docIds': deletedIds
            }
            resolve(result);
          })
          .catch(function(err) {
            // loggers.get('models').error('[otherModel.BulkDelete] Failed to delete docId: '+ _id);
            failedIds.push(_id);
          });
        }
      })
      .catch(function(err) {
        // loggers.get('models').error('[otherModel.BulkDelete] Failed to delete docId: '+ docId);
        failedIds.push(docId);
      });
    });
  });
}

/**
 * Get children of team in flatten structure
 * 
 * @param parentId - team document id to get children to
 * @param allTeams - array of all team document
 * @returns {array}
 */
module.exports.getChildrenOfParent = function(parentId, allTeams){
var children = _.isEmpty(children) ? [] : children;
 var currentTeam = _.isEmpty(allTeams[parentId]) ? allTeams[parentId] : null;
  if (currentTeam != null) {
    if (currentTeam.child_team_id != undefined) {
      for (var j = 0; j < currentTeam.child_team_id.length; j++) {
        if (children.indexOf(currentTeam.child_team_id[j]) == -1) {
          children.push(currentTeam.child_team_id[j]);
          module.exports.getChildrenOfParent(currentTeam.child_team_id[j], allTeams);
        }
      }
    }
  }
  return children; 
}

/**
 * Reformat document to update document structure for BULK operation
 * 
 * @param docs - array of documents
 * @param email - email address as last update user, ie logged in user
 * @returns - reformatted object that will be passed directly to updateBulk
 */

 // TODO : can be merged with formatForBulkDelete
module.exports.formatForBulkUpdate = function(docs, email){
  //can use lodash cloneDeep
  var reformatDocu = [];
  _.each(docs, function(v, i, l){
    var doc2 = v;
    doc2['last_updt_user'] = email;
    doc2['last_updt_dt'] = module.exports.getServerTime();
    doc2['doc_status'] = '';
    reformatDocu.push(doc2);
  });
  return {
    docs : reformatDocu
  };
}