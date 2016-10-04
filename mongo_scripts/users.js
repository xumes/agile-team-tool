'use strict';
var _           = require('underscore');
var cloudantDb  = require('./data');
var MongoClient = require('mongodb').MongoClient;
var ObjectID    = require('mongodb').ObjectID;
var assert      = require('assert');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

var util = require('./util.js');
var userMap = util.getUserMap();

var mongoUsers = [];
_.each(userMap, function(user) {
  user['adminAccess'] = 'none';
  user['lastLogin'] = undefined;
  mongoUsers.push(user);
});

//insert into db
var creds = require('./creds');
// Use connect method to connect to the server
MongoClient.connect(creds.url, function(err, db) {
  assert.equal(null, err);
  console.log('Connected successfully to server');
  db.collection('users')
    .drop()
    .then(function(){
      return db.collection('users').createIndex({userId:1}, {background: false, unique: true});
    })
    .then(function(){
      db.collection('users').insertMany(
        mongoUsers,
        {ordered:false},
        function(err, r) {
          if (err){
            _.each(err.writeErrors, function(e){
              var err =  e.toJSON();
              console.log('CloudantId:'+err.op.userId+'   ...  '+err.errmsg);
            });
          }
        }
      );
      console.log('Done!  ' + JSON.stringify(r.result));
      db.close();
      process.exit();
    });
});

