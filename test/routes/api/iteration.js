var querystring = require('querystring');
var chai = require('chai');
var crypto = require('crypto');
var expect = chai.expect;
var request = require('supertest');
var iterationModel = require('../../../models/iteration');
var app = require('../../../app');
var validId;
var docId;
var iterationId;
var iterationId3;
var timeout = 100000;
var iterationDocValid = {
  "_id": "testmyid-" + crypto.randomBytes(20).toString('hex'),
  "type": "iterationinfo",
  "team_id": "testteamid_1",
  "iteration_name": "testiterationname-" + crypto.randomBytes(4).toString('hex'),
  "iteration_start_dt": "07/19/2016",
  "iteration_end_dt": "07/20/2016",
  "iterationinfo_status": "Not complete",
  "team_mbr_cnt": "1",
  "nbr_committed_stories": "3",
  "nbr_stories_dlvrd": "",
  "nbr_committed_story_pts": "4",
  "nbr_story_pts_dlvrd": "",
  "iteration_comments": "",
  "team_mbr_change": "No",
  "last_updt_user": "ortegaaa@ph.ibm.com",
  "fte_cnt": "0.0",
  "nbr_dplymnts": "",
  "nbr_defects": "",
  "client_sat": "1.0",
  "team_sat": "4",
  "last_updt_dt": "2016-04-04 03:07:10 EDT",
  "created_user": "ortegaaa@ph.ibm.com",
  "created_dt": "2016-04-04 03:07:10 EDT"
};

var iterationDoc_duplicateIterName = {
  "_id": "testmyid",
  "type": "iterationinfo",
  "team_id": "testteamid_1",
  "iteration_name": "testiterationname-1",
  "iteration_start_dt": "07/19/2016",
  "iteration_end_dt": "07/20/2016",
  "iterationinfo_status": "Not complete",
  "team_mbr_cnt": "1",
  "nbr_committed_stories": "3",
  "nbr_stories_dlvrd": "",
  "nbr_committed_story_pts": "4",
  "nbr_story_pts_dlvrd": "",
  "iteration_comments": "",
  "team_mbr_change": "No",
  "last_updt_user": "ortegaaa@ph.ibm.com",
  "fte_cnt": "0.0",
  "nbr_dplymnts": "",
  "nbr_defects": "",
  "client_sat": "1.0",
  "team_sat": "4",
  "last_updt_dt": "2016-04-04 03:07:10 EDT",
  "created_user": "ortegaaa@ph.ibm.com",
  "created_dt": "2016-04-04 03:07:10 EDT"
};

var iterationDocValid_sample1 = {
  "_id": "testmyid-" + crypto.randomBytes(20).toString('hex'),
  "type": "iterationinfo",
  "team_id": "testteamid_1",
  "iteration_name": "testiterationname-1",
  "iteration_start_dt": "07/19/2016",
  "iteration_end_dt": "07/20/2016",
  "iterationinfo_status": "Not complete",
  "team_mbr_cnt": "1",
  "nbr_committed_stories": "3",
  "nbr_stories_dlvrd": "",
  "nbr_committed_story_pts": "4",
  "nbr_story_pts_dlvrd": "",
  "iteration_comments": "",
  "team_mbr_change": "No",
  "last_updt_user": "ortegaaa@ph.ibm.com",
  "fte_cnt": "0.0",
  "nbr_dplymnts": "",
  "nbr_defects": "",
  "client_sat": "1.0",
  "team_sat": "4",
  "last_updt_dt": "2016-04-04 03:07:10 EDT",
  "created_user": "ortegaaa@ph.ibm.com",
  "created_dt": "2016-04-04 03:07:10 EDT"
};

var iterationDocValid_sample2 = {
  "_id": "testmyid-" + crypto.randomBytes(20).toString('hex'),
  "type": "iterationinfo",
  "team_id": "testteamid_1",
  "iteration_name": "testiterationname-1",
  "iteration_start_dt": "07/19/2016",
  "iteration_end_dt": "07/20/2016",
  "iterationinfo_status": "Not complete",
  "team_mbr_cnt": "1",
  "nbr_committed_stories": "3",
  "nbr_stories_dlvrd": "",
  "nbr_committed_story_pts": "4",
  "nbr_story_pts_dlvrd": "",
  "iteration_comments": "",
  "team_mbr_change": "No",
  "last_updt_user": "ortegaaa@ph.ibm.com",
  "fte_cnt": "0.0",
  "nbr_dplymnts": "",
  "nbr_defects": "",
  "client_sat": "1.0",
  "team_sat": "4",
  "last_updt_dt": "2016-04-04 03:07:10 EDT",
  "created_user": "ortegaaa@ph.ibm.com",
  "created_dt": "2016-04-04 03:07:10 EDT"
};

