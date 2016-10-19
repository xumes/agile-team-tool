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

describe('Assessment model [getTeamAssessments] ', function() {
  it('fail because Assessment ID is required', function(done) {
    Assessments.getTeamAssessments(null)
      .catch(function(err) {
        expect(err.error).to.be.equal('Team ID is required');
        done();
      });
  });

  it('return empty Assessment details because Team ID is not existing', function(done) {
    Assessments.getTeamAssessments('123456789abc')
      .then(function(result) {
        expect(result).to.deep.equal([]);
        done();
      });
  });

  it('return success in getting team Assessment', function(done) {
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
        assessmentId = result['_id'].toString();
        return Assessments.getTeamAssessments(createdTeam['_id']);
      })
      .then(function(result) {
        expect(result[0]['teamId'].toString()).to.be.equal(createdTeam['_id'].toString());
        expect(result[0]['_id'].toString()).to.be.equal(assessmentId);
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

describe('Assessment model [getAssessment] ', function() {

  it('fail because Assessment ID is required', function(done) {
    Assessments.getAssessment(null)
      .catch(function(err) {
        expect(err.error).to.be.equal('Assessment ID is required');
        done();
      });
  });

  it('return empty Assessment details because Assessment ID is not existing', function(done) {
    Assessments.getAssessment('123456789abc')
      .then(function(result) {
        expect(result).to.deep.equal([]);
        done();
      });
  });

  it('return success in getting Assessment by Assessment ID', function(done) {
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
        assessmentId = result['_id'].toString();
        return Assessments.getAssessment(assessmentId);
      })
      .then(function(result) {
        expect(result[0]['_id'].toString()).to.be.equal(assessmentId);
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

describe('Assessment model [updateTeamAssessment] ', function() {
  it('return fail because Assessment ID and User ID/email is required', function(done) {
    Assessments.updateTeamAssessment(null, null)
      .catch(function(err) {
        expect(err.error).to.be.equal('Assessment ID and user email is required');
        done();
      });
  });

  it('return fail because Assessment Team ID is required', function(done) {
    Assessments.updateTeamAssessment(testData.validUserEmail(), validAssessments)
      .catch(function(err) {
        expect(err.error).to.be.equal('Invalid assessment or team id');
        done();
      });
  });

  it('return fail because user is not allowed to edit Assessment', function(done) {
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
        assessmentId = result['_id'].toString();
        var data = {
          '_id': result['_id'],
          'teamId': assessmentData['teamId'],
          'version': 'New assessment version'
        };
        return Assessments.updateTeamAssessment(testData.invalidUserEmail(), data);
      })
      .catch(function(err) {
        expect(err.error).to.be.equal('Not allowed to update assessment');
      })
      .then(function() {
        return Teams.deleteTeamByName(createdTeam['name']);
      })
      .then(function(result) {
        done();
      });
  });

  it('return success in updating Assessment data', function(done) {
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
        assessmentId = result['_id'].toString();
        var data = {
          '_id': result['_id'],
          'teamId': assessmentData['teamId'],
          'version': 'New assessment version'
        };
        return Assessments.updateTeamAssessment(testData.validUserEmail(), data);
      })
      .then(function(result) {
        expect(result['version']).to.be.equal('New assessment version');
      })
      .then(function() {
        return Teams.deleteTeamByName(createdTeam['name']);
      })
      .then(function(result) {
        done();
      });
  });
});

describe('Assessment model [deleteAssessment] ', function() {
  it('return fail because Assessment ID and User ID/email is required', function(done) {
    Assessments.deleteAssessment(null, null)
      .catch(function(err) {
        expect(err.error).to.be.equal('Assessment ID and user email is required');
        done();
      });
  });

  it('return fail because user is not allowed to delete Assessment', function(done) {
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
        assessmentId = result['_id'].toString();
        var data = {
          '_id': result['_id'],
          'teamId': assessmentData['teamId'],
          'version': 'New assessment version'
        };
        return Assessments.deleteAssessment(testData.invalidUserEmail(), data);
      })
      .catch(function(err) {
        expect(err.error).to.be.equal('Not allowed to delete assessment');
      })
      .then(function() {
        return Teams.deleteTeamByName(createdTeam['name']);
      })
      .then(function(result) {
        done();
      });
  });

  it('return success in deleting Assessment data', function(done) {
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
        assessmentId = result['_id'].toString();
        return Assessments.deleteAssessment(testData.validUserEmail(), assessmentId);
      })
      .then(function(result) {
        expect(result.result.ok).to.be.equal(1);
        expect(result.result.n).to.be.equal(1);
        return true;
      })
      .then(function() {
        return Teams.deleteTeamByName(createdTeam['name']);
      })
      .then(function(result) {
        done();
      });
  });
});
