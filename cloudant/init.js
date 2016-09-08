var Promise = require('bluebird');
var logger = require('../middleware/logger');
var initLogger = logger.get('init');
var settings = require('../settings');
var Cloudant = require('cloudant');
var cloudantDb = Cloudant(settings.cloudant.url);
var dbName = settings.cloudant.dbName;
var db = cloudantDb.use(dbName);
var fs = require('fs');
var _ = require('underscore');
var async = require('async');
var team = require('../models/index/teamIndex');

module.exports.init = function() {
  //only init cloudant if we are running locally or on app instance 0 in cloudfoundry
  if (_.isEmpty(process.env.CF_INSTANCE_INDEX) || process.env.CF_INSTANCE_INDEX == "0") {
    initLogger.info("Checking Cloudant DB design docs and indexes...");

    //design docs
    Promise.join(getCloudantDocs(), getSourceDocs(), function(cloudantDocs, sourceDocs) {
      /*ignore if design doc exists in the DB but not in the source
        (might be a use case in the future for metrics) */
      initLogger.info("Cloudant design docs:" + cloudantDocs.length +
        ", " + "Source design docs:" + sourceDocs.length);
      //for each source doc, find the doc in cloudant
      _.each(sourceDocs, function(sDoc) {
        var cDoc = _.find(cloudantDocs, function(cDoc) {
          return _.isEqual(sDoc._id, cDoc.doc._id);
        });
        //not found in cloudant, so create it in cloudant
        if (_.isEmpty(cDoc)) {
          initLogger.warn(sDoc._id + " NOT found in DB. Creating it now..");

          db.insert(sDoc, function(err, body) {
            if (!err)
              initLogger.info("Create Success: " + sDoc._id);
            else
              initLogger.error("Create Error: " + sDoc._id + ". " + err);
          });
        }
        //found in cloudant so check version
        else {
          if (!_.isEqual(sDoc.version, cDoc.doc.version)) {
            initLogger.warn(cDoc.doc._id + " cloudant design document is out of date. version=" + cDoc.doc.version + ", source version=" + sDoc.version);
            sDoc["_rev"] = cDoc.doc._rev;
            db.insert(sDoc, function(err, body) {
              if (!err)
                initLogger.info("Update Success: " + sDoc._id + " " + JSON.stringify(body));
              else
                initLogger.error("Update Error: " + sDoc._id + ". " + err);
            });
          } else
            initLogger.info(cDoc.doc._id + " already up-to-date");
        }

      });
      team.initIndex();
    });

    //indexes
    getSourceIndexes()
      .then(function(indexes) {
        _.each(indexes, function(index) {
          db.index(index, function(err, response) {
            if (err)
              initLogger.error(err);
            else {
              if (_.isEqual(response.result, "exists"))
                initLogger.info(index.name + " already exists");
              else
                initLogger.info("Index: " + index.name + " creation result: " + response.result);
            }
          });
        });
      });

    //system docs
    getSystemDocs()
      .then(function(docs) {
        _.each(docs, function(doc) {
          db.get(doc._id, function(err, response) {
            if (err) {
              if (_.isEqual(err.error, "not_found")) {
                db.insert(doc, function(err, body) {
                  if (!err)
                    initLogger.info("Create Success: " + doc._id + " " + body.rev);
                  else
                    initLogger.error("Create Error: " + doc._id + ". " + err);
                });
              }
            } else {
              if (_.isEqual(response._id, doc._id)) {
                initLogger.info(doc._id + " already exists");
                if (doc._id == "ag_ref_team_type_role") {
                  if (_.isUndefined(response.version) || _.isEmpty(response.version) || (response.version < doc.version)) {
                    doc["_rev"] = response._rev;
                    db.insert(doc, function(err, body) {
                      if (!err)
                        initLogger.info("Create Success: " + doc._id + " " + body.rev);
                      else
                        initLogger.error("Create Error: " + doc._id + ". " + err);
                    });
                  }
                }
              } else {
                db.insert(doc, function(err, body) {
                  if (!err)
                    initLogger.info("Create Success: " + doc._id + " " + body.rev);
                  else
                    initLogger.error("Create Error: " + doc._id + ". " + err);
                });
              }
            }
          });
        });
      });

  }
}

var getCloudantDocs = function() {
  return new Promise(function(resolve, reject) {
    db.list({
        startkey: '_design',
        endkey: "_design0",
        include_docs: true
      },
      function(err, body) {
        if (err)
          reject(err);
        else
          resolve(body.rows);
      });
  });
}

var getSourceDocs = function() {
  return new Promise(function(resolve, reject) {
    fs.readdir("./cloudant/design_docs", function(err, files) {
      if (err)
        reject(err);

      var res = [];
      async.each(files, function(file, callback) {
        if (file.indexOf('.json') < 0) return callback();
        var designDoc = require("./design_docs/" + file);
        res.push(designDoc);
        callback();
      }, function() {
        resolve(res);
      });
    });
  });
}

var getSourceIndexes = function() {
  return new Promise(function(resolve, reject) {
    fs.readdir("./cloudant/indexes", function(err, files) {
      if (err)
        reject(err);

      var res = [];
      async.each(files, function(file, callback) {
        if (file.indexOf('.json') < 0) return callback();
        var index = require("./indexes/" + file);
        res.push(index);
        callback();
      }, function() {
        resolve(res);
      });
    });
  });
}

var getSystemDocs = function() {
  return new Promise(function(resolve, reject) {
    fs.readdir("./cloudant/system_docs", function(err, files) {
      if (err)
        reject(err);

      var res = [];
      async.each(files, function(file, callback) {
        if (file.indexOf('.json') < 0) return callback();
        var index = require("./system_docs/" + file);
        res.push(index);
        callback();
      }, function() {
        resolve(res);
      });
    });
  });
}