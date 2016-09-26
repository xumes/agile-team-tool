var chai = require('chai');
var expect = chai.expect;
var users = require('../../../models/mongodb/users');

describe('Users model [findUserByEmail]', function() {
  it('return null for non existing user', function(done) {
    users.findUserByEmail('thisiddoesntexist iktKKTbAIGWQVAI')
      .then(function(result) {
        expect(result).to.be.null;
        done();
      });
  });
});

describe('Users model [create]', function() {
  it('return null for non existing user', function(done) {
    var newUser = {
      'userId': '4G2831897',
      'email': 'Yanliang.Gu1@ibm.com',
      'name': 'Yanliang Gu',
      'adminAccess': 'none',
    };
    users.create(newUser)
      .then(function(result) {
        //expect(result).to.be.a('array');
        done();
      });
  });
});
