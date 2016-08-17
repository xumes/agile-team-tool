var querystring = require('querystring');
var chai = require('chai');
var crypto = require('crypto');
var expect = chai.expect;
var request = require('supertest');
var iterationModel = require('../../../models/iteration');
var teamModel = require('../../../models/teams');
var iterationTestData = require('../../data/iteration.js');
var app = require('../../../app');
var validId;
var docId;
var iterationId;
var adminUser = 'Yanliang.Gu1@ibm.com';

var iterationDocValid = iterationTestData.iterationDocValid;
iterationDocValid.last_updt_user = adminUser;

var iterationDoc_duplicateIterName = iterationTestData.iterationDoc_duplicateIterName;
iterationDoc_duplicateIterName.last_updt_user = adminUser;

var iterationDocValid_sample2 = iterationTestData.iterationDocValid_sample2;
iterationDocValid_sample2.last_updt_user = adminUser;

var iterationDocInvalid = iterationTestData.iterationDocInvalid;
iterationDocInvalid.last_updt_user = adminUser;

var agent = request.agent(app);

var teamDocValid = iterationTestData.teamDocValid;
var userDetails = iterationTestData.userDetails;
var userTeams = iterationTestData.userTeams;
var allTeams = iterationTestData.allTeams;
var user = iterationTestData.user;

