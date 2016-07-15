/* Put cloudant calls for iteration here */
"use strict";

var Cloudant = require('cloudant');
var settings = require('../settings');
var common = require('./common-cloudant');

var cloudantDb = Cloudant({account:settings.cloudant.userName, password:settings.cloudant.password});
var dbName = settings.cloudant.dbName;
var agileTeam = cloudantDb.use(dbName);

var iteration = {
  getByTeam: function(callback) {
    common.getByView('teams', 'teams', callback);
  },

  getByIterinfo: function(keys, callback) {
    if (keys != undefined) {
      common.getByViewKey('teams', 'iterinfo', keys, callback);
    } else {
      common.getByView('teams', 'iterinfo', callback);
    }
  },

  getCompletedIterations: function(startkey, endkey) {
    agileTeam.view('teams', 'getCompletedIterations', { 'startkey': startkey, 'endkey': endkey },
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
  }
};

module.exports = iteration;