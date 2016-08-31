var cloudantDriver = require('./cloudant-driver');
var loggers = require('../middleware/logger');
var Promise = require('bluebird');

module.exports.getAdmins = function () {
  return new Promise(function(resolve, reject) {
      loggers.get('model-users').info('Getting all admins and supports..');
      cloudantDriver.getRecord('ag_ref_access_control').then(function(body){
        loggers.get('model-users').info('Success: Admin records obtained');
        resolve(body);
      })
      .catch( /* istanbul ignore next */ function(err) {
        loggers.get('model-users').error('ERROR: '+err);
        msg = err.error;
        reject(msg);
      });
  });
};
