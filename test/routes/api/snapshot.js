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
  describe('Snapshot model [updateRollUpData]', function(){
    it('return successful for updating roll up data', function(done) {
      snapshotModel.updateRollUpData()
        .then(function(result){
          expect(result).to.be.a('string');
          done();
        });
    });
  });
});

describe('Snapshot API Test [GET /api/snapshot/getrollupdata]: calculate and update non squad teams iteartions', function() {
  this.timeout(60000);
  // do the login befre testing
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

  it('Successfully roll up data', function(done) {
    var req = request(app).get('/api/snapshot/updaterollupdata');
    agent.attachCookies(req);
    req.end(function(err, res) {
      if (err) {} else {
        expect(res.statusCode).to.be.equal(200);
      }
      done();
    });
  });

  it('Successfully return top level team', function(done) {
    var req = request(app).get('/api/snapshot/getteams/' + userEmail);
    agent.attachCookies(req);
    req.end(function(err, res) {
      if (err) {} else {
        expect(res.statusCode).to.be.equal(200);
      }
      done();
    });
  });

  it('Successfully roll up squads', function(done) {
    var req = request(app).get('/api/snapshot/updaterollupsquads');
    agent.attachCookies(req);
    req.end(function(err, res) {
      if (err) {} else {
        expect(res.statusCode).to.be.equal(200);
      }
      done();
    });
  });

  it('Successfully return roll up data for team', function(done) {
    var req = request(app).get('/api/snapshot/rollupdatabyteam/' + 'ag_team_CIO');
    agent.attachCookies(req);
    req.end(function(err, res) {
      if (err) {} else {
        expect(res.statusCode).to.be.equal(200);
      }
      done();
    });
  });

  it('Successfully return roll up squads for team', function(done) {
    var req = request(app).get('/api/snapshot/rollupsquadsbyteam/' + 'ag_team_CIO');
    agent.attachCookies(req);
    req.end(function(err, res) {
      if (err) {} else {
        expect(res.statusCode).to.be.equal(200);
      }
      done();
    });
  });

  it('Successfully complete iterations if past end date', function(done) {
    var req = request(app).get('/api/snapshot/completeiterations');
    agent.attachCookies(req);
    req.end(function(err, res) {
      if (err) {} else {
        expect(res.statusCode).to.be.equal(200);
      }
      done();
    });
  });

});
