var chai = require('chai');
var expect = chai.expect;
var teams = require('../../../models/mongodb/teams');
var _ = require('underscore');

describe('Team model [searchTeamWithName]', function() {
  it('return null for non existing team', function(done) {
    teams.searchTeamWithName('thisiddoesntexist iktKKTbAIGWQVAI')
      .then(function(result) {
        expect(result).to.be.null;
        done();
      });
  });
});
describe('Team model [getNonSquadTeams]', function() {
  it('returns an array of all non-squad teams', function(done) {
    teams.getNonSquadTeams({type:1})
      .then(function(result) {
        var squadTeam = _.find(result, function(team) {return team.type==='squad';});
        expect(squadTeam).to.be.undefined;
        done();
      });
  });
});

describe('Team model [getSquadTeams]', function() {
  it('returns an array of all squad teams', function(done) {
    teams.getSquadTeams({type:1})
      .then(function(result) {
        var nonSquadTeam = _.find(result, function(team) {return team.type!=='squad';});
        expect(nonSquadTeam).to.be.undefined;
        done();
      });
  });
});

describe('Team model [getRootTeams]', function() {
  it('returns an array of all root teams', function(done) {
    teams.getRootTeams()
      .then(function(result) {
        var nonRoot = _.find(result, function(team) {return !_.isEmpty(team.path);});
        expect(nonRoot).to.be.undefined;
        done();
      });
  });
});