var iterationDocInvalid = {
  "_id": "testmyid-" + crypto.randomBytes(20).toString('hex'),
  "type": "iterationinfo",
  "team_id": "",
  "iteration_name": "",
  "iteration_start_dt": "07/19/2016",
  "iteration_end_dt": "07/20/2016",
  "iterationinfo_status": "Not complete",
  "team_mbr_cnt": "1",
  "nbr_committed_stories": "3",
  "nbr_stories_dlvrd": "",
  "nbr_committed_story_pts": "4",
  "nbr_story_pts_dlvrd": "",
  "iteration_comments": "",
  "team_mbr_change": "No",
  "last_updt_user": "ortegaaa@ph.ibm.com",
  "fte_cnt": "0.0",
  "nbr_dplymnts": "",
  "nbr_defects": "",
  "client_sat": "alpha",
  "team_sat": "-1",
  "last_updt_dt": "2016-04-04 03:07:10 EDT",
  "created_user": "ortegaaa@ph.ibm.com",
  "created_dt": "2016-04-04 03:07:10 EDT"
};

var agent = request.agent(app);

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

after(function(done){
  iterationModel.get(iterationId)
  .then(function(result){
    var _id = result._id;
    var _rev = result._rev;
    iterationModel.delete(_id, _rev)
    .then(function(result){
      console.log('Successfully deleted Doc1 docId: '+_id);
    })
    .catch(function(err){
      console.log('Err: Attempt to delete Doc1 docId: ' + _id);
      console.log(err);
      expect(err).to.not.equal(null);
    });
  })
  .catch(function(err) {
    console.log('Err: Attempt to delete Doc1 docId: ' + iterationId);
    console.log(err);
    expect(err).to.not.equal(null);
  })
  .finally(function(){
    setTimeout(function() {
      var iterationId2 = 'testmyid';
      console.log('Attempt to delete Doc2 docId: ' + iterationId2);
      iterationModel.get(iterationId2)
      .then(function(result) {
        var _id = result._id;
        var _rev = result._rev;
        iterationModel.delete(_id, _rev)
        .then(function(result) {
          console.log('Successfully deleted Doc2 docId: ' + _id);
        })
        .catch(function(err) {
          console.log('Err: Attempt to delete Doc2 docId: ' + iterationId2);
          console.log(err);
          expect(err).to.not.equal(null);
        });
      })
      .catch(function(err) {
        console.log('Err: Attempt to delete Doc1 docId: ' + iterationId2);
        console.log(err);
        expect(err).to.not.equal(null);
      })
      .finally(function() {
        setTimeout(function() {
          done();
        }, 3000);
      });
    }, 3000);
  });
});

describe('Iteration API Test [POST /api/iteration]: add team iteration document', function(){
  it('It will successfully add new iteration document', function(done){
    var req = request(app).post('/api/iteration');
    agent.attachCookies(req);
    req.send(iterationDocValid);
    req.expect(200);
    req.end(function(err, res){
      if (err) {
        console.log(err);
      } else {
        expect(res.body).to.be.a('object');
        expect(res.body).to.have.property('id');
        expect(res.body).to.have.property('ok');
        expect(res.body.ok).to.be.equal(true);
        iterationId = res.body.id;
      }
      done();
    });
  });

  // it('Return Iteration no/identifier already exists', function(done){
  //   var req = request(app).post('/api/iteration');
  //   agent.attachCookies(req);
  //   req.send(iterationDoc_duplicateIterName);
  //   req.expect(200);
  //   req.end(function(err, res){
  //     if (err) {
  //       console.log(err);
  //     } else {
  //       expect(res.body).to.have.property('error');
  //       expect(res.body.error).to.contain('exists');
  //     }
  //     done();
  //   });
  // });

  it('It will fail to add invalid iteration document', function(done){
    var req =request(app).post('/api/iteration');
    agent.attachCookies(req);
    req.send(iterationDocInvalid);
    req.expect(400);
    req.end(function(err, res){
      if (err) {
        console.log(err);
      } else {
        expect(res.body).to.have.property('error');
      }
      done();
    });
  });

  it('It will fail with empty document', function(done){
    var req =request(app).post('/api/iteration');
    agent.attachCookies(req);
    req.expect(400);
    req.end(function(err, res){
      if (err) {
        console.log(err);
      } else {
        expect(res.body).to.have.property('error');
      }
      done();
    });
  });
});

