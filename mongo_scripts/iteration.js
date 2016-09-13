"use strict";
var _          = require('underscore');
var cloudantDb = require('./allProdDocs');
var moment     = require('moment');

var cloudantIterations = _.filter(cloudantDb.rows, function(row){ return row.doc.type === 'iterationinfo'; });
var cloudantIterations = _.pluck(cloudantIterations, 'doc');


var stringToUtcFormat = function(string){
  if(_.isEmpty(string))
    return undefined;

  if(string.indexOf('UTC') > 0)
    return moment.utc(string).format();
  else if(string.indexOf('EST') > 0 || string.indexOf('EDT') > 0)
    return moment(string).utc().format();
  else if(string.indexOf('adm') > 0) //convert to utc for this case
    return moment(string).utc().format();
  else if(string.indexOf('UTC') < 0 && string.indexOf('EST') < 0 && string.indexOf('EDT') < 0) //homer said assume UTC
    return moment.utc(string).format() === 'Invalid date' ? undefined : moment.utc(string).format()

}

var mongoIterations = [];
_.each(cloudantIterations, function(doc) {
  
  //set empty string values to be undefined
  doc = _.mapObject(doc, function(val){ return _.isEmpty(val) ? undefined : val; });
  
  var mongoDoc = {
    'cloudantId' : doc._id,
    'createDate': new Date(stringToUtcFormat(doc.created_dt)),
    'createdById': doc.created_user,
    'createdBy': doc.created_user,
    'updateDate': new Date(stringToUtcFormat(doc.last_updt_dt)),
    'updatedById': doc.last_updt_user,
    'updatedBy': doc.last_updt_user,
    'startDate': new Date(stringToUtcFormat(doc.iteration_start_dt)),
    'endDate': new Date(stringToUtcFormat(doc.iteration_end_dt)),
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


