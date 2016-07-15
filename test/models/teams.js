var assert = require('assert');
var teamModel = require('../../models/teams');
var timeout = 30000;
var validId = null;

describe("Team models [getTeam]: get all teams or get team details if team id is set ", function(){ 
  this.timeout(timeout);
  it("retrieve all team", function(done){
    teamModel.getTeam(null, function(err, body){
      assert.equal(err, null);
      assert.notEqual(body, null);
      validId = body.rows[0]['id'];
      done();
    })
  });

  it("return empty none existent team details", function(done){    
    teamModel.getTeam('none-existing-team', function(err, body){
      assert.notEqual(err, null);
      assert.equal(body, null);
      done();
    })
  });

  it("return team details", function(done){
    validId = 'ag_team_Agile Talent Business Management';
    teamModel.getTeam(validId, function(err, body){
      assert.equal(err, null);
      assert.notEqual(body, null);
      done();
    })
  });
});