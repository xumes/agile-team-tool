var Promise = require('bluebird');
var uuid = require('node-uuid');
var loggers = require('../../middleware/logger');
var moment = require('moment');
var _ = require('underscore');
var config = require('../../settings');
var mongoose = config.mongoose;
var Schema   = require('mongoose').Schema;

var apiKeySchema = {
  userId: {
    type: String,
    required: [true, 'UserId is required.'],
    unique: true
  },
  email: {
    type: String,
    required: [true, 'email is required.']
  },
  key: {
    type: String,
    default: 'none'
  },
  createDate: {
    type: Date,
    default: new Date()
  }
};

var apiKeySchema = new Schema(apiKeySchema, {collection : 'apiKeys'});
var ApiKey = mongoose.model('apiKeys', apiKeySchema);

var apiKeys = {
  getUserApikeyByUser: function(user) {
    return new Promise(function(resolve, reject) {
      if (_.isEmpty(user)) {
        loggers.get('model-apikeys').verbose('Getting user api key with UID but empty');
        var query = ApiKey.find();
      } else {
        var uid = user['ldap']['uid'];
        loggers.get('model-apikeys').verbose('Getting user api key with UID ' + uid);
        query = ApiKey.findOne({userId: uid});
      }
      query
      .then(function(result){
        resolve(result);
      })
      .catch( /* istanbul ignore next */ function(err){
        reject(err);
      });
    });
  },

  createApikey: function(user) {
    return new Promise(function(resolve, reject) {
      if (_.isEmpty(user)) {
        reject({'error': 'user cannot be empty'});
      } else {
        apiKeys.getUserApikeyByUser(user)
          .then(function(result){
            if (_.isEmpty(result)) {
              var newApiKey = {
                'key': uuid.v4(),
                'userId': user['ldap']['uid'].toUpperCase(),
                'email': user['shortEmail'].toLowerCase()
              };
              return ApiKey.create(new ApiKey(newApiKey));
            } else {
              return result;
            }
          })
          .then(function(result){
            resolve(result);
          })
          .catch( /* istanbul ignore next */ function(err){
            loggers.get('models-apikeys').error(err);
            reject(err);
          });
      }
    });
  },

  deleteApikey: function(user) {
    return new Promise(function(resolve, reject) {
      loggers.get('model-apikeys').verbose('Delete api key for user ' + user['ldap']['uid']);
      apiKeys.getUserApikeyByUser(user)
     .then(function(userApi) {
       if (!_.isEmpty(userApi)) {
         loggers.get('model-apikeys').verbose('Ready to remove user uid =: '+user['ldap']['uid']);
         var q = {userId: user['ldap']['uid']};
         return ApiKey.remove(q);
       } else {
         return 'user not exist';
       }
     })
     .then(function(result) {
       resolve(result);
     })
     .catch( /* istanbul ignore next */ function(err) {
       console.log(err);
       loggers.get('model-apikeys').error('ERROR:', err);
       var msg = err.error;
       reject(msg);
     });
    });
  }

};

module.exports = apiKeys;
