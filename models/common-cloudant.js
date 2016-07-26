/**
 * This contains common cloudant calls
 */
var Promise = require('bluebird');
var Cloudant = require('cloudant');
var _ = require('underscore');
var settings = require('../settings');
var cloudantDb = Cloudant('https://' + settings.cloudant.userName + ':' + settings.cloudant.password + '@' + settings.cloudant.userName + '.cloudant.com');
var dbName = settings.cloudant.dbName;
var agileTeam = Promise.promisifyAll((cloudantDb.use(dbName)));

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
    agileTeam.destroyAsync(_id, _rev)
      .then(function(body){
        resolve(body);
      })
      .catch(function(err){
        reject(err);
      })  
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