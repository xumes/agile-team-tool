var chai = require('chai');
var expect = chai.expect;
var users = require('../../models/users');
var teams = require('../../models/teams');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var testUser = {
  'userId': 'TEST1234567',
  'name': 'test user',
  'email': 'testuser@test.com',
  'adminAccess': 'none'
};
var testParentTeam = {
  'name': 'mongodb-test-team-01',
  'members': [{
    'name': 'test user',
    'role': 'Tester',
    'allocation': 100,
    'userId': 'TEST1234567',
    'email': 'testuser@test.com',
    'workTime': 100
  }],
  'createdByUserId': 'TEST1234567',
  'createdBy': 'testuser@test.com'
};
var testAdminUser = {
  'userId': 'ADMIN1234567',
  'name': 'admin test user',
  'email': 'admintestuser@test.com',
  'adminAccess': 'full'
};
var testChildUser = {
  'userId': 'CHILD1234567',
  'name': 'child test user',
  'email': 'childtestuser@test.com',
  'adminAccess': 'none'
};

var testChildTeam = {
  'name': 'mongodb-test-child-team-01',
  'members': [{
    'name': 'admin test user',
    'role': 'Tester',
    'allocation': 100,
    'userId': 'ADMIN1234567',
    'email': 'admintestuser@test.com'
  }, {
    'name': 'child test user',
    'role': 'Tester',
    'allocation': 100,
    'userId': 'CHILD1234567',
    'email': 'childtestuser@test.com'
  }],
  'createdByUserId': 'CHILD1234567',
  'createdBy': 'childtestuser@test.com'
};
var userSession1 = {
  'ldap': {
    'uid': 'TEST1234567',
    'hrFirstName': 'John',
    'hrLastName': 'Doe',
  },
  'shortEmail': 'testuser@test.com'
};
var userSession2 = {
  'ldap': {
    'uid': 'ADMIN1234567',
    'hrFirstName': 'John',
    'hrLastName': 'Doe',
  },
  'shortEmail': 'admintestuser@test.com'
};

var testChildUser2 = {
  'userId': 'CHILD111',
  'name': 'childtest_user1',
  'email': 'childtestuser111@test.com',
  'adminAccess': 'none'
};
var testChildTeam2 = {
  'name': 'mongodb-test-child2',
  'members': [{
    'name': 'childtest_user1',
    'role': 'Tester',
    'allocation': 100,
    'userId': 'CHILD111',
    'email': 'childtestuser111@test.com'
  }],
  'createdByUserId': 'ADMIN1234567',
  'createdBy': 'admintestuser@test.com'
};

var newParentTeamId = Schema.Types.ObjectId;
var newChildTeamId = Schema.Types.ObjectId;
// var newChildTeamId2 = Schema.Types.ObjectId;

describe('Users model [create]', function() {
  before(function(done){
    var promiseArray = [];
    promiseArray.push(users.deleteUser(testUser.userId));
    promiseArray.push(users.deleteUser(testAdminUser.userId));
    promiseArray.push(users.deleteUser(testChildUser.userId));
    promiseArray.push(teams.deleteTeamByName(testParentTeam.name));
    promiseArray.push(teams.deleteTeamByName(testChildTeam.name));
    Promise.all(promiseArray)
      .then(function(){
        return teams.createTeam(testParentTeam, userSession1);
      })
      .then(function(result){
        newParentTeamId = result._id;
        testChildTeam.path = ','+result.pathId+',';
        return teams.createTeam(testChildTeam, userSession2);
      })
      .then(function(result){
        newChildTeamId = result._id;
        console.log('TESTING_createTeam result:',result);
        // delete all created users who were members of the team
        promiseArray = [];
        promiseArray.push(users.deleteUser(testUser.userId));
        promiseArray.push(users.deleteUser(testAdminUser.userId));
        promiseArray.push(users.deleteUser(testChildUser.userId));
        return Promise.all(promiseArray);
      })
      .then(function(result){
        done();
      })
      .catch(function(err){
        done();
      });
  });

  it('return successful for adding a user', function(done) {
    users.create(testUser)
      .then(function(result) {
        expect(result).to.be.a('object');
        expect(result.userId).to.equal('TEST1234567');
        done();
      });
  });
  it('return successful for adding an admin user', function(done) {
    users.create(testAdminUser)
      .then(function(result) {
        expect(result).to.be.a('object');
        expect(result.userId).to.equal('ADMIN1234567');
        done();
      });
  });
  it('return successful for adding an child user', function(done) {
    users.create(testChildUser)
      .then(function(result) {
        expect(result).to.be.a('object');
        expect(result.userId).to.equal('CHILD1234567');
        done();
      });
  });
});

describe('Users model [getAllUsers]', function() {
  it('return all users', function(done){
    this.timeout(5000);
    users.getAllUsers()
      .then(function(result) {
        expect(result).to.be.a('array');
        done();
      });
  });
});

