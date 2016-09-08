var request = require('supertest');
var app = require('../../../app');
var chai = require('chai');
var expect = chai.expect;

var agent = request.agent(app);

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


describe('GET /team', function() {
  it('should return 200', function(done) {
    var req = request(app).get('/team');
    agent.attachCookies(req);
    req.expect(200);
    req.end(function(err, res) {
      done();
    });
  });
});
