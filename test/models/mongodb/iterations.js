var chai = require('chai');
var Promise = require('bluebird');
var expect = chai.expect;
var iterationModel = require('../../../models/mongodb/iterations');
var userModel = require('../../../models/mongodb/users');
var teamModel = require('../../../models/mongodb/teams');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var _ = require('underscore');
var moment = require('moment');
var dateFormat = 'YYYY-MM-DD HH:mm:ss';
var iterStatus = '';
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
var invalidUser = {
  'userId': 'TEST7654321',
  'name': 'test user2',
  'email': 'testuser2@test.com',
  'adminAccess': 'none',
  'location': {
    'site': 'somers, ny, usa',
    'timezone': 'UTC-4'
  }
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
  'type': 'squad',
  'members': [{
    'name': 'test user',
    'role': 'Tester',
    'allocation': 100,
    'userId': testUser.userId,
    'email': testUser.email
  }],
  'createdByUserId': testUser.userId,
  'createdBy': testUser.email
};
var userSession = {
  'ldap': {
    'uid': testUser.userId
  },
  'shortEmail': testUser.email
};
var invalidUserSession = {
  'ldap': {
    'uid': invalidUser.userId
  },
  'shortEmail': invalidUser.email
};

var notExistingUserSession = {
  'ldap': {
    'uid': 'notexisting'
  },
  'shortEmail': 'notexisting@test.com'
};

var newIterationId = Schema.Types.ObjectId;
var newTeamId = Schema.Types.ObjectId;
var notExistingUser = new Object();
notExistingUser['userId'] = 'notexisting';

describe('Iteration model [add]', function() {
  var createdTeam = {};
  before(function(done){
    var promiseArray = [];
    promiseArray.push(userModel.deleteUser(testUser.userId));
    promiseArray.push(userModel.deleteUser(invalidUser.userId));
    promiseArray.push(teamModel.deleteTeamByName(testTeam.name));
    Promise.all(promiseArray)
      .then(function(results){
        return userModel.create(testUser);
      })
      .then(function(result){
        return userModel.create(invalidUser);
      })
      .then(function(result){
        return teamModel.createTeam(testTeam, userSession);
      })
      .then(function(result){
        newTeamId = result._id;
        createdTeam = result;
        done();
      })
      .catch(function(err){
        done();
      });
  });
  before(function(done){
    var request = {
      'name': validIterationDoc.name,
    };
    iterationModel.deleteByFields(request)
      .then(function(result){
        done();
      })
      .catch(function(err){
        done();
      });
  });
  it('returns false because new team has no iteration', function(done) {
    iterationModel.hasIterations(newTeamId)
      .then(function(result) {
        expect(result).to.equal(false);
        done();
      });
  });

  it('return successful for adding an iteration', function(done) {
    validIterationDoc['teamId'] = newTeamId;
    iterationModel.add(validIterationDoc, userSession)
      .then(function(result){
        expect(result).to.be.a('object');
        expect(result).to.have.property('_id');
        newIterationId = result._id;
        iterStatus = result.status;
        return iterationModel.hasIterations(newTeamId);
      })
      .then(function(result) {
        expect(result).to.equal(true);
        createdTeam.type = null;
        return teamModel.updateTeam(createdTeam, userSession);
      })
      .catch(function(err) {
        expect(err).to.be.a('object');
        done();
      });
  });

  it('return fail for adding a duplicate name iteration', function(done){
    iterationModel.add(validIterationDoc, userSession)
      .catch(function(err){
        expect(err).to.be.a('object');
        expect(err).to.have.property('error');
        done();
      });
  });

  it('return fail because the user is not existing', function(done){
    iterationModel.add(validIterationDoc, notExistingUserSession)
      .catch(function(err){
        expect(err).to.be.a('object');
        expect(err).to.have.property('error');
        done();
      });
  });

  it('return fail because the user is invalid to add iteration to this team', function(done){
    iterationModel.add(validIterationDoc, invalidUserSession)
      .catch(function(err){
        expect(err).to.be.a('object');
        expect(err).to.have.property('error');
        done();
      });
  });
});

describe('Iteration model [getByIterInfo]', function() {
  it('return successful for retriveing a iteration by teamId', function(done) {
    iterationModel.getByIterInfo(validIterationDoc.teamId)
      .then(function(result){
        expect(result).to.be.a('array');
        expect(result.length).not.to.equal(0);
        done();
      });
  });

  it('return successful for retriveing all iterations', function(done) {
    iterationModel.getByIterInfo('',10)
      .then(function(result){
        expect(result).to.be.a('array');
        expect(result.length).not.to.equal(0);
        done();
      });
  });
});

