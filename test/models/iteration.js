"use strict";
var root_path = '../../';
var chai = require('chai');
var crypto = require('crypto');
var expect = chai.expect;
var iterationModel = require(root_path + 'models/iteration');
var validId;
var docId;
var timeout = 100000;
var iterationId;
var iterationId2;
var iterationDocValid = {
  "_id": "testmyid-" + crypto.randomBytes(20).toString('hex'),
  "type": "iterationinfo",
  "team_id": "testteamid_1",
  "iteration_name": "testiterationname-" + crypto.randomBytes(4).toString('hex'),
  "iteration_start_dt": "07/19/2016",
  "iteration_end_dt": "07/20/2016",
  "iterationinfo_status": "Not complete",
  "team_mbr_cnt": "1",
  "nbr_committed_stories": "3",
  "nbr_stories_dlvrd": "",
  "nbr_committed_story_pts": "4",
  "nbr_story_pts_dlvrd": "",
  "iteration_comments": "",
  "team_mbr_change": "No",
  "last_updt_user": "ortegaaa@ph.ibm.com",
  "fte_cnt": "0.0",
  "nbr_dplymnts": "",
  "nbr_defects": "",
  "client_sat": "1.0",
  "team_sat": "4",
  "last_updt_dt": "2016-04-04 03:07:10 EDT",
  "created_user": "ortegaaa@ph.ibm.com",
  "created_dt": "2016-04-04 03:07:10 EDT"
};

var iterationDoc_duplicateIterName = {
  "_id": "testmyid",
  "type": "iterationinfo",
  "team_id": "testteamid_1",
  "iteration_name": "testiterationname-1",
  "iteration_start_dt": "07/19/2016",
  "iteration_end_dt": "07/20/2016",
  "iterationinfo_status": "Not complete",
  "team_mbr_cnt": "1",
  "nbr_committed_stories": "3",
  "nbr_stories_dlvrd": "",
  "nbr_committed_story_pts": "4",
  "nbr_story_pts_dlvrd": "",
  "iteration_comments": "",
  "team_mbr_change": "No",
  "last_updt_user": "ortegaaa@ph.ibm.com",
  "fte_cnt": "0.0",
  "nbr_dplymnts": "",
  "nbr_defects": "",
  "client_sat": "1.0",
  "team_sat": "4",
  "last_updt_dt": "2016-04-04 03:07:10 EDT",
  "created_user": "ortegaaa@ph.ibm.com",
  "created_dt": "2016-04-04 03:07:10 EDT"
};

var iterationDocValid_sample1 = {
  "_id": "testmyid-" + crypto.randomBytes(20).toString('hex'),
  "type": "iterationinfo",
  "team_id": "testteamid_1",
  "iteration_name": "testiterationname-1",
  "iteration_start_dt": "07/19/2016",
  "iteration_end_dt": "07/20/2016",
  "iterationinfo_status": "Not complete",
  "team_mbr_cnt": "1",
  "nbr_committed_stories": "3",
  "nbr_stories_dlvrd": "",
  "nbr_committed_story_pts": "4",
  "nbr_story_pts_dlvrd": "",
  "iteration_comments": "",
  "team_mbr_change": "No",
  "last_updt_user": "ortegaaa@ph.ibm.com",
  "fte_cnt": "0.0",
  "nbr_dplymnts": "",
  "nbr_defects": "",
  "client_sat": "1.0",
  "team_sat": "4",
  "last_updt_dt": "2016-04-04 03:07:10 EDT",
  "created_user": "ortegaaa@ph.ibm.com",
  "created_dt": "2016-04-04 03:07:10 EDT"
};

var iterationDocValid_sample2 = {
  "_id": "testmyid-" + crypto.randomBytes(20).toString('hex'),
  "type": "iterationinfo",
  "team_id": "testteamid_1",
  "iteration_name": "testiterationname-1",
  "iteration_start_dt": "07/19/2016",
  "iteration_end_dt": "07/20/2016",
  "iterationinfo_status": "Not complete",
  "team_mbr_cnt": "1",
  "nbr_committed_stories": "3",
  "nbr_stories_dlvrd": "",
  "nbr_committed_story_pts": "4",
  "nbr_story_pts_dlvrd": "",
  "iteration_comments": "",
  "team_mbr_change": "No",
  "last_updt_user": "ortegaaa@ph.ibm.com",
  "fte_cnt": "0.0",
  "nbr_dplymnts": "",
  "nbr_defects": "",
  "client_sat": "1.0",
  "team_sat": "4",
  "last_updt_dt": "2016-04-04 03:07:10 EDT",
  "created_user": "ortegaaa@ph.ibm.com",
  "created_dt": "2016-04-04 03:07:10 EDT"
};

