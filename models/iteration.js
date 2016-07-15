"use strict";

var Cloudant = require('cloudant');
var settings = require('../settings');
var common = require('./common-cloudant');
var _ = require('underscore');

var cloudantDb = Cloudant({account:settings.cloudant.userName, password:settings.cloudant.password});
var dbName = settings.cloudant.dbName;
var agileTeam = cloudantDb.use(dbName);

var iteration = {

  getByIterinfo: function(keys, callback) {
    if (!(_.isEmpty(keys))) {
      common.getByViewKey('teams', 'iterinfo', keys, callback);
    } else {
      common.getByView('teams', 'iterinfo', callback);
    }
  },

  getCompletedIterations: function(startkey, endkey, callback) {
    agileTeam.view('teams', 'getCompletedIterations', { 'startkey': startkey, 'endkey': endkey },
      function(err, body) {
        /* istanbul ignore next */
        if (err) {
          callback(err);
          return;
        }
        if (body.rows && body.rows.length > 0) {
          callback(null, body);
          return;
        } else {
          callback(null, null);
          return;
        }
    });
  },

};

module.exports = iteration;