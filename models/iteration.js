/* Put cloudant calls for iteration here */
"use strict";
var db = require('../lib/cloudant-db');

var database_name = 'ciodashboard';

//Database name - can be dynamically changed from env
if (process.env.NODE_ENV === 'test') {
  database_name = 'test_ciodashboard';
}

var ciodashboardSchema = {
  'name': {
    presence: true
  },
  'desc': {
    presence: true
  }
};

exports.findByTeams = function(callback) {
  db.getCloudant().use(database_name).view('teams', 'teams', {},
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

exports.findByIterinfo = function(keys, callback) {
  db.getCloudant().use(database_name).view('teams', 'iterinfo', {'keys': keys},
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

exports.getCompletedIterations = function() {
  db.getCloudant().use(database_name).view('teams', 'iterinfo', {'keys': keys},
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
