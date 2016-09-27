var chai = require('chai');
var expect = chai.expect;
var iterationModel = require('../../../models/mongodb/iteration');
var userModel = require('../../../models/mongodb/users');
var teamModel = require('../../../models/mongodb/teams');
var app = require('../../../app');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var request = require('supertest');
var querystring = require('querystring');
var _ = require('underscore');
var moment = require('moment');
var dateFormat = 'YYYY-MM-DD HH:mm:ss';
var iterStatus = '';
var testUser = {
  'userId': 'TEST1234567',
  'name': 'test user',
  'email': 'testuser@test.com',
  'adminAccess': 'none'
};
var validIterationDoc = {
  'name': 'mongodb-test-iteration-01',
  'memberCount': 1,
  'teamId': Schema.Types.ObjectId,
  'startDate': moment(new Date('08-01-2016')).format(dateFormat),
  'endDate': moment().format(dateFormat)
};
var testTeam = {
  'name': 'mongodb-test-team-01',
  'members': {
    'name': 'test user',
    'userId': 'TEST1234567',
    'email': 'testuser@test.com'
  },
  'createdByUserId': 'TEST1234567',
  'createdBy': 'testuser@test.com'
};
var newIterationId = Schema.Types.ObjectId;
var newTeamId = Schema.Types.ObjectId;
var validUser = new Object();
validUser['shortEmail'] = 'testuser@test.com';
var notExistingUser = new Object();
notExistingUser['shortEmail'] = 'notexisting';

var agent = request.agent(app);


