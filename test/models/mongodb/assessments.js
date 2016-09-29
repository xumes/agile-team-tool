var chai = require('chai');
var expect = chai.expect;
var Promise = require('bluebird');
var validAssessments = require('./testData/validAssessments');
var validTeams = require('./testData/validTeams');
var validUsers = require('./testData/validUsers');
var Teams = require('../../../models/mongodb/teams');
var Assessments = require('../../../models/mongodb/assessments');

var testData = {
  validUserEmail : function() {
    return 'johndoe@us.ibm.com';
  },
  invalidUserEmail: function() {
    return 'invalidUser@us.ibm.com';
  }
};

describe('Assessment model [addTeamAssessment] ', function() {
  it('fail because User ID/Email and Assessment data is required', function(done) {
    Assessments.addTeamAssessment(null, null)
      .catch(function(err) {
        expect(err.error).to.be.equal('User email and Assessment data is required');
        done();
      });
  });

  it('fail because user is not authorized to add assessment to team', function(done) {
    var createdTeam = {};
    Teams.createTeam(validTeams, testData.validUserEmail())
      .then(function(result) {
        createdTeam = result;
        assessmentData = validAssessments;
        assessmentData['teamId'] = result['_id'];
        return Assessments.addTeamAssessment(testData.invalidUserEmail(), assessmentData);
      })
      .catch(function(err) {
        expect(err.error).to.be.equal('Not allowed to add assessment for this team');
        return Teams.deleteTeamByName(createdTeam['name']);
      })
      .then(function() {
        done();
      });
  });

  it('fail because Assessment team id is required', function(done) {
    var createdTeam = {};
    Teams.createTeam(validTeams, testData.validUserEmail())
      .then(function(result) {
        createdTeam = result;
        var assessmentData = validAssessments;
        delete assessmentData['teamId'];
        return Assessments.addTeamAssessment(testData.validUserEmail(), assessmentData);
      })
      .catch(function(err) {
        expect(err.error).to.be.equal('Assessment team id is required');
        return Teams.deleteTeamByName(createdTeam['name']);
      })
      .then(function() {
        done();
      });
  });

  it('fail because Assessment data is invalid', function(done) {
    var createdTeam = {};
    Teams.createTeam(validTeams, testData.validUserEmail())
      .then(function(result) {
        createdTeam = result;
        var assessmentData = validAssessments;
        assessmentData['teamId'] = result['_id'];
        delete assessmentData['version'];
        delete assessmentData['componentResults'];
        delete assessmentData['actionPlans'];
        return Assessments.addTeamAssessment(testData.validUserEmail(), assessmentData);
      })
      .catch(function(err) {
        expect(err.name).to.be.equal('ValidationError');
        return Teams.deleteTeamByName(createdTeam['name']);
      })
      .then(function(result) {
        done();
      });
  });

  it('success ins creating new Assessment', function(done) {
    var createdTeam = {};
    var assessmentData = {};
    var assessmentId = null;
    Teams.createTeam(validTeams, testData.validUserEmail())
      .then(function(result) {
        createdTeam = result;
        assessmentData = validAssessments;
        assessmentData['teamId'] = result['_id'];
        assessmentData['version'] = 1;
        assessmentData['createdByUserId'] = validUsers.userId;
        assessmentData['createdBy'] = validUsers.email;
        assessmentData['assessorUserId'] = validUsers.userId;
        delete assessmentData['componentResults'];
        delete assessmentData['actionPlans'];
        return Assessments.addTeamAssessment(testData.validUserEmail(), assessmentData);
      })
      .then(function(result) {
        assessmentId = result['_id'];
        expect(result['assessorUserId']).to.be.equal(assessmentData['assessorUserId']);
        return assessmentId;
      })
      .then(function(result) {
        return Assessments.deleteAssessment(testData.validUserEmail(), assessmentId);
      })
      .then(function() {
        return Teams.deleteTeamByName(createdTeam['name']);
      })
      .then(function(result) {
        done();
      });
  });
});

xdescribe('assessment models [getTeamAssessments]', function() {
  it('retrieve team assessments [valid team id]');

  it('retrieve team assessments [valid team id-all assessment information]');

  it('retrieve team assessments [non-existing team id]');

  it('retrieve team assessments [empty team id]');
});

xdescribe('assessment model [getAssessment] ', function() {

  it('retrieve assessment [non-existing assessment id]');

  it('retrieve assessment [empty assessment id]');

  it('retrieve assessment [valid assessment id]');

});

xdescribe('assessment model [updateTeamAssessment] ', function() {
  it('update assessment [no assessment id]');

  it('update assessment [empty assessment id]');

  it('update assessment [valid assessment data] with non-existing user');

  it('update assessment [valid assessment data] invalid revision id');

  it('update assessment [valid assessment data]');

});

xdescribe('assessment model [deleteAssessment] ', function() {
  it('delete assessment [non-existing assessment id]');

  it('delete assessment [empty assessment id]');

  it('delete assessment [non-existing revision id]');

  it('delete assessment [empty revision id]');

  it('delete assessment [invalid assessment id and revision id]');

  it('delete assessment [valid assessment and revision id] using admin user');
});
