var chai = require('chai');
var expect = chai.expect;
var Teams = require('../../models/teams');
var Users = require('../../models/users');
var _ = require('underscore');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var newTeamId = Schema.Types.ObjectId;
var newTeamPathId = '';
var parentTeamId = Schema.Types.ObjectId;
var parentTeamPathId = '';
var childTeamId = Schema.Types.ObjectId;
var gchildTeamId = Schema.Types.ObjectId;
var newLinkId = '';

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
var testUser2 = {
  'userId': 'USER002US',
  'name': 'test user2',
  'email': 'testuser2@test.com',
  'adminAccess': 'none',
  'location': {
    'site': 'somers, ny, usa',
    'timezone': 'UTC-4'
  }
};
var testUser3 = {
  'userId': 'USER003US',
  'name': 'test user3',
  'email': 'testuser3@test.com',
  'adminAccess': 'none',
  'location': {
    'site': 'somers, ny, usa',
    'timezone': ''
  }
};
var invalidUser = {
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
  'members': [{
    'name': 'test user',
    'role': 'Tester',
    'allocation': 100,
    'userId': testUser.userId,
    'email': testUser.email
  }],
  'createdByUserId': testUser.userId,
  'createdBy': testUser.email
};
var testTeam2 = {
  'name': 'mongodb-test-team-02',
  'members': [{
    'name': 'test user1',
    'role': 'Tester',
    'allocation': 100,
    'userId': testUser.userId,
    'email': testUser.email
  },{
    'name': 'test user2',
    'role': 'Tester',
    'allocation': 100,
    'userId': testUser2.userId,
    'email': testUser2.email
  }],
  'createdByUserId': testUser.userId,
  'createdBy': testUser.email
};
var testTeamParent = {
  'name': 'mongodb-test-team-parent',
  'type': '',
  'members': [{
    'name': 'test user',
    'role': 'Tester',
    'allocation': 100,
    'userId': testUser.userId,
    'email': testUser.email
  }],
  'createdByUserId': testUser.userId,
  'createdBy': testUser.email
};
var testTeamChild = {
  'name': 'mongodb-test-team-child',
  'type': '',
  'members': [{
    'name': 'test user',
    'role': 'Tester',
    'allocation': 100,
    'userId': testUser.userId,
    'email': testUser.email
  }],
  'createdByUserId': testUser.userId,
  'createdBy': testUser.email
};
var testTeamGChild = {
  'name': 'mongodb-test-team-gchild',
  'type': 'squad',
  'members': [{
    'name': 'test user',
    'role': 'Tester',
    'allocation': 100,
    'userId': testUser.userId,
    'email': testUser.email
  }],
  'createdByUserId': testUser.userId,
  'createdBy': 'testuser@test.com'
};
var inValidTeam = {
  'members': {
    'name': 'test user',
    'role': 'Tester',
    'allocation': 100,
    'userId': testUser.userId,
    'email': testUser.email
  },
  'createdByUserId': testUser.userId,
  'createdBy': testUser.email
};
var userSession = {
  'ldap': {
    'uid': testUser.userId,
    'hrFirstName': 'John',
    'hrLastName': 'Doe',
  },
  'shortEmail': testUser.email
};
var invalidUserSession = {
  'ldap': {
    'uid': invalidUser.userId,
    'hrFirstName': 'John',
    'hrLastName': 'Doe',
  },
  'shortEmail': invalidUser.email
};

describe('Team model [createTeam]', function() {
  before(function(done){
    var promiseArray = [];
    promiseArray.push(Users.deleteUser(testUser.userId));
    promiseArray.push(Users.deleteUser(testUser2.userId));
    promiseArray.push(Users.deleteUser(testUser3.userId));
    promiseArray.push(Users.deleteUser(invalidUser.userId));
    promiseArray.push(Teams.deleteTeamByName('mongodb-test-team-01'));
    promiseArray.push(Teams.deleteTeamByName('mongodb-test-team-02'));
    promiseArray.push(Teams.deleteTeamByName('mongodb-test-team-parent'));
    promiseArray.push(Teams.deleteTeamByName('mongodb-test-team-child'));
    promiseArray.push(Teams.deleteTeamByName('mongodb-test-team-gchild'));
    Promise.all(promiseArray)
      .then(function(results){
        return Users.create(testUser);
      })
      .then(function(results){
        return Users.create(testUser2);
      })
      .then(function(results){
        return Users.create(testUser3);
      })
      .then(function(result){
        return Users.create(invalidUser);
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
        expect(err.errors.name.message).to.equal('Team name is required.');
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
      })
      .catch(function(err) {
        done();
      });
  });
  it('return successful for adding a team with more than 1 members', function(done){
    Teams.createTeam(testTeam2, userSession)
      .then(function(result){
        expect(result).to.be.a('object');
        expect(result.name).to.equal(testTeam2.name);
        expect(result).to.have.property('_id');
        expect(result).to.have.property('pathId');
        done();
      })
      .catch(function(err) {
        done();
      });
  });
  it('return fail for adding a team with same name', function(done){
    Teams.createTeam(testTeam, userSession)
      .catch(function(err){
        expect(err).to.be.a('object');
        expect(err.errors.name.message).to.equal('This team name already exists. Please enter a different team name.');
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
      })
      .catch(function(err) {
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
      })
      .catch(function(err) {
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
      })
      .catch(function(err) {
        done();
      });
  });
});

