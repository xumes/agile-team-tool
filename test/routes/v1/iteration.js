var chai = require('chai');
var expect = chai.expect;
var app = require('../../../app');
var request = require('supertest');
var testApiKey = '';
var testTeamId = '';
var testIterationId = '';
var agent = request.agent(app);

describe('API Iterations', function(done) {
  before(function(done) {
    agent
      .get('/api/login/masquerade/john.doe@ph.ibm.com')
      .send()
      .end(function(err, res) {
        if (err) throw err;
        agent.saveCookies(res);
        done();
      });
  });

  it('GET [/api/users/apiKey] will return user and key information', function(done) {
    var req = request(app).get('/api/users/apiKey');
    agent.attachCookies(req);
    req.end(function(err, res) {
      if (err) {
        //console.log(err);
      } else {
        expect(res.body).to.be.a('object');
        expect(res.body).to.have.property('key');
        testApiKey = res.body.key;
      }
      done();
    });
  });

  it('GET [/v1/iterations] will require team id is required message', function(done) {
    var req = request(app).get('/v1/iterations?docs=true').set('apiKey', testApiKey);
    agent.attachCookies(req);
    req.end(function(err, res) {
      if (err) {
        //console.log(err);
      } else {
        expect(res.statusCode).to.be.equal(400);
        expect(res.body).to.have.property('message');
      }
      done();
    });
  });

  it('GET [/v1/iterations] will return unauthorized team access message', function(done) {
    var req = request(app).get('/v1/iterations?teamId=invalid_team_id').set('apiKey', testApiKey);
    agent.attachCookies(req);
    req.end(function(err, res) {
      if (err) {
        //console.log(err);
      } else {
        expect(res.statusCode).to.be.equal(400);
        expect(res.body).to.have.property('message');
      }
      done();
    });
  });


  it('PUT [/v1/iterations] will return iteration id is required message', function(done) {
    var req = request(app).put('/v1/iterations').set('apiKey', testApiKey).send({'iterationName':'invalid test iteration'});
    agent.attachCookies(req);
    req.end(function(err, res) {
      if (err) {
        //console.log(err);
      } else {
        expect(res.statusCode).to.be.equal(400);
        expect(res.body).to.have.property('message');
      }
      done();
    });
  });

  it('POST [/v1/iterations] will return unauthorized team access message', function(done) {
    var req = request(app).post('/v1/iterations').set('apiKey', testApiKey).send({'teamId':'invalid_team_id'});
    agent.attachCookies(req);
    req.end(function(err, res) {
      if (err) {
        //console.log(err);
      } else {
        expect(res.statusCode).to.be.equal(400);
        expect(res.body).to.have.property('message');
      }
      done();
    });
  });

  it('DELETE [/v1/iterations]  will return not supported message', function(done) {
    var req = request(app).delete('/v1/iterations?iterationId=invalid_iteration_id').set('apiKey', testApiKey);
    agent.attachCookies(req);
    req.end(function(err, res) {
      if (err) {
        //console.log(err);
      } else {
        expect(res.statusCode).to.be.equal(400);
        expect(res.body).to.have.property('message');
      }
      done();
    });
  });

  it('DELETE [/api/users/apiKey] will delete current key used by the user', function(done) {
    var req = request(app).delete('/api/users/apiKey');
    agent.attachCookies(req);
    req.end(function(err, res) {
      if (err) {
        //console.log(err);
      } else {
        expect(res.statusCode).to.be.equal(200);
      }
      done();
    });
  });
});
