var chai = require('chai');
var expect = chai.expect;
var teamModel = require('../../models/teams');
var timeout = 30000;
var validId = null;

describe("Team models [getTeam]: get all teams or get team details if team id is set ", function(){ 
  this.timeout(timeout);
  it("retrieve all team", function(done){
    teamModel.getTeam(null, function(err, body){
      expect(err).to.be.equal(null);
      expect(body).to.be.a('object');
      expect(body).to.have.property('rows');
      validId = body.rows[0]['id'];
      done();
    })
  });

  it("return empty none existent team details", function(done){    
    teamModel.getTeam('none-existing-team', function(err, body){
      expect(body).to.be.equal(null);
      expect(err).to.not.equal(null);
      done();
    })
  });

  it("return team details", function(done){
    teamModel.getTeam(validId, function(err, body){
      expect(err).to.be.equal(null);
      expect(body).to.be.a('object');
      expect(body).to.have.property('type');
      done();
    })
  });
});

describe('Team models [getRole]: get team role type', function(){
  this.timeout(timeout);
  it('retrieve all team role type', function(done){
    teamModel.getRole(function(err, body){
      expect(err).to.be.equal(null);
      expect(body).to.be.a('object');
      expect(body).to.have.property('rows');
      done();
    });
  });
});

describe('Team models [getName]: get team names', function(){
  this.timeout(timeout);
  it('retrieve all team role type', function(done){
    teamModel.getName(function(err, body){
      expect(err).to.be.equal(null);
      expect(body).to.be.a('object');
      expect(body).to.have.property('rows');
      done();
    });
  });
});