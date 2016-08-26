var querystring = require('querystring');
var chai = require('chai');
var crypto = require('crypto');
var expect = chai.expect;
var request = require('supertest');
var moment = require('moment');
var iterationModel = require('../../../models/iteration');
var teamModel = require('../../../models/teams');
var iterationTestData = require('../../data/iteration.js');
var util = require('../../../helpers/util');
var app = require('../../../app');
var validId;
var validTeamId;
var docId;
var iterationId;

var timeout = 100000;

var iterationDocValid = iterationTestData.iterationDocValid;
iterationDocValid.last_updt_user = adminUser;

var iterationDoc_duplicateIterName = iterationTestData.iterationDoc_duplicateIterName;
iterationDoc_duplicateIterName.last_updt_user = adminUser;

var iterationDocValid_sample2 = iterationTestData.iterationDocValid_sample2;
iterationDocValid_sample2.last_updt_user = adminUser;

var iterationDocValid_sample3 = iterationTestData.iterationDocValid_sample3;

var iterationDocInvalid = iterationTestData.iterationDocInvalid;
iterationDocInvalid.last_updt_user = adminUser;

var agent = request.agent(app);

var teamDocValid = iterationTestData.teamDocValid;
var userDetails = iterationTestData.userDetails;
var userTeams = iterationTestData.userTeams;
var allTeams = iterationTestData.allTeams;
var user = iterationTestData.user;
var adminUser = userDetails.shortEmail;

