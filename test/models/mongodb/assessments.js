var chai = require('chai');
var expect = chai.expect;
var Promise = require('bluebird');
var validAssessments = require('./testData/validAssessments');
var validTeams = require('./testData/validTeams');
var validUsers = require('./testData/validUsers');
var Teams = require('../../../models/mongodb/teams');
var Assessments = require('../../../models/mongodb/assessments');
var Users = require('../../../models/mongodb/users');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var newTeamId = Schema.Types.ObjectId;
var newAssessId = Schema.Types.ObjectId;

var testUser = {
  'userId': 'TEST1234567',
  'name': 'test user',
  'email': 'testuser@test.com',
  'adminAccess': 'none',
  'location': {
    'site': 'somers, ny, usa',
    'timezone': 'UTC-4'
  }
};

var inValidUser = {
  'userId': 'TEST7654321',
  'name': 'test user2',
  'email': 'testuser2@test.com',
  'adminAccess': 'none',
  'location': {
    'site': 'somers, ny, usa',
    'timezone': 'UTC-4'
  }
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

// var testData = {
//   validUserEmail : function() {
//     return 'johndoe@us.ibm.com';
//   },
//   invalidUserEmail: function() {
//     return 'invalidUser@us.ibm.com';
//   }
// };

describe('Assessment model [addTeamAssessment] ', function() {
  // create test user and team
  before(function(done){
    var promiseArray = [];
    promiseArray.push(Users.deleteUser(testUser.userId));
    promiseArray.push(Users.deleteUser(inValidUser.userId));
    promiseArray.push(Teams.deleteTeamByName(testTeam.name));
    promiseArray.push(Assessments.deleteByCloudantId(validAssessments.cloudantId));
    Promise.all(promiseArray)
      .then(function(results){
        return Users.create(testUser);
      })
      .then(function(result){
        return Users.create(inValidUser);
      })
      .then(function(result){
        return Teams.createTeam(testTeam);
      })
      .then(function(result){
        newTeamId = result._id;
        done();
      })
      .catch(function(err){
        done();
      });
  });
  it('fail because User ID and Assessment data is required', function(done) {
    Assessments.addTeamAssessment(null, null)
      .catch(function(err) {
        expect(err.error).to.be.equal('User ID and Assessment data is required');
        done();
      });
  });

  it('fail because user is not authorized to add assessment to team', function(done) {
    assessmentData = validAssessments;
    assessmentData['teamId'] = newTeamId;
    Assessments.addTeamAssessment(inValidUser.userId, assessmentData)
      .catch(function(err){
        expect(err.error).to.be.equal('Not allowed to add assessment for this team');
        done();
      });
  });

  it('fail because Assessment team id is required', function(done) {
    var assessmentData = validAssessments;
    delete assessmentData['teamId'];
    Assessments.addTeamAssessment(testUser.userId, assessmentData)
      .catch(function(err) {
        expect(err.error).to.be.equal('Assessment team id is required');
        done();
      });
  });

  it('fail because Assessment data is invalid', function(done) {
    var assessmentData = validAssessments;
    assessmentData['teamId'] = newTeamId;
    delete assessmentData['version'];
    delete assessmentData['componentResults'];
    delete assessmentData['actionPlans'];
    Assessments.addTeamAssessment(testUser.userId, assessmentData)
      .catch(function(err) {
        expect(err.name).to.be.equal('ValidationError');
        done();
      });
  });

  it('success ins creating new Assessment', function(done) {
    var assessmentData = validAssessments;
    assessmentData['teamId'] = newTeamId;
    assessmentData['version'] = 1;
    assessmentData['createdByUserId'] = testUser.userId;
    assessmentData['createdBy'] = testUser.email;
    assessmentData['assessorUserId'] = testUser.userId;
    delete assessmentData['componentResults'];
    delete assessmentData['actionPlans'];
    Assessments.addTeamAssessment(testUser.userId, assessmentData)
      .then(function(result) {
        newAssessId = result['_id'];
        expect(result['assessorUserId']).to.be.equal(assessmentData['assessorUserId']);
        done();
      });
  });
});

describe('Assessment model [getTeamAssessments] ', function() {
  it('fail because Assessment ID is required', function(done) {
    Assessments.getTeamAssessments(null)
      .catch(function(err) {
        expect(err.error).to.be.equal('Team ID is required');
        done();
      });
  });

  it('return empty Assessment details because Team ID is not existing', function(done) {
    Assessments.getTeamAssessments('18209ac24f5a448108e5398c')
      .then(function(result) {
        expect(result).to.deep.equal([]);
        done();
      });
  });

  it('return success in getting team Assessment', function(done) {
    Assessments.getTeamAssessments(newTeamId)
      .then(function(result){
        expect(result[0]['teamId'].toString()).to.be.equal(newTeamId.toString());
        done();
      });
  });
});

describe('Assessment model [getAssessment] ', function() {

  it('fail because Assessment ID is required', function(done) {
    Assessments.getAssessment(null)
      .catch(function(err) {
        expect(err.error).to.be.equal('Assessment ID is required');
        done();
      });
  });

  it('return empty Assessment details because Assessment ID is not existing', function(done) {
    Assessments.getAssessment('18209ac24f5a448108e5398c')
      .then(function(result) {
        expect(result).to.be.null;
        done();
      });
  });

  it('return success in getting Assessment by Assessment ID', function(done) {
    Assessments.getAssessment(newAssessId)
      .then(function(result) {
        expect(result['_id'].toString()).to.be.equal(newAssessId.toString());
        done();
      });
  });
});

describe('Assessment model [updateTeamAssessment] ', function() {
  it('return fail because Assessment ID and User ID is required', function(done) {
    Assessments.updateTeamAssessment(null, null)
      .catch(function(err) {
        expect(err.error).to.be.equal('Assessment ID and user ID is required');
        done();
      });
  });

  it('return fail because Assessment Team ID is required', function(done) {
    Assessments.updateTeamAssessment(testUser.userId, validAssessments)
      .catch(function(err) {
        expect(err.error).to.be.equal('Invalid assessment or team id');
        done();
      });
  });

  it('return fail because user is not allowed to edit Assessment', function(done) {
    var data = {
      '_id': newAssessId,
      'teamId': newTeamId,
      'version': 'New assessment version'
    };
    Assessments.updateTeamAssessment(inValidUser.userId, data)
      .catch(function(err) {
        expect(err.error).to.be.equal('Not allowed to update assessment');
        done();
      });
  });

  it('return success in updating Assessment data', function(done) {
    var data = {
      '_id': newAssessId,
      'teamId': newTeamId,
      'version': 'New assessment version'
    };
    Assessments.updateTeamAssessment(testUser.userId, data)
      .then(function(result) {
        expect(result['version']).to.be.equal('New assessment version');
        done();
      });
  });
});

describe('Assessment model [deleteAssessment] ', function() {
  it('return fail because Assessment ID and User ID/email is required', function(done) {
    Assessments.deleteAssessment(null, null)
      .catch(function(err) {
        expect(err.error).to.be.equal('Assessment ID and user ID is required');
        done();
      });
  });

  it('return fail because user is not allowed to delete Assessment', function(done) {
    Assessments.deleteAssessment(inValidUser.userId, newAssessId)
      .catch(function(err) {
        expect(err.error).to.be.equal('Not allowed to delete assessment');
        done();
      });
  });

  it('return success in deleting Assessment data', function(done) {
    Assessments.deleteAssessment(testUser.userId, newAssessId)
      .then(function(result) {
        expect(result.result.ok).to.be.equal(1);
        expect(result.result.n).to.be.equal(1);
        done();
      });
  });

  after(function(done){
    var promiseArray = [];
    promiseArray.push(Users.deleteUser(testUser.userId));
    promiseArray.push(Users.deleteUser(inValidUser.userId));
    promiseArray.push(Teams.deleteTeamByName(testTeam.name));
    Promise.all(promiseArray)
      .then(function(results){
        done();
      })
      .catch(function(err){
        done();
      });
  });
});
