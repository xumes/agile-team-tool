var chai = require('chai');
var expect = chai.expect;
var app = require('../../../app');
var request = require('supertest');
var testApiKey = '';
var agent = request.agent(app);

before(function(done) {
  agent
    .get('/api/login/masquerade/john.doe@us.ibm.com')
    .send()
    .end(function(err, res) {
      if (err) throw err;
      agent.saveCookies(res);
      done();
    });
});

describe('API Teams', function(done) {
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
        console.log(res.body);
      }
      done();
    });
  });

  it('GET [/v1/teams] will return user teams', function(done) {
    var req = request(app)
      .get('/v1/teams')
      .set('apiKey', testApiKey);
    agent.attachCookies(req);
    req.end(function(err, res) {
      if (err) {
        //console.log(err);
      } else {
        expect(res.statusCode).to.be.equal(200);
        expect(res.body).to.be.a('array');
        if (res.body.length > 0) {
          expect(res.body[0]).to.have.property('_id');
        }
      }
      done();
    });
  });

  it('get [/v1/teams] will return all user teams and complete team information', function(done) {
    var req = request(app).get('/v1/teams?docs=true&all=true').set('apiKey', testApiKey);
    agent.attachCookies(req);
    req.end(function(err, res) {
      if (err) {
        //console.log(err);
      } else {
        expect(res.statusCode).to.be.equal(200);
        expect(res.body).to.be.a('array');
      }
      done();
    });
  });

  it('get [/v1/teams] will be anuthorized due to invalid key', function(done) {
    var req = request(app).get('/v1/teams').set('apiKey', 'invvalid_key');
    agent.attachCookies(req);
    req.end(function(err, res) {
      if (err) {
        //console.log(err);
      } else {
        expect(res.statusCode).to.be.equal(401);
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
