"use strict";
var _          = require('underscore');
var cloudantDb = require('./data');
var MongoClient = require('mongodb').MongoClient
var assert     = require('assert');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

var cloudantIterations = _.filter(cloudantDb.rows, function(row){ return row.doc.type === 'iterationinfo'; });
var cloudantIterations = _.pluck(cloudantIterations, 'doc');

var util = require("./util.js");


var mongoIterations = [];
_.each(cloudantIterations, function(doc) {
  if(doc.doc_status==='delete')
    return;
  //set empty string values to be undefined
  doc = _.mapObject(doc, function(val){ return _.isEmpty(val) ? undefined : val; });
  
  var mongoDoc = {
    'cloudantId' : doc._id,
    'createDate': util.stringToUtcDate(doc.created_dt),
    'createdById': doc.created_user,
    'createdBy': doc.created_user,
    'updateDate': util.stringToUtcDate(doc.last_updt_dt),
    'updatedById': doc.last_updt_user,
    'updatedBy': doc.last_updt_user,
    'startDate': util.stringToUtcDate(doc.iteration_start_dt),
    'endDate': util.stringToUtcDate(doc.iteration_end_dt),
    'name' : doc.iteration_name,
    'teamId' : doc.team_id,
    'docStatus' : doc.doc_status,
    'status' : doc.iterationinfo_status,
    'memberCount' : doc.team_mbr_cnt,
    'committedStories': doc.nbr_committed_stories,
    'deliveredStories': doc.nbr_stories_dlvrd,
    'commitedStoryPoints': doc.nbr_committed_story_pts,
    'storyPointsDelivered': doc.nbr_story_pts_dlvrd,
    'locationScore':  doc.fte_cnt,
    'deployments': doc.nbr_dplymnts,
    'defects': doc.nbr_defects,
    'clientSatisfaction': doc.client_sat,
    'teamSatisfaction': doc.team_sat,
    'comment': doc.iteration_comments,
    'memberChanged': (doc.team_mbr_change==='No')? false : true
  };
  mongoIterations.push(mongoDoc);
});


var creds = require('./creds')
// Use connect method to connect to the server
MongoClient.connect(creds.url, function(err, db) {
  
  assert.equal(null, err);
  console.log("Connected successfully to server");
  //console.log(db)
  
  db.collection('iterations').insertMany(mongoIterations, function(err, r) {
        assert.equal(null, err);
        console.log("Done!  " + JSON.stringify(r.result));
        db.close();
        process.exit();
  });
  
});