describe('Iteration model [get]', function() {
  it('return successful for retriveing a iteration by id', function(done) {
    iterationModel.get(newIterationId)
      .then(function(result){
        expect(result).to.be.a('object');
        expect(result).to.have.property('_id');
        done();
      });
  });
});

describe('Iteration model [getCompletedIterationsByKey]', function() {
  it('return successful for retriveing iterations by time', function(done) {
    iterationModel.getCompletedIterationsByKey(validIterationDoc.startDate, validIterationDoc.endDate)
      .then(function(result){
        expect(result).to.be.a('array');
        expect(result.length).not.to.equal(0);
        done();
      });
  });

  it('return successful for retriveing iterations by time (only startDate)', function(done) {
    iterationModel.getCompletedIterationsByKey(validIterationDoc.startDate, null)
      .then(function(result){
        expect(result).to.be.a('array');
        expect(result.length).not.to.equal(0);
        done();
      });
  });

  it('return successful for retriveing iterations by time (only endDate)', function(done) {
    iterationModel.getCompletedIterationsByKey(null, validIterationDoc.startDate)
      .then(function(result){
        expect(result).to.be.a('array');
        expect(result.length).not.to.equal(0);
        done();
      });
  });
});

describe('Iteration model [getNotCompletedIterations]', function() {
  it('return successful for retriveing all not completed iterations', function(done) {
    iterationModel.getNotCompletedIterations()
      .then(function(result){
        expect(result).to.be.a('array');
        done();
      });
  });
});

describe('Iteration model [updateSprintAvailability]', function(){
  it('return successful for updating the sprint availability', function(done) {
    iterationModel.updateSprintAvailability()
      .then(function(result){
        expect(result).to.be.a('String');
        expect(result).to.equal('Successfully completed this operation');
        done();
      });
  });
});

describe('Iteration model [searchTeamIteration]', function() {
  it('return successful for retriveing a iteration by query', function(done) {
    var queryrequest = {
      'id': validIterationDoc.teamId,
      'status': iterStatus,
      'startDate': moment(new Date('01-01-2016')).format(dateFormat),
      'endDate': moment(new Date()).format(dateFormat)
    };
    iterationModel.searchTeamIteration(queryrequest)
      .then(function(result){
        expect(result).to.be.a('array');
        expect(result.length).not.to.equal(0);
        done();
      });
  });

  it('return successful for retriveing a iteration by query (startdate only)', function(done) {
    var queryrequest = {
      'id': validIterationDoc.teamId,
      'status': iterStatus,
      'startDate': validIterationDoc.endDate
    };
    iterationModel.searchTeamIteration(queryrequest)
      .then(function(result){
        expect(result).to.be.a('array');
        done();
      });
  });

  it('return successful for retriveing a iteration by query (enddate only)', function(done) {
    var queryrequest = {
      'id': validIterationDoc.teamId,
      'status': iterStatus,
      'endDate': validIterationDoc.endDate
    };
    iterationModel.searchTeamIteration(queryrequest)
      .then(function(result){
        expect(result).to.be.a('array');
        done();
      });
  });
});

describe('Iteration model [edit]', function() {
  it('return successful for updating a iteration', function(done) {
    validIterationDoc.memberCount = 2;
    iterationModel.edit(newIterationId, validIterationDoc, userSession)
      .then(function(result){
        expect(result).to.be.a('object');
        expect(result).to.have.property('ok');
        done();
      });
  });

  it('return successful for updating a iteration (update deliveredStories)', function(done) {
    validIterationDoc.deliveredStories = 1;
    iterationModel.edit(newIterationId, validIterationDoc, userSession)
      .then(function(result){
        expect(result).to.be.a('object');
        expect(result).to.have.property('ok');
        done();
      });
  });

  it('return successful for updating a iteration (update endDate)', function(done) {
    validIterationDoc.endDate = '09-15-2016';
    iterationModel.edit(newIterationId, validIterationDoc, userSession)
      .then(function(result){
        expect(result).to.be.a('object');
        expect(result).to.have.property('ok');
        done();
      });
  });

  it('return fail for updating a iteration by invalid user', function(done) {
    iterationModel.edit(newIterationId, validIterationDoc, invalidUserSession)
      .catch(function(err){
        expect(err).to.be.a('object');
        expect(err).to.have.property('error');
        done();
      });
  });
});

