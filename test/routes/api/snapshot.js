var chai = require('chai');
var expect = chai.expect;
var app = require('../../../app');
var request = require('supertest');
var _ = require('underscore');
var util = require('../../../helpers/util');
var querystring = require('querystring');
var agent = request.agent(app);
var userEmail = 'john.doe@ph.ibm.com';

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
    var req = request(app).get('/api/snapshot/rollupassessmentbyteam/' + 'ag_team_JMGParent1_1475830400490');
    agent.attachCookies(req);
    req.end(function(err, res) {
      if (err) {} else {
        expect(res.statusCode).to.be.equal(200);
      }
      done();
    });
  });
});
