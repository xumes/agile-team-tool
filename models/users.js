var cloudantDriver = require('./cloudant-driver');
var loggers = require('../middleware/logger');
var util = require('../helpers/util');
var uuid = require('node-uuid');
var Promise = require('bluebird');

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

  createApiKey: function(user) {
    return new Promise(function(resolve, reject) {
      users.getUserApikeyWtihUid(user['ldap']['uid'])
      .then(function(result) {
        if (_.isUndefined(result) || _.isEmpty(result)) {
          var uuidKey = uuid.v4();
          var data = {};
          data['type'] = 'api_key';
          data['userId'] = user['ldap']['uid'];
          data['email'] = user['shortEmail'];
          data['key'] = uuidKey;
          data['createDate'] = util.getServerTime();
          data['_id'] = 'ag_apiKey_'+uuidKey;
          data = util.trimData(data);
          cloudantDriver.addRecord(data);
          return data;
        } else
          return result;
      })
      .then(function(result) {
        console.log(result);
        resolve(result);
      })
      .catch( /* istanbul ignore next */ function(err) {
        loggers.get('models-users').error('ERROR:', err);
        var msg = err.error;
        reject(msg);
      });
    });
  },

  getUserApikeyWtihUid: function(uid) {
    loggers.get('model-users').verbose('Getting user with UID ' + uid);
    return new Promise(function(resolve, reject) {
      cloudantDriver.getByViewKey('utility', 'userapiuid', uid)
      .then(function(result) {
        result = util.returnObject(result);
        result = !_.isEmpty(result) ? result[0] : new Object();
        console.log(result);
        resolve(result);
      })
      .catch( /* istanbul ignore next */ function(err) {
        loggers.get('model-users').error('ERROR: ' + err);
        msg = err.error;
        reject(msg);
      });
    });
  },

  getUserWithApikey: function(apiKey) {
    loggers.get('model-users').verbose('Getting user with API ' + apiKey);
    return new Promise(function(resolve, reject) {
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