describe('Iteration model [softDelete]', function() {
  it('return successful for soft deleteing a iteration', function(done) {
    iterationModel.softDelete(newIterationId, userSession)
      .then(function(result){
        expect(result).to.be.a('object');
        expect(result).to.have.property('ok');
        done();
      });
  });
});

describe('Iteration model [delete]', function() {
  it('return fail for deleteing a iteration by empty id', function(done) {
    iterationModel.deleteIter('', userSession)
      .catch(function(err){
        expect(err).to.be.a('object');
        expect(err).to.have.property('error');
        done();
      });
  });

// describe('Iteration model [getCompletedIterationsByKey]', function() {
//   it('return successful for retriveing a iteration by time', function(done) {
//     iterationModel.getCompletedIterationsByKey(validIterationDoc.startDate, validIterationDoc.endDate)
//       .then(function(result){
//         expect(result).to.be.a('array');
//         expect(result.length).not.to.equal(0);
//         done();
//       });
//   });
// });

// describe('Iteration model [searchTeamIteration]', function() {
//   it('return successful for retriveing a iteration by query', function(done) {
//     var queryrequest = {
//       'id': validIterationDoc.teamId,
//       'status': iterStatus,
//       'startdate': moment(new Date('01-01-2016')).format(dateFormat),
//       'enddate': moment(new Date()).format(dateFormat)
//     };
//     iterationModel.searchTeamIteration(queryrequest)
//       .then(function(result){
//         expect(result).to.be.a('array');
//         expect(result.length).not.to.equal(0);
//         done();
//       });
//   });

//   it('return successful for retriveing a iteration by query (startdate only)', function(done) {
//     var queryrequest = {
//       'id': validIterationDoc.teamId,
//       'status': iterStatus,
//       'startdate': validIterationDoc.endDate
//     };
//     iterationModel.searchTeamIteration(queryrequest)
//       .then(function(result){
//         expect(result).to.be.a('array');
//         done();
//       });
//   });

//   it('return successful for retriveing a iteration by query (enddate only)', function(done) {
//     var queryrequest = {
//       'id': validIterationDoc.teamId,
//       'status': iterStatus,
//       'enddate': validIterationDoc.endDate
//     };
//     iterationModel.searchTeamIteration(queryrequest)
//       .then(function(result){
//         expect(result).to.be.a('array');
//         done();
//       });
//   });
// });

// describe('Iteration model [edit]', function() {
//   it('return successful for updating a iteration', function(done) {
//     validIterationDoc.memberCount = 2;
//     iterationModel.edit(newIterationId, validIterationDoc, userSession)
//       .then(function(result){
//         expect(result).to.be.a('object');
//         expect(result).to.have.property('ok');
//         done();
//       });
//   });

//   it('return successful for updating a iteration (update deliveredStories)', function(done) {
//     validIterationDoc.deliveredStories = 1;
//     iterationModel.edit(newIterationId, validIterationDoc, userSession)
//       .then(function(result){
//         expect(result).to.be.a('object');
//         expect(result).to.have.property('ok');
//         done();
//       });
//   });

//   it('return successful for updating a iteration (update endDate)', function(done) {
//     validIterationDoc.endDate = '09-15-2016';
//     iterationModel.edit(newIterationId, validIterationDoc, userSession)
//       .then(function(result){
//         expect(result).to.be.a('object');
//         expect(result).to.have.property('ok');
//         done();
//       });
//   });
// });

// describe('Iteration model [delete]', function() {
//   it('return fail for deleteing a iteration by empty id', function(done) {
//     iterationModel.delete()
//       .catch(function(err){
//         expect(err).to.be.a('object');
//         expect(err).to.have.property('error');
//         done();
//       });
//   });

//   it('return fail for deleteing a iteration by empty request', function(done) {
//     iterationModel.deleteByFields()
//       .catch(function(err){
//         expect(err).to.be.a('object');
//         expect(err).to.have.property('error');
//         done();
//       });
//   });

  it('return successful for deleteing a iteration by id', function(done) {
    iterationModel.deleteIter(newIterationId, userSession)
      .then(function(result){
        expect(result).to.be.a('object');
        expect(result).to.have.property('result');
        done();
      });
  });

  after(function(done){
    var promiseArray = [];
    promiseArray.push(userModel.deleteUser(testUser.userId));
    promiseArray.push(userModel.deleteUser(invalidUser.userId));
    promiseArray.push(teamModel.deleteTeamByName(testTeam.name));
    Promise.all(promiseArray)
      .then(function(results){
        done();
      })
      .catch(function(err){
        done();
      });
  });
});
