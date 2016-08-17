var Promise       = require('bluebird');
var logger        = require('../middleware/logger');
var settings      = require('../settings');
var Cloudant      = require('cloudant');
var cloudantDb    = Cloudant(settings.cloudant.url);
var dbName        = settings.cloudant.dbName;
var db            = cloudantDb.use(dbName);
var fs            = require('fs');
var _             = require('underscore');
var async         = require('async');
var util          = require('../helpers/util');

module.exports.init = function(){
  //only init cloudant if we are running locally or on app instance 0 in cloudfoundry
  if(_.isEmpty(process.env.CF_INSTANCE_INDEX) || process.env.CF_INSTANCE_INDEX == "0"){
    logger.get('init').info("Checking Cloudant DB design docs and indexes...");

    //design docs
    Promise.join(getCloudantDocs(), getSourceDocs(), function(cloudantDocs, sourceDocs) {
        /*ignore if design doc exists in the DB but not in the source
          (might be a use case in the future for metrics) */
        logger.get('init').info("Cloudant design docs:"+cloudantDocs.length
        +", "+"Source design docs:"+sourceDocs.length);
        //for each source doc, find the doc in cloudant
        _.each(sourceDocs, function(sDoc){
          var cDoc = _.find(cloudantDocs, function(cDoc){return _.isEqual(sDoc._id, cDoc.doc._id); });
          //not found in cloudant, so create it in cloudant
          if(_.isEmpty(cDoc)){
            logger.get('init').warn(sDoc._id + " NOT found in DB. Creating it now..");

            db.insert(sDoc, function(err, body) {
              if(!err)
                logger.get('init').info("Create Success: "+sDoc._id);
              else
                logger.get('init').error("Create Error: "+sDoc._id+". "+ err);
            });
          }
          //found in cloudant so check version
          else{
            if(!_.isEqual(sDoc.version, cDoc.doc.version)){
              logger.get('init').warn(cDoc.doc._id+" cloudant design document is out of date. version="+cDoc.doc.version+", source version="+sDoc.version);
              sDoc["_rev"]=cDoc.doc._rev;
              db.insert(sDoc, function(err, body) {
                if(!err)
                  logger.get('init').info("Update Success: "+sDoc._id+ " "+JSON.stringify(body));
                else
                  logger.get('init').error("Update Error: "+sDoc._id+". "+ err);
              });
            }
            else
              logger.get('init').info(cDoc.doc._id + " already up-to-date");
          }

        });
        initIndex();
    });

    //indexes
    getSourceIndexes()
    .then(function(indexes){
      _.each(indexes, function(index){
        db.index(index, function(err, response) {
          if (err)
            logger.get('init').error(err);
          else{
            if(_.isEqual(response.result,"exists"))
              logger.get('init').info(index.name+" already exists");
            else
              logger.get('init').info("Index: "+index.name+" creation result: "+response.result);
          }
        });
      });
    });

  }
}

var getCloudantDocs = function(){
  return new Promise(function(resolve, reject) {
    db.list({startkey:'_design', endkey:"_design0", include_docs:true},
      function(err, body){
        if (err)
          reject(err);
        else
          resolve(body.rows);
      });
  });
}

var getSourceDocs = function(){
  return new Promise(function(resolve, reject) {
    fs.readdir("./cloudant/design_docs", function(err, files){
      if(err)
        reject(err);

      var res = [];
      async.each(files, function(file, callback) {
         if(file.indexOf('.json')<0) return callback();
         var designDoc = require("./design_docs/" + file);
         res.push(designDoc);
         callback();
      }, function() {
           resolve(res);
         }
      );
    });
  });
}

var getSourceIndexes = function(){
  return new Promise(function(resolve, reject) {
    fs.readdir("./cloudant/indexes", function(err, files){
      if(err)
        reject(err);
        
      var res = [];
      async.each(files, function(file, callback) {
         if(file.indexOf('.json')<0) return callback();
         var index = require("./indexes/" + file);
         res.push(index);
         callback();
      }, function() {
           resolve(res);
         }
      );
    });
  });
}

var getAllChildren = function(teamId, teamList) {
  var children = _.isEmpty(children) ? [] : children;
  var team = teamList[teamId];
  if (!_.isEmpty(team)) {
    if (!_.isEmpty(team.child_team_id)) {
      children = _.union(children, team.child_team_id);
      _.each(team.child_team_id, function(id) {
        children = _.union(children, getAllChildren(id, teamList, children));
      });
    }
  }
  return children;
}

