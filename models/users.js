var cloudantDriver = require('./cloudant-driver');
var loggers = require('../middleware/logger');
var util = require('../helpers/util');
var uuid = require('node-uuid');
var Promise = require('bluebird');
var _ = require('underscore');

var users = {
  getAdmins: function() {
    return new Promise(function(resolve, reject) {
      loggers.get('model-users').verbose('Getting all admins and supports..');
      cloudantDriver.getRecord('ag_ref_access_control')
      .then(function(body) {
        loggers.get('model-users').verbose('Success: Admin records obtained');
        resolve(body);
      })
      .catch( /* istanbul ignore next */ function(err) {
        loggers.get('model-users').error('ERROR: ' + err);
        msg = err.error;
        reject(msg);
      });
    });
  },

  createApikey: function(user) {
    return new Promise(function(resolve, reject) {
      var apiData = {};
      users.getUserApikeyByUid(user['ldap']['uid'])
        .then(function(result) {
          if (_.isEmpty(result)) {
            var uuidKey = uuid.v4();
            apiData['type'] = 'api_key';
            apiData['userId'] = user['ldap']['uid'];
            apiData['email'] = user['shortEmail'];
            apiData['key'] = uuidKey;
            apiData['createDate'] = util.getServerTime();
            apiData['_id'] = 'ag_apikey_'+uuidKey;
            apiData = util.trimData(apiData);
            return cloudantDriver.addRecord(apiData);
          }
          apiData = result;
          return apiData;
        })
        .then(function(result) {
          resolve(apiData);
        })
        .catch( /* istanbul ignore next */ function(err) {
          loggers.get('models-users').error('ERROR:', err);
          var msg = err.error;
          reject(msg);
        });
    });
  },

  deleteApikey: function(user) {
    return new Promise(function(resolve, reject) {
      loggers.get('model-users').verbose('Delete api key for user ' + user.shortEmail);
      users.getUserApikeyByUid(user['ldap']['uid'])
      .then(function(userApi) {
        if (!_.isEmpty(userApi)) {
          return cloudantDriver.deleteRecord(userApi._id, userApi._rev);
        } else {
          return userApi;
        }
      })
      .then(function(result) {
        resolve(result);
      })
      .catch( /* istanbul ignore next */ function(err) {
        loggers.get('models-users').error('ERROR:', err);
        var msg = err.error;
        reject(msg);
      });
    });
  },

  getUserApikeyByUid: function(uid) {
    return new Promise(function(resolve, reject) {
      loggers.get('model-users').verbose('Getting user api key with UID ' + uid);
      cloudantDriver.getByViewKey('utility', 'userapiuid', uid)
        .then(function(result) {
          result = util.returnObject(result);
          result = !_.isEmpty(result) ? result[0] : new Object();
          resolve(result);
        })
        .catch( /* istanbul ignore next */ function(err) {
          loggers.get('model-users').error('ERROR: ' + err);
          msg = err.error;
          reject(msg);
        });
    });
  },

  getUserApikeyByUser: function(user) {
    return new Promise(function(resolve, reject) {
      loggers.get('model-users').verbose('Getting user api key with user objects ID ' + user['ldap']['uid']);
      users.getUserApikeyByUid(user['ldap']['uid'])
        .then(function(result) {
          if (!_.isEmpty(result)) {
//            result = util.returnObject(result);
//            result = !_.isEmpty(result) ? result[0] : new Object();
            resolve(result);
          }
        })
        .catch( /* istanbul ignore next */ function(err) {
          loggers.get('model-users').error('ERROR: ' + err);
          msg = err.error;
          reject(msg);
        });
    });
  },

  getUserApikeyByApikey: function(apiKey) {
    return new Promise(function(resolve, reject) {
      loggers.get('model-users').verbose('Getting user api key with API ' + apiKey);
      cloudantDriver.getByViewKey('utility', 'userapi', apiKey)
        .then(function(result) {
          result = util.returnObject(result);
          result = !_.isEmpty(result) ? result[0] : new Object();
          resolve(result);
        })
        .catch( /* istanbul ignore next */ function(err) {
          loggers.get('model-users').error('ERROR: ' + err);
          msg = err.error;
          reject(msg);
        });
    });
  }
};

module.exports = users;