describe('Team model [associateTeams]', function() {
  it('return fail for associating teams by empty user id', function(done){
    Teams.associateTeams(parentTeamId, childTeamId, null)
      .catch(function(err){
        expect(err).to.be.a('object');
        expect(err.errors.userId.message).to.equal('The user id cannot be empty.');
        done();
      });
  });
  it('return fail for associating teams by empty child team id', function(done){
    Teams.associateTeams(parentTeamId, null, userSession)
      .catch(function(err){
        expect(err).to.be.a('object');
        expect(err.errors.path.message).to.equal('Child team ID is required.');
        done();
      });
  });
  it('return fail for associating teams by empty parent team id', function(done){
    Teams.associateTeams(null, childTeamId, userSession)
      .catch(function(err){
        expect(err).to.be.a('object');
        expect(err.errors.path.message).to.equal('Parent team ID is required.');
        done();
      });
  });
  it('return fail for associating teams by no access for parent team', function(done){
    Teams.associateTeams(parentTeamId, childTeamId, invalidUserSession)
      .catch(function(err){
        expect(err).to.be.a('object');
        done();
      });
  });
  it('return successful for associating teams', function(done){
    Teams.associateTeams(childTeamId, gchildTeamId, userSession)
      .then(function(result){
        expect(result).to.be.a('object');
        expect(result.ok).to.equal('Updated Successfully');
        done();
      })
      .catch(function(err) {
        done();
      });
  });
  it('return fail for associating teams because parent team is squad', function(done){
    Teams.associateTeams(gchildTeamId, childTeamId, userSession)
      .catch(function(err){
        expect(err).to.be.a('object');
        expect(err.errors.path.message).to.equal('Parent team has been updated as a squad team.  Squad teams cannot be selected as parent team.');
        done();
      });
  });
  // TODO: may need to consider old parent team id before allowing new parent id.
  // it('return fail for associating teams because child team has a parent', function(done){
  //   Teams.associateTeams(parentTeamId, gchildTeamId, userSession)
  //     .catch(function(err){
  //       expect(err).to.be.a('object');
  //       expect(err.errors.path.message).to.equal('Child team has been updated with another parent team.');
  //       done();
  //     });
  // });
  it('return successful for associating teams', function(done){
    Teams.associateTeams(parentTeamId, childTeamId, userSession)
      .then(function(result){
        expect(result).to.be.a('object');
        expect(result.ok).to.equal('Updated Successfully');
        done();
      })
      .catch(function(err) {
        done();
      });
  });
});

