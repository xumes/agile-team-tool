var chai = require('chai');
var expect = chai.expect;
var teamModel = require('../../models/teams');
var dummyData = require('../dummy-data.js');
var validId = null;
var validTeamName = null;
var createdId = null;

var teamDocUpdateInvalid = dummyData.teams.validDoc;

var teamDocUpdateValid = dummyData.teams.validDoc;

var teamDocValid = dummyData.teams.validDoc; 

var userDetailsValid = dummyData.user.details;

var userDetails = dummyData.user.details;

var teamDocInvalid = dummyData.teams.invalidDoc; 

describe('Team models [createTeam]: create a new team document', function(){
  it('it will return error because team document is not valid', function(done){
    teamModel.createTeam(teamDocInvalid, userDetails)
    .then(function(body){
      expect(body).to.be.equal(null);
    })
    .catch(function(err){
      expect(err).to.not.equal(null);
      expect(err).to.have.property('error');
      expect(err.error).to.be.a('object');
    })
    .finally(function(){
      done();
    })
  });

  it('it will return success for creating a new team document', function(done){
    teamModel.createTeam(teamDocValid, userDetails)
    .then(function(body){
      expect(body).to.be.a('object');
      expect(body).to.have.property('_id');
      createdId = body['_id'];
    })
    .catch(function(err){
      expect(err.error).to.be.an('undefined');
    })
    .finally(function(){
      done();
    })
  });

  it('it will return error because Team name is already existing', function(done){
    teamModel.createTeam(teamDocValid, userDetails)
    .then(function(body){
      expect(body).to.be.equal(null);
    })
    .catch(function(err){
      expect(err).to.not.equal(null);
      expect(err).to.have.property('error');
      expect(err.error).to.be.a('object');
      expect(err.error).to.have.property('name');
    })
    .finally(function(){
      done();
    })
  });
});