describe('Users model [getAdmins]', function() {
  it('return all admin users', function(done){
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
  it('return user info by searching admin user email', function(done) {
    users.findUserByEmail(testAdminUser.email)
      .then(function(result) {
        expect(result).to.be.a('object');
        expect(result.userId).to.equal('ADMIN1234567');
        done();
      });
  });
  it('return user info by searching child user email', function(done) {
    users.findUserByEmail(testChildUser.email)
      .then(function(result) {
        expect(result).to.be.a('object');
        expect(result.userId).to.equal('CHILD1234567');
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
  it('return user info by searching user userId', function(done) {
    users.findUserByUserId(testUser.userId)
      .then(function(result) {
        expect(result).to.be.a('object');
        expect(result.userId).to.equal('TEST1234567');
        done();
      });
  });
  it('return user info by searching admin user userId', function(done) {
    users.findUserByUserId(testAdminUser.userId)
      .then(function(result) {
        expect(result).to.be.a('object');
        expect(result.userId).to.equal('ADMIN1234567');
        done();
      });
  });
  it('return user info by searching child user userID', function(done) {
    users.findUserByUserId(testChildUser.userId)
      .then(function(result) {
        expect(result).to.be.a('object');
        expect(result.userId).to.equal('CHILD1234567');
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
        expect(result[0]).to.have.property('userId');
        expect(result[0]).to.have.property('email');
        expect(result[0]).to.have.property('name');
        expect(result[0]).to.have.property('adminAccess');
        done();
      });
  });
});

describe('Users model [isUserAllowed]', function() {
  // before(function(done) {
  //   var promiseArray = [];
  //   promiseArray.push(teams.createTeam(testChildTeam2, userSession2));
  //   Promise.all(promiseArray)
  //     .then(function(result) {
  //       newChildTeamId2 = result._id;
  //       console.log('testChildTeam2 RETURN TRUE FOR CHILD USER ACCESS result:',result);
  //       done();
  //     })
  //     .catch(function(err){
  //       console.log('testChildTeam2 RETURN TRUE FOR CHILD USER ACCESS err:',err);
  //       done();
  //     });
  // });

  it('return true if the user has access', function(done) {
    users.isUserAllowed(testUser.userId, newParentTeamId)
      .then(function(result) {
        expect(result).to.equal(true);
        done();
      });
  });
  it('return true if the user has access to child team', function(done) {
    users.isUserAllowed(testUser.userId, newChildTeamId)
      .then(function(result) {
        expect(result).to.equal(true);
        done();
      });
  });
  it('return false if the user has no access', function(done) {
    users.isUserAllowed(testUser.userId, '581b72897bc85c73d8254a48')
      .then(function(result) {
        expect(result).to.equal(false);
        done();
      });
  });
  it('return true for admin user access', function(done) {
    users.isUserAllowed(testAdminUser.userId, newParentTeamId)
      .then(function(result) {
        expect(result).to.equal(true);
        done();
      });
  });
  it('return true for admin user access to child team', function(done) {
    users.isUserAllowed(testAdminUser.userId, newChildTeamId)
      .then(function(result) {
        expect(result).to.equal(true);
        done();
      });
  });
  it('return true for admin user access', function(done) {
    users.isUserAllowed(testAdminUser.userId, '581b72897bc85c73d8254a48')
      .then(function(result) {
        expect(result).to.equal(true);
        done();
      });
  });
  // it('return true for child user access', function(done) {
  //   users.isUserAllowed(testChildUser2.userId, newChildTeamId2)
  //     .then(function(result) {
  //       if (testChildUser2.userId === 'CHILD111') {
  //         console.log('TESTING_isUserAllowed RETURN TRUE FOR CHILD USER ACCESS');
  //         console.log('TESTING_isUserAllowed testChildUser.userId:',testChildUser2.userId);
  //         console.log('TESTING_isUserAllowed testChildTeam2:',JSON.stringify(testChildTeam2));
  //         console.log('TESTING_isUserAllowed result:',result);
  //       }
  //       expect(result).to.equal(true);
  //       done();
  //     });
  // });
  it('return true for child user access', function(done) {
    users.isUserAllowed(testChildUser.userId, newChildTeamId)
      .then(function(result) {
        if (testChildUser.userId === 'CHILD1234567') {
          console.log('TESTING_isUserAllowed RETURN TRUE FOR CHILD USER ACCESS');
          console.log('TESTING_isUserAllowed testChildUser.userId:',testChildUser.userId);
          console.log('TESTING_isUserAllowed testChildTeam:',JSON.stringify(testChildTeam));
          console.log('TESTING_isUserAllowed result:',result);
        }
        expect(result).to.equal(true);
        done();
      });
  });
  it('return false for child user access to parent team', function(done) {
    users.isUserAllowed(testChildUser.userId, newParentTeamId)
      .then(function(result) {
        expect(result).to.equal(false);
        done();
      });
  });
});

describe('Users model [update]', function() {
  it('return fail for updateing a user without userId', function(done){
    users.updateUser({})
      .catch(function(err) {
        expect(err).to.be.a('object');
        done();
      });
  });
  it('return successful for updateing a user', function(done){
    users.updateUser(testUser)
      .then(function(result) {
        expect(result).to.be.a('object');
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
    console.log('AFTER testUser.userId:', testUser.userId);
    console.log('AFTER testAdminUser.userId:', testAdminUser.userId);
    console.log('AFTER testChildUser.userId:', testChildUser.userId);
    console.log('AFTER testParentTeam.name:', testParentTeam.name);
    console.log('AFTER testChildTeam.name:', testChildTeam.name);
    promiseArray.push(users.deleteUser(testUser.userId));
    promiseArray.push(users.deleteUser(testAdminUser.userId));
    promiseArray.push(users.deleteUser(testChildUser.userId));
    promiseArray.push(teams.deleteTeamByName(testParentTeam.name));
    promiseArray.push(teams.deleteTeamByName(testChildTeam.name));
    Promise.all(promiseArray)
      .then(function(results){
        done();
      })
      .catch(function(err){
        done();
      });
  });
});