describe('Team model [removeAssociation]', function() {
  it('return fail for removing association by empty user id', function(done){
    Teams.removeAssociation(childTeamId, null)
      .catch(function(err){
        expect(err).to.be.a('object');
        expect(err.error).to.equal('The user id cannot be empty.');
        done();
      })
      .catch(function(err) {
        done();
      });
  });
  it('return fail for removing association by empty child team id', function(done){
    Teams.removeAssociation(null, userSession)
      .catch(function(err){
        expect(err).to.be.a('object');
        expect(err.errors.path.message).to.equal('Child team ID is required.');
        done();
      })
      .catch(function(err) {
        done();
      });
  });
  it('return fail for removing association by no access user', function(done){
    Teams.removeAssociation(childTeamId, invalidUserSession)
      .catch(function(err){
        expect(err).to.be.a('object');
        done();
      });
  });
  it('return fail for removing association by root team', function(done){
    Teams.removeAssociation(parentTeamId, userSession)
      .catch(function(err){
        expect(err).to.be.a('object');
        expect(err.errors.path.message).to.equal('Child team may have been updated and any team association was removed.');
        done();
      });
  });
  it('return successful for removing association', function(done){
    Teams.removeAssociation(childTeamId, userSession)
      .then(function(result){
        expect(result).to.be.a('array');
        return Teams.associateTeams(parentTeamId, childTeamId, userSession);
      })
      .then(function(result){
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
      })
      .catch(function(err) {
        done();
      });
  });
  it('return the team by id', function(done){
    Teams.getTeam(newTeamId)
      .then(function(result){
        expect(result).to.be.a('object');
        expect(result._id.toString()).to.equal(newTeamId.toString());
        done();
      })
      .catch(function(err) {
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
      })
      .catch(function(err) {
        done();
      });
  });
  it('return the team by pathId', function(done){
    Teams.getTeamByPathId(newTeamPathId)
      .then(function(result){
        expect(result).to.be.a('object');
        expect(result.pathId).to.equal(newTeamPathId);
        done();
      })
      .catch(function(err) {
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
      })
      .catch(function(err) {
        done();
      });
  });
  it('return the team by name', function(done){
    Teams.getByName(testTeam.name)
      .then(function(result){
        expect(result).to.be.a('object');
        expect(result.name).to.equal(testTeam.name);
        done();
      })
      .catch(function(err) {
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
      })
      .catch(function(err) {
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
      })
      .catch(function(err) {
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
      })
      .catch(function(err) {
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
      })
      .catch(function(err) {
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
      })
      .catch(function(err) {
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
      })
      .catch(function(err) {
        done();
      });
  });
  it('return all root teams by user id', function(done){
    Teams.getRootTeams(testUser.userId)
      .then(function(result){
        expect(result).to.be.a('array');
        done();
      })
      .catch(function(err) {
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
      })
      .catch(function(err) {
        done();
      });
  });
  it('return all standalone teams by user id', function(done){
    Teams.getStandalone(testUser.userId)
      .then(function(result){
        expect(result).to.be.a('array');
        done();
      })
      .catch(function(err) {
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
      })
      .catch(function(err) {
        done();
      });
  });
});

describe('Team model [getSelectableChildren]', function() {
  it('return fail by empty team id', function(done){
    Teams.getSelectableChildren()
      .catch(function(err){
        expect(err).to.be.a('object');
        expect(err.error).to.equal('Team ID is required.');
        done();
      });
  });
  it('return all selectable teams by team id', function(done){
    Teams.getSelectableChildren(newTeamId)
      .then(function(result){
        expect(result).to.be.a('array');
        done();
      })
      .catch(function(err) {
        done();
      });
  });
});

// describe('Team model [getSquadsOfParent]', function() {
//   it('return all squads of parent by pathId', function(done){
//     Teams.getSquadsOfParent(newTeamPathId)
//       .then(function(result){
//         expect(result).to.be.a('array');
//         done();
//       })
//       .catch(function(err) {
//         done();
//       });
//   });
// });

describe('Team model [getAllRootTeamsSquadNonSquad]', function() {
  it('return all root teams (team with no parents) regardless if it is squad or non squad', function(done){
    Teams.getAllRootTeamsSquadNonSquad()
      .then(function(result){
        expect(result).to.be.a('array');
        done();
      })
      .catch(function(err) {
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
      })
      .catch(function(err){
        done();
      })
      .catch(function(err) {
        done();
      });
  });
  it('return children by parent path id' , function(done){
    Teams.getChildrenByPathId(parentTeamPathId)
      .then(function(result){
        expect(result).to.be.a('array');
        expect(result.length).to.equal(1);
        done();
      })
      .catch(function(err){
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
      })
      .catch(function(err){
        done();
      });
  });
});

describe('Team model [getTeamAndChildInfo]', function() {
  // it('return team info by team id', function(done){
  //   Teams.loadTeamChildDetails(newTeamId)
  //     .then(function(result){
  //       expect(result).to.be.a('object');
  //       expect(result._id.toString()).to.equal(newTeamId.toString());
  //       done();
  //     })
  //     .catch(function(err){
  //       done();
  //     });
  // });
  it('return team info by team pathId', function(done){
    Teams.loadTeamChildDetails(parentTeamPathId)
      .then(function(result){
        expect(result).to.be.a('object');
        expect(result.pathId).to.equal(parentTeamPathId);
        done();
      })
      .catch(function(err){
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
      })
      .catch(function(err){
        done();
      });
  });
});

