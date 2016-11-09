var chai = require('chai');
var expect = chai.expect;
var Teams = require('../../../models/mongodb/teams');
var Users = require('../../../models/mongodb/users');
var _ = require('underscore');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var newTeamId = Schema.Types.ObjectId;
var newTeamPathId = '';
var parentTeamId = Schema.Types.ObjectId;
var parentTeamPathId = '';
var childTeamId = Schema.Types.ObjectId;
var gchildTeamId = Schema.Types.ObjectId;

var testUser = {
  'userId': 'TEST1234567',
  'name': 'test user',
  'email': 'testuser@test.com',
  'adminAccess': 'none',
  'location': {
    'site': 'somers, ny, usa',
    'timezone': 'UTC-4'
  }
};
var inValidUser = {
  'userId': 'TEST7654321',
  'name': 'test user2',
  'email': 'testuser2@test.com',
  'adminAccess': 'none',
  'location': {
    'site': 'somers, ny, usa',
    'timezone': 'UTC-4'
  }
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
var testTeamParent = {
  'name': 'mongodb-test-team-parent',
  'type': '',
  'members': {
    'name': 'test user',
    'userId': 'TEST1234567',
    'email': 'testuser@test.com'
  },
  'createdByUserId': 'TEST1234567',
  'createdBy': 'testuser@test.com'
};
var testTeamChild = {
  'name': 'mongodb-test-team-child',
  'type': '',
  'members': {
    'name': 'test user',
    'userId': 'TEST1234567',
    'email': 'testuser@test.com'
  },
  'createdByUserId': 'TEST1234567',
  'createdBy': 'testuser@test.com'
};
var testTeamGChild = {
  'name': 'mongodb-test-team-gchild',
  'type': 'squad',
  'members': {
    'name': 'test user',
    'userId': 'TEST1234567',
    'email': 'testuser@test.com'
  },
  'createdByUserId': 'TEST1234567',
  'createdBy': 'testuser@test.com'
};
var inValidTeam = {
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

describe('Team model [createTeam]', function() {
  before(function(done){
    var promiseArray = [];
    promiseArray.push(Users.deleteUser(testUser.userId));
    promiseArray.push(Users.deleteUser(inValidUser.userId));
    promiseArray.push(Teams.deleteTeamByName('mongodb-test-team-01'));
    promiseArray.push(Teams.deleteTeamByName('mongodb-test-team-parent'));
    promiseArray.push(Teams.deleteTeamByName('mongodb-test-team-child'));
    promiseArray.push(Teams.deleteTeamByName('mongodb-test-team-gchild'));
    Promise.all(promiseArray)
      .then(function(results){
        return Users.create(testUser);
      })
      .then(function(result){
        return Users.create(inValidUser);
      })
      .then(function(result){
        done();
      })
      .catch(function(err){
        done();
      });
  });
  it('return fail for adding a team without team name', function(done){
    Teams.createTeam(inValidTeam, userSession)
      .catch(function(err){
        expect(err).to.be.a('object');
        expect(err.error).to.equal('Team name is required.');
        done();
      });
  });
  it('return successful for adding a team', function(done){
    Teams.createTeam(testTeam, userSession)
      .then(function(result){
        expect(result).to.be.a('object');
        expect(result.name).to.equal(testTeam.name);
        expect(result).to.have.property('_id');
        newTeamId = result._id;
        expect(result).to.have.property('pathId');
        newTeamPathId = result.pathId;
        done();
      });
  });
  it('return fail for adding a team with same name', function(done){
    Teams.createTeam(testTeam, userSession)
      .catch(function(err){
        expect(err).to.be.a('object');
        done();
      });
  });
  it('return successful for adding a parent team', function(done){
    Teams.createTeam(testTeamParent, userSession)
      .then(function(result){
        expect(result).to.be.a('object');
        expect(result.name).to.equal(testTeamParent.name);
        expect(result).to.have.property('_id');
        parentTeamId = result._id;
        expect(result).to.have.property('pathId');
        parentTeamPathId = result.pathId;
        done();
      });
  });
  it('return successful for adding a child team', function(done){
    Teams.createTeam(testTeamChild, userSession)
      .then(function(result){
        expect(result).to.be.a('object');
        expect(result.name).to.equal(testTeamChild.name);
        expect(result).to.have.property('_id');
        childTeamId = result._id;
        done();
      });
  });
  it('return successful for adding a child team', function(done){
    Teams.createTeam(testTeamGChild, userSession)
      .then(function(result){
        expect(result).to.be.a('object');
        expect(result.name).to.equal(testTeamGChild.name);
        expect(result).to.have.property('_id');
        gchildTeamId = result._id;
        done();
      });
  });
});

describe('Team model [associateTeams]', function() {
  it('return fail for associating teams by empty user id', function(done){
    Teams.associateTeams(parentTeamId, childTeamId, null)
      .catch(function(err){
        expect(err).to.be.a('object');
        expect(err.error).to.equal('The user id cannot be empty.');
        done();
      });
  });
  it('return fail for associating teams by empty child team id', function(done){
    Teams.associateTeams(parentTeamId, null, testUser.userId)
      .catch(function(err){
        expect(err).to.be.a('object');
        expect(err.error).to.equal('The child team id cannot be empty.');
        done();
      });
  });
  it('return fail for associating teams by empty parent team id', function(done){
    Teams.associateTeams(null, childTeamId, testUser.userId)
      .catch(function(err){
        expect(err).to.be.a('object');
        expect(err.error).to.equal('The parent team id cannot be empty.');
        done();
      });
  });
  it('return fail for associating teams by no access for parent team', function(done){
    Teams.associateTeams(parentTeamId, childTeamId, inValidUser.userId)
      .catch(function(err){
        expect(err).to.be.a('object');
        expect(err.error).to.equal('You dont have access to parent team.');
        done();
      });
  });
  it('return successful for associating teams', function(done){
    Teams.associateTeams(childTeamId, gchildTeamId, testUser.userId)
      .then(function(result){
        expect(result).to.be.a('object');
        expect(result.ok).to.equal('Updated Successfully');
        done();
      });
  });
  it('return fail for associating teams because parent team is squad', function(done){
    Teams.associateTeams(gchildTeamId, childTeamId, testUser.userId)
      .catch(function(err){
        expect(err).to.be.a('object');
        expect(err.error).to.equal('Parent team cannot be associated.');
        done();
      });
  });
  it('return successful for associating teams', function(done){
    Teams.associateTeams(parentTeamId, childTeamId, testUser.userId)
      .then(function(result){
        expect(result).to.be.a('object');
        expect(result.ok).to.equal('Updated Successfully');
        done();
      });
  });
});

describe('Team model [getTeam]', function() {
  it('return all teams by empty id', function(done){
    Teams.getTeam()
      .then(function(result){
        expect(result).to.be.a('array');
        done();
      });
  });
  it('return the team by id', function(done){
    Teams.getTeam(newTeamId)
      .then(function(result){
        expect(result).to.be.a('object');
        expect(result._id.toString()).to.equal(newTeamId.toString());
        done();
      });
  });
});

describe('Team model [getTeamByPathId]', function() {
  it('return all teams by empty pathId', function(done){
    Teams.getTeamByPathId()
      .then(function(result){
        expect(result).to.be.a('array');
        done();
      });
  });
  it('return the team by pathId', function(done){
    Teams.getTeamByPathId(newTeamPathId)
      .then(function(result){
        expect(result).to.be.a('object');
        expect(result.pathId).to.equal(newTeamPathId);
        done();
      });
  });
});

describe('Team model [getByName]', function() {
  it('return all teams by empty name', function(done){
    Teams.getByName()
      .then(function(result){
        expect(result).to.be.a('array');
        done();
      });
  });
  it('return the team by name', function(done){
    Teams.getByName(testTeam.name)
      .then(function(result){
        expect(result).to.be.a('object');
        expect(result.name).to.equal(testTeam.name);
        done();
      });
  });
});

describe('Team model [getTeamsByEmail]', function() {
  it('return all teams by user email', function(done){
    Teams.getTeamsByEmail(testUser.email)
      .then(function(result){
        expect(result).to.be.a('array');
        done();
      });
  });
});

describe('Team model [getTeamsByUserId]', function() {
  it('return all teams by user id', function(done){
    Teams.getTeamsByUserId(testUser.userId)
      .then(function(result){
        expect(result).to.be.a('array');
        done();
      });
  });
});

describe('Team model [searchTeamWithName]', function() {
  it('return all teams by matching team name substring', function(done){
    Teams.searchTeamWithName(testTeam.name)
      .then(function(result){
        expect(result).to.be.a('array');
        done();
      });
  });
});

describe('Team model [getNonSquadTeams]', function() {
  it('return all non squad teams', function(done){
    Teams.getNonSquadTeams()
      .then(function(result){
        expect(result).to.be.a('array');
        done();
      });
  });
});

describe('Team model [getSquadTeams]', function() {
  it('return all squad teams', function(done){
    Teams.getSquadTeams()
      .then(function(result){
        expect(result).to.be.a('array');
        done();
      });
  });
});

describe('Team model [getRootTeams]', function() {
  it('return all root teams', function(done){
    Teams.getRootTeams()
      .then(function(result){
        expect(result).to.be.a('array');
        done();
      });
  });
  it('return all root teams by user id', function(done){
    Teams.getRootTeams(testUser.userId)
      .then(function(result){
        expect(result).to.be.a('array');
        done();
      });
  });
});

describe('Team model [getStandalone]', function() {
  it('return all standalone teams', function(done){
    Teams.getStandalone()
      .then(function(result){
        expect(result).to.be.a('array');
        done();
      });
  });
  it('return all standalone teams by user id', function(done){
    Teams.getStandalone(testUser.userId)
      .then(function(result){
        expect(result).to.be.a('array');
        done();
      });
  });
});

describe('Team model [getSelectableParents]', function() {
  it('return fail by empty team id', function(done){
    Teams.getSelectableParents()
      .catch(function(err){
        expect(err).to.be.a('object');
        expect(err.error).to.equal('Id of team is required.');
        done();
      });
  });
  it('return fail by not exist team id', function(done){
    Teams.getSelectableParents('18209ac24f5a448108e5398c')
      .catch(function(err){
        expect(err).to.be.a('object');
        expect(err.error).to.equal('18209ac24f5a448108e5398c is not a team.');
        done();
      });
  });
  it('return all selectable teams by team id', function(done){
    Teams.getSelectableParents(newTeamId)
      .then(function(result){
        expect(result).to.be.a('array');
        done();
      });
  });
});

describe('Team model [getSelectableChildren]', function() {
  it('return fail by empty team id', function(done){
    Teams.getSelectableChildren()
      .catch(function(err){
        expect(err).to.be.a('object');
        expect(err.error).to.equal('Id of team is required.');
        done();
      });
  });
  it('return fail by not exist team id', function(done){
    Teams.getSelectableChildren('18209ac24f5a448108e5398c')
      .catch(function(err){
        expect(err).to.be.a('object');
        expect(err.error).to.equal('18209ac24f5a448108e5398c is not a team.');
        done();
      });
  });
  it('return all selectable teams by team id', function(done){
    Teams.getSelectableChildren(newTeamId)
      .then(function(result){
        expect(result).to.be.a('array');
        done();
      });
  });
});

describe('Team model [getSquadsOfParent]', function() {
  it('return all squads of parent by pathId', function(done){
    Teams.getSquadsOfParent(newTeamPathId)
      .then(function(result){
        expect(result).to.be.a('array');
        done();
      });
  });
});

describe('Team model [getChildrenByPathId]', function() {
  it('return empty by empty path id', function(done){
    Teams.getChildrenByPathId()
      .then(function(result){
        expect(result).to.be.a('array');
        expect(result.length).to.equal(0);
        done();
      });
  });
  it('return children by parent path id' , function(done){
    Teams.getChildrenByPathId(parentTeamPathId)
      .then(function(result){
        expect(result).to.be.a('array');
        expect(result.length).to.equal(1);
        done();
      });
  });
});

describe('Team model [getAllChildrenOnPath]', function() {
  it('return all children by path', function(done){
    Teams.getAllChildrenOnPath([parentTeamPathId])
      .then(function(result){
        expect(result).to.be.a('array');
        done();
      });
  });
});

describe('Team model [getTeamAndChildInfo]', function() {
  it('return team info by team id', function(done){
    Teams.loadTeamDetails(newTeamId)
      .then(function(result){
        expect(result).to.be.a('object');
        expect(result._id.toString()).to.equal(newTeamId.toString());
        done();
      });
  });
  it('return team info by team pathId', function(done){
    Teams.loadTeamDetails(parentTeamPathId)
      .then(function(result){
        expect(result).to.be.a('object');
        expect(result.pathId).to.equal(parentTeamPathId);
        done();
      });
  });
});

describe('Team model [getRole]', function() {
  it('return all roles', function(done){
    Teams.getRole()
      .then(function(result){
        expect(result).to.be.a('array');
        done();
      });
  });
});

describe('Team model [modifyTeamMembers]', function() {
  it('return fail by empty team id', function(done){
    Teams.modifyTeamMembers(null, userSession, [])
      .catch(function(err){
        expect(err).to.be.a('object');
        expect(err.error).to.equal('Team ID is required');
        done();
      });
  });
  it('return fail by empty team id', function(done){
    Teams.modifyTeamMembers(newTeamId, null, [])
      .catch(function(err){
        expect(err).to.be.a('object');
        expect(err.error).to.equal('User is required');
        done();
      });
  });
  it('return fail by empty team members', function(done){
    Teams.modifyTeamMembers(newTeamId, userSession, null)
      .catch(function(err){
        expect(err).to.be.a('object');
        expect(err.error).to.equal('Member lists is required');
        done();
      });
  });
  it('return fail by invalid team members', function(done){
    Teams.modifyTeamMembers(newTeamId, userSession, {'test':'test'})
      .catch(function(err){
        expect(err).to.be.a('object');
        expect(err.error).to.equal('Invalid member lists');
        done();
      });
  });
  it('return fail by invalid user modify', function(done){
    userSession.ldap.uid = 'TEST7654321';
    Teams.modifyTeamMembers(newTeamId, userSession, ['test','test'])
      .catch(function(err){
        expect(err).to.be.a('object');
        expect(err.error).to.equal('Not allowed to modify team members');
        done();
      });
  });
  it('return fail by invalid user modify', function(done){
    var newMember = {
      'name': testUser.name,
      'userId': testUser.userId,
      'allocation': 100,
      'email': testUser.email
    };
    userSession.ldap.uid = 'TEST1234567';
    Teams.modifyTeamMembers(newTeamId, userSession, [newMember])
      .then(function(result){
        expect(result).to.be.a('object');
        expect(result.ok).to.equal('Updated successfully.');
        done();
      });
  });
});

describe('Team model [modifyImportantLinks]', function() {
  var newLink = {
    'linkLabel': 'Wall of work',
    'linkUrl': 'https://trello.com/b/yITPQoST/jellyfish-iteration-agile-team-tool'
  };
  it('return fail by empty team id', function(done){
    Teams.modifyImportantLinks(null, userSession, [newLink])
      .catch(function(err){
        expect(err).to.be.a('object');
        expect(err.error.teamId[0]).to.equal('Team ID is required');
        done();
      });
  });
  it('return fail by empty user', function(done){
    var testUserSession = {
      'ldap': {
        'uid': ''
      },
      'shortEmail': ''
    };
    Teams.modifyImportantLinks(newTeamId, testUserSession, [newLink])
      .catch(function(err){
        expect(err).to.be.a('object');
        expect(err.error.userId[0]).to.equal('User ID is required');
        done();
      });
  });
  it('return fail by invalid links', function(done){
    Teams.modifyImportantLinks(newTeamId, userSession, {'test':'test'})
      .catch(function(err){
        expect(err).to.be.a('object');
        expect(err.error.links[0]).to.equal('Invalid links');
        done();
      });
  });
  it('return fail by invalid user modify', function(done){
    userSession.ldap.uid = 'TEST7654321';
    Teams.modifyImportantLinks(newTeamId, userSession, [newLink])
      .catch(function(err){
        expect(err).to.be.a('object');
        expect(err.error).to.equal('Not allowed to modify team links');
        done();
      });
  });
  it('return successful', function(done){
    userSession.ldap.uid = 'TEST1234567';
    Teams.modifyImportantLinks(newTeamId, userSession, [newLink])
      .then(function(result){
        expect(result).to.be.a('object');
        done();
      });
  });
  it('return successful by empty links', function(done){
    Teams.modifyImportantLinks(newTeamId, userSession, [])
      .then(function(result){
        expect(result).to.be.a('object');
        done();
      });
  });
});

describe('Team model [getTeamHierarchy]', function() {
  it('return empty by empty path', function(done){
    Teams.getTeamHierarchy()
      .then(function(result){
        expect(result).to.be.a('array');
        expect(result.length).to.equal(0);
        done();
      });
  });
  it('return Hierarchy by path', function(done){
    Teams.getTeam(gchildTeamId)
      .then(function(result){
        expect(result).to.be.a('object');
        expect(result).to.have.property('path');
        return Teams.getTeamHierarchy(result.path);
      })
      .then(function(result){
        expect(result).to.be.a('array');
        done();
      });
  });
});

describe('Team model [updateTeam]', function() {
  var newDoc = {
    'name' : 'mongodb-test-team-01',
    'description': 'aaa'
  };
  it('return fail by empty team id', function(done){
    Teams.updateTeam(null, userSession, newDoc)
      .catch(function(err){
        expect(err).to.be.a('object');
        expect(err.error).to.equal('Team ID is required.');
        done();
      });
  });
  it('return fail by empty user', function(done){
    Teams.updateTeam(newTeamId, null, newDoc)
      .catch(function(err){
        expect(err).to.be.a('object');
        expect(err.error).to.equal('User ID is required.');
        done();
      });
  });
  it('return fail by empty doc name', function(done){
    newDoc.name = '';
    Teams.updateTeam(newTeamId, userSession, newDoc)
      .catch(function(err){
        expect(err).to.be.a('object');
        expect(err.error).to.equal('Team name is required.');
        done();
      });
  });
  it('return fail by duplicate doc name', function(done){
    newDoc.name = 'mongodb-test-team-parent';
    Teams.updateTeam(newTeamId, userSession, newDoc)
      .catch(function(err){
        expect(err).to.be.a('object');
        done();
      });
  });
  it('return fail by wrong user', function(done){
    newDoc.name = 'mongodb-test-team-01';
    userSession.ldap.uid = 'TEST7654321';
    Teams.updateTeam(newTeamId, userSession, newDoc)
      .catch(function(err){
        expect(err).to.be.a('object');
        expect(err.error).to.equal('Not allowed to modify team.');
        done();
      });
  });
  it('return successful', function(done){
    userSession.ldap.uid = 'TEST1234567';
    Teams.updateTeam(newTeamId, userSession, newDoc)
      .then(function(result){
        expect(result).to.be.a('object');
        done();
      });
  });
});

describe('Team model [softDelete]', function() {
  it('return fail by empty team id', function(done){
    Teams.softDelete(null, userSession)
      .catch(function(err){
        expect(err).to.be.a('object');
        expect(err.error).to.equal('Team ID is required.');
        done();
      });
  });
  it('return fail by empty user', function(done){
    Teams.softDelete(parentTeamId, null)
      .catch(function(err){
        expect(err).to.be.a('object');
        expect(err.error).to.equal('User ID is required.');
        done();
      });
  });
  it('return fail by wrong user', function(done){
    userSession.ldap.uid = 'TEST7654321';
    Teams.softDelete(parentTeamId, userSession)
      .catch(function(err){
        expect(err).to.be.a('object');
        expect(err.error).to.equal('Not allowed to delete team.');
        done();
      });
  });
  it('return successful', function(done){
    userSession.ldap.uid = 'TEST1234567';
    Teams.softDelete(parentTeamId, userSession)
      .then(function(result){
        expect(result).to.be.a('object');
        done();
      });
  });
  after(function(done){
    var promiseArray = [];
    promiseArray.push(Users.deleteUser(testUser.userId));
    promiseArray.push(Users.deleteUser(inValidUser.userId));
    promiseArray.push(Teams.deleteTeamByName('mongodb-test-team-01'));
    promiseArray.push(Teams.deleteTeamByName('mongodb-test-team-parent'));
    promiseArray.push(Teams.deleteTeamByName('mongodb-test-team-child'));
    promiseArray.push(Teams.deleteTeamByName('mongodb-test-team-gchild'));
    Promise.all(promiseArray)
      .then(function(results){
        done();
      })
      .catch(function(err){
        done();
      });
  });
});