describe('Iteration API Test', function() {
  describe('Iteration API Test [POST /api/iteration]: add team iteration document', function() {
    before(function(done){
      var promiseArray = [];
      promiseArray.push(userModel.delete(testUser.email));
      promiseArray.push(teamModel.deleteTeamByName(testTeam.name));
      Promise.all(promiseArray)
        .then(function(results){
          return userModel.create(testUser);
        })
        .then(function(result){
          return teamModel.createTeam(testTeam);
        })
        .then(function(result){
          newTeamId = result._id;
          done();
        })
        .catch(function(err){
          done();
        });
    });
    before(function(done){
      var query = {
        'name': validIterationDoc.name,
      };
      iterationModel.deleteByFields(query)
        .then(function(result){
          done();
        })
        .catch(function(err){
          done();
        });
    });
    before(function(done) {
      agent
        .get('/api/login/masquerade/' + testUser.email)
        .send()
        .end(function(err, res) {
          if (err) throw err;
          agent.saveCookies(res);
          done();
        });
    });

    it('It will successfully add new iteration document', function(done) {
      var req = request(app).post('/api/iteration');
      agent.attachCookies(req);
      validIterationDoc['teamId'] = newTeamId;
      validIterationDoc['teamSatisfaction'] = '';
      req.send(validIterationDoc);
      req.end(function(err, res) {
        if (err) {
          //console.log(err);
        } else {
          expect(res.statusCode).to.be.equal(200);
          expect(res.body).to.be.a('object');
          newIterationId = res.body._id;
          iterStatus = res.body.status;
        }
        done();
      });
    });

    it('It will fail to add invalid iteration document (duplicate name)', function(done) {
      var req = request(app).post('/api/iteration');
      agent.attachCookies(req);
      req.send(validIterationDoc);
      req.end(function(err, res) {
        if (err) {
          //console.log(err);
        } else {
          expect(res.statusCode).to.be.equal(400);
          expect(res.body).to.have.property('error');
        }
        done();
      });
    });

    it('It will fail with empty document', function(done) {
      var req = request(app).post('/api/iteration');
      agent.attachCookies(req);
      req.end(function(err, res) {
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

  describe('Iteration API Test [GET /api/iteration/]: get iteration doucments', function() {
    it('Get all team iteration documents', function(done) {
      var req = request(app).get('/api/iteration/');
      agent.attachCookies(req);
      req.end(function(err, res) {
        if (err) {
          //console.log(err);
        } else {
          expect(res.statusCode).to.be.equal(200);
          expect(res.body).to.be.a('array');
          expect(res.body.length).not.to.equal(0);
        }
        done();
      });
    });

    it('Get team iteration docs by teamId', function(done) {
      var req = request(app).get('/api/iteration/' + newTeamId);
      agent.attachCookies(req);
      req.end(function(err, res) {
        if (err) {
          // console.log(err);
        } else {
          expect(res.statusCode).to.be.equal(200);
          expect(res.body).to.be.a('array');
          expect(res.body.length).not.to.equal(0);
        }
        done();
      });
    });

    it('Get non-existing team iteration document', function(done) {
      var invalidTeamId = '17ea965b735ee96fed79038d';
      var req = request(app).get('/api/iteration/' + invalidTeamId);
      agent.attachCookies(req);
      req.end(function(err, res) {
        if (err) {
          //console.log(err);
        } else {
          expect(res.statusCode).to.be.equal(200);
          expect(res.body).to.be.empty;
        }
        done();
      });
    });
  });

  describe('Iteration API Test [GET /api/iteration/searchTeamIteration]: Search team iteration', function() {
    it('Search by team id', function(done) {
      var query = querystring.stringify({
        'id': newTeamId
      });
      var req = request(app).get('/api/iteration/searchTeamIteration?' + query);
      agent.attachCookies(req);
      req.end(function(err, res) {
        if (err) {
          //console.log(err);
        } else {
          expect(res.statusCode).to.be.equal(200);
          expect(res.body).to.be.a('array');
          expect(res.body.length).not.to.equal(0);
        }
        done();
      });
    });

    it('Search by team id with startdate/enddate', function(done) {
      var query = querystring.stringify({
        'id': newTeamId,
        'startdate': '07-01-2016'
      });
      var req = request(app).get('/api/iteration/searchTeamIteration?' + query);
      agent.attachCookies(req);
      req.end(function(err, res) {
        if (err) {
          //console.log(err);
        } else {
          expect(res.statusCode).to.be.equal(200);
          expect(res.body).to.be.a('array');
          expect(res.body.length).not.to.equal(0);
        }
        done();
      });
    });

    it('Search by team id with startdate/enddate', function(done) {
      var query = querystring.stringify({
        'id': newTeamId,
        'startdate': '07-01-2016',
        'enddate': monent().format(dateFormat)
      });
      var req = request(app).get('/api/iteration/searchTeamIteration?' + query);
      agent.attachCookies(req);
      req.end(function(err, res) {
        if (err) {
          //console.log(err);
        } else {
          expect(res.statusCode).to.be.equal(200);
          expect(res.body).to.be.a('array');
          expect(res.body.length).not.to.equal(0);
        }
        done();
      });
    });

    it('Search by team id with startdate <= enddate', function(done) {
      var query = querystring.stringify({
        'id': newTeamId,
        'startdate': '20160801',
        'enddate': '20160814'
      });
      var req = request(app).get('/api/iteration/searchTeamIteration?' + query);
      agent.attachCookies(req);
      req.end(function(err, res) {
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
      req.end(function(err, res) {
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
      var query = querystring.stringify({
        'id': iterationDocValid._id,
        'status': 'X'
      });
      var req = request(app).get('/api/iteration/searchTeamIteration?' + query);
      agent.attachCookies(req);
      req.end(function(err, res) {
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
      var query = querystring.stringify({
        'id': iterationDocValid._id,
        'status': 'Y'
      });
      var req = request(app).get('/api/iteration/searchTeamIteration?' + query);
      agent.attachCookies(req);
      req.end(function(err, res) {
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
      var query = querystring.stringify({
        'id': iterationDocValid._id,
        'startdate': '20160820'
      });
      var req = request(app).get('/api/iteration/searchTeamIteration?' + query);
      agent.attachCookies(req);
      req.end(function(err, res) {
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
      var query = querystring.stringify({
        'id': iterationDocValid._id,
        'startdate': '12345678'
      });
      var req = request(app).get('/api/iteration/searchTeamIteration?' + query);
      agent.attachCookies(req);
      req.end(function(err, res) {
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
      var query = querystring.stringify({
        'id': iterationDocValid._id,
        'enddate': '20160820'
      });
      var req = request(app).get('/api/iteration/searchTeamIteration?' + query);
      agent.attachCookies(req);
      req.end(function(err, res) {
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
      var query = querystring.stringify({
        'id': iterationDocValid._id,
        'enddate': '12345678'
      });
      var req = request(app).get('/api/iteration/searchTeamIteration?' + query);
      agent.attachCookies(req);
      req.end(function(err, res) {
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

  describe('Iteration API Test [GET /api/iteration/completed]: get completed iteration', function() {
    before(function(done) {
      var doc = _.clone(iterationDocValid);
      doc.team_id = validId;
      var currentDate = moment().format('MM/DD/YYYY');
      doc.iteration_start_dt = currentDate;
      doc.iteration_end_dt = currentDate;
      doc.iteration_name = 'testiterationname-' + crypto.randomBytes(4).toString('hex');
      iterationModel.add(doc, user, allTeams, userTeams)
        .then(function(result) {
          iterationId = result.id;
          expect(result).to.be.a('object');
          expect(result).to.have.property('id');
          expect(result.ok).to.be.equal(true);
          done();
        })
        .catch(function(err) {
          done();
        });
    });

    it('Get completed iteration documents', function(done) {
      var query = querystring.stringify({
        'startkey': '07/19/2016'
      });
      var req = request(app).get('/api/iteration/completed?' + query);
      agent.attachCookies(req);
      req.end(function(err, res) {
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

  describe('Iteration API Test [PUT /api/iteration/]: update iteration document', function() {
    it('It will successfully update iteration document', function(done) {
      var req = request(app).put('/api/iteration/' + iterationId);
      iterationDocValid_sample2._id = iterationId;
      iterationDocValid_sample2.team_id = validId;
      agent.attachCookies(req);
      req.send(iterationDocValid_sample2);
      req.end(function(err, res) {
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

    it('It will fail to update without iterationId', function(done) {
      var req = request(app).put('/api/iteration/');
      agent.attachCookies(req);
      iterationDocValid_sample2.team_id = validId;
      req.send(iterationDocValid_sample2);
      req.end(function(err, res) {
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

    it('It will fail to update without document', function(done) {
      var req = request(app).put('/api/iteration/' + iterationId);
      var emptyDoc = '';
      agent.attachCookies(req);
      req.send(emptyDoc);
      req.end(function(err, res) {
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

    it('It will fail to update without invalid document', function(done) {
      var req = request(app).put('/api/iteration/' + iterationId);
      agent.attachCookies(req);
      iterationDocInvalid.team_id = validId;
      req.send(iterationDocInvalid);
      req.end(function(err, res) {
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
    it('It will successfully get iteration document', function(done) {
      var req = request(app).get('/api/iteration/current/' + iterationId);
      agent.attachCookies(req);
      req.end(function(err, res) {
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

    it('It will fail to get iteration document with invalid id', function(done) {
      var req = request(app).get('/api/iteration/current/' + 'undefined');
      agent.attachCookies(req);
      req.end(function(err, res) {
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
