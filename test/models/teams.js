var chai = require('chai');
var expect = chai.expect;
var teamModel = require('../../models/teams');
var dummyData = require('../data/dummy-data.js');
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
    teamDocUpdateValid = dummyData.teams.validUpdateDoc();
    teamDocUpdateValid['_id'] = createdId;
    delete teamDocUpdateValid['child_team_id'];
    delete teamDocUpdateValid['parent_team_id'];
    teamModel.updateOrDeleteTeam(teamDocUpdateValid, userDetailsValid, 'update')
    .then(function(body){
      expect(body).to.be.a('object');
      expect(body).to.have.property('_id');
      expect(body['_id']).to.be.equal(createdId);
    })
    .catch(function(err){
      expect(err.error).to.be.an('undefined');
    })
    .finally(function(){
      done();
    })
  });
});

describe('Team models [associateTeams]: associate team relationship with other teams', function(){
  it('will return error because action is not allowed', function(done){
    teamModel.associateTeams({}, 'invalid-action', dummyData.associate.invalidUser())
    .catch(function(err){
      expect(err).to.not.equal(null);
      expect(err).to.have.property('error');
      expect(err.error).to.have.property('action');
      expect(err.error.action).to.have.be.equal('Invalid action');
    })
    .finally(function(){
      done();
    })
  });

  it('will return error because team id is invalid', function(done){
    teamModel.associateTeams({}, 'associateParent', dummyData.associate.invalidUser())
    .catch(function(err){
      expect(err).to.not.equal(null);
      expect(err).to.have.property('error');
      expect(err.error).to.have.property('teamId');
      expect(err.error.teamId).to.have.be.equal('Invalid team document ID');
    })
    .finally(function(){
      done();
    })
  });

  it('will return error because user is not authorized to perform action', function(done){
    associateValidObj = {
      teamId : createdId,
      targetParent : ''
    };
    teamModel.associateTeams( associateValidObj, 'associateParent', dummyData.associate.invalidUser())
    .catch(function(err){
      expect(err).to.not.equal(null);
      expect(err).to.have.property('error');
      expect(err.error).to.have.property('user');
      expect(err.error.user).to.have.be.equal('User not authorized to do action');
    })
    .finally(function(){
      done();
    })
  });
  
  it('will return error because associate data is invalid to associate parent', function(done){
    associateDataParentInvalid = {
      teamId : createdId,
      targetParent : 'invalidTeam'
    };
    teamModel.associateTeams(associateDataParentInvalid, 'associateParent', dummyData.associate.validUser())
    .catch(function(err){
      expect(err).to.not.equal(null);
      expect(err).to.have.property('error');
      expect(err.error).to.have.property('targetParent');
      expect(err.error.targetParent).to.have.be.equal('Unable to associate selected team as a parent. Parent team may have been updated as a descendant of this team.');
    })
    .finally(function(){
      done();
    })
  });
  
  it('will return error because associate data is invalid to associate child', function(done){
    associateDataChildInvalid = {
      teamId : createdId,
      targetChild : createdId
    };
    teamModel.associateTeams(associateDataChildInvalid, 'associateChild', dummyData.associate.validUser())
    .catch(function(err){
      expect(err).to.not.equal(null);
      expect(err).to.have.property('error');
      expect(err.error).to.have.property('targetChild');
      expect(err.error.targetChild).to.have.be.equal('Unable to add selected team as a child. Team may have been updated with another parent.');
    })
    .finally(function(){
      done();
    })
  });

  it('will return error because associate data is invalid to associate child', function(done){
    associateDataChildInvalid = {
      teamId : createdId,
      targetChild : [createdId]
    };
    teamModel.associateTeams(associateDataChildInvalid, 'associateChild', dummyData.associate.validUser())
    .catch(function(err){
      expect(err).to.not.equal(null);
      expect(err).to.have.property('error');
      expect(err.error).to.have.property('targetChild');
      expect(err.error.targetChild).to.have.be.equal('Unable to add selected team as a child. Team may have been updated with another parent.');
    })
    .finally(function(){
      done();
    })
  });

  
  it('will return error because associate data is invalid to removed parent', function(done){
    associateDataRemoveParentInvalid = {
      teamId : createdId,
      targetParent : ''
    };
    teamModel.associateTeams(associateDataRemoveParentInvalid, 'removeParent', dummyData.associate.validUser())
    .catch(function(err){
      expect(err).to.not.equal(null);
      expect(err).to.have.property('error');
      expect(err.error).to.have.property('targetParent');
      expect(err.error.targetParent).to.have.be.equal('Target parent cannot be blank');
    })
    .finally(function(){
      done();
    })
  });
  
  it('will return error because associate data is invalid to removed parent', function(done){
    associateDataRemoveParentInvalid = {
      teamId : createdId,
      targetParent : createdId
    };
    teamModel.associateTeams(associateDataRemoveParentInvalid, 'removeParent', dummyData.associate.validUser())
    .catch(function(err){
      expect(err).to.not.equal(null);
      expect(err).to.have.property('error');
      expect(err.error).to.have.property('targetParent');
      expect(err.error.targetParent).to.have.be.equal('Target parent cannot be equal to self');
    })
    .finally(function(){
      done();
    })
  });

  it('will return error because associate data is invalid to removed child', function(done){
    associateDataRemoveChildInvalid = {
      teamId : createdId,
      targetChild : ''
    };
    teamModel.associateTeams(associateDataRemoveChildInvalid, 'removeChild', dummyData.associate.validUser())
    .catch(function(err){
      expect(err).to.not.equal(null);
      expect(err).to.have.property('error');
      expect(err.error).to.have.property('targetChild');
      expect(err.error.targetChild).to.have.be.equal('Invalid target child');
    })
    .finally(function(){
      done();
    })
  });

  it('will return error because associate data is invalid to removed child', function(done){
    associateDataRemoveChildInvalid = {
      teamId : createdId,
      targetChild : [createdId]
    };
    teamModel.associateTeams(associateDataRemoveChildInvalid, 'removeChild', dummyData.associate.validUser())
    .catch(function(err){
      expect(err).to.not.equal(null);
      expect(err).to.have.property('error');
      expect(err.error).to.have.property('targetChild');
      expect(err.error.targetChild).to.have.be.equal('Invalid target child');
    })
    .finally(function(){
      done();
    })
  });
  
  it('will associate new parent team', function(done){
    teamModel.createTeam(dummyData.associate.validDoc(), dummyData.userDetails.valid())
    .then(function(body){
      var associateDataParentValid = {
        teamId : createdId,
        targetParent : body['_id']
      };
      teamModel.associateTeams(associateDataParentValid, 'associateParent', dummyData.associate.validUser())
      .then(function(body){
        expect(body).to.not.equal(null);
        expect(body[0]['_id']).to.have.equal(associateDataParentValid['teamId']);
        expect(body[1]['_id']).to.have.equal(associateDataParentValid['targetParent']);
      })
      .finally(function(){
        done();
      })
    })
  });
  
  it('will associate new child team', function(done){
    teamModel.createTeam(dummyData.associate.validDoc(), dummyData.userDetails.valid())
    .then(function(body){
      var associateDataChildValid = {
        teamId : createdId,
        targetChild : [body['_id']]
      };
      teamModel.associateTeams(associateDataChildValid, 'associateChild', dummyData.associate.validUser())
      .then(function(body){
        expect(body).to.not.equal(null);
        expect(body[0]['_id']).to.have.equal(associateDataChildValid['teamId']);
        // need to have better assertion, ie check if targetChild is now existing in teamId child_team_id
      })
      .finally(function(){
        done();
      })
    })
  });
  
  it('will removed parent association', function(done){
    teamModel.createTeam(dummyData.associate.validDoc(), dummyData.userDetails.valid())
    .then(function(body){
      var associateDataParentValid = {
        teamId : createdId,
        targetParent : [body['_id']]
      };
      teamModel.associateTeams(associateDataParentValid, 'associateParent', dummyData.associate.validUser())
      .then(function(body){
        var associateRemoveParent = {
          teamId : createdId,
          targetParent : body[1]['_id']
        };
        teamModel.associateTeams(associateRemoveParent, 'removeParent', dummyData.associate.validUser())
        .then(function(body){
          expect(body).to.not.equal(null);
          expect(body[0]['_id']).to.have.equal(associateRemoveParent['teamId']);
          expect(body[1]['_id']).to.have.equal(associateRemoveParent['targetParent']);
        })
        .catch(function(err){
          console.log('###############, line 371');
          console.log(err);
          console.log('###############');
        })
        .finally(function(){
          done();
        })
      })
    });
  });
  
  it('will removed child team', function(done){
    teamModel.createTeam(dummyData.associate.validDoc(), dummyData.userDetails.valid())
    .then(function(body){
      var associateDataChildValid = {
        teamId : createdId,
        targetChild : [body['_id']]
      };
      teamModel.associateTeams(associateDataChildValid, 'associateChild', dummyData.associate.validUser())
      .then(function(body){
        var associateRemoveChild = {
          teamId : createdId,
          targetChild : associateDataChildValid['targetChild']
        }
        teamModel.associateTeams(associateRemoveChild, 'removeChild', dummyData.associate.validUser())
        .then(function(body){
          expect(body).to.not.equal(null);
          expect(body[0]['_id']).to.have.equal(associateDataChildValid['teamId']);
          // need to have better assertion, ie check if targetChild is none existing in teamId child_team_id
        })
        .finally(function(){
          done();
        })
      })
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
        expect(body).to.be.a('array');
        validId = body[0]['id'];
        validTeamName = body[0]['value']['name'];
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