var chai = require('chai');
var expect = chai.expect;
var teamModel = require('../../models/teams');
var timeout = 30000;
var validId = null;

describe("Team models [getTeam]: get all teams or get team details if team id is set ", function(){ 
  this.timeout(timeout);
  it("retrieve all team", function(done){
    teamModel.getTeam(null)
      .then(function(body){
        expect(body).to.be.a('object');
        expect(body).to.have.property('rows');
        validId = body.rows[0]['id'];
      })
      .catch(function(err){
        expect(err.error).to.be.an('undefined');
      })
      .finally(function(){
        done();
      });
  });

  it("return empty none existent team details", function(done){    
    teamModel.getTeam('none-existing-team')
      .then(function(body){
        expect(body).to.be.equal(null);
      })
      .catch(function(err){
        expect(err).to.not.equal(null);
        expect(err).to.have.property('error');
        expect(err.error).to.be.equal('not_found');
      })
      .finally(function(){
        done();
      })
  });

  it("return team details", function(done){
    teamModel.getTeam(validId)
      .then(function(body){
        expect(body).to.be.a('object');
        expect(body).to.have.property('type');
      })
      .catch(function(err){
        expect(err.error).to.be.an('undefined');
      })
      .finally(function(){
        done();
      });
  });
});

describe('Team models [getRole]: get team role type', function(){
  this.timeout(timeout);
  it('retrieve all team role type', function(done){
    teamModel.getRole()
      .then(function(body){
        expect(body).to.be.a('object');
        expect(body).to.have.property('rows');
      })
      .catch(function(err){
        expect(err.error).to.be.an('undefined');
      })
      .finally(function(){
        done();  
      });
  });
});

xdescribe('Team models [getName]: get team names', function(){
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