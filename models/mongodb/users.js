var mongoose = require('mongoose');
var Promise = require('bluebird');
var loggers = require('../../middleware/logger');
var moment = require('moment');
var user_schema = require('./validate_rules/users.js');
var Schema   = mongoose.Schema;

// Just needed so that corresponding test could run
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

module.exports.UserSchema = new Schema();

var userModel = mongoose.model('users', user_schema.userSchema);

var users = {
  findUserByEmail: function(email) {
    return new Promise(function(resolve, reject) {
      userModel.findOne({email: email})
        .then(function(useInfo){
          resolve(useInfo);
        })
        .catch(function(err){
          reject(formatErrMsg(err.message));
        });
    });
  },

  add: function(user) {
    return new Promise(function(resolve, reject) {
      var newUser = {
        'userId': (user.ldap.ibmSerialNumber + user.ldap.employeeCountryCode).toUpperCase(),
        'email': (user.shortEmail).toLowerCase(),
        'name': user.ldap.hrFirstName + ' ' + user.ldap.hrLastName,
        'adminAccess': 'none'
      };
      userModel.create(newUser)
        .then(function(result){
          resolve(result);
        })
        .catch(function(err){
          reject(formatErrMsg(err.message));
        });
    });
  }
};

module.exports = users;
