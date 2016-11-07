'use strict';
var _ = require('underscore');
var cloudantDb = require('./data');
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var assert = require('assert');
var async = require('async');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;


var teamMap = {};

//insert into db
var creds = require('./creds');
// Use connect method to connect to the server
MongoClient.connect(creds.url, function(err, db) {
  assert.equal(null, err);
  console.log('Connected successfully to db');

  async.series([
    //create team map
    function(callback) {
      var teamCursor = db.collection('teams').find();
      teamCursor.each(function(err, doc) {
        if (err) callback(err);
        if (_.isEmpty(doc)) {
          console.log('done mapping teams');
          callback(null);
          return;
        }
        teamMap[doc.cloudantId] = doc;
      });
    },
    function(callback) {
      var col = db.collection('iterations');
      var iterCursor = db.collection('iterations').find({
        teamId: {
          $ne: null
        }
      });
      iterCursor.each(function(err, doc) {
        if (err) callback(err);
        if (_.isEmpty(doc)) {
          console.log('done with iteration updates');
          callback(null);
          return;
        }

        var cloudantId = doc.teamId;

        if (_.isEmpty(teamMap[cloudantId])) {
          console.log(cloudantId + " isn't a team. setting this iteration teamId to null..");
          doc.teamId = undefined;
          var result = col.save(doc);
          iterCursor.next();
          return;
        }

        doc.teamId = teamMap[cloudantId]._id;
        var result = col.save(doc);
      });
    },
    function(callback) {
      //delete all cloudantId keys from iteration collection
      db.collection('iterations')
        .update({}, {
          $unset: {
            cloudantId: 1
          }
        }, {
          multi: true
        },
        function(err, results) {
          console.log('done removing cloudantId from iterations collection');
          callback(null);
        });
    },

    function(callback) {
      var col = db.collection('assessments');
      var assmntCursor = db.collection('assessments').find({
        teamId: {
          $ne: null
        }
      });
      assmntCursor.each(function(err, doc) {
        if (err) callback(err);
        if (_.isEmpty(doc)) {
          console.log('done with assessment updates');
          callback(null);
          return;
        }

        var cloudantId = doc.teamId;

        if (_.isEmpty(teamMap[cloudantId])) {
          console.log(cloudantId + " isn't a team. setting this assessment teamId to null..");
          doc.teamId = undefined;
          var result = col.save(doc);
          assmntCursor.next();
          return;
        }

        doc.teamId = teamMap[cloudantId]._id;
        var result = col.save(doc);
      });
    },
    function(callback) {
      db.collection('assessments')
        .update({}, {
          $unset: {
            cloudantId: 1
          }
        }, {
          multi: true
        },
        function(err, results) {
          console.log('done removing cloudantId from assessments collection');
          callback(null);
        });
    },
    function(callback) {
      db.collection('teams')
        .update({}, {
          $unset: {
            cloudantId: 1
          }
        }, {
          multi: true
        },
        function(err, results) {
          console.log('done removing cloudantId from teams collection');
          callback(null);
        });
    }
  ],
  // optional callback
  function(err, results) {
    if (err) console.log(err);
    console.log('Done with everything!');
  });

});