var iterationDocInvalid = {
  "_id": "testmyid-" + crypto.randomBytes(20).toString('hex'),
  "type": "iterationinfo",
  "team_id": "",
  "iteration_name": "",
  "iteration_start_dt": "07/19/2016",
  "iteration_end_dt": "07/20/2016",
  "iterationinfo_status": "Not complete",
  "team_mbr_cnt": "1",
  "nbr_committed_stories": "3",
  "nbr_stories_dlvrd": "",
  "nbr_committed_story_pts": "4",
  "nbr_story_pts_dlvrd": "",
  "iteration_comments": "",
  "team_mbr_change": "No",
  "last_updt_user": "ortegaaa@ph.ibm.com",
  "fte_cnt": "0.0",
  "nbr_dplymnts": "",
  "nbr_defects": "",
  "client_sat": "alpha",
  "team_sat": "-1",
  "last_updt_dt": "2016-04-04 03:07:10 EDT",
  "created_user": "ortegaaa@ph.ibm.com",
  "created_dt": "2016-04-04 03:07:10 EDT"
};

var user = {
  'shortEmail': 'ortegaaa@ph.ibm.com'
};

describe('Iteration Model', function() {
  after(function(done) {
    this.timeout(timeout);
    // console.log('Attempt to delete Doc1 docId: '+ iterationId);
    iterationModel.get(iterationId)
    .then(function(result) {
      var _id = result._id;
      var _rev = result._rev;
      iterationModel.delete(_id, _rev)
      .then(function(result) {
        console.log('Successfully deleted Doc1 docId: '+_id);
      })
      .catch(function(err) {
        console.log('Err: Attempt to delete Doc1 docId: ' + _id);
        expect(err).to.not.equal(null);
      });
    })
    .catch(function(err) {
      console.log('Err: Attempt to delete Doc1 docId: ' + iterationId);
      expect(err).to.not.equal(null);
    })
    .finally(function() {
      done();
    });
  });

  describe('[getByIterInfo]: Get iteration document', function() {
    this.timeout(timeout);
    it('Get all team iteration documents', function(done) {
      iterationModel.getByIterInfo(null)
      .then(function(result){
        expect(result).to.be.a('object');
        expect(result).to.have.property('rows');
      })
      .catch(function(err) {
        expect(err).to.not.equal(null);
      })
      .finally(function(){
        done();
      });
    });

    it('Get team iteration docs by key', function(done) {
      iterationModel.getByIterInfo(validId)
      .then(function(result) {
        expect(result).to.be.a('object');
        expect(result.rows[0].id).to.be.equal(validId);
      })
      .catch(function(err) {
        expect(err).to.not.equal(null);
      })
      .finally(function(){
        done();
      });
    });

    it('Get non-existent team iteration document', function(done) {
      iterationModel.getByIterInfo(1111111111111111)
      .then(function(result) {
        expect(result).to.be.a('object');
        expect(result.rows[0].id).to.be.equal(id);
      })
      .catch(function(err) {
        expect(err).to.not.equal(null);
      })
      .finally(function(){
        done();
      });
    });
  });

  describe('[get]: Get specific iteration document', function() {
    this.timeout(timeout);
    it('Get a specific team iteration document', function(done) {
      iterationModel.get(validId)
      .then(function(result) {
        expect(result).to.be.a('object');
        expect(result.rows[0].id).to.be.equal(validId);
      })
      .catch(function(err) {
        expect(err).to.not.equal(null);
      })
      .finally(function(){
        done();
      });
    });
  });

  describe('[getCompletedIterationsByKey]: Get completed iteration', function() {
    this.timeout(timeout);
    it('Get completed iteration documents', function(done) {
      var startkey = undefined;
      var endkey = undefined;

      iterationModel.getCompletedIterationsByKey(startkey, endkey)
      .then(function(result) {
        expect(result).to.be.a('object');
      })
      .catch(function(err) {
        expect(err).to.not.equal(null);
      })
      .finally(function(){
        done();
      });
    });
  });

  describe('[add]: Add team iteration document', function() {
    this.timeout(timeout);
    it('It will successfully add new iteration document', function(done) {
      iterationModel.add(iterationDocValid, user)
      .then(function(result) {
        iterationId = result.id;
        //console.log('result iterationId:', iterationId);
        expect(result).to.be.a('object');
        expect(result).to.have.property('id');
        expect(result.ok).to.be.equal(true);
      })
      .catch(function(err) {
        expect(err).to.not.equal(null);
      })
      .finally(function() {
        done();
      });
    });

    it('Return Iteration no/identifier already exists', function(done) {
      iterationModel.add(iterationDoc_duplicateIterName, user)
      .catch(function(err) {
        // console.log('[add] Return Iteration no/identifier already exists err, ', err.error['iteration_name'][0]);
        expect(err.error['iteration_name'][0]).to.contain('exists');
        expect(err).to.not.equal(null);
      })
      .finally(function() {
        done();
      });
    });

    it('It will fail to add iteration document', function(done) {
      iterationModel.add(iterationDocInvalid, user)
      .then(function(result) {
        //console.log('iterationDocInvalid result:', result);
        expect(result).to.be.a('object');
        expect(result).to.have.property('id');
        expect(result.ok).to.be.equal(true);
      })
      .catch(function(err) {
        //console.log('[add] It will fail to add iteration document, ', err);
        expect(err).to.not.equal(null);
      })
      .finally(function() {
        done();
      });
    });
  });

  describe('[edit]: Edit team iteration document', function(){
    this.timeout(timeout);
    it('It will successfully update iteration document', function(done) {
      iterationModel.edit(iterationId, iterationDocValid_sample2, user)
      .then(function(result) {
        //console.log('[edit] result:', result);
        expect(result).to.be.a('object');
        expect(result).to.have.property('id');
        expect(result.ok).to.be.equal(true);
      })
      .catch(function(err) {
        //console.log('[edit] Edit team iteration document:', err);
        expect(err).to.not.equal(null);
      })
      .finally(function() {
        done();
      });
    });

    it('Return Iteration no/identifier already exists', function(done) {
      iterationModel.edit(iterationId, iterationDoc_duplicateIterName, user)
      .catch(function(err) {
        //console.log('[edit] Return Iteration no/identifier already exists:', err);
        expect(err.error.iteration_name[0]).to.contain('exists');
        expect(err.error).to.have.property('iteration_name');
        expect(err).to.not.equal(null);
      })
      .finally(function() {
        done();
      });
    });

    it('It will fail to update iteration document', function(done) {
      iterationModel.edit(iterationId, iterationDocInvalid, user)
      .catch(function(err) {
        //console.log('[edit] It will fail to update iteration document:', err);
        expect(err).to.be.a('object');
        expect(err).to.have.property('error');
        expect(err).to.not.equal(null);
      })
      .finally(function() {
        done();
      });
    });
  });

  describe('[edit]: Edit team iteration document', function(){
    it('Saved successfully iterationId2 document', function(done) {
      this.timeout(timeout);
      iterationId2 = iterationDocValid._id;
      iterationModel.add(iterationDocValid, user)
      .then(function(result) {
        expect(result).to.be.a('object1');
        expect(result).to.have.property('id');
        expect(result.ok).to.be.equal(true);
      })
      .catch(function(err) {
        //console.log('[edit] Edit team iteration iterationId2 document res2:', err);
        expect(err).to.not.equal(null);
      })
      .finally(function() {
        done();
      });
    });

    it('It will successfully update document(iterationId2)', function(done) {
      this.timeout(timeout);
      //console.log('Attempt to edit iterationId2: ', iterationId2);
      iterationModel.edit(iterationId2, iterationDocValid, user)
      .then(function(result) {
        //console.log('[edit] iterationId3 result:', result);
        expect(result).to.be.a('object');
        expect(result).to.have.property('id');
        expect(result.ok).to.be.equal(true);
        done();
      })
      .catch(function(err) {
        //console.log('[edit] Edit team iteration iterationId2 document res1:', err);
        expect(err).to.not.equal(null);
        done();
      });
    });

    it('It will successfully updated document(iterationId2) with New iteration name', function(done) {
      this.timeout(timeout);
      // console.log('Attempt to edit iterationId2: ', iterationId2);
      iterationDocValid.iteration_name = 'newiterationname';
      iterationModel.edit(iterationId2, iterationDocValid, user)
      .then(function(result) {
        //console.log('[edit] iterationId2 result:', result);
        expect(result).to.be.a('object');
        expect(result).to.have.property('id');
        expect(result.ok).to.be.equal(true);
        done();
      })
      .catch(function(err) {
        //console.log('[edit] Edit team iteration iterationId2 document res1:', err);
        expect(err).to.not.equal(null);
        done();
      });
    });

    it('Should return missing', function(done) {
      this.timeout(timeout);
      //console.log('Attempt to edit iterationId2: ', iterationId2);
      iterationDocValid.iteration_name = 'newiterationname';
      iterationModel.edit(111111, iterationDocValid, user)
      .then(function(result) {
        //console.log('[edit] iterationId2 result:', result);
        expect(result).to.be.a('object');
        expect(result).to.have.property('id');
        expect(result.ok).to.be.equal(true);
      })
      .catch(function(err) {
        //console.log('[edit] Edit team iteration iterationId2 document res1:', err);
        expect(err.error).to.equal('missing');
        expect(err).to.not.equal(null);
      })
      .finally(function() {
        done();
      });
    });
  });
});