var getAllParents = function(teamId, teamList) {
  var parents = _.isEmpty(parents) ? [] : parents;
  var team = teamList[teamId];
  if (!_.isEmpty(team) && !_.isEmpty(team.parent_team_id)) {
    parents = _.union(parents, [team.parent_team_id]);
    parents = _.union(parents, getAllParents(team.parent_team_id, teamList));
  }
  return parents;
}

var initIndex = function() {
  var indexDocument = new Object();
  indexDocument._id = "ag_ref_team_index";
  indexDocument.domains = [];
  indexDocument.tribes = [];
  indexDocument.squads = [];


  logger.get('init').info("Processing all teams for lookup index.");
  db.view('teams', 'teams', function(err, body) {
    var allTeams = util.returnObject(body.rows);
    var teamList = _.indexBy(allTeams, function(team) {return team._id});

    allTeams = _.groupBy(allTeams, function(team) {
      var level =  "squads";
      if (_.isEmpty(team.parent_team_id) && (!_.isEmpty(team.squadteam) && team.squadteam.toLowerCase() == 'no'))
        level = "domains";
      else if (!_.isEmpty(team.parent_team_id) && (!_.isEmpty(team.squadteam) && team.squadteam.toLowerCase() == 'no'))
        level = "tribes";
      return level;
    });

    if (_.has(allTeams, 'domains'))
      allTeams.domains = _.sortBy(allTeams.domains, function(team) {return team.name});
    if (_.has(allTeams, 'tribes'))
      allTeams.tribes = _.sortBy(allTeams.tribes, function(team) {return team.name});
    if (_.has(allTeams, 'squads')) 
      allTeams.squads = _.sortBy(allTeams.squads, function(team) {return team.name});

    _.each(allTeams.domains, function(team) {
      var indexObj = new Object();
      indexObj._id = team._id;
      indexObj.name = team.name;
      indexObj.squadteam = team.squadteam;
      indexObj.parents = !_.isEmpty(team.parent_team_id) ? [team.parent_team_id] : [];
      indexObj.children = _.union(team.child_team_id, getAllChildren(team._id, teamList));
      indexDocument.domains.push(indexObj);
    });

    _.each(allTeams.tribes, function(team) {
      var indexObj = new Object();
      indexObj._id = team._id;
      indexObj.name = team.name;
      indexObj.squadteam = team.squadteam;
      indexObj.parents = _.union([team.parent_team_id], getAllParents(team._id, teamList));
      indexObj.children = _.union(team.child_team_id, getAllChildren(team._id, teamList));
      indexDocument.tribes.push(indexObj);
    });

    _.each(allTeams.squads, function(team) {
      var indexObj = new Object();
      indexObj._id = team._id;
      indexObj.name = team.name;
      indexObj.squadteam = team.squadteam;
      indexObj.parents = !_.isEmpty(team.parent_team_id) ? [team.parent_team_id] : [];
      indexObj.children = team.child_team_id;

      var tribeIndex = _.findWhere(indexDocument.tribes, {_id : team.parent_team_id});
      if (!_.isEmpty(tribeIndex)) {
        indexObj.parents = _.union(indexObj.parents, tribeIndex.parents);
      }

      indexDocument.squads.push(indexObj);
    });

    logger.get('init').info("Squads: " + _.size(indexDocument.squads));
    logger.get('init').info("Tribes: " + _.size(indexDocument.tribes));
    logger.get('init').info("Domains: " + _.size(indexDocument.domains));

    var allIndex = new Object();
    allIndex._id = "ag_ref_team_index";
    allIndex.lookup = _.union(indexDocument.domains, indexDocument.tribes, indexDocument.squads);
    logger.get('init').info("Index size: " + _.size(allIndex.lookup));
    
    logger.get('init').info("Finding current lookup index.");
    db.get("ag_ref_team_index", function(err, body) {
      if (err) {
        db.insert(allIndex, function(err, body) {
          if (!err)
            logger.get('init').info("Lookup index created.");
          else
            logger.get('init').error("Failed to create lookup index. " + err);
        });
      } else {
        if (_.has(body, "_rev"))
          allIndex._rev = body._rev;
        
        db.insert(allIndex, function(err, body) {
          if (!err)
            logger.get('init').info("Lookup index updated.");
          else
            logger.get('init').error("Failed to update lookup index. " + err);
        });
      }
    });
  });
}