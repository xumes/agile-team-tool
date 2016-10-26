'use strict';
var _           = require('underscore');
var cloudantDb  = require('./data');
var MongoClient = require('mongodb').MongoClient;
var ObjectID    = require('mongodb').ObjectID;
var assert      = require('assert');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

var util = require('./util.js');

var cloudantUserApi = _.filter(cloudantDb.rows, function(row){ return row.doc.type === 'api_key'; });
var cloudantUserApi = _.pluck(cloudantUserApi, 'doc');

var mongoUserApi = [];
_.each(cloudantUserApi, function(doc) {
  //set empty string values to be undefined
  doc = _.mapObject(doc, function(val){ return _.isEmpty(val) ? undefined : val; });
  
  var mongoDoc = {
    'userId'     : doc.userId.toUpperCase(),
    'email'      : util.lowerCase(doc.email),
    'key'        : doc.key,
    'createDate' : util.stringToUtcDate(doc.createDate),
  };

  mongoUserApi.push(mongoDoc);
});

//insert into db
var creds = require('./creds');

// Use connect method to connect to the server
MongoClient.connect(creds.url, function(err, db) {
  assert.equal(null, err);
  console.log('Connected successfully to server');
  db.collection('apiKeys')
    .drop()
    .then(function(){
      db.collection('apiKeys').insertMany(mongoUserApi, function(err, r) {
        assert.equal(null, err);
        console.log('Done!  ' + JSON.stringify(r.result));
        db.close();
        process.exit();
      });
    });
});
