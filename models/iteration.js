/* Put cloudant calls for iteration here */
"use strict";
var db = require('../lib/cloudant-db');

var settings = require('./settings');

var common = require('./common-cloudant');

var Cloudant = require('cloudant');

var cloudantDb = Cloudant({account:settings.cloudant.userName, password:settings.cloudant.password});
var dbName = settings.cloudant.dbName;
var agileTeam = cloudantDb.use(dbName);

exports.getByTeam = function(callback) {
  common.getByView('teams', 'teams', callback);
};

exports.getByIterinfo = function(keys, callback) {
  common.getByViewKey('teams', 'iterinfo', keys, callback);
};

exports.getCompletedIterations = function(startkey, endkey) {
  agileTeam.getCloudant().use(dbName).view('teams', 'getCompletedIterations', { 'startkey': startkey, 'endkey': endkey },
    function(err, body) {
      /* istanbul ignore next */
      if (err) {
        callback(err);
        return;
      }
      if (body.rows.length > 0) {
        callback(null, body);
        return;
      } else {
        callback(null, null);
        return;
      }
  });
};

exports.getIterationNumber = function() {

};

exports.addIteration = function() {

};

exports.updateIteration = function() {

};
