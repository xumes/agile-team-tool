"use strict";
var _           = require('underscore');
var cloudantDb  = require('./data');
var MongoClient = require('mongodb').MongoClient;
var ObjectID    = require('mongodb').ObjectID;
var assert      = require('assert');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

var util = require("./util.js");


var cloudantTeams = _.filter(cloudantDb.rows, function(row){ return row.doc.type === 'team'; });
var cloudantTeams = _.pluck(cloudantTeams, 'doc');
var team_index = _.find(cloudantDb.rows, function(row){return row.id==='ag_ref_team_index'})
var team_index = team_index.doc;

//combine indexed domains, tribes, squads, and lookup arrays into 1 big array
var concatTeamIndex = [];
concatTeamIndex = concatTeamIndex.concat(team_index.domains);
concatTeamIndex = concatTeamIndex.concat(team_index.tribes);
concatTeamIndex = concatTeamIndex.concat(team_index.squads);
concatTeamIndex = concatTeamIndex.concat(team_index.lookup);

var normalizeString = function(str) {
  return str.toLowerCase().replace(/[^a-z1-9]/g, '');
};

var pathMap = {};
var parentMap = {};
var mongoTeams = [];
_.each(cloudantTeams, function(doc) {
  //dont port over teams that were deleted
  if(doc.doc_status==='delete')
    return;
  
  //set empty string values to be undefined
  doc = _.mapObject(doc, function(val){ return _.isEmpty(val) ? undefined : val; });
  
  //rename members.key to members.cnum because 'key' is not descriptive
  _.each(doc.members, function(member){
    member['cnum'] = member['key'];
    delete member['key'];
  });
  
  
  //get team parent info from it's indexed doc
  var indexDoc = _.find(concatTeamIndex, function(obj){
    return obj._id === doc._id;
  });
  if(_.isEmpty(indexDoc))
    console.log("warning: " + doc._id + " was not found in the index");
  var parents = indexDoc.parents;
  
  
  var pathId = normalizeString(doc.name);
  
  //check if pathId is unique
  _.each(mongoTeams, function(obj){
    if(_.isEqual(obj.pathId, pathId)){
      console.log('error conflicting path') //TODO need to clean up prod db and remove duplicate teams
      // console.log('ERROR: ' + pathId + '  exists already.');
      // console.log('new mongo doc: ' + JSON.stringify(doc));
      // console.log('\n')
      // console.log('conflicting doc: ' + JSON.stringify(obj));
      // console.log('\n\n\n')
    }
  });
  
  //populate the map from doc._id -> pathId so we can compute paths in the next step
  pathMap[doc._id] = pathId;
  //store parent info too for this id
  parentMap[doc._id] = parents;
  
  var mongoDoc = {
    // cant do this '_id' : new ObjectID(normalizedName),
    'cloudantId' : doc._id,
    'name'       : doc.name,
    'pathId'     : pathId,
    'path'       : undefined,
    'members'    : doc.members,
    'type'       : (doc.squadteam==='Yes'? 'squad' : undefined),
    'description': doc.desc,
    'createDate' : util.stringToUtcDate(doc.created_dt),
    'createdById': doc.created_user,
    'createdBy'  : doc.created_user,
    'updateDate' : util.stringToUtcDate(doc.last_updt_dt),
    'updatedById': doc.last_updt_user,
    'updatedBy'  : doc.last_updt_user,
    'startDate'  : util.stringToUtcDate(doc.iteration_start_dt),
    'endDate'    : util.stringToUtcDate(doc.iteration_end_dt),
    'docStatus'  : doc.doc_status
  };
  
  mongoTeams.push(mongoDoc);
});

//build the paths
_.each(mongoTeams, function(mongoDoc) {
  //case where the team has no parents
  if(_.isEmpty(parentMap[mongoDoc.cloudantId])) {
    //console.log(mongoDoc.name + " has  parents")
    return;
  }
  
  var path = '';
  
  var parentsDesc = parentMap[mongoDoc.cloudantId].reverse();
  
  _.each(parentsDesc, function(parent){
    if(_.isEmpty(pathMap[parent])){
      //looks like there was ~27 cases here all 'leaf parents' decided to skip and not worry about it
      //console.log(parent + " doesnt map to anything in pathMap. which means that its not a team anymore")
    }
    else{
      var parentPathId = pathMap[parent];
      path = path.concat(','+parentPathId)
    }
  });
  //append last comma
  path = path.concat(',');
  
  //console.log(path);
  mongoDoc['path'] = path;
});


//insert into db
var creds = require('./creds')
// Use connect method to connect to the server
MongoClient.connect(creds.url, function(err, db) {
  
  assert.equal(null, err);
  console.log("Connected successfully to server");
  //console.log(db)
  
  db.collection('teams').insertMany(mongoTeams, function(err, r) {
        assert.equal(null, err);
        console.log("Done!  " + JSON.stringify(r.result));
        db.close();
        process.exit();
  });
  
});



