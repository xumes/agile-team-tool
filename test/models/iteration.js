var chai = require('chai');
var crypto = require('crypto');
var expect = chai.expect;
var iterationModel = require('../../models/iteration');
var dummyData = require('../data/iteration.js');
var validId;
var validTeamId;
var iterationId;
var iterationDocValid = dummyData.iterationDocValid;
var iterationDoc_duplicateIterName = dummyData.iterationDoc_duplicateIterName;
var iterationDocValid_sample2 = dummyData.iterationDocValid_sample2;
var iterationDocInvalid = dummyData.iterationDocInvalid;
var user = dummyData.user;

describe('Iteration Model', function() {

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

  describe('[add]: Add team iteration document', function() {
    it('It will successfully add new iteration document', function(done) {
      iterationModel.add(iterationDocValid, user)
      .then(function(result) {
        iterationId = result.id;
        validId = result.id;
        validTeamId = iterationDocValid.team_id;
        // console.log('result iterationId:', iterationId);
        expect(result).to.be.a('object');
        expect(result).to.have.property('id');
        expect(result.ok).to.be.equal(true);
        done();
      })
      .catch(function(err) {
        done(err);
      });
    });

    it('Return Iteration no/identifier already exists', function(done) {
      iterationModel.add(iterationDoc_duplicateIterName, user)
      .catch(function(err) {
        expect(err).to.not.equal(null);
        expect(err).to.have.property('error');
        expect(err.error).to.have.property('iteration_name');
        expect(err.error['iteration_name']).to.not.empty;
        expect(err.error['iteration_name'][0]).to.contain('exists');
        done();
      });
    });

    it('It will fail to add iteration document', function(done) {
      iterationModel.add(iterationDocInvalid, user)
      .catch(function(err) {
        expect(err).to.have.property('error');
        done();
      })
    });
  });

  describe('[getByIterInfo]: Get iteration document', function() {
    it('Get all team iteration documents', function(done) {
      iterationModel.getByIterInfo(null)
      .then(function(result){
        expect(result).to.be.a('object');
        expect(result).to.have.property('rows');
        done();
      })
      .catch(function(err) {
        done(err);
      });
    });

    it('Get team iteration docs by key', function(done) {
      // var validTeamId = 'XXXXXXXXXXXX';
      iterationModel.getByIterInfo(validTeamId)
      .then(function(result) {
        expect(result).to.be.a('object');
        expect(result).to.have.property('rows');
        expect(result.rows.length).to.not.equal(0);
        expect(result.rows[0]).to.have.property('value');
        expect(result.rows[0].value).to.have.property('team_id');
        expect(result.rows[0].value.team_id).to.be.equal(validTeamId);
        done();
      })
      .catch(function(err) {
        done(err);
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
        done();
      })
      .catch(function(err) {
        done(err);
      });
    });
  });

  describe('[get]: Get specific iteration document', function() {
    it('Get a specific team iteration document', function(done) {
      iterationModel.get(validId)
      .then(function(result) {
        expect(result).to.be.a('object');
        expect(result).to.have.property('_id');
        expect(result).to.have.property('iteration_name');
        expect(result).to.have.property('team_id');
        done();
      })
      .catch(function(err) {
        done(err);
      });
    });
  });

  describe('[getCompletedIterationsByKey]: Get completed iteration', function() {
    it('Get completed iteration documents', function(done) {
      var startkey = undefined;
      var endkey = undefined;

      iterationModel.getCompletedIterationsByKey(startkey, endkey)
      .then(function(result) {
        expect(result).to.be.a('object');
        done();
      })
      .catch(function(err) {
        done(err);
      });
    });
  });

  describe('[edit]: Edit team iteration document', function(){
    it('It will successfully update iteration document', function(done) {
      iterationModel.edit(iterationId, iterationDocValid_sample2, user)
      .then(function(result) {
        expect(result).to.be.a('object');
        expect(result).to.have.property('id');
        expect(result.ok).to.be.equal(true);
        done();
      })
      .catch(function(err) {
        done(err);
      });
    });

    it('Return Iteration no/identifier already exists', function(done) {
      iterationModel.edit(iterationId, iterationDoc_duplicateIterName, user)
      .catch(function(err) {
        expect(err).to.not.equal(null);
        expect(err.error).to.have.property('iteration_name');
        expect(err.error['iteration_name']).to.not.empty;
        expect(err.error['iteration_name'][0]).to.contain('exists');
        done();
      })
      .catch(function(err) {
        done(err);
      });
    });

    it('It will fail to update iteration document', function(done) {
      iterationModel.edit(iterationId, iterationDocInvalid, user)
      .catch(function(err) {
        // console.log('[edit] It will fail to update iteration document:', err);
        expect(err).to.be.a('object');
        expect(err).to.have.property('error');
        expect(err).to.not.equal(null);
        done();
      })
      .catch(function(err) {
        done(err);
      });
    });

    it('It will successfully updated document with New iteration name', function(done) {
      iterationDocValid.iteration_name = 'newiterationname-' + new Date().getTime();
      iterationModel.edit(iterationId, iterationDocValid, user)
      .then(function(result) {
        expect(result).to.be.a('object');
        expect(result).to.have.property('id');
        expect(result.ok).to.be.equal(true);
        done();
      })
      .catch(function(err) {
        done(err);
      });
    });

    it('Should return missing', function(done) {
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