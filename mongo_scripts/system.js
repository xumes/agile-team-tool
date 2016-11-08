'use strict';
var _ = require('underscore');
var cloudantDb = require('./data');
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var assert = require('assert');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

var mongoDocs = [];
mongoDocs.push({
  'collTag': 'team',
  'collField': 'members.role',
  'validOptions': ['Analyst', 'Architect', 'Consultant', 'DBA', 'Designer', 'Developer', 'Infrastructure', 'Iteration Manager', 'Manager', 'Operations and Support', 'Product Owner', 'Program & Project Mgmt', 'Tester', 'Other...']
});

mongoDocs.push({
  'collTag': 'team',
  'collField': 'links.linkLabel',
  'validOptions': ['Backlog', 'Defects', 'Retrospectives', 'Standup schedule', 'Wall of Work', 'Other...']
});
console.log(mongoDocs);

var mongoSysDocs = [];
mongoSysDocs.push({
  'flag': 'DynamicChange',
  'desc': 'System is open to all users for read and authorized update',
  'active': false,
  'display': '[Replace with a system wide message to display if `active` is set to true]',
  'adminAccess': 'none'
});

mongoSysDocs.push({
  'flag': 'AdminOnlyChange',
  'desc': 'System is only open to authorized Admin users {see access control} for update; all users will have read-only access',
  'active': false,
  'display': '[Replace with a system wide message to display if `active` is set to true]',
  'adminAccess': 'full'
});
console.log(mongoSysDocs);
//insert into db
var creds = require('./creds');

// Use connect method to connect to the server
MongoClient.connect(creds.url, function(err, db) {
  assert.equal(null, err);
  console.log('Connected successfully to server');
  db.collection('sysCollOptions')
    .drop()
    .then(function() {
      db.collection('sysCollOptions').insertMany(mongoDocs, function(err, r) {
        assert.equal(null, err);
        console.log('Done!  ' + JSON.stringify(r.result));
        db.close();
        process.exit();
      });
    });
  db.collection('sysStatus')
    .drop()
    .then(function() {
      db.collection('sysStatus').insertMany(mongoSysDocs, function(err, r) {
        assert.equal(null, err);
        console.log('Done!  ' + JSON.stringify(r.result));
        db.close();
        process.exit();
      });
    });
});
