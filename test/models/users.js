var chai = require('chai');
var expect = chai.expect;
var users = require('../../models/users');
var user = {
  'shortEmail': 'john.doe@us.ibm.com',
  'ldap': {
    'uid': '123456PH1'
  }
};
var testApiKey = '';

describe('Users model [getAdmins]: get admins and supports', function(done) {
  it('return admins and supports', function(done) {
    users.getAdmins()
      .then(function(body) {
        expect(body).to.be.a('object');
        expect(body).to.have.property('ACL_Full_Admin');
        expect(body).to.have.property('ACL_User_Supt');
        done();
      })
      .catch(function(err) {
        done(err);
      });
  });
});

describe('Users model [api key]: user api key handlers', function(done) {
  it('return user api key', function(done) {
    users.createApikey(user)
      .then(function(body) {
        expect(body).to.be.a('object');
        expect(body).to.have.property('key');
        testApiKey = body.key;
        done();
      })
      .catch(function(err) {
        done(err);
      });
  });

  // it('return user existing api key', function(done) {
  //   users.createApikey(user)
  //     .then(function(body) {
  //       expect(body).to.be.a('object');
  //       expect(body).to.have.property('key');
  //       expect(body.key).to.be.equal(testApiKey);
  //       done();
  //     })
  //     .catch(function(err) {
  //       done(err);
  //     });
  // });

  // it('return user and key by api key search', function(done) {
  //   users.getUserApikeyByApikey(testApiKey)
  //     .then(function(body) {
  //       expect(body).to.be.a('object');
  //       expect(body).to.have.property('key');
  //       expect(body.email).to.be.equal(user.shortEmail);
  //       done();
  //     })
  //     .catch(function(err) {
  //       done(err);
  //     });
  // });

  // it('returns user and key by uid search', function(done) {
  //   users.getUserApikeyByUid(user.ldap.uid)
  //     .then(function(body) {
  //       expect(body).to.be.a('object');
  //       expect(body).to.have.property('key');
  //       expect(body.key).to.be.equal(testApiKey);
  //       done();
  //     })
  //     .catch(function(err) {
  //       done(err);
  //     });
  // });

  it('deletes user api key', function(done) {
    users.deleteApikey(user)
      .then(function(body) {
        expect(body).to.be.a('object');
        done();
      })
      .catch(function(err) {
        done(err);
      });
  });
});
