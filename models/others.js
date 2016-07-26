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
