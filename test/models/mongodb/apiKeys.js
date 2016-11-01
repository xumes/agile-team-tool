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

describe('apiKeys model [getUserApikeyByUser]', function() {
  it('return null for non existing user key', function(done) {
    apiKeys.getUserApikeyByUser(testUser)
      .then(function(result) {
        expect(result).to.be.null;
        done();
      });
  });
});

describe('apiKeys model [createApikey]', function() {
  it('return successful for adding an API Key for user', function(done) {
    apiKeys.createApikey(testUser)
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
        done();
      })
      .catch(function(){
        done();
      });
  });
});
