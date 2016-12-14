var chai = require('chai');
var expect = chai.expect;
var app = require('../../../app');
var iterationModel = require('../../../models/mongodb/snapshot');
var request = require('supertest');
var _ = require('underscore');
var querystring = require('querystring');
var agent = request.agent(app);
var testUser = {
  'userId': 'TEST1234567',
  'name': 'test user',
  'email': 'testuser@test.com',
  'adminAccess': 'none'
};

describe('Snapshot API Test', function(){
  before(function(done){
    var promiseArray = [];
    promiseArray.push(userModel.delete(testUser.email));
    Promise.all(promiseArray)
      .then(function(results){
        return userModel.create(testUser);
      })
      .then(function(result){
        done();
      })
      .catch(function(err){
        done();
      });
  });
  before(function(done) {
    agent
      .get('/api/login/masquerade/' + testUser.email)
      .send()
      .end(function(err, res) {
        if (err) throw err;
        agent.saveCookies(res);
        done();
      });
  });
  describe('Snapshot API Test [GET /api/snapshot/updaterollupdata/]', function(){
    this.timeout(60000);
    it('return successful for updating roll up data', function(done) {
      var req = request(app).post('/api/snapshot/updaterollupdata');
      agent.attachCookies(req);
      req.end(function(err, res) {
        if (err) {
          //console.log(err);
        } else {
          expect(res.statusCode).to.be.equal(200);
          expect(res.body).to.be.a('string');
        }
        done();
      });
    });
  });
  describe('Snapshot API Test [GET /api/snapshot/completeiterations]', function(){
    it('return successful for updating iterations', function(done) {
      var req = request(app).post('/api/snapshot/completeiterations');
      agent.attachCookies(req);
      req.end(function(err, res) {
        if (err) {
          //console.log(err);
        } else {
          expect(res.statusCode).to.be.equal(200);
          expect(res.body).to.be.a('object');
        }
        done();
      });
    });
  });
  after(function(done){
    var promiseArray = [];
    promiseArray.push(userModel.delete(testUser.email));
    Promise.all(promiseArray)
      .then(function(results){
        done();
      })
      .catch(function(err){
        done();
      });
  });
});

describe('Snapshot API Test [assessment rollup]', function() {
  this.timeout(60000);
  // do the login before testing
  before(function(done) {
    agent
      .get('/api/login/masquerade/' + userEmail)
      .send()
      .end(function(err, res) {
        if (err) throw err;
        agent.saveCookies(res);
        done();
      });
  });

  it('Successfully roll up assessment data', function(done) {
    var req = request(app).get('/api/snapshot/updateAssessmentRollUpData');
    agent.attachCookies(req);
    req.end(function(err, res) {
      if (err) {} else {
        expect(res.statusCode).to.be.equal(200);
      }
      done();
    });
  });

  it('Successfully return assessment roll up data by team', function(done) {
    var req = request(app).get('/api/snapshot/rollupassessmentbyteam/' + 'ag_team_CIO');
    agent.attachCookies(req);
    req.end(function(err, res) {
      if (err) {} else {
        expect(res.statusCode).to.be.equal(200);
      }
      done();
    });
  });
});
