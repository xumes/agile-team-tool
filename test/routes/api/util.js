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

describe('Util API Test [GET /api/util/admins]: get admins', function(){
  it('It will return admins successfully', function(done){
    var req = request(app).get('/api/util/admins/');
    agent.attachCookies(req);
    req.expect(200);
    req.end(function(err, res){
      if (err) {
        //console.log(err);
      } else {
        expect(res.body).to.be.a('object');
        expect(res.body).to.have.property('ACL_Full_Admin');
        expect(res.body).to.have.property('ACL_User_Supt');
      }
      done();
    });
  });
});

describe('Util API Test [GET /api/util/systemstatus]: get system status', function(){
  it('It will return system status successfully', function(done){
    var req = request(app).get('/api/util/systemstatus/');
    agent.attachCookies(req);
    req.expect(200);
    req.end(function(err, res){
      if (err) {
        //console.log(err);
      } else {
        expect(res.body).to.be.a('object');
        //console.log(res.body);
      }
      done();
    });
  });
});

describe('Util API Test [GET /api/util/servertime]: get server time', function(){
  it('It will return server time successfully', function(done){
    var req = request(app).get('/api/util/servertime');
    agent.attachCookies(req);
    req.expect(200);
    req.end(function(err, res){
      if (err) {
        //console.log(err);
      } else {
        expect(res.body).to.be.a('object');
        //console.log(res.body);
      }
      done();
    });
  });
});
