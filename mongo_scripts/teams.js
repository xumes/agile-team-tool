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

var mongoTeams = [];
_.each(cloudantTeams, function(doc) {
  //dont port over teams that were deleted
  if(doc.doc_status==='delete')
    return;
  
  //set empty string values to be undefined
  doc = _.mapObject(doc, function(val){ return _.isEmpty(val) ? undefined : val; });
  
  var path = ",";
  
  //get team parent info from it's indexed doc
  var indexedDoc = _.find(concatTeamIndex, function(obj){
    return obj._id === doc._id;
  });
  if(_.isEmpty(indexedDoc))
    console.log("warning: " + doc._id + " was not found in the index");
  
  
  var mongoDoc = {
    // cant do this '_id' : new ObjectID(normalizedName),
    'cloudantId' : doc._id,
    'name'       : doc.name,
    'pathId'     : normalizeString(doc.name),
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
  
  
});