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
var childTeamId = Schema.Types.ObjectId;

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

describe('Team model [createTeam]', function() {
  before(function(done){
    var promiseArray = [];
    promiseArray.push(Users.deleteUser(testUser.userId));
    promiseArray.push(Users.deleteUser(inValidUser.userId));
    promiseArray.push(Teams.deleteTeamByName('mongodb-test-team-01'));
    promiseArray.push(Teams.deleteTeamByName('mongodb-test-team-parent'));
    promiseArray.push(Teams.deleteTeamByName('mongodb-test-team-child'));
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
    Teams.createTeam(inValidTeam)
      .catch(function(err){
        expect(err).to.be.a('object');
        expect(err.error).to.equal('Team name is required.');
        done();
      });
  });
  it('return successful for adding a team', function(done){
    Teams.createTeam(testTeam)
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
    Teams.createTeam(testTeam)
      .catch(function(err){
        expect(err).to.be.a('object');
        done();
      });
  });
  it('return successful for adding a parent team', function(done){
    Teams.createTeam(testTeamParent)
      .then(function(result){
        expect(result).to.be.a('object');
        expect(result.name).to.equal(testTeamParent.name);
        expect(result).to.have.property('_id');
        parentTeamId = result._id;
        done();
      });
  });
  it('return successful for adding a child team', function(done){
    Teams.createTeam(testTeamChild)
      .then(function(result){
        expect(result).to.be.a('object');
        expect(result.name).to.equal(testTeamChild.name);
        expect(result).to.have.property('_id');
        childTeamId = result._id;
        done();
      });
  });
});

describe('Team model [associateTeams]', function() {
  it('return successful for associating teams', function(done){
    Teams.associateTeams(parentTeamId, childTeamId, testUser.userId)
      .then(function(result){
        console.log(result);
        done();
      })
      .catch(function(err){
        console.log(err);
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
