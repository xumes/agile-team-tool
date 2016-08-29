var chai = require('chai');
var crypto = require('crypto');
var expect = chai.expect;
var iterationModel = require('../../models/iteration');
var teamModel = require('../../models/teams');
var dummyData = require('../data/iteration.js');
var timeout = 100000;
var validId;
var validTeamId;
var iterationId;
var iterationName;
var iterationRev;
var iterationDocValid = dummyData.iterationDocValid;
var iterationDoc_duplicateIterName = dummyData.iterationDoc_duplicateIterName;
var iterationDocValid_sample2 = dummyData.iterationDocValid_sample2;
var iterationDocInvalid = dummyData.iterationDocInvalid;
var teamDocValid = dummyData.teamDocValid;
var user = dummyData.user;
var userDetails = dummyData.userDetails;
var allTeams = dummyData.allTeams;
var userTeams = dummyData.userTeams;

describe('Iteration Model', function() {
  before(function(done) {
    var teamName = 'testteamid_1';
    teamModel.getName(teamName)
    .then(function(result) {
      if (result.length == 0) {
        teamModel.createTeam(teamDocValid, userDetails)
        .then(function(body) {
          expect(body).to.be.a('object');
          expect(body).to.have.property('_id');
          validId = body['_id'];
          validTeamId = body['key'];
        });
      } else {
        validTeamId = result[0].key;
      }
    })
    .finally(function() {
      done();
    });
  });

  after(function(done){
    iterationModel.delete(iterationId, iterationRev)
      .then(function(result){
        expect(result).to.be.a('object');
        expect(result).to.have.property('ok');
        expect(result).to.have.property('id');
        done();
      })
      .catch(function(err){
        done(err);
      })
  });

  describe('[add]: Add team iteration document', function() {
    this.timeout(timeout);
    it('It will successfully add new iteration document', function(done) {
      iterationDocValid.iteration_name = "testiterationname-" + crypto.randomBytes(4).toString('hex');
      iterationModel.add(iterationDocValid, user, allTeams, userTeams)
      .then(function(result) {
        iterationId = result.id;
        iterationRev = result.rev;
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
      this.timeout(timeout);
      iterationModel.add(iterationDoc_duplicateIterName, user, allTeams, userTeams)
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
      iterationModel.add(iterationDocInvalid, user, allTeams, userTeams)
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
    before(function(done) {
      iterationModel.getByIterInfo('testteamid_1')
      .then(function(result) {
        if (result.rows.length == 0) {
          iterationModel.add(iterationDocValid, user, allTeams, userTeams)
          .then(function(result) {
            iterationId = result.id;
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
        } else {
          iterationId = result.rows[0].id;
          done();
        }
      });
    });

    it('Get a specific team iteration document', function(done) {
      iterationModel.get(iterationId)
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
    this.timeout(timeout);
    before(function(done) {
      var teamName = 'testteamid_1';
      iterationModel.getByIterInfo(teamName)
      .then(function(result) {
        if (result.rows.length == 0) {
          iterationModel.add(iterationDocValid, user, allTeams, userTeams)
          .then(function(result) {
            iterationId = result.id;
            iterationName = result.iteration_name;
            iterationRev = result.rev;
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
        } else {
          iterationId = result.rows[0].id;
          iterationName = result.rows[0].value.iteration_name;
          done();
        }
      });
    });

    it('It will successfully update iteration document with same iteration name - compare old with the new - isNew = false', function(done) {
      //iterationDocValid.team_mbr_change = 'YES';
      //iterationDocValid.iteration_name = "testiterationname-" + crypto.randomBytes(4).toString('hex');
      iterationDocValid.iteration_name = iterationName;
      iterationModel.edit(iterationId, iterationDocValid, user, allTeams, userTeams)
      .then(function(result) {
        iterationRev =result.rev;
        expect(result).to.be.a('object');
        expect(result).to.have.property('id');
        expect(result.ok).to.be.equal(true);
        done();
      })
      .catch(function(err) {
        done(err);
      });
    });


    it('It will successfully update iteration document with same iteration name', function(done) {
      //iterationDocValid.team_mbr_change = 'YES';
      iterationDocValid.iteration_name = "testiterationname-" + crypto.randomBytes(4).toString('hex');
      iterationModel.edit(iterationId, iterationDocValid, user, allTeams, userTeams)
      .then(function(result) {
        iterationRev =result.rev;
        expect(result).to.be.a('object');
        expect(result).to.have.property('id');
        expect(result.ok).to.be.equal(true);
        done();
      })
      .catch(function(err) {
        done(err);
      });
    });

    it('It will successfully update iteration document', function(done) {
      iterationModel.edit(iterationId, iterationDocValid_sample2, user, allTeams, userTeams)
      .then(function(result) {
        iterationRev =result.rev;
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
      iterationModel.edit(iterationId, iterationDoc_duplicateIterName, user, allTeams, userTeams)
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
      iterationModel.edit(iterationId, iterationDocInvalid, user, allTeams, userTeams)
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
      iterationModel.edit(iterationId, iterationDocValid, user, allTeams, userTeams)
      .then(function(result) {
        iterationRev =result.rev;
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
      iterationModel.edit(id, iterationDocValid, user, allTeams, userTeams)
      .catch(function(err) {
        expect(err).to.not.equal(null);
        expect(err.error).to.equal('missing');
        done();
      })
    });
  });

  describe('[delete]: delete team iteration document', function() {
    it('Should return _id/_rev is missing', function(done){
      iterationModel.delete()
      .catch(function(err){
        expect(err).to.not.equal(null);
        expect(err).to.have.property('error');
        expect(err.error).to.have.property('_id');
        expect(err.error._id[0]).to.be.equal('_id/_rev is missing');
        done();
      });
    });
  });

});