describe('Iteration API Test', function(){
  before(function(done) {
    // If team document 'testteamid_1' does not exist lets create it because iteration info needs it
    var teamName = 'testteamid_1';
    teamModel.getName(teamName)
    .then(function(result) {
      if (result.length == 0) {
        teamModel.createTeam(teamDocValid, userDetails)
        .then(function(body) {
          expect(body).to.be.a('object');
          expect(body).to.have.property('_id');
          var createdId = body['_id'];
          validTeamId = body['key'];
        });
      } else {
        validTeamId = result[0].key;
      }
    })
    .finally(function() {
      // done();
      // do the login befre testing
      agent
        .get('/api/login/masquerade/' + adminUser)
        .end(function(err, res) {
          if (err) throw err;
          agent.saveCookies(res);
          done();
        });
    });
  });

  // delete the iteration file created in the test
  after(function(done) {
    // console.log('Attempt to delete Doc1 docId: '+ iterationId);
    iterationModel.get(iterationId)
    .then(function(result) {
      var _id = result._id;
      var _rev = result._rev;
      iterationModel.delete(_id, _rev)
      .then(function(result) {
         //console.log('Successfully deleted Doc1 docId: '+_id);
      })
      .catch(function(err) {
         //console.log('Err: Attempt to delete Doc1 docId: ' + _id);
        expect(err).to.not.equal(null);
      });
    })
    .catch(function(err) {
       //console.log('Err: Attempt to delete Doc1 docId: ' + iterationId);
      expect(err).to.not.equal(null);
    })
    .finally(function() {
      done();
    });
  });

  describe('Iteration API Test [POST /api/iteration]: add team iteration document', function(){
    it('It will successfully add new iteration document', function(done){
      var req = request(app).post('/api/iteration');
      agent.attachCookies(req);
      req.send(iterationDocValid);
      req.end(function(err, res){
        if (err) {
          //console.log(err);
        } else {
          expect(res.statusCode).to.be.equal(200);
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.property('id');
          expect(res.body).to.have.property('ok');
          expect(res.body.ok).to.be.equal(true);
          iterationId = res.body.id;
        }
        done();
      });
    });

    it('It will fail to add invalid iteration document', function(done){
      var req =request(app).post('/api/iteration');
      agent.attachCookies(req);
      req.send(iterationDocInvalid);
      req.end(function(err, res){
        if (err) {
          //console.log(err);
        } else {
          expect(res.statusCode).to.be.equal(400);
          expect(res.body).to.have.property('error');
        }
        done();
      });
    });

    it('It will fail with empty document', function(done){
      var req =request(app).post('/api/iteration');
      agent.attachCookies(req);
      req.end(function(err, res){
        if (err) {
          //console.log(err);
        } else {
          expect(res.statusCode).to.be.equal(400);
          expect(res.body).to.have.property('error');
        }
        done();
      });
    });
  });

  describe('Iteration API Test [GET /api/iteration/]: get iteration doucments', function(){
    it('Get all team iteration documents', function(done){
      var req = request(app).get('/api/iteration/');
      agent.attachCookies(req);
      req.end(function(err, res){
        if (err) {
          //console.log(err);
        } else {
          expect(res.statusCode).to.be.equal(200);
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.property('rows');
        }
        done();
      });
    });

    it('Get team iteration docs by key', function(done){
      var validTeamId = iterationDocValid.team_id;
      var req = request(app).get('/api/iteration/' + validTeamId);
      agent.attachCookies(req);
      req.end(function(err, res){
        if (err) {
          //console.log(err);
        } else {
          expect(res.statusCode).to.be.equal(200);
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.property('rows');
          expect(res.body.rows[0]).to.have.property('key');
          expect(res.body.rows[0].key).to.be.equal(validTeamId);
        }
        done();
      });
    });

    it('Get non-existing team iteration document', function(done){
      var invalidTeamId = '11111111';
      var req = request(app).get('/api/iteration/' + invalidTeamId);
      agent.attachCookies(req);
      req.end(function(err, res){
        if (err) {
          //console.log(err);
        } else {
          expect(res.statusCode).to.be.equal(200);
          expect(res.body).to.have.property('rows');
          expect(res.body.rows).to.be.empty;
        }
        done();
      });
    });
  });

  describe('Iteration API Test [GET /api/iteration/searchTeamIteration]: Search team iteration', function(){
    it('Search by team id', function(done) {
      var query = querystring.stringify({'id':iterationDocValid._id});
      var req = request(app).get('/api/iteration/searchTeamIteration?' + query);
      agent.attachCookies(req);
      req.end(function(err, res){
        if (err) {
          //console.log(err);
        } else {
          expect(res.statusCode).to.be.equal(200);
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.property('rows');
        }
        done();
      });
    });
    it('Search by team id with startdate/enddate', function(done) {
      var query = querystring.stringify({'id':iterationDocValid._id, 'startdate': '20160701', 'enddate': '20160701'});
      var req = request(app).get('/api/iteration/searchTeamIteration?' + query);
      agent.attachCookies(req);
      req.end(function(err, res){
        if (err) {
          //console.log(err);
        } else {
          expect(res.statusCode).to.be.equal(200);
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.property('rows');
        }
        done();
      });
    });
  });

  describe('Iteration API Test [PUT /api/iteration/]: update iteration document', function(){
    it('It will successfully update iteration document', function(done){
      var req = request(app).put('/api/iteration/' + iterationId);
      iterationDocValid_sample2._id = iterationId;
      agent.attachCookies(req);
      req.send(iterationDocValid_sample2);
      req.end(function(err, res){
          //console.log(res.body);
        if (err) {
          //console.log(err);
        } else {
          expect(res.statusCode).to.be.equal(200);
          expect(res.body).to.have.property('id');
          expect(res.body.id).to.be.equal(iterationId);
        }
        done();
      });
    });

    it('It will fail to update without iterationId', function(done){
      var req = request(app).put('/api/iteration/');
      agent.attachCookies(req);
      req.send(iterationDocValid_sample2);
      req.end(function(err, res){
        if (err) {
          //console.log(err);
        } else {
          expect(res.statusCode).to.be.equal(400);
          expect(res.body).to.have.property('error');
          expect(res.body.error).to.be.equal('iterationId is missing');
        }
        done();
      });
    });

    it('It will fail to update without document', function(done){
      var req = request(app).put('/api/iteration/' + iterationId);
      var emptyDoc = '';
      agent.attachCookies(req);
      req.send(emptyDoc);
      req.end(function(err, res){
        if (err) {
          //console.log(err);
        } else {
          expect(res.statusCode).to.be.equal(400);
          expect(res.body).to.have.property('error');
          expect(res.body.error).to.be.equal('Iteration data is missing');
        }
        done();
      });
    });

    it('It will fail to update without invalid document', function(done){
      var req = request(app).put('/api/iteration/' + iterationId);
      agent.attachCookies(req);
      req.send(iterationDocInvalid);
      req.end(function(err, res){
        if (err) {
          //console.log(err);
        } else {
          expect(res.statusCode).to.be.equal(400);
          expect(res.body).to.have.property('error');
        }
        done();
      });
    });
  });

  describe('Iteration API Test [GET /api/iteration/current]: get iteration doc by id', function(){
    it('It will successfully get iteration document', function(done){
      var req = request(app).get('/api/iteration/current/' + iterationId);
      agent.attachCookies(req);
      req.end(function(err, res){
        if (err) {
          //console.log(err);
        } else {
          expect(res.statusCode).to.be.equal(200);
          expect(res.body).to.have.property('_id');
          expect(res.body._id).to.be.equal(iterationId);
        }
        done();
      });
    });

    it('It will fail to get iteration document with invalid id', function(done){
      var req = request(app).get('/api/iteration/current/' + 'undefined');
      agent.attachCookies(req);
      req.end(function(err, res){
        if (err) {
          //console.log(err);
        } else {
          expect(res.statusCode).to.be.equal(400);
          expect(res.body).to.have.property('error');
          expect(res.body.error.error).to.be.equal('not_found');
        }
        done();
      });
    });
  });
});
