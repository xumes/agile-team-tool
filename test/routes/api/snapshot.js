var chai = require('chai');
var expect = chai.expect;
var app = require('../../../app');
var request = require('supertest');
var _  = require('underscore');
var util = require('../../../helpers/util')
var querystring = require('querystring');
var agent = request.agent(app);
var userEmail = 'john.doe@ph.ibm.com';

describe('Snapshot API Test [GET /api/snapshot/getrollupdata]: calculate and update non squad teams iteartions' , function(){
  this.timeout(60000);
  // do the login befre testing
  before(function(done) {
    agent
      .get('/api/login/masquerade/'+userEmail)
      .send()
      .end(function(err, res) {
        if (err) throw err;
        agent.saveCookies(res);
        done();
      })
  });

  it('Successfully roll up data', function(done){
     var req = request(app).get('/api/snapshot/updaterollupdata');
     agent.attachCookies(req);
     req.end(function(err, res){
       if (err) {
       } else {
         expect(res.statusCode).to.be.equal(200);
       }
       done();
     });
  });

  it('Successfully return top level team', function(done){
    var req = request(app).get('/api/snapshot/getteams/'+userEmail);
    agent.attachCookies(req);
    req.end(function(err, res){
      if (err) {
      } else {
        expect(res.statusCode).to.be.equal(200);
      }
      done();
    });
  });

  it('Successfully roll up squads', function(done){
     var req = request(app).get('/api/snapshot/updaterollupsquads');
     agent.attachCookies(req);
     req.end(function(err, res){
       if (err) {
       } else {
         expect(res.statusCode).to.be.equal(200);
       }
       done();
     });
  });

  // it('Successfully get roll up data', function(done){
  //   var query = {
  //     'startTime' : '03/18/2016',
  //     'endTime' : '08/18/2016'
  //   };
  //   var req = request(app).get('/api/snapshot/getrollupdata?' + querystring.stringify(query));
  //   agent.attachCookies(req);
  //   req.end(function(err, res){
  //     if (err) {
  //     } else {
  //       expect(res.statusCode).to.be.equal(200);
  //     }
  //     done();
  //   });
  // });
  //
  // it('failed because lack of startTime', function(done){
  //   var query = {
  //     'endTime' : '08/18/2016'
  //   };
  //   var req = request(app).get('/api/snapshot/getrollupdata?' + querystring.stringify(query));
  //   agent.attachCookies(req);
  //   req.end(function(err, res){
  //     if (err) {
  //     } else {
  //       expect(res.statusCode).to.be.equal(400);
  //       expect(res.body.error).to.be.equal('missing start time');
  //     }
  //     done();
  //   });
  // });
  //
  // it('failed because lack of endTime', function(done){
  //   var query = {
  //     'startTime' : '03/18/2016'
  //   };
  //   var req = request(app).get('/api/snapshot/getrollupdata?' + querystring.stringify(query));
  //   agent.attachCookies(req);
  //   req.end(function(err, res){
  //     if (err) {
  //     } else {
  //       expect(res.statusCode).to.be.equal(400);
  //       expect(res.body.error).to.be.equal('missing end time');
  //     }
  //     done();
  //   });
  // });
  //
  // it('failed because endTime is after current time', function(done){
  //   var query = {
  //     'startTime' : '03/18/2016',
  //     'endTime' : '03/18/2999'
  //   };
  //   var req = request(app).get('/api/snapshot/getrollupdata?' + querystring.stringify(query));
  //   agent.attachCookies(req);
  //   req.end(function(err, res){
  //     if (err) {
  //     } else {
  //       expect(res.statusCode).to.be.equal(400);
  //       expect(res.body.error).to.be.equal('end time is after current time');
  //     }
  //     done();
  //   });
  // });
  //
  // it('failed because endTime is after current time', function(done){
  //   var query = {
  //     'startTime' : '03/18/2016',
  //     'endTime' : '02/18/2016'
  //   };
  //   var req = request(app).get('/api/snapshot/getrollupdata?' + querystring.stringify(query));
  //   agent.attachCookies(req);
  //   req.end(function(err, res){
  //     if (err) {
  //     } else {
  //       expect(res.statusCode).to.be.equal(400);
  //       expect(res.body.error).to.be.equal('start time is after end time');
  //     }
  //     done();
  //   });
  // });

});
