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
      for (var i = 0; i < files.length; i++) {
        if(files[i].substring(files[i].length - 4, files[i].length) != 'json') {
          files.splice(i,1);
        }
      }
      var res = [];
      async.each(files, function(file, callback) {

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
        for (var i = 0; i < files.length; i++) {
          if(files[i].substring(files[i].length - 4, files[i].length) != 'json') {
            files.splice(i,1);
          }
        }
      var res = [];
      async.each(files, function(file, callback) {
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
