var chai    = require('chai');
var expect  = chai.expect;
var app     = require('../../../app');
var request = require('supertest');
var _       = require('underscore');
var util    = require('../../../helpers/util')
var agent   = request.agent(app);

describe('Snapshot API Test [GET /api/snapshot/getrollupdata]: calculate and update non squad teams iteartions' , function(){
  this.timeout(60000);
  // do the login befre testing
  before(function(done) {
    agent
      .get('/api/login/masquerade/john.doe@ph.ibm.com')
      .send()
      .end(function(err, res) {
        if (err) throw err;
        agent.saveCookies(res);
        done();
      })
  });

  it('Successfully update', function(done){
    var req = request(app).get('/api/snapshot/getrollupdata');
    agent.attachCookies(req);
    req.end(function(err, res){
      if (err) {
      } else {
        expect(res.statusCode).to.be.equal(200);
      }
      done();
    });
  })
});
