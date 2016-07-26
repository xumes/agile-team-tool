var chai = require('chai');
var expect = chai.expect;
var app = require('../../../app');
var request = require('supertest');
var dummyData = require('../../dummy-data.js');

var teamDocValid = dummyData.teams.validDoc;
var teamDocInvalid = dummyData.teams.invalidDoc;
var teamDocUpdateInvalid = dummyData.teams.validDoc;
var teamDocUpdateValid = dummyData.teams.validDoc;
var userValidEmail = dummyData.user.details.shortEmail;
var userDetailsInvalid = dummyData.user;

var createdId = null;
var agent = request.agent(app);

// do the login befre testing
var agents;
before(function (done) {
  loginRequest(userValidEmail, function(loginAgent) {
    agents = loginAgent;
    done();
  });
});

describe('Team API Tests', function(){
  it('it will return 400 because team docment is not valid', function(done){
    var req = request(app).post('/api/teams');
    agents.attachCookies(req);
    req.send(teamDocInvalid);
    req.expect(400);
    req.end(function(err, res){
      expect(res.body).to.not.equal(null);
      expect(res.body).to.have.property('error');
      expect(res.body.error).to.be.a('object');
      done();
    });
  });

  it('it will return 201 when you create a team successfully',function(done){
    var req = request(app).post('/api/teams');
    agents.attachCookies(req);
    req.send(teamDocValid);
    req.expect(201);
    req.end(function(err,res){
      createdId = res.body['_id'];
      done();
    });
  });

  it('it will return 400 because Team document ID is none existing', function(done){
    var docu = { '_id' : 'none-existing-docu' + new Date().getTime() };
    var req = request(app).put('/api/teams');
    agents.attachCookies(req);
    req.send(docu);
    req.expect(400);
    req.end(done);
  });

  it('it will return 400 because update data is invalid', function(done){
    teamDocUpdateInvalid['parent_team_id']=createdId;
    var req = request(app).put('/api/teams');
    agents.attachCookies(req);
    req.send(teamDocUpdateInvalid);
    req.expect(400);
    req.end(done);
  });

  it('it will return 200 after updating document', function(done){
    teamDocUpdateValid['name'] = teamDocUpdateValid['name'] + 'new name';
    teamDocUpdateValid['_id'] = createdId;
    delete teamDocUpdateValid['parent_team_id'];
    var req = request(app).put('/api/teams');
    agents.attachCookies(req);
    req.send(teamDocUpdateValid);
    req.expect(200);
    req.end(function(err, res){
      done();
    });
  });

  // Get teams api tests
  it('it will return 200 for retrieving all teams successfully', function(done){
    var req = request(app).get('/api/teams');
    agents.attachCookies(req);
    req.expect(200);
    req.end(function(err,res){
      expect(res.body).to.be.a('object');
      expect(res.body).to.have.property('rows');
      done();
    });
  });

  it('it will return 400 and return empty because none existent team details', function(done){
    var req = request(app).get('/api/teams/'+'none-existing-team');
    agents.attachCookies(req);
    req.expect(400);
    req.end(function(err,res){
      expect(res.body.error).to.be.equal('not_found');
      done();
    });
  });

  it('it will return 200 and team details', function(done){
    var req = request(app).get('/api/teams/' + createdId);
    agents.attachCookies(req);
    req.expect(200);
    req.end(function(err,res){
      expect(res.body).to.be.a('object');
      expect(res.body).to.have.property('type');
      done();
    });
  });

  // Get team roles api test
  it('it will return 200 and retrieve all team role types', function(done){
    var req = request(app).get('/api/teams/roles');
    agents.attachCookies(req);
    req.expect(200);
    req.end(function(err,res){
      expect(res.body).to.be.a('object');
      expect(res.body).to.have.property('rows');
      done();
    });
  });

  // Get by names api tests
  it('it will return 200 and retrieve all team names', function(done){
    var req = request(app).get('/api/teams/names');
    agents.attachCookies(req);
    req.expect(200);
    req.end(function(err,res){
      expect(res.body).to.be.a('object');
      expect(res.body).to.have.property('rows');
      done();
    });
  });

  it('it will return 200 and return empty details for none existing team name', function(done){
    var req = request(app).get('/api/teams/names/' + 'none-existing-team-name');
    agents.attachCookies(req);
    req.expect(200);
    req.end(function(err, res){
      expect(res.body).to.be.empty;
      done();
    });
  });

  it('it will reutrn 200 and details for team name', function(done){
    var req = request(app).get('/api/teams/names/' + teamDocUpdateValid['name']);
    agents.attachCookies(req);
    req.expect(200);
    req.end(function(err,res){
      expect(res.body[0]['key']).to.be.equal(teamDocUpdateValid['name']);
      done();
    });
  });

  // Get by email api tests
  it('it will return 400 because invalid email address', function(done){
    var req = request(app).get('/api/teams/members/' + 'invalid-email-add');
    agents.attachCookies(req);
    req.expect(400);
    req.end(done);
  });

  it('it will return 400 and empty team lists because email without team', function(done){
    var req = request(app).get('/api/teams/members/' + 'emailWithoutTeam@email.com');
    agents.attachCookies(req);
    req.expect(400);
    req.end(function(err, res){
      expect(res.body).to.be.empty;
      done();
    });
  });

  it('it will return 200 and team lists for this email', function(done){
    var req = request(app).get('/api/teams/members/' + userValidEmail);
    agents.attachCookies(req);
    req.expect(200);
    req.end(function(err, res){
      expect(res.body[0]['key']).to.be.equal(userValidEmail);
      done();
    });
  });

  // Delete api test
  it('it will return 204 after deleting document', function(done){
    teamDocUpdateValid['doc_status'] = 'delete';
    teamDocUpdateValid['_id'] = createdId;
    var req = request(app).delete('/api/teams');
    agents.attachCookies(req);
    req.send(teamDocUpdateValid);
    req.expect(204);
    req.end(done);
  });
});


// login requset used for testing
function loginRequest (creds, done) {
  var req = agent.post('/api/login/masquerade/' + creds);
  req.end(function (err, res) {
    if (err) {
      throw err;
    }
    agent.saveCookies(res);
    done(agent);
  });
};
