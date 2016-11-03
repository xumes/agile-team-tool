var chai = require('chai');
var expect = chai.expect;
var users = require('../../../models/mongodb/users');
var teams = require('../../../models/mongodb/teams');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var testUser = {
  'userId': 'TEST1234567',
  'name': 'test user',
  'email': 'testuser@test.com',
  'adminAccess': 'none'
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
var newTeamId = Schema.Types.ObjectId;
var testUserDocId = Schema.Types.ObjectId;

describe('Users model [create]', function() {
  before(function(done){
    var promiseArray = [];
    promiseArray.push(users.deleteUser(testUser.userId));
    promiseArray.push(teams.deleteTeamByName(testTeam.name));
    Promise.all(promiseArray)
      .then(function(){
        return teams.createTeam(testTeam);
      })
      .then(function(result){
        newTeamId = result._id;
        done();
      })
      .catch(function(){
        done();
      });
  });

  it('return successful for adding a user', function(done) {
    users.create(testUser)
      .then(function(result) {
        testUserDocId = result._id;
        expect(result).to.be.a('object');
        expect(result.userId).to.equal('TEST1234567');
        done();
      });
  });
});

describe('Users model [findUserByEmail]', function() {
  it('return all admin users', function(done) {
    users.getAdmins()
      .then(function(result) {
        expect(result).to.be.a('array');
        done();
      });
  });
});

describe('Users model [findUserByEmail]', function() {
  it('return all users info by searching empty email', function(done) {
    users.findUserByEmail()
      .then(function(result) {
        expect(result).to.be.a('array');
        expect(result.length).not.to.equal(0);
        done();
      });
  });
  it('return user info by searching user email', function(done) {
    users.findUserByEmail(testUser.email)
      .then(function(result) {
        expect(result).to.be.a('object');
        expect(result.userId).to.equal('TEST1234567');
        done();
      });
  });
});

describe('Users model [findUserByUserId]', function() {
  it('return all users info by searching empty userId', function(done) {
    users.findUserByUserId()
      .then(function(result) {
        expect(result).to.be.a('array');
        expect(result.length).not.to.equal(0);
        done();
      });
  });
  it('return user info by searching user email', function(done) {
    users.findUserByUserId(testUser.userId)
      .then(function(result) {
        expect(result).to.be.a('object');
        expect(result.userId).to.equal('TEST1234567');
        done();
      });
  });
});

describe('Users model [getUsersInfo]', function() {
  it('return users by object ids', function(done) {
    users.getUsersInfo([testUser.userId])
      .then(function(result) {
        expect(result).to.be.a('array');
        expect(result.length).not.to.equal(0);
        done();
      });
  });
});

describe('Users model [isUserAllowed]', function() {
  it('return ture if the user has access', function(done) {
    users.isUserAllowed(testUser.userId, newTeamId)
      .then(function(result) {
        expect(result).to.equal(true);
        done();
      });
  });
  it('return false if the user has access', function(done) {
    users.isUserAllowed(testUser.userId, '581b72897bc85c73d8254a48')
      .then(function(result) {
        expect(result).to.equal(false);
        done();
      });
  });
});

describe('Users model [delete]', function() {
  it('return successful for deleting a user', function(done) {
    users.deleteUser(testUser.userId)
      .then(function(result) {
        expect(result).to.be.a('object');
        done();
      });
  });

  after(function(done){
    var promiseArray = [];
    promiseArray.push(users.deleteUser(testUser.userId));
    promiseArray.push(teams.deleteTeamByName(testTeam.name));
    Promise.all(promiseArray)
      .then(function(results){
        done();
      })
      .catch(function(err){
        done();
      });
  });
});
