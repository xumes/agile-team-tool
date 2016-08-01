/**
 * This contains common cloudant calls
 */
var Promise = require('bluebird');
var Cloudant = require('cloudant');
var _ = require('underscore');
var lodash = require('lodash');
var settings = require('../settings');
var loggers = require('../middleware/logger');
var cloudantDb = Cloudant(settings.cloudant.url);
var dbName = settings.cloudant.dbName;
var agileTeam = Promise.promisifyAll((cloudantDb.use(dbName)));

var formatErrMsg = function(msg){
  loggers.get('models').info('Error: ' + msg);
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

exports.addRecord = function(data) {
  return new Promise(function(resolve, reject){
    agileTeam.insertAsync(data)
    .then(function(body){
      resolve(body);
    })
    .catch(function(err){
      reject(err);
    })
  });
};

exports.getRecord = function(data) {
  return new Promise(function(resolve, reject){
    agileTeam.getAsync(data)
      .then(function(body){
        resolve(body);
      })
      .catch(function(err){
        reject(err);
      });
  });
};

exports.updateRecord = function(data) {
  // revision _id is required on data
  return new Promise(function(resolve, reject){
    agileTeam.insertAsync(data)
    .then(function(body){
      resolve(body);
    })
    .catch(function(err){
      reject(err);
    })
  });
};

exports.deleteRecord = function(_id, _rev) {
  return new Promise(function(resolve, reject){
    infoLogs('Deleting record '+_id+' rev: '+_rev);
    if(!lodash.isEmpty(_id) && !lodash.isEmpty(_rev)){
      agileTeam.destroyAsync(_id, _rev)
        .then(function(body){
          successLogs('Record '+_id+' rev: '+_rev+' has been deleted successfully.');
          resolve(body);
        })
        .catch(function(err){
          reject(err);
        });
    }else{
      reject(formatErrMsg('No document/revision id provided for deletion.'));
    }
  });
};

exports.getByView = function(_design, _view) {
  return new Promise(function(resolve, reject) {
    agileTeam.viewAsync(_design, _view)
      .then(function(body){
        body = _.isEmpty(body.rows) ? {} : body;
        resolve(body);
      })
      .catch(function(err){
        reject(err);
      });
  });
};

exports.getByViewKey = function(_design, _view, _key) {
  return new Promise(function(resolve, reject){
    agileTeam.viewAsync(_design, _view, {'include_docs': false, key: _key })
      .then(function(body){
        resolve(body);
      })
      .catch(function(err){
        reject(err);
      });
  });
};

exports.getByViewWithStartOrEndKey = function(_design, _view, _startkey, _endkey) {
  return new Promise(function(resolve, reject) {
    agileTeam.viewAsync(_design, _view, { 'startkey': _startkey, 'endkey': _endkey })
      .then(function(body){
        body = _.isEmpty(body.rows) ? {} : body;
        resolve(body);
      })
      .catch(function(err){
        reject(err);
      });
  });
}

exports.bulkUpdate = function(data) {
  // document id and revision _id are required on data
  return new Promise(function(resolve, reject){
    agileTeam.bulkAsync(data)
    .then(function(body){
      resolve(body);
    })
    .catch(function(err){
      reject(err);
    })
  });
};