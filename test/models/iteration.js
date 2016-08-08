var chai = require('chai');
var crypto = require('crypto');
var expect = chai.expect;
var iterationModel = require('../../models/iteration');
var dummyData = require('../data/dummy-data.js');
var validId;
var validTeamId;
var timeout = 100000;
var iterationId;
var iterationDocValid = dummyData.iterationDocValid;
var iterationDoc_duplicateIterName = dummyData.iterationDoc_duplicateIterName;
var iterationDocValid_sample2 = dummyData.iterationDocValid_sample2;
var iterationDocInvalid = dummyData.iterationDocInvalid;
var user = dummyData.user;

describe('Iteration Model', function() {

  describe('[getByIterInfo]: Get iteration document', function() {
    this.timeout(timeout);
    before(function(done) {
      iterationModel.add(iterationDocValid, user)
      .then(function(result) {
        validId = result.id;
        validTeamId = iterationDocValid.team_id;
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

    after(function(done) {
      iterationModel.get(validId)
      .then(function(result) {
        var _id = result._id;
        var _rev = result._rev;
        iterationModel.delete(_id, _rev)
        .then(function(result) {
          // console.log('Successfully deleted Doc validId: '+_id);
        })
        .catch(function(err) {
          // console.log('Err: Attempt to delete Doc1 docId: ' + _id);
          expect(err).to.not.equal(null);
        });
      })
      .catch(function(err) {
        // console.log('Err: Attempt to delete Doc validId: ' + validId);
        expect(err).to.not.equal(null);
      })
      .finally(function() {
        done();
      });
    });

    it('Get all team iteration documents', function(done) {
      iterationModel.getByIterInfo(null)
      .then(function(result){
        expect(result).to.be.a('object');
        expect(result).to.have.property('rows');
      })
      .catch(function(err) {
        expect(err).to.be.equal(null);
        done(err);
      })
      .finally(function(){
        done();
      });
    });

    it('Get team iteration docs by key', function(done) {
      // var validTeamId = 'XXXXXXXXXXXX';
      iterationModel.getByIterInfo(validTeamId)
      .then(function(result) {
        expect(result).to.be.a('object');
        expect(result.rows[0].value.team_id).to.be.equal(validTeamId);
      })
      .finally(function(){
        done();
      });
    });

    it('Get non-existent team iteration document', function(done) {
      var team_id = '1111111111111111';
      iterationModel.getByIterInfo(team_id)
      .then(function(result) {
        expect(result).to.be.a('object');
        expect(result).to.have.property('total_rows');
        expect(result).to.have.property('offset');
        expect(result).to.have.property('rows');
        expect(result.rows.length).to.be.equal(0);
      })
      .finally(function() {
        done();
      });
    });
  });

  describe('[get]: Get specific iteration document', function() {
    this.timeout(timeout);
    before(function(done) {
      iterationModel.add(iterationDocValid, user)
      .then(function(result) {
        validId = result.id;
        // console.log('result validId:', validId);
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

    after(function(done) {
      iterationModel.get(validId)
      .then(function(result) {
        var _id = result._id;
        var _rev = result._rev;
        iterationModel.delete(_id, _rev)
        .then(function(result) {
          // console.log('Successfully deleted Doc validId: '+_id);
        })
        .catch(function(err) {
          // console.log('Err: Attempt to delete Doc1 docId: ' + _id);
          expect(err).to.not.equal(null);
        });
      })
      .catch(function(err) {
        // console.log('Err: Attempt to delete Doc validId: ' + validId);
        expect(err).to.not.equal(null);
      })
      .finally(function() {
        done();
      });
    });

    it('Get a specific team iteration document', function(done) {
      iterationModel.get(validId)
      .then(function(result) {
        expect(result).to.be.a('object');
        expect(result).to.have.property('_id');
        expect(result).to.have.property('iteration_name');
        expect(result).to.have.property('team_id');
      })
      .catch(function(err) {
        expect(err).to.not.equal(null);
      })
      .finally(function() {
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
        // console.log('result iterationId:', iterationId);
        expect(result).to.be.a('object');
        expect(result).to.have.property('id');
        expect(result.ok).to.be.equal(true);
      })
      .finally(function() {
        done();
      });
    });

    it('Return Iteration no/identifier already exists', function(done) {
      iterationModel.add(iterationDoc_duplicateIterName, user)
      .catch(function(err) {
        expect(err.error['iteration_name'][0]).to.contain('exists');
        expect(err).to.not.equal(null);
      })
      .finally(function() {
        done();
      });
    });

    it('It will fail to add iteration document', function(done) {
      iterationModel.add(iterationDocInvalid, user)
      .catch(function(err) {
        expect(err).to.have.property('error');
      })
      .finally(function() {
        done();
      });
    });
  });

  describe('[edit]: Edit team iteration document', function(){
    this.timeout(timeout);
    before(function(done) {
      iterationModel.add(iterationDocValid, user)
      .then(function(result) {
        iterationId = result.id;
        console.log('result iterationId:', iterationId);
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

    it('It will successfully update iteration document', function(done) {
      iterationModel.edit(iterationId, iterationDocValid_sample2, user)
      .then(function(result) {
        expect(result).to.be.a('object');
        expect(result).to.have.property('id');
        expect(result.ok).to.be.equal(true);
      })
      .finally(function() {
        done();
      });
    });

    it('Return Iteration no/identifier already exists', function(done) {
      iterationModel.edit(iterationId, iterationDoc_duplicateIterName, user)
      .catch(function(err) {
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
        // console.log('[edit] It will fail to update iteration document:', err);
        expect(err).to.be.a('object');
        expect(err).to.have.property('error');
        expect(err).to.not.equal(null);
      })
      .finally(function() {
        done();
      });
    });

    it('It will successfully updated document with New iteration name', function(done) {
      iterationDocValid.iteration_name = 'newiterationname-' + new Date().getTime();
      iterationModel.edit(iterationId, iterationDocValid, user)
      .then(function(result) {
        expect(result).to.be.a('object');
        expect(result).to.have.property('id');
        expect(result.ok).to.be.equal(true);
      })
      .finally(function() {
        done();
      });
    });

    it('Should return missing', function(done) {
      this.timeout(timeout);
      var id = '111111';
      iterationDocValid.iteration_name = 'newiterationname';
      iterationModel.edit(id, iterationDocValid, user)
      .catch(function(err) {
        expect(err.error).to.equal('missing');
        expect(err).to.not.equal(null);
      })
      .finally(function() {
        done();
      });
    });
  });

});
