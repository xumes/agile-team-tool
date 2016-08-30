var Promise = require('bluebird');
var common = require('./cloudant-driver');
var _ = require('underscore');

var cleanUp = {
  cleanUpDataById : function(ids){
    return new Promise(function(resolve, reject) {
      //var docs = [];
      common.getByView('utility','cleanUpData')
        .then(function(docs){
          var deleteDocs = [];
          _.each(ids, function(id){
            _.find(docs.rows, function(doc){
              if (id == doc.id) {
                var deleteDoc = new Object();
                deleteDoc['_id'] = id;
                deleteDoc['_rev'] = doc.value;
                deleteDoc['_deleted'] = true;
                deleteDocs.push(deleteDoc);
              }
            });
          });
          var request = {'docs' : deleteDocs};
          common.bulkUpdate(request)
            .then(function(results){
              resolve(results);
            })
            .catch(function(err){
              reject(err);
            });
        })
        .catch(function(err){
          reject(err);
        });
    });
  }
};

module.exports = cleanUp;
