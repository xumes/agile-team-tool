var chai = require('chai');
var expect = chai.expect;
var app = require('../../../app');
var request = require('supertest');

var agent = request.agent(app);

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

describe('Page variables API Test [GET /api/uihelper/home]: get variables used for client side interaction at home page', function(){
  it('should return 200', function(done){
    var req = request(app).get('/api/uihelper/home');
    agent.attachCookies(req);
    req.expect(200);
    req.end(function(err, res){
      expect(res.body).to.have.property('systemAdmin');
      expect(res.body).to.have.property('systemStatus');
      expect(res.body).to.have.property('userTeamList');
      done();
    });
  });
});

describe('Page variables API Test [GET /api/uihelper/home]: get variables used for client side interaction at team page', function(){
  it('should return 200', function(done){
    var req = request(app).get('/api/uihelper/team');
    agent.attachCookies(req);
    req.expect(200);
    req.end(function(err, res){
      expect(res.body).to.have.property('systemAdmin');
      expect(res.body).to.have.property('systemStatus');
      expect(res.body).to.have.property('userTeamList');
      expect(res.body).to.have.property('allTeams');
      expect(res.body).to.have.property('memberRoles');
      done();
    });
  });
});

describe('Page variables API Test [GET /api/uihelper/iteration]: get variables used for client side interaction at iteration page', function(){
  it('should return 200', function(done){
    var req = request(app).get('/api/uihelper/iteration');
    agent.attachCookies(req);
    req.expect(200);
    req.end(function(err, res){
      expect(res.body).to.have.property('systemAdmin');
      expect(res.body).to.have.property('systemStatus');
      expect(res.body).to.have.property('userTeamList');
      expect(res.body).to.have.property('squadTeams');
      done();
    });
  });
});

describe('Page variables API Test [GET /api/uihelper/assessment]: get variables used for client side interaction at assessment page', function(){
  it('should return 200', function(done){
    var req = request(app).get('/api/uihelper/assessment');
    agent.attachCookies(req);
    req.expect(200);
    req.end(function(err, res){
      expect(res.body).to.have.property('systemAdmin');
      expect(res.body).to.have.property('systemStatus');
      expect(res.body).to.have.property('userTeamList');
      expect(res.body).to.have.property('squadTeams');
      done();
    });
  });
});

describe('Page variables API Test [GET /api/uihelper/progress]: get variables used for client side interaction at progress page', function(){
  it('should return 200', function(done){
    var req = request(app).get('/api/uihelper/progress');
    agent.attachCookies(req);
    req.expect(200);
    req.end(function(err, res){
      expect(res.body).to.have.property('systemAdmin');
      expect(res.body).to.have.property('systemStatus');
      expect(res.body).to.have.property('userTeamList');
      done();
    });
  });
});


describe('Page variables API Test [GET /api/uihelper/help]: get variables used for client side interaction at help page', function(){
  it('should return 200', function(done){
    var req = request(app).get('/api/uihelper/help');
    agent.attachCookies(req);
    req.expect(200);
    req.end(function(err, res){
      expect(res.body).to.have.property('systemAdmin');
      expect(res.body).to.have.property('systemStatus');
      expect(res.body).to.have.property('userTeamList');
      done();
    });
  });
});