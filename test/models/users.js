var chai = require('chai');
var expect = chai.expect;
var users = require('../../models/users');

describe("Users model [getAdmins]: get admins and supports", function(done){
  it("return admins and supports", function(done){
    users.getAdmins()
      .then(function(body){
        expect(body).to.be.a('object');
        expect(body).to.have.property('ACL_Full_Admin');
        expect(body).to.have.property('ACL_User_Supt');
        done();
      })
      .catch(function(err){
        done(err);
      });
  });
});