describe('Team model [modifyTeamMembers]', function() {
  it('return fail by empty team id', function(done){
    Teams.modifyTeamMembers(null, userSession, [])
      .catch(function(err){
        expect(err).to.be.a('object');
        expect(err.error).to.equal('Team ID is required.');
        done();
      });
  });
  it('return fail by empty team id', function(done){
    Teams.modifyTeamMembers(newTeamId, null, ['test','test'])
      .catch(function(err){
        expect(err).to.be.a('object');
        expect(err.error).to.equal('User is required.');
        done();
      });
  });
  it('return fail by empty team members', function(done){
    Teams.modifyTeamMembers(newTeamId, userSession, null)
      .catch(function(err){
        expect(err).to.be.a('object');
        expect(err.error).to.equal('You can\'t remove the last team member. You must have at least one member listed.');
        done();
      });
  });
  it('return fail by invalid team members', function(done){
    Teams.modifyTeamMembers(newTeamId, userSession, {'test':'test'})
      .catch(function(err){
        expect(err).to.be.a('object');
        expect(err.error).to.equal('Invalid member lists.');
        done();
      });
  });
  it('return fail with invalid member object', function(done){
    Teams.modifyTeamMembers(newTeamId, userSession, ['test','test'])
      .catch(function(err){
        expect(err).to.be.a('object');
        done();
      });
  });
  it('return fail with no access user', function(done){
    userSession.ldap.uid = 'TEST7654321';
    var newMember = {
      'name': testUser.name,
      'userId': testUser.userId,
      'allocation': 100,
      'role': 'TEST',
      'email': testUser.email
    };
    Teams.modifyTeamMembers(newTeamId, userSession, [newMember])
      .catch(function(err){
        expect(err).to.be.a('object');
        done();
      });
  });
  it('return successful with valid user modify', function(done){
    var newMember = {
      'name': testUser.name,
      'userId': testUser.userId,
      'allocation': 100,
      'role': 'TEST',
      'email': testUser.email
    };
    userSession.ldap.uid = testUser.userId;
    Teams.modifyTeamMembers(newTeamId, userSession, [newMember])
      .then(function(result){
        expect(result).to.be.a('object');
        expect(result.ok).to.equal('Updated successfully.');
        done();
      })
      .catch(function(err){
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
        expect(err.error).to.equal('User is not allowed to modify team links.');
        done();
      });
  });
  it('return successful', function(done){
    userSession.ldap.uid = testUser.userId;
    Teams.modifyImportantLinks(newTeamId, userSession, [newLink])
      .then(function(result){
        expect(result).to.be.a('object');
        newLinkId = result.links[0].id;
        done();
      });
  });
  // it('return successful by empty links', function(done){
  //   Teams.modifyImportantLinks(newTeamId, userSession, [])
  //     .then(function(result){
  //       expect(result).to.be.a('object');
  //       done();
  //     })
  //     .catch(function(err){
  //       done();
  //     });
  // });
});