describe('Team models [updateOrDeleteTeam] : update existing team document', function(){
  it('it will return error because Team document ID is none existing', function(done){
    var docu = { '_id' : 'none-existing-docu' + new Date().getTime() };
    teamModel.updateOrDeleteTeam(docu, userDetails, 'update')
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
  
  it('it will return error because update data is invalid', function(done){
    teamDocUpdateInvalid['parent_team_id'] = createdId;
    teamDocUpdateInvalid['squadteam'] = 'Yes';
    teamDocUpdateInvalid['child_team_id'] = [];
    teamDocUpdateInvalid['child_team_id'].push(createdId);
    teamModel.updateOrDeleteTeam(teamDocUpdateInvalid, userDetails, 'update')
    .then(function(body){
      expect(body).to.be.equal(null);
    })
    .catch(function(err){
      expect(err).to.not.equal(null);
      expect(err).to.have.property('error');
    })
    .finally(function(){
      done();
    })
  });

  it('it will return error because user is not authorized to update document', function(done){
    userDetailsInvalid = {};
    userDetailsInvalid['shortEmail'] = 'none-existing-user@email.com';
    teamModel.updateOrDeleteTeam(teamDocValid, userDetailsInvalid, 'update')
    .then(function(body){
      expect(body).to.be.equal(null);
    })
    .catch(function(err){
      expect(err).to.not.equal(null);
      expect(err).to.have.property('error');
    })
    .finally(function(){
      done();
    })
  });

  it('it will return success after updating document', function(done){
    teamDocUpdateValid['name'] = teamDocUpdateValid['name'] + 'new name';
    teamDocUpdateValid['_id'] = createdId;
    delete teamDocUpdateValid['squadteam'];
    delete teamDocUpdateValid['child_team_id'];
    delete teamDocUpdateValid['parent_team_id'];
    teamModel.updateOrDeleteTeam(teamDocUpdateValid, userDetailsValid, 'update')
    .then(function(body){
      expect(body).to.be.a('object');
      expect(body).to.have.property('id');
      expect(body).to.have.property('ok');
      expect(body.ok).to.be.equal(true);
    })
    .catch(function(err){
      expect(err.error).to.be.an('undefined');
    })
    .finally(function(){
      done();
    })
  });
});

describe('Team models [deleteTeam] : delete existing team document', function(){
  it('it will return error because user is not authorized to delete document', function(done){
    userDetailsInvalid = {};
    userDetailsInvalid['shortEmail'] = 'none-existing-user@email.com';
    teamModel.updateOrDeleteTeam(teamDocValid, userDetailsInvalid, 'delete')
    .then(function(body){
      expect(body).to.be.equal(null);
    })
    .catch(function(err){
      expect(err).to.not.equal(null);
      expect(err).to.have.property('error');
    })
    .finally(function(){
      done();
    })
  });

  it('it will return error when deleting a document', function(done){
    var teamToDelete = {};
    teamToDelete['doc_status'] = 'delete';
    teamToDelete['_id'] = createdId;
    teamModel.updateOrDeleteTeam(teamToDelete, userDetailsValid, 'delete')
    .catch(function(err){
      expect(err.error).to.contain('action');
    })
    .finally(function(){
      done();
    })
  });

  it('it will return error because team id is not existing', function(done){
    var docu = { '_id' : 'none-existing-docu' + new Date().getTime() };
    docu['doc_status'] = 'delete';
    teamModel.updateOrDeleteTeam(docu, userDetailsValid, 'delete')
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

  it('it will return error because action is not allowed', function(done){
    teamDocUpdateValid['doc_status'] = 'delete';
    teamDocUpdateValid['_id'] = createdId;
    teamModel.updateOrDeleteTeam(teamDocUpdateValid, userDetailsValid, 'delete')
    .then(function(body){
      expect(body).to.be.equal(null);
    })
    .catch(function(err){
      expect(err).to.not.equal(null);
      expect(err).to.have.property('error');
      expect(err.error).to.be.equal('Invalid action');
    })
    .finally(function(){
      done();
    })
  });
});

describe("Team models [getTeam]: get all teams or get team details if team id is set ", function(){ 
  it("retrieve all team", function(done){
    teamModel.getTeam(null)
      .then(function(body){
        expect(body).to.be.a('object');
        expect(body).to.have.property('rows');
        validId = body.rows[0]['id'];
        validTeamName = body.rows[0]['value']['name'];
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

describe('Team models [getRole]: get team role type', function(done){
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

describe('Team models [getName]: get all team names or team details if name is given', function(){
  it('retrieve all team names', function(done){
    teamModel.getName(null)
      .then(function(body){
        expect(body).to.be.a('object');
        expect(body).to.have.property('rows');
      })
      .catch(function(err){
        expect(err).to.be.equal(null);
      })
      .finally(function(){
        done();
      });
  });

  it('return empty details for none existing team name', function(done){
    teamModel.getName('none-existing-team-name')
      .then(function(body){
        expect(body).to.be.empty;
      })
      .catch(function(err){
        expect(err).to.be.equal(null);
      })
      .finally(function(){
        done();
      });
  });

  it('return details for team name', function(done){
    teamModel.getName(validTeamName)
      .then(function(body){
        expect(body[0]['key']).to.be.equal(validTeamName);
      })
      .finally(function(){
        done();
      });
  });
});

describe('Team models [getTeamByEmail]: get all team lists for a given email address', function(){
  it('return error for invalid email address', function(done){
    teamModel.getTeamByEmail('invalid-email-add')
      .then(function(body){
        expect(body[0]['key']).to.be.equal(validTeamName);
      })
      .catch(function(err){
        expect(err).to.not.equal(null);
        expect(err).to.have.property('error');
      })
      .finally(function(){
        done();
      });
  });

  it('return empty team lists email without team', function(done){
    teamModel.getTeamByEmail('emailWithoutTeam@email.com')
      .then(function(body){
        expect(body).to.be.empty;
      })
      .finally(function(){
        done();
      });
  });

  it('return team lists for this email', function(done){
    teamModel.getTeamByEmail(userDetailsValid['shortEmail'])
      .then(function(body){
        expect(body[0]['key']).to.be.equal(userDetailsValid['shortEmail']);
      })
      .catch(function(err){
        expect(err).to.be.equal(null);
      })
      .finally(function(){
        done();
      });
  });    

});