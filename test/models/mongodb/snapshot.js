var chai = require('chai');
var expect = chai.expect;
var snapshotModel = require('../../../models/mongodb/snapshot');
var teamModel = require('../../../models/mongodb/teams');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var _ = require('underscore');
var testTeam = {
  'name': 'mongodb-test-team-01',
  'type': '',
  'members': {
    'name': 'test user',
    'userId': 'TEST1234567',
    'email': 'testuser@test.com'
  },
  'createdByUserId': 'TEST1234567',
  'createdBy': 'testuser@test.com'
};
var userSession = {
  'ldap': {
    'uid': 'TEST1234567'
  },
  'shortEmail': 'testuser@test.com'
};

var newTeamId = Schema.Types.ObjectId;
var newTeamPathId = '';
var newSnapshotId = Schema.Types.ObjectId;

describe('Snapshot Model Test', function(){
  describe('Snapshot model [updateRollUpData]', function(){
    before(function(done){
      var promiseArray = [];
      promiseArray.push(teamModel.deleteTeamByName(testTeam.name));
      Promise.all(promiseArray)
        .then(function(){
          return teamModel.createTeam(testTeam, userSession);
        })
        .then(function(result){
          newTeamId = result._id;
          newTeamPathId = result.pathId;
          done();
        })
        .catch(function(){
          done();
        });
    });

    it('return successful for updating roll up data', function(done) {
      snapshotModel.updateRollUpData()
        .then(function(result){
          expect(result).to.be.a('string');
          done();
        });
    });
  });

  describe('Snapshot model [getRollUpDataByTeamId]', function(){
    it('return snapshot by team id', function(done) {
      snapshotModel.getRollUpDataByTeamId(newTeamId)
        .then(function(result){
          expect(result).to.be.a('object');
          expect(result).to.have.property('_id');
          newSnapshotId = result._id;
          done();
        });
    });
  });

  describe('Snapshot model [getRollUpDataByPathId]', function(){
    it('return snapshot by team id', function(done) {
      snapshotModel.getRollUpDataByPathId(newTeamPathId)
        .then(function(result){
          expect(result).to.be.a('object');
          done();
        });
    });
  });

  describe('Snapshot model [completeIterations]', function(){
    it('return successful for updating iterations', function(done) {
      snapshotModel.completeIterations()
        .then(function(result){
          done();
        });
    });
    after(function(done){
      var promiseArray = [];
      teamModel.deleteTeamByName(testTeam.name)
        .then(function(result){
          return snapshotModel.deleteSnapshot(newSnapshotId);
        })
        .then(function(result){
          done();
        })
        .catch(function(){
          done();
        });
    });
  });
});