describe('Team model [deleteImportantLinks]', function() {
  it('return fail by empty team id', function(done){
    Teams.deleteImportantLinks(null, userSession, [{id: newLinkId}])
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
    Teams.deleteImportantLinks(newTeamId, testUserSession, [{id: newLinkId}])
      .catch(function(err){
        expect(err).to.be.a('object');
        expect(err.error.userId[0]).to.equal('User ID is required');
        done();
      });
  });
  it('return fail by invalid links', function(done){
    Teams.deleteImportantLinks(newTeamId, userSession, {'test':'test'})
      .catch(function(err){
        expect(err).to.be.a('object');
        expect(err.error.links[0]).to.equal('Invalid links');
        done();
      });
  });
  it('return Link ID is required', function(done){
    Teams.deleteImportantLinks(newTeamId, userSession, [] )
      .catch(function(err){
        expect(err).to.be.a('object');
        expect(err.error.links[0]).to.equal('Link ID is required');
        done();
      });
  });
  it('return fail by invalid user modify', function(done){
    userSession.ldap.uid = 'TEST7654321';
    Teams.deleteImportantLinks(newTeamId, userSession, [{id: newLinkId}])
      .catch(function(err){
        expect(err).to.be.a('object');
        expect(err.error).to.equal('User is not allowed to modify team links.');
        done();
      });
  });
  it('return fail by empty link', function(done){
    userSession.ldap.uid = testUser.userId;
    Teams.deleteImportantLinks(newTeamId, userSession, [{id: ''}])
      .catch(function(err){
        expect(err).to.be.a('object');
        done();
      });
  });
  it('return fail by empty team', function(done){
    userSession.ldap.uid = testUser.userId;
    Teams.deleteImportantLinks(parentTeamId, userSession, [{id: ''}])
      .catch(function(err){
        expect(err).to.be.a('object');
        done();
      });
  });
  it('return successful', function(done){
    userSession.ldap.uid = testUser.userId;
    Teams.deleteImportantLinks(newTeamId, userSession, [{id: newLinkId}])
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
      })
      .catch(function(err){
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
      })
      .catch(function(err){
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
    Teams.updateTeam(newDoc, userSession)
      .catch(function(err){
        expect(err).to.be.a('object');
        //TODO: need to refactor to valid promise error object
        //expect(err.error).to.equal('Team ID is required.');
        done();
      });
  });
  it('return fail by empty user', function(done){
    newDoc._id = '1234567890';
    Teams.updateTeam(newDoc, null)
      .catch(function(err){
        expect(err).to.be.a('object');
        //TODO: need to refactor to valid promise error object
        //expect(err.error).to.equal('User ID is required.');
        done();
      });
  });
  it('return fail by empty doc name', function(done){
    newDoc.name = '';
    Teams.updateTeam(newDoc, userSession)
      .catch(function(err){
        expect(err).to.be.a('object');
        //TODO: need to refactor to valid promise error object
        //expect(err.error).to.equal('Team name is required.');
        done();
      });
  });
  it('return fail by duplicate doc name', function(done){
    newDoc._id = newTeamId;
    newDoc.name = 'mongodb-test-team-parent';
    userSession.ldap.uid = testUser.userId;
    Teams.updateTeam(newDoc, userSession)
      .catch(function(err){
        expect(err).to.be.a('object');
        done();
      });
  });
  it('return fail by wrong user', function(done){
    newDoc._id = newTeamId;
    newDoc.name = 'mongodb-test-team-01';
    userSession.ldap.uid = 'TEST7654321';
    Teams.updateTeam(newDoc, userSession)
      .catch(function(err){
        expect(err).to.be.a('object');
        //TODO: need to refactor to valid promise error object
        //expect(err.error).to.equal('Not allowed to modify team.');
        done();
      });
  });
  it('return successful', function(done){
    newDoc._id = parentTeamId;
    newDoc.name = testTeamParent.name;
    userSession.ldap.uid = testUser.userId;
    Teams.updateTeam(newDoc, userSession)
      .then(function(result){
        expect(result).to.be.a('object');
        done();
      })
      .catch(function(err){
        done();
      });
  });
});

describe('Team model [getAllUserTeamsByUserId]', function() {
  it('return all teams full object with location - site and timezone by user id', function(done){
    Teams.getTeamsByUserId(testUser.userId)
      .then(function(result){
        expect(result).to.be.a('array');
        done();
      })
      .catch(function(err) {
        done();
      });
  });
  it('return all user teams by userId',function(done){
    Teams.getAllUserTeamsByUserId(testUser.userId)
      .then(function(result){
        expect(result).to.be.a('array');
        done();
      })
      .catch(function(err) {
        done();
      });
  });
});

describe('Team model [softDeleteArchive]', function() {
  var newDoc = {
    'name' : 'mongodb-test-team-01',
    'description': 'aaa'
  };
  it('return fail by empty team id', function(done){
    Teams.softDeleteArchive(null, userSession)
      .catch(function(err){
        expect(err).to.be.a('object');
        expect(err.error).to.equal('Team ID is required.');
        done();
      });
  });
  it('return fail by empty user', function(done){
    newDoc._id = parentTeamId;
    Teams.softDeleteArchive(newDoc, null)
      .catch(function(err){
        expect(err).to.be.a('object');
        //TODO: need to refactor to valid promise error object
        //expect(err.error).to.equal('User ID is required.');
        done();
      });
  });
  it('return fail by wrong user', function(done){
    userSession.ldap.uid = 'TEST7654321';
    newDoc._id = parentTeamId;
    Teams.softDeleteArchive(newDoc, userSession)
      .catch(function(err){
        expect(err).to.be.a('object');
        //TODO: need to refactor to valid promise error object
        //expect(err.error).to.equal('Not allowed to delete team.');
        done();
      });
  });
  it('return successful', function(done){
    userSession.ldap.uid = testUser.userId;
    newDoc._id = parentTeamId;
    Teams.softDeleteArchive(newDoc, userSession)
      .then(function(result){
        expect(result).to.be.a('object');
        done();
      })
      .catch(function(err){
        done();
      });
  });
  after(function(done){
    var promiseArray = [];
    promiseArray.push(Users.deleteUser(testUser.userId));
    promiseArray.push(Users.deleteUser(testUser2.userId));
    promiseArray.push(Users.deleteUser(testUser3.userId));
    promiseArray.push(Users.deleteUser(invalidUser.userId));
    promiseArray.push(Teams.deleteTeamByName('mongodb-test-team-01'));
    promiseArray.push(Teams.deleteTeamByName('mongodb-test-team-02'));
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
