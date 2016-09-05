var querystring = require('querystring');
var chai = require('chai');
var expect = chai.expect;
var app = require('../../../app');
var request = require('supertest');
var dummyData = require('../../data/dummy-data.js');
var teamModel = require('../../../models/teams');
var assessmentModel = require('../../../models/assessment');
var _ = require('underscore');
var lodash = require('lodash');

var testData = require('../../data/assessment');
var noId = testData.noId;
var teamData = testData.teamData;
var curr_assessment = testData.currentAssessment;
var invalidTeamId = testData.invalidTeamId;
var invalidAssessId = testData.invalidAssessId;
var invalidRevisionId = testData.invalidRevisionId;
var currRevisionId = '';
var adminUser = 'Yanliang.Gu1@ibm.com';

var agent = request.agent(app);

describe('Assessment API Test', function(){
  // do the login befre testing
  before(function(done) {
    agent
      .get('/api/login/masquerade/' + dummyData.user.details.shortEmail)
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
          })
      })
  });

  // prepare the team data
  before(function(done){
    var teamId;
    var revDelete;
    teamModel.getName(teamData.name)
    .then(function(body){
      if (_.isEmpty(body)){
        return teamModel.createTeam(teamData, dummyData.user.details);
      }
      else{
        return body;
      }
    })
    .then(function(body){
      if (Array.isArray(body)){
        teamId  = body[0].id;
      }
      else{
        teamId = body._id;
      }
      //set current team id for assessment
      curr_assessment.team_id = teamId;
      curr_assessment._id = 'ag_mar_'+teamId+'_1469112933083';
      noId.team_id = teamId;
      return assessmentModel.getAssessment(curr_assessment._id);
    })
    .then(function(body){
      return assessmentModel.deleteAssessment(body._id, body._rev);
    })
    .catch(function(err){
      //console.log(err);
    })
    .finally(function(){
      //console.log('team data preparation done. '+curr_assessment._id+' for team '+curr_assessment.team_id);
      done();
    });
  });

  describe('Assesment API Test [GET /api/assessment/template]: get assessment template', function(){
    it("retrieve assessment template", function(done){
      var req = request(app).get('/api/assessment/template');
      agent.attachCookies(req);
      req.end(function(err, res){
        expect(res.statusCode).to.be.equal(200);
        expect(res.body).to.be.a('object');
        expect(res.body).to.have.property('rows');
        done();
      });
    });
  });

  describe('Assesment API Test [POST /api/assessment]: add team assessment', function(){
    it('add assessment with valid assessment data', function(done){
      var req = request(app).post('/api/assessment/');
      agent.attachCookies(req);
      req.send(curr_assessment);
      req.end(function(err, res){
        expect(res.statusCode).to.be.equal(200);
        expect(res.body).to.be.a('object');
        expect(res.body.ok).to.be.true;
        curr_assessment._id = res.body.id;
        currRevisionId = res.body.rev;
        done();
      });
    });

    it('add assessment with invalid assessment data', function(done){
      var invalidAssessment =  lodash.cloneDeep(curr_assessment);
      invalidAssessment.created_dt = '';
      var req = request(app).post('/api/assessment/');
      agent.attachCookies(req);
      req.send(invalidAssessment);
      req.end(function(err, res){
        expect(res.statusCode).to.be.equal(400);
        expect(res.body).to.be.a('object');
        expect(res.body).to.have.property('error');
        expect(res.body.error).to.have.deep.property('created_dt[0]', 'Created date is required.');
        done();
      });
    });
  });

  describe('Assessment API Test [GET /api/assessment/view]: get team assessments', function(){
    it('retrieve team assessments with non-existing team id', function(done){
      var req = request(app).get('/api/assessment/view/' + 'teamId=' + invalidTeamId);
      agent.attachCookies(req);
      req.end(function(err, res){
        expect(res.statusCode).to.be.equal(404);
        expect(res.body).to.be.empty;
        done();
      });
    });

    it('retrieve team assessments with empty team id', function(done){
      var req = request(app).get('/api/assessment/view/' + 'teamId=' + '');
      agent.attachCookies(req);
      req.end(function(err, res){
        expect(res.statusCode).to.be.equal(404);
        expect(res.body).to.be.empty;
        done();
      });
    });

    it('retrieve team assessments with valid id', function(done){
      var query = querystring.stringify({'teamId': curr_assessment.team_id});
      var req = request(app).get('/api/assessment/view?' + query);
      agent.attachCookies(req);
      req.end(function(err, res){
        expect(res.statusCode).to.be.equal(200);
        expect(res.body).to.be.instanceof(Array);
        var idRecords = _.pluck(res.body, '_id');
        expect(idRecords).to.have.contain(curr_assessment._id);
        var iteamIRecords = _.pluck(res.body, 'team_id');
        expect(iteamIRecords).to.have.contain(curr_assessment.team_id);
        done();
      });
    });

    it('retrieve assessment with non-existing id', function(done){
      var req = request(app).get('/api/assessment/view/' + 'assessId=' + invalidAssessId);
      agent.attachCookies(req);
      req.end(function(err, res){
        expect(res.statusCode).to.be.equal(404);
        expect(res.body).to.be.empty
        done();
      });
    });

    it('retrieve assessments with empty id', function(done){
      var req = request(app).get('/api/assessment/view/' + 'assessId=' + '');
      agent.attachCookies(req);
      req.end(function(err, res){
        expect(res.statusCode).to.be.equal(404);
        expect(res.body).to.be.empty;
        done();
      });
    });

    it('retrieve assessments with none', function(done){
      var req = request(app).get('/api/assessment/view/');
      agent.attachCookies(req);
      req.end(function(err, res){
        expect(res.statusCode).to.be.equal(400);
        expect(res.body).to.have.property('error');
        expect(res.body.error).to.be.equal('No assessment id provided.');
        done();
      });
    });

    it('retrieve team assessments with valid id', function(done){
      var query = querystring.stringify({'assessId': curr_assessment._id});
      var req = request(app).get('/api/assessment/view?' + query);
      agent.attachCookies(req);
      req.end(function(err, res){
        expect(res.statusCode).to.be.equal(200);
        expect(res.body).to.be.a('object');
        expect(res.body).to.have.property('_id');
        expect(res.body._id).equal(curr_assessment._id);
        currRevisionId = res.body._rev;
        done();
      });
    });
  });

  describe('Assessment API Test [PUT /api/assessment/]: update team assessment', function(){
    it('update assessment with no id', function(done){
      var req = request(app).put('/api/assessment/');
      agent.attachCookies(req);
      req.send(noId);
      req.end(function(err, res){
        expect(res.statusCode).to.be.equal(400);
        expect(res.body).to.have.property('error');
        expect(res.body.error).to.have.property('_id');
        expect(res.body.error._id[0]).to.be.equal('Record id is required.');
        done();
      });
    });

    it('update assessment with empty id', function(done){
      var tempData = _.clone(curr_assessment);
      tempData._id='';
      var req = request(app).put('/api/assessment/');
      agent.attachCookies(req);
      req.send(tempData);
      req.end(function(err, res){
        expect(res.statusCode).to.be.equal(400);
        expect(res.body).to.have.property('error');
        expect(res.body.error).to.have.property('_id');
        expect(res.body.error._id[0]).to.be.equal('Record id is required.');
        done();
      });
    });

    it('update assessment with valid data', function(done){
      var tempData = _.clone(curr_assessment);
      tempData.last_updt_user = dummyData.user.details.shortEmail;
      tempData._rev = currRevisionId;
      var req = request(app).put('/api/assessment/');
      agent.attachCookies(req);
      req.send(tempData);
      req.end(function(err, res){
        expect(res.statusCode).to.be.equal(200);
        expect(res.body).to.be.a('object');
        expect(res.body).to.have.property('id');
        expect(res.body.id).equal(tempData._id);
        expect(res.body.ok).to.be.true;
        currRevisionId = res.body.rev;
        done();
      });
    });
  });

  describe('Assessment API Test [DELETE /api/assessment]: delete assessment', function(){
    it('delete assessment with non-existing id', function(done){
      var query = querystring.stringify({'docId': invalidAssessId, 'revId': currRevisionId});
      var req = request(app).delete('/api/assessment?' + query);
      agent.attachCookies(req);
      req.end(function(err, res){
        expect(res.statusCode).to.be.equal(400);
        expect(res.body).to.be.a('object');
        expect(res.body).to.have.property('error');
        expect(res.body.error).equal('not_found');
        done();
      });
    });

    it('delete assessment with empty id', function(done){
      var query = querystring.stringify({'docId': '', 'revId': currRevisionId});
      var req = request(app).delete('/api/assessment?' + query);
      agent.attachCookies(req);
      req.end(function(err, res){
        expect(res.statusCode).to.be.equal(400);
        expect(res.body).to.be.a('object');
        expect(res.body).to.have.property('error');
        expect(res.body.error).equal('No id/rev for record deletion.');
        done();
      });
    });

    it('delete assessment with non-existing rev id', function(done){
      var query = querystring.stringify({'docId': curr_assessment._id, 'revId': invalidRevisionId});
      var req = request(app).delete('/api/assessment?' + query);
      agent.attachCookies(req);
      req.end(function(err, res){
        expect(res.statusCode).to.be.equal(400);
        expect(res.body).to.be.a('object');
        expect(res.body).to.have.property('error');
        expect(res.body.error).equal('conflict');
        done();
      });
    });

    it('delete assessment with empty rev id', function(done){
      var query = querystring.stringify({'docId': curr_assessment._id, 'revId': ''});
      var req = request(app).delete('/api/assessment?' + query);
      agent.attachCookies(req);
      req.end(function(err, res){
        expect(res.statusCode).to.be.equal(400);
        expect(res.body).to.be.a('object');
        expect(res.body).to.have.property('error');
        expect(res.body.error).equal('No id/rev for record deletion.');
        done();
      });
    });

    it('delete assessment with valid id and rev id', function(done){
      var query = querystring.stringify({'docId': curr_assessment._id, 'revId': currRevisionId});
      var req = request(app).delete('/api/assessment?' + query);
      agent.attachCookies(req);
      req.end(function(err, res){
        expect(res.statusCode).to.be.equal(200);
        expect(res.body).to.be.a('object');
        expect(res.body).to.have.property('ok');
        expect(res.body.ok).to.be.true;
        done();
      });
    });
  });
});
