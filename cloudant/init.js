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

//TODO
module.exports.init = function(){
  //only init cloudant if we are running locally or on app instance 0 in cloudfoundry
  if(_.isEmpty(process.env.CF_INSTANCE_INDEX) || process.env.CF_INSTANCE_INDEX == "0"){
    logger.get('init').info("Checking Cloudant DB fixtures...");
    
    Promise.join(getCloudantDocs(), getSourceDocs(),
        function(cloudantDocs, sourceDocs) {
          
        //TODO
        // console.log(cloudantDocs);
        // console.log("\n\n\n\n\n");
        // console.log(sourceDocs);

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
         var designDoc = require("./design_docs/" + file);
         res.push(designDoc);
         callback();
          
      }, function() {
         resolve(res);
       });
    });
 });
}