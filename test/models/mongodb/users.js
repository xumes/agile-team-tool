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
