var chai = require('chai');
var expect = chai.expect;
var app = require('../../../app');
var request = require('supertest');
var teamModel = require('../../../models/teamscore.js');
var adminUser = 'Yanliang.Gu1@ibm.com';
var agent = request.agent(app);

describe('Team API Tests', function() {

  // do the login befre testing
  before(function(done) {
    agent
      .get('/api/login/masquerade/' + adminUser)
      .send()
      .end(function(err, res) {
        if (err) throw err;
        //call home page to initialize session data
        agent
          .get('/')
          .send()
          .end(function(err, res) {
            if (err) throw err;
            agent.saveCookies(res);
            done();
          });
      });
  });

  it('it will return 200 to get score', function(done) {
    var data = {};
    data['loc'] = ['us'];
    var req = request(app).post('/api/teamscore/calculate');
    agent.attachCookies(req);
    req.send(data);
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
