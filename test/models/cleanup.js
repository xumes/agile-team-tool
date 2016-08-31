"use strict";
var chai = require('chai');
var expect = chai.expect;
var _ = require('underscore');
var dummyData = require('../data/dummy-data.js');
var teamModel = require('../../models/teams');
var common = require('../../models/cloudant-driver');
var util = require('../../helpers/util');

var testUser = dummyData.user.details.shortEmail.toLowerCase(); // default testuser: john.doe@ph.ibm.com
var testUsersArray = ["john.doe@ph.ibm.com","heranaml@ph.ibm.com"];

describe('Clean-up test data', function() {
  it('Delete Test data that belongs to john.doe@ph.ibm.com', function(done) {
    this.timeout(5000);
    teamModel.getTeamByEmail(testUser)
    .then(function(result) {
      var bulkDeleteIds = [];
      if (result && result.length > 0) {
        _.each(result, function(p) {
          var docid = p.value._id;
          bulkDeleteIds.push(docid);
        });
        // console.log('[1] Total records found to be deleted:', bulkDeleteIds.length);
        // console.log('bulkDeleteIds:', JSON.stringify(bulkDeleteIds));
        if(bulkDeleteIds.length>0) {
          util.BulkDelete(bulkDeleteIds)
          .then(function(result) {
            done();
          })
          .catch(function(err){
            done();
          });
        } else {
          done();
        }
      } else {
        done();
      }
    })
    .catch(function(err) {
      done();
    });
  });

  it('Delete old test data with a name "Team document-"', function(done) {
    this.timeout(5000);
    var bulkDeleteIds = [];
    var params = {
      'q': 'name:Team document-'
    };
    common.Search('teams', 'name', params)
    .then(function(body) {
      if (body && !(_.isEmpty(body.rows))) {
        var data = _.pluck(body.rows, 'doc');
        if (data && data.length > 0) {
          // console.log('records:', data);
          _.each(data, function(p) {
            var docid = p._id;
            var created_user = p.created_user.toLowerCase();
            // console.log('\ndocid:', docid);
            // console.log('created_user:', created_user);
            // Delete test data that belongs to "john.doe@ph.ibm.com", "heranaml@ph.ibm.com"
            if (_.indexOf(testUsersArray, created_user) > -1) {
              // console.log('Test data found! created by '+created_user);
              bulkDeleteIds.push(docid);
            }
          });
          // console.log('[2] Total records found to be deleted:', bulkDeleteIds.length);
          // console.log('\nbulkDeleteIds:', JSON.stringify(bulkDeleteIds));
          if(bulkDeleteIds.length>0) {
            util.BulkDelete(bulkDeleteIds)
            .then(function(result) {
              done();
            })
            .catch(function(err){
              done();
            });
          } else {
            done();
          }
        } else {
          done();
        }
      } else {
        done();
      }
    })
    .catch(function(err) {
      done();
    });
  });
});
