var chai = require('chai');
var expect = chai.expect;
var users = require('../../../models/mongodb/users');
var testUser = {
  'userId': 'TEST1234567',
  'name': 'test user',
  'email': 'testuser@test.com',
  'adminAccess': 'none'
};

describe('Users model [create]', function() {
  before(function(done){
    users.delete(testUser.email)
      .then(function(){
        done();
      })
      .catch(function(){
        done();
      });
  });

  it('return successful for adding a user', function(done) {
    users.create(testUser)
      .then(function(result) {
        expect(result).to.be.a('object');
        done();
      });
  });
});

describe('Users model [findUserByEmail]', function() {
  it('return user info by searching user email', function(done) {
    users.findUserByEmail(testUser.email)
      .then(function(result) {
        expect(result).to.be.a('object');
        done();
      });
  });
});

describe('Users model [delete]', function() {
  it('return successful for deleting a user', function(done) {
    users.delete(testUser.email)
      .then(function(result) {
        expect(result).to.be.a('object');
        done();
      });
  });
});