describe('Iteration API Test', function(){
  this.timeout(timeout);
  before(function(done) {
    this.timeout(timeout);
    var teamName = 'testteamid_1';
    teamModel.getName(teamName)
    .then(function(result) {
      if (result.length === 0) {
        teamModel.createTeam(teamDocValid, userDetails)
        .then(function(body) {
          expect(body).to.be.a('object');
          expect(body).to.have.property('_id');
          validId = body['_id'];
          validTeamId = body['name'];
          userTeams[0]._id = validId;
          // console.log('validId1:', validId);
          agent.get('/api/login/masquerade/' + adminUser).send().end(function(err, res) {
            if (err) throw err;
              //call home page to initialize session data
              agent.get('/').send().end(function(err, res) {
                agent.saveCookies(res);
                // console.log('\n back to homepage 1...\n');
                done();
              });
          });
        }).catch(function(err) {});
      } else {
        validId = result[0].id;
        userTeams[0]._id = validId;
        agent.get('/api/login/masquerade/' + adminUser).send().end(function(err, res) {
          if (err) throw err;
            //call home page to initialize session data
            agent.get('/').send().end(function(err, res) {
              agent.saveCookies(res);
              done();
            });
        });
      }
    });
  });

  after(function(done) {
    var bulkDeleteIds = [];
    if(validId) {
      iterationModel.getByIterInfo(validId)
      .then(function(result) {
        // console.log('TOTAL validId:', validId);
        // console.log('TOTAL ROWS1:', result.rows.length);
        if (result && result.rows.length > 0) {
          for(i=0; i < result.rows.length; i++) {
            var id = result.rows[i].id;
            bulkDeleteIds.push(id);
          }
          util.BulkDelete(bulkDeleteIds)
          .then(function(result) {
            done();
          })
          .catch(function(err){
            done();
          });
          // done();
        } else {
          done();
        }
      })
      .catch(function(err){
        done();
      });
    } else {
      done();
    }
  });

  describe('Iteration API Test [POST /api/iteration]: add team iteration document', function(){
    this.timeout(timeout);
    it('It will successfully add new iteration document', function(done){
      var req = request(app).post('/api/iteration');
      agent.attachCookies(req);
      iterationDocValid._id = "testmyid-" + crypto.randomBytes(20).toString('hex');
      iterationDocValid.team_id = validId;
      iterationDocValid.iteration_name = "testiterationname-" + crypto.randomBytes(4).toString('hex');
      req.send(iterationDocValid);
      req.end(function(err, res){
        if (err) {
          //console.log(err);
        } else {
          expect(res.statusCode).to.be.equal(200);
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.property('id');
          expect(res.body).to.have.property('ok');
          expect(res.body.ok).to.be.equal(true);
          iterationId = res.body.id;
        }
        done();
      });
    });

    it('It will successfully add iteration doc with default values', function(done) {
      iterationDocValid._id = "testmyid-" + crypto.randomBytes(20).toString('hex');
      iterationDocValid.client_sat = '';
      iterationDocValid.team_sat = '';
      iterationDocValid.nbr_stories_dlvrd = '';
      iterationDocValid.team_id = validId;
      var currentDate = moment().format("MM/DD/YYYY");
      iterationDocValid.iteration_start_dt = currentDate;
      iterationDocValid.iteration_end_dt = currentDate;
      iterationDocValid.iteration_name = "testiterationname-" + crypto.randomBytes(4).toString('hex');
      var req = request(app).post('/api/iteration');
      agent.attachCookies(req);
      req.send(iterationDocValid);
      req.end(function(err, res){
        if (err) {
          // console.log(err);
        } else {
          expect(res.statusCode).to.be.equal(200);
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.property('id');
          expect(res.body).to.have.property('ok');
          expect(res.body.ok).to.be.equal(true);
          iterationId = res.body.id;
        }
        done();
      });
    });

    it('It will fail to add invalid iteration document', function(done){
      var req =request(app).post('/api/iteration');
      agent.attachCookies(req);
      iterationDocInvalid._id = "testmyid-" + crypto.randomBytes(20).toString('hex');
      iterationDocInvalid.team_id = validId;
      req.send(iterationDocInvalid);
      req.end(function(err, res){
        if (err) {
          //console.log(err);
        } else {
          expect(res.statusCode).to.be.equal(400);
          expect(res.body).to.have.property('error');
        }
        done();
      });
    });

    it('It will fail with empty document', function(done){
      var req =request(app).post('/api/iteration');
      agent.attachCookies(req);
      req.end(function(err, res){
        if (err) {
          //console.log(err);
        } else {
          expect(res.statusCode).to.be.equal(400);
          expect(res.body).to.have.property('error');
        }
        done();
      });
    });
  });

  describe('Iteration API Test [GET /api/iteration/]: get iteration doucments', function(){
    this.timeout(timeout);
    before(function(done) {
      var doc = _.clone(iterationDocValid);
      doc.team_id = validId;
      doc.iteration_name = "testiterationname-" + crypto.randomBytes(4).toString('hex');
      iterationModel.add(doc, user, allTeams, userTeams)
      .then(function(result) {
        iterationId = result.id;
        iterationRev = result.rev;
        expect(result).to.be.a('object');
        expect(result).to.have.property('id');
        expect(result.ok).to.be.equal(true);
        done();
      })
      .catch(function(err) {
        done();
      });
    });
    it('Get all team iteration documents', function(done){
      var req = request(app).get('/api/iteration/');
      agent.attachCookies(req);
      req.end(function(err, res){
        if (err) {
          //console.log(err);
        } else {
          expect(res.statusCode).to.be.equal(200);
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.property('rows');
        }
        done();
      });
    });

    it('Get team iteration docs by key', function(done){
      var req = request(app).get('/api/iteration/' + validId);
      agent.attachCookies(req);
      req.end(function(err, res){
        if (err) {
          // console.log(err);
        } else {
          expect(res.statusCode).to.be.equal(200);
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.property('rows');
          expect(res.body.rows[0]).to.have.property('key');
          expect(res.body.rows[0].key).to.be.equal(validId);
        }
        done();
      });
    });

    it('Get non-existing team iteration document', function(done){
      var invalidTeamId = '11111111';
      var req = request(app).get('/api/iteration/' + invalidTeamId);
      agent.attachCookies(req);
      req.end(function(err, res){
        if (err) {
          //console.log(err);
        } else {
          expect(res.statusCode).to.be.equal(200);
          expect(res.body).to.have.property('rows');
          expect(res.body.rows).to.be.empty;
        }
        done();
      });
    });
  });

  describe('Iteration API Test [GET /api/iteration/searchTeamIteration]: Search team iteration', function(){
    this.timeout(timeout);
    it('Search by team id', function(done) {
      iterationDocValid.team_id = validId;
      var query = querystring.stringify({'id':iterationDocValid._id});
      var req = request(app).get('/api/iteration/searchTeamIteration?' + query);
      agent.attachCookies(req);
      req.end(function(err, res){
        if (err) {
          //console.log(err);
        } else {
          expect(res.statusCode).to.be.equal(200);
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.property('rows');
        }
        done();
      });
    });

    it('Search by team id with startdate/enddate', function(done) {
      iterationDocValid.team_id = validId;
      var query = querystring.stringify({'id':iterationDocValid._id, 'startdate': '20160701', 'enddate': '20160701'});
      var req = request(app).get('/api/iteration/searchTeamIteration?' + query);
      agent.attachCookies(req);
      req.end(function(err, res){
        if (err) {
          //console.log(err);
        } else {
          expect(res.statusCode).to.be.equal(200);
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.property('rows');
        }
        done();
      });
    });

    it('Search by team id with startdate <= enddate', function(done) {
      iterationDocValid_sample3.team_id = validId;
      var query = querystring.stringify({'id':iterationDocValid_sample3._id, 'startdate': '20160801', 'enddate': '20160814'});
      var req = request(app).get('/api/iteration/searchTeamIteration?' + query);
      agent.attachCookies(req);
      req.end(function(err, res){
        if (err) {
          //console.log(err);
        } else {
          expect(res.statusCode).to.be.equal(200);
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.property('rows');
        }
        done();
      });
    });

    it('Missing TeamId', function(done) {
      var req = request(app).get('/api/iteration/searchTeamIteration');
      agent.attachCookies(req);
      req.end(function(err, res){
        if (err) {
          // console.log(err);
        } else {
          expect(res.statusCode).to.be.equal(400);
          expect(res.body.error).to.be.equal('TeamId is required');
        }
        done();
      });
    });

    it('Cannot retrieve documents with invalid status', function(done) {
      iterationDocValid.team_id = validId;
      var query = querystring.stringify({'id':iterationDocValid._id, 'status': 'X'});
      var req = request(app).get('/api/iteration/searchTeamIteration?' + query);
      agent.attachCookies(req);
      req.end(function(err, res){
        if (err) {
          // console.log(err);
        } else {
          expect(res.statusCode).to.be.equal(400);
          expect(res.body).to.have.property('error');
          expect(res.body.error).to.have.property('status');
        }
        done();
      });
    });

    it('Successfully fetch documents with valid status', function(done) {
      iterationDocValid.team_id = validId;
      var query = querystring.stringify({'id':iterationDocValid._id, 'status': 'Y'});
      var req = request(app).get('/api/iteration/searchTeamIteration?' + query);
      agent.attachCookies(req);
      req.end(function(err, res){
        if (err) {
          // console.log(err);
        } else {
          expect(res.statusCode).to.be.equal(200);
          expect(res.body).to.have.property('rows');
        }
        done();
      });
    });

    it('Successfully fetch documents with valid startdate', function(done) {
      iterationDocValid.team_id = validId;
      var query = querystring.stringify({'id':iterationDocValid._id, 'startdate': '20160820'});
      var req = request(app).get('/api/iteration/searchTeamIteration?' + query);
      agent.attachCookies(req);
      req.end(function(err, res){
        if (err) {
          // console.log(err);
        } else {
          expect(res.statusCode).to.be.equal(200);
          expect(res.body).to.have.property('rows');
        }
        done();
      });
    });

    it('Cannot retrieve documents with invalid startdate', function(done) {
      iterationDocValid.team_id = validId;
      var query = querystring.stringify({'id':iterationDocValid._id, 'startdate': '12345678'});
      var req = request(app).get('/api/iteration/searchTeamIteration?' + query);
      agent.attachCookies(req);
      req.end(function(err, res){
        if (err) {
          // console.log(err);
        } else {
          expect(res.statusCode).to.be.equal(400);
          expect(res.body).to.have.property('error');
          expect(res.body.error).to.have.property('startdate');
        }
        done();
      });
    });

    it('Successfully fetch documents with valid enddate', function(done) {
      iterationDocValid.team_id = validId;
      var query = querystring.stringify({'id':iterationDocValid._id, 'enddate': '20160820'});
      var req = request(app).get('/api/iteration/searchTeamIteration?' + query);
      agent.attachCookies(req);
      req.end(function(err, res){
        if (err) {
          // console.log(err);
        } else {
          expect(res.statusCode).to.be.equal(200);
          expect(res.body).to.have.property('rows');
        }
        done();
      });
    });

    it('Cannot retrieve documents due to invalid enddate', function(done) {
      iterationDocValid.team_id = validId;
      var query = querystring.stringify({'id':iterationDocValid._id, 'enddate': '12345678'});
      var req = request(app).get('/api/iteration/searchTeamIteration?' + query);
      agent.attachCookies(req);
      req.end(function(err, res){
        if (err) {
          // console.log(err);
        } else {
          expect(res.statusCode).to.be.equal(400);
          expect(res.body).to.have.property('error');
          expect(res.body.error).to.have.property('enddate');
        }
        done();
      });
    });
  });

  describe('Iteration API Test [GET /api/iteration/completed]: get completed iteration', function(){
    this.timeout(timeout);
    before(function(done) {
      var doc = _.clone(iterationDocValid);
      doc.team_id = validId;
      var currentDate = moment().format("MM/DD/YYYY");
      doc.iteration_start_dt = currentDate;
      doc.iteration_end_dt = currentDate;
      doc.iteration_name = "testiterationname-" + crypto.randomBytes(4).toString('hex');
      iterationModel.add(doc, user, allTeams, userTeams)
      .then(function(result) {
        iterationId = result.id;
        iterationRev = result.rev;
        expect(result).to.be.a('object');
        expect(result).to.have.property('id');
        expect(result.ok).to.be.equal(true);
        done();
      })
      .catch(function(err) {
        done();
      });
    });

    it('Get completed iteration documents', function(done){
      var query = querystring.stringify({'startkey': '07/19/2016'});
      var req = request(app).get('/api/iteration/completed?' + query);
      agent.attachCookies(req);
      req.end(function(err, res){
        if (err) {
          //console.log(err);
        } else {
          expect(res.statusCode).to.be.equal(200);
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.property('rows');
        }
        done();
      });
    });
  });

  describe('Iteration API Test [PUT /api/iteration/]: update iteration document', function(){
    this.timeout(timeout);
    it('It will successfully update iteration document', function(done){
      var req = request(app).put('/api/iteration/' + iterationId);
      iterationDocValid_sample2._id = iterationId;
      iterationDocValid_sample2.team_id = validId;
      agent.attachCookies(req);
      req.send(iterationDocValid_sample2);
      req.end(function(err, res){
          //console.log(res.body);
        if (err) {
          //console.log(err);
        } else {
          expect(res.statusCode).to.be.equal(200);
          expect(res.body).to.have.property('id');
          expect(res.body.id).to.be.equal(iterationId);
        }
        done();
      });
    });

    it('It will fail to update without iterationId', function(done){
      var req = request(app).put('/api/iteration/');
      agent.attachCookies(req);
      iterationDocValid_sample2.team_id = validId;
      req.send(iterationDocValid_sample2);
      req.end(function(err, res){
        if (err) {
          //console.log(err);
        } else {
          expect(res.statusCode).to.be.equal(400);
          expect(res.body).to.have.property('error');
          expect(res.body.error).to.be.equal('iterationId is missing');
        }
        done();
      });
    });

    it('It will fail to update without document', function(done){
      var req = request(app).put('/api/iteration/' + iterationId);
      var emptyDoc = '';
      agent.attachCookies(req);
      req.send(emptyDoc);
      req.end(function(err, res){
        if (err) {
          //console.log(err);
        } else {
          expect(res.statusCode).to.be.equal(400);
          expect(res.body).to.have.property('error');
          expect(res.body.error).to.be.equal('Iteration data is missing');
        }
        done();
      });
    });

    it('It will fail to update without invalid document', function(done){
      var req = request(app).put('/api/iteration/' + iterationId);
      agent.attachCookies(req);
      iterationDocInvalid.team_id = validId;
      req.send(iterationDocInvalid);
      req.end(function(err, res){
        if (err) {
          //console.log(err);
        } else {
          expect(res.statusCode).to.be.equal(400);
          expect(res.body).to.have.property('error');
        }
        done();
      });
    });
  });

  describe('Iteration API Test [GET /api/iteration/current]: get iteration doc by id', function() {
    this.timeout(timeout);
    it('It will successfully get iteration document', function(done){
      var req = request(app).get('/api/iteration/current/' + iterationId);
      agent.attachCookies(req);
      req.end(function(err, res){
        if (err) {
          //console.log(err);
        } else {
          expect(res.statusCode).to.be.equal(200);
          expect(res.body).to.have.property('_id');
          expect(res.body._id).to.be.equal(iterationId);
        }
        done();
      });
    });

    it('It will fail to get iteration document with invalid id', function(done){
      var req = request(app).get('/api/iteration/current/' + 'undefined');
      agent.attachCookies(req);
      req.end(function(err, res){
        if (err) {
          //console.log(err);
        } else {
          expect(res.statusCode).to.be.equal(400);
          expect(res.body).to.have.property('error');
          expect(res.body.error).to.be.equal('not_found');
        }
        done();
      });
    });
  });
});
