var chai = require('chai');
var expect = chai.expect;
var apiKeys = require('../../../models/mongodb/apiKeys');
var _ = require('underscore');
var testUser = {
  'userid': 'TEST1234567',
  'ldap': {
    uid:'TEST1234567'
  },
  'name': 'test user',
  'email': 'test@us.ibm.com',
  'shortEmail': 'test@us.ibm.com',
  'adminAccess': 'none'
};
var testUser2 = {
  'userid': 'TEST7654321',
  'ldap': {
    uid:'TEST7654321'
  },
  'name': 'test user2',
  'email': 'test2@us.ibm.com',
  'shortEmail': 'test2@us.ibm.com',
  'adminAccess': 'none'
};

describe('apiKeys model [createApikey]', function() {
  before(function(done){
    apiKeys.deleteApikey(testUser)
      .then(function(){
        done();
      })
      .catch(function(){
        done();
      });
  });
  it('return fail for adding an empty API Key for user', function(done) {
    apiKeys.createApikey()
      .catch(function(err) {
        expect(err).to.be.a('object');
        done();
      });
  });
  it('return successful for adding an API Key for user', function(done) {
    apiKeys.createApikey(testUser)
      .then(function(result) {
        expect(result).to.be.a('object');
        done();
      });
  });
  it('return user api key for adding a duplicate user', function(done) {
    apiKeys.createApikey(testUser)
      .then(function(result) {
        expect(result).to.be.a('object');
        done();
      });
  });
});

describe('apiKeys model [getUserApikeyByUser]', function() {
  it('return null for non existing user key', function(done) {
    apiKeys.getUserApikeyByUser(testUser2)
      .then(function(result) {
        expect(result).to.be.null;
        done();
      });
  });
  it('return all users api keys', function(done) {
    apiKeys.getUserApikeyByUser()
      .then(function(result) {
        expect(result).to.be.a('array');
        done();
      });
  });
  it('return user api key', function(done) {
    apiKeys.getUserApikeyByUser(testUser)
      .then(function(result) {
        expect(result).to.be.a('object');
        done();
      });
  });
});

describe('apiKeys model [deleteApikey]', function() {
  it('return successful for deleting an API Key', function(done) {
    apiKeys.deleteApikey(testUser)
      .then(function(result) {
        expect(result).to.be.a('object');
        done();
      });
  });
});