describe('Iteration API Test [GET /api/iteration/]: get iteration doucments', function(){
  it('Get all team iteration documents', function(done){
    var req = request(app).get('/api/iteration/');
    agent.attachCookies(req);
    req.expect(200);
    req.end(function(err, res){
      if (err) {
        console.log(err);
      } else {
        expect(res.body).to.be.a('object');
        expect(res.body).to.have.property('rows');
      }
      done();
    });
  });

  it('Get team iteration docs by key', function(done){
    var validTeamId = iterationDocValid.team_id;
    var req = request(app).get('/api/iteration/' + validTeamId);
    agent.attachCookies(req);
    req.expect(200);
    req.end(function(err, res){
      if (err) {
        console.log(err);
      } else {
        expect(res.body).to.be.a('object');
        expect(res.body).to.have.property('rows');
        expect(res.body.rows[0]).to.have.property('key');
        expect(res.body.rows[0].key).to.be.equal(validTeamId);
      }
      done();
    });
  });

  it('Get non-existing team iteration document', function(done){
    var invalidTeamId = '11111111';
    var req = request(app).get('/api/iteration/' + invalidTeamId);
    agent.attachCookies(req);
    req.expect(200);
    req.end(function(err, res){
      if (err) {
        console.log(err);
      } else {
        expect(res.body).to.have.property('rows');
        expect(res.body.rows).to.be.empty;
      }
      done();
    });
  });
});

describe('Iteration API Test [GET /api/iteration/completed]: get completed iteration', function(){
  it('Get completed iteration documents', function(done){
    var query = querystring.stringify({'startkey':iterationDocValid.iteration_start_dt});
    var req = request(app).get('/api/iteration/completed?' + query);
    agent.attachCookies(req);
    req.expect(200);
    req.end(function(err, res){
      if (err) {
        console.log(err);
      } else {
        expect(res.body).to.be.a('object');
        expect(res.body).to.have.property('rows');
      }
      done();
    });
  });
});

describe('Iteration API Test [PUT /api/iteration/]: update iteration document', function(){
  it('It will successfully update iteration document', function(done){
    var req = request(app).put('/api/iteration/' + iterationId);
    agent.attachCookies(req);
    req.send(iterationDocValid_sample2);
    req.expect(200);
    req.end(function(err, res){
      if (err) {
        console.log(err);
      } else {
        expect(res.body).to.have.property('id');
        expect(res.body.id).to.be.equal(iterationId);
      }
      done();
    });
  });

  it('It will fail to update without iterationId', function(done){
    var req = request(app).put('/api/iteration/');
    agent.attachCookies(req);
    req.send(iterationDocValid_sample2);
    req.expect(400);
    req.end(function(err, res){
      if (err) {
        console.log(err);
      } else {
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
    req.expect(400);
    req.end(function(err, res){
      if (err) {
        console.log(err);
      } else {
        expect(res.body).to.have.property('error');
        expect(res.body.error).to.be.equal('Iteration data is missing');
      }
      done();
    });
  });

  it('It will fail to update without invalid document', function(done){
    var req = request(app).put('/api/iteration/' + iterationId);
    agent.attachCookies(req);
    req.send(iterationDocInvalid);
    req.expect(400);
    req.end(function(err, res){
      if (err) {
        console.log(err);
      } else {
        expect(res.body).to.have.property('error');
      }
      done();
    });
  });
});

describe('Iteration API Test [GET /api/iteration/current]: get iteration doc by id', function(){
  it('It will successfully get iteration document', function(done){
    var req = request(app).get('/api/iteration/current/' + iterationId);
    agent.attachCookies(req);
    req.expect(200);
    req.end(function(err, res){
      if (err) {
        console.log(err);
      } else {
        expect(res.body).to.have.property('_id');
        expect(res.body._id).to.be.equal(iterationId);
      }
      done();
    });
  });

  it('It will fail to get iteration document with invalid id', function(done){
    var req = request(app).get('/api/iteration/current/' + 'undefined');
    agent.attachCookies(req);
    req.expect(400);
    req.end(function(err, res){
      if (err) {
        console.log(err);
      } else {
        expect(res.body).to.have.property('error');
        expect(res.body.error.error).to.be.equal('not_found');
      }
      done();
    });
  });
});
