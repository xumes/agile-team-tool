var chai = require('chai');
var expect = chai.expect;
var teamModel = require('../../models/teams');
var common = require('../../models/cloudant-driver');
var dummyData = require('../data/dummy-data.js');
var cache = require('../../middleware/cache');
var _ = require('underscore');
var teamIndex = require('../../models/index/teamIndex');
var lookupSquadId = null;
var lookupNonsquadId = null;
var validId = null;
var validTeamName = null;
var createdId = null;
var teamMembersDummy = require('../data/teams');

var teamDocUpdateInvalid = dummyData.teams.validDoc;

var teamDocUpdateValid = dummyData.teams.validDoc;

var teamDocValid = dummyData.teams.validDoc;

var teamSquadDocValid = dummyData.teams.validSquadDoc;

var userDetailsValid = dummyData.user.details;

var userDetails = dummyData.user.details;

var teamDocInvalid = dummyData.teams.invalidDoc;

var indexDocument = dummyData.index.indexDocument;

var teamAssociations = dummyData.index.teamAssociations;

var removedId = [];

var removedRev = [];

// retrieve obj via cache, decoy for session
// var session = {};
describe('Team models [createTeam]: create a new team document', function() {
  // before(function(done) {
  //   cache.setHomeCache(userDetails['shortEmail'])
  //   .then(function(body){
  //     session = body;
  //     session['user'] = userDetails;
  //     done();
  //   })
  // })
  it('it will return error because team document is not valid', function(done) {
    teamModel.createTeam(teamDocInvalid, userDetails)
      .then(function(body) {
        expect(body).to.be.equal(null);
      })
      .catch(function(err) {
        expect(err).to.not.equal(null);
        expect(err).to.have.property('error');
        expect(err.error).to.be.a('object');
      })
      .finally(function() {
        done();
      });
  });

  it('it will return success for creating a new team document', function(done) {
    teamModel.createTeam(teamDocValid, userDetails)
      .then(function(body) {
        expect(body).to.be.a('object');
        expect(body).to.have.property('_id');
        createdId = body['_id'];
      })
      .catch(function(err) {
        expect(err.error).to.be.an('undefined');
      })
      .finally(function() {
        done();
      });
  });

  it('it will return error because Team name is already existing', function(done) {
    teamModel.createTeam(teamDocValid, userDetails)
      .then(function(body) {
        expect(body).to.be.equal(null);
      })
      .catch(function(err) {
        expect(err).to.not.equal(null);
        expect(err).to.have.property('error');
        expect(err.error).to.be.a('object');
        expect(err.error).to.have.property('name');
      })
      .finally(function() {
        done();
      });
  });
});

describe('Team models [updateOrDeleteTeam] : update existing team document', function() {
  // before(function(done) {
  //   cache.setHomeCache(userDetails['shortEmail'])
  //   .then(function(body){
  //     session = body;
  //     session['user'] = userDetails;
  //     done();
  //   })
  // })
  it('it will return error because Team document ID is none existing', function(done) {
    var docu = {
      '_id': 'none-existing-docu' + new Date().getTime()
    };
    teamModel.updateOrDeleteTeam(docu, userDetails, 'update')
      .then(function(body) {
        expect(body).to.be.equal(null);
      })
      .catch(function(err) {
        expect(err).to.not.equal(null);
        expect(err).to.have.property('error');
        expect(err.error).to.be.equal('not_found');
      })
      .finally(function() {
        done();
      });
  });

  it('it will return error because update data is invalid', function(done) {
    teamDocUpdateInvalid['parent_team_id'] = createdId;
    teamDocUpdateInvalid['squadteam'] = 'Yes';
    teamDocUpdateInvalid['child_team_id'] = [];
    teamDocUpdateInvalid['child_team_id'].push(createdId);
    teamModel.updateOrDeleteTeam(teamDocUpdateInvalid, userDetails, 'update')
      .then(function(body) {
        expect(body).to.be.equal(null);
      })
      .catch(function(err) {
        expect(err).to.not.equal(null);
        expect(err).to.have.property('error');
      })
      .finally(function() {
        done();
      });
  });

  it('it will return error because update data is invalid. Squadteam details error', function(done) {
    teamModel.createTeam(dummyData.associate.validDoc(), dummyData.userDetails.valid())
      .then(function(body) {
        teamModel.getTeam(body['_id'])
          .then(function(teamBody) {
            teamBody['squadteam'] = 'Yes';
            teamBody['child_team_id'] = [createdId];
            removedId.push(body['_id']);
            teamModel.updateOrDeleteTeam(teamBody, userDetails, 'update')
              .catch(function(err) {
                expect(err).to.have.property('error');
                expect(err.error).to.have.property('squadteam');
              })
              .finally(function() {
                done();
              });
          });
      });
  });

  it('it will return error because update data is invalid. Parent_id details error', function(done) {
    teamModel.createTeam(dummyData.associate.validDoc(), dummyData.userDetails.valid())
      .then(function(body) {
        teamModel.getTeam(body['_id'])
          .then(function(teamBody) {
            teamBody['parent_team_id'] = body['_id'];
            removedId.push(body['_id']);
            teamModel.updateOrDeleteTeam(teamBody, userDetails, 'update')
              .catch(function(err) {
                expect(err).to.have.property('error');
                expect(err.error).to.have.property('parent_id');
              })
              .finally(function() {
                done();
              });
          });
      });
  });

  it('it will return error because update data is invalid. Child_team_id details error', function(done) {
    teamModel.createTeam(dummyData.associate.validDoc(), dummyData.userDetails.valid())
      .then(function(body) {
        teamModel.getTeam(body['_id'])
          .then(function(teamBody) {
            removedId.push(body['_id']);
            teamBody['child_team_id'] = [body['_id']];
            teamModel.updateOrDeleteTeam(teamBody, userDetails, 'update')
              .catch(function(err) {
                expect(err).to.have.property('error');
                expect(err.error).to.have.property('child_team_id');
              })
              .finally(function() {
                done();
              });
          });
      });
  });

  it('it will return error because update data is invalid. Squadteam details error', function(done) {
    teamModel.createTeam(dummyData.associate.validDoc(), dummyData.userDetails.valid())
      .then(function(body) {
        teamModel.getTeam(body['_id'])
          .then(function(teamBody) {
            removedId.push(body['_id']);
            teamBody['squadteam'] = 'Yes';
            teamBody['child_team_id'] = [createdId];
            teamModel.updateOrDeleteTeam(teamBody, userDetails, 'update')
              .catch(function(err) {
                expect(err).to.have.property('error');
                expect(err.error).to.have.property('squadteam');
              })
              .finally(function() {
                done();
              });
          });
      });
  });

  it('it will return error because user is not authorized to update document', function(done) {
    userDetailsInvalid = {};
    userDetailsInvalid['shortEmail'] = 'none-existing-user@email.com';
    teamModel.updateOrDeleteTeam(teamDocValid, userDetailsInvalid, 'update')
      .then(function(body) {
        expect(body).to.be.equal(null);
      })
      .catch(function(err) {
        expect(err).to.not.equal(null);
        expect(err).to.have.property('error');
      })
      .finally(function() {
        done();
      });
  });

  it('it will return success after updating document', function(done) {
    teamDocUpdateValid['_id'] = createdId;
    teamDocUpdateValid['desc'] = 'A new description ' + Date.now();
    delete teamDocUpdateValid['child_team_id'];
    delete teamDocUpdateValid['parent_team_id'];
    teamModel.updateOrDeleteTeam(teamDocUpdateValid, userDetails, 'update')
      .then(function(body) {
        expect(body).to.be.a('object');
        expect(body).to.have.property('_id');
        expect(body['_id']).to.be.equal(createdId);
      })
      .catch(function(err) {
        expect(err.error).to.be.an('undefined');
      })
      .finally(function() {
        done();
      });
  });

  it('it will return error because update document is invalid', function(done) {
    teamDocUpdateValid['_id'] = createdId;
    delete teamDocUpdateValid['name'];
    teamModel.updateOrDeleteTeam(teamDocUpdateValid, userDetails, 'update')
      .catch(function(err) {
        expect(err).to.not.equal(null);
        expect(err).to.have.property('error');
        expect(err.error).to.have.property('name');
      })
      .finally(function() {
        done();
      });
  });

  it('it will return error because update document is invalid/ team name already exists', function(done) {
    teamDocUpdateValid['_id'] = createdId;
    teamModel.getTeam(null)
      .then(function(body) {
        teamDocUpdateValid['name'] = body[0]['value']['name'];
        teamModel.updateOrDeleteTeam(teamDocUpdateValid, userDetails, 'update')
          .catch(function(err) {
            expect(err).to.not.equal(null);
            expect(err).to.have.property('error');
            expect(err.error).to.have.property('name');
          })
          .finally(function() {
            done();
          });
      });
  });
});

describe('Team models [associateTeams]: associate team relationship with other teams', function() {
  // before(function(done) {
  //   cache.setHomeCache(userDetails['shortEmail'])
  //   .then(function(body){
  //     session = body;
  //     session['user'] = userDetails;
  //     done();
  //   })
  // });

  it('will return error because action is not allowed', function(done) {
    teamModel.associateTeams({}, 'invalid-action', userDetails)
      .catch(function(err) {
        expect(err).to.not.equal(null);
        expect(err).to.have.property('error');
        expect(err.error).to.have.property('action');
        expect(err.error.action[0]).to.have.be.equal('Invalid action');
      })
      .finally(function() {
        done();
      });
  });

  it('will return error because team id is invalid', function(done) {
    teamModel.associateTeams({}, 'associateParent', userDetails)
      .catch(function(err) {
        expect(err).to.not.equal(null);
        expect(err).to.have.property('error');
        expect(err.error).to.have.property('teamId');
        expect(err.error.teamId[0]).to.have.be.equal('Invalid team document ID');
      })
      .finally(function() {
        done();
      });
  });

  it('will return error because target parent is not defined', function(done) {
    associateValidObj = {
      teamId: createdId,
      targetParent: ''
    };
    teamModel.associateTeams(associateValidObj, 'associateParent', userDetails)
      .catch(function(err) {
        expect(err).to.not.equal(null);
        expect(err).to.have.property('error');
        expect(err.error).to.have.property('targetParent');
        expect(err.error.targetParent[0]).to.have.be.equal('Unable to associate selected team as a parent. Parent team may have been updated as a descendant of this team.');
      })
      .finally(function() {
        done();
      });
  });

  it('will return error because associate data is invalid to associate parent', function(done) {
    associateDataParentInvalid = {
      teamId: createdId,
      targetParent: 'invalidTeam'
    };
    teamModel.associateTeams(associateDataParentInvalid, 'associateParent', userDetails)
      .catch(function(err) {
        expect(err).to.not.equal(null);
        expect(err).to.have.property('error');
        expect(err.error).to.have.property('targetParent');
        expect(err.error.targetParent[0]).to.have.be.equal('Unable to associate selected team as a parent. Parent team may have been updated as a descendant of this team.');
      })
      .finally(function() {
        done();
      });
  });

  it('will return error because associate data is invalid to associate child', function(done) {
    associateDataChildInvalid = {
      teamId: createdId,
      targetChild: createdId
    };
    teamModel.associateTeams(associateDataChildInvalid, 'associateChild', userDetails)
      .catch(function(err) {
        expect(err).to.not.equal(null);
        expect(err).to.have.property('error');
        if (err.error != 'not_found') {
          expect(err.error).to.have.property('targetChild');
          expect(err.error.targetChild[0]).to.have.be.equal('Unable to add selected team as a child. Team may have been updated with another parent.');
        }
      })
      .finally(function() {
        done();
      });
  });

  it('will return error because associate data is invalid to associate child', function(done) {
    associateDataChildInvalid = {
      teamId: createdId,
      targetChild: []
    };
    teamModel.associateTeams(associateDataChildInvalid, 'associateChild', userDetails)
      .catch(function(err) {
        expect(err).to.not.equal(null);
        expect(err).to.have.property('error');
        expect(err.error).to.have.property('targetChild');
        expect(err.error.targetChild[0]).to.have.be.equal('No team selected to associate as a Child team.');
      })
      .finally(function() {
        done();
      });
  });

  it('will return error because associate data is invalid to associate child', function(done) {
    associateDataChildInvalid = {
      teamId: createdId,
      targetChild: [createdId]
    };
    teamModel.associateTeams(associateDataChildInvalid, 'associateChild', userDetails)
      .catch(function(err) {
        expect(err).to.not.equal(null);
        expect(err).to.have.property('error');
        expect(err.error).to.have.property('targetChild');
        expect(err.error.targetChild[0]).to.have.be.equal('Unable to add selected team as a child. Team may have been updated with another parent.');
      })
      .finally(function() {
        done();
      });
  });


  it('will return error because associate data is invalid to removed parent', function(done) {
    associateDataRemoveParentInvalid = {
      teamId: createdId,
      targetParent: ''
    };
    teamModel.associateTeams(associateDataRemoveParentInvalid, 'removeParent', userDetails)
      .catch(function(err) {
        expect(err).to.not.equal(null);
        expect(err).to.have.property('error');
        expect(err.error).to.have.property('targetParent');
        expect(err.error.targetParent[0]).to.have.be.equal('Target parent cannot be blank');
      })
      .finally(function() {
        done();
      });
  });

  it('will return error because associate data is invalid to removed parent', function(done) {
    associateDataRemoveParentInvalid = {
      teamId: createdId,
      targetParent: createdId
    };
    teamModel.associateTeams(associateDataRemoveParentInvalid, 'removeParent', userDetails)
      .catch(function(err) {
        expect(err).to.not.equal(null);
        expect(err).to.have.property('error');
        expect(err.error).to.have.property('targetParent');
        expect(err.error.targetParent[0]).to.have.be.equal('Target parent cannot be equal to self');
      })
      .finally(function() {
        done();
      });
  });

  it('will return error because associate data is invalid to removed child', function(done) {
    associateDataRemoveChildInvalid = {
      teamId: createdId,
      targetChild: ''
    };
    teamModel.associateTeams(associateDataRemoveChildInvalid, 'removeChild', userDetails)
      .catch(function(err) {
        expect(err).to.not.equal(null);
        expect(err).to.have.property('error');
        expect(err.error).to.have.property('targetChild');
        expect(err.error.targetChild[0]).to.have.be.equal('Invalid target child');
      })
      .finally(function() {
        done();
      });
  });

  it('will return error because associate data is invalid to removed child', function(done) {
    associateDataRemoveChildInvalid = {
      teamId: createdId,
      targetChild: [createdId]
    };
    teamModel.associateTeams(associateDataRemoveChildInvalid, 'removeChild', userDetails)
      .catch(function(err) {
        expect(err).to.not.equal(null);
        expect(err).to.have.property('error');
        expect(err.error).to.have.property('targetChild');
        expect(err.error.targetChild[0]).to.have.be.equal('Invalid target child');
      })
      .finally(function() {
        done();
      });
  });

  it('will associate new parent team', function(done) {
    teamModel.createTeam(dummyData.associate.validDoc(), dummyData.userDetails.valid())
      .then(function(body) {
        var associateDataParentValid = {
          teamId: createdId,
          targetParent: body['_id']
        };
        teamModel.associateTeams(associateDataParentValid, 'associateParent', userDetails)
          .then(function(body) {
            expect(body).to.not.equal(null);
            expect(body[0]['_id']).to.have.equal(associateDataParentValid['teamId']);
            expect(body[1]['_id']).to.have.equal(associateDataParentValid['targetParent']);
            removedId.push(body[1]['_id']);
          })
          .finally(function() {
            done();
          });
      });
  });

  it('will associate new child team', function(done) {
    teamModel.createTeam(dummyData.associate.validDoc(), dummyData.userDetails.valid())
      .then(function(body) {
        var associateDataChildValid = {
          teamId: createdId,
          targetChild: [body['_id']]
        };
        removedId.push(body['_id']);
        teamModel.associateTeams(associateDataChildValid, 'associateChild', userDetails)
          .then(function(body) {
            expect(body).to.not.equal(null);
            expect(body[0]['_id']).to.have.equal(associateDataChildValid['teamId']);
            var invalidChildId = body[1]['_id'];
            teamModel.createTeam(dummyData.associate.validDoc(), dummyData.userDetails.valid())
              .then(function(body) {
                var associateDataChildInvalid = {
                  teamId: body['_id'],
                  targetChild: invalidChildId
                };
                removedId.push(body['_id']);
                teamModel.associateTeams(associateDataChildValid, 'associateChild', userDetails)
                  .catch(function(err) {
                    expect(err).to.not.equal(null);
                    expect(err).to.have.property('error');
                    expect(err.error).to.have.property('targetChild');
                    expect(err.error.targetChild[0]).to.have.be.equal('Unable to add selected team as a child. Team may have been updated with another parent.');
                  });
              });
            // need to have better assertion, ie check if targetChild is now existing in teamId child_team_id
          })
          .finally(function() {
            done();
          });
      });
  });

  it('will remove parent association', function(done) {
    teamModel.createTeam(dummyData.associate.validDoc(), dummyData.userDetails.valid())
      .then(function(body) {
        var associateDataParentValid = {
          teamId: createdId,
          targetParent: [body['_id']]
        };
        teamModel.associateTeams(associateDataParentValid, 'associateParent', userDetails)
          .then(function(body) {
            var associateRemoveParent = {
              teamId: createdId,
              targetParent: body[1]['_id']
            };
            teamModel.associateTeams(associateRemoveParent, 'removeParent', userDetails)
              .then(function(body) {
                expect(body).to.not.equal(null);
                expect(body[0]['_id']).to.have.equal(associateRemoveParent['teamId']);
                expect(body[1]['_id']).to.have.equal(associateRemoveParent['targetParent']);
                removedId.push(body[1]['_id']);
              })
              .catch(function(err) {})
              .finally(function() {
                done();
              });
          });

      });
  });

  it('will delete an associated team ', function(done) {
    teamModel.createTeam(dummyData.associate.validDoc(), dummyData.userDetails.valid())
      .then(function(body) {
        var associateDataParentValid = {
          teamId: createdId,
          targetParent: [body['_id']]
        };
        removedId.push(body['_id']);
        teamModel.associateTeams(associateDataParentValid, 'associateParent', userDetails)
          .then(function(body) {
            removedId.push(body[1]['_id']);
            // session['myTeams'].push(body[0]);
            // session['myTeams'].push(body[1]);
            teamModel.updateOrDeleteTeam(body[1], userDetails, 'delete')
              .then(function(body) {
                expect(body).to.not.equal(null);
                expect(body['parent_team_id']).to.have.equal(createdId);
                expect(body['doc_status']).to.have.equal('delete');
              })
              .catch(function(err) {})
              .finally(function() {
                done();
              });
          });
      });
  });

  it('will remove child team', function(done) {
    teamModel.createTeam(dummyData.associate.validDoc(), dummyData.userDetails.valid())
      .then(function(body) {
        var associateDataChildValid = {
          teamId: createdId,
          targetChild: [body['_id']]
        };
        teamModel.associateTeams(associateDataChildValid, 'associateChild', userDetails)
          .then(function(body) {
            var associateRemoveChild = {
              teamId: createdId,
              targetChild: associateDataChildValid['targetChild']
            };
            teamModel.associateTeams(associateRemoveChild, 'removeChild', userDetails)
              .then(function(body) {
                expect(body).to.not.equal(null);
                expect(body[0]['_id']).to.have.equal(associateDataChildValid['teamId']);
                // need to have better assertion, ie check if targetChild is none existing in teamId child_team_id
                removedId.push(body[1]['_id']);
              })
              .finally(function() {
                done();
              });
          });
      });
  });

  it('will delete an associated team', function(done) {
    teamModel.createTeam(dummyData.associate.validDoc(), dummyData.userDetails.valid())
      .then(function(body) {
        var targetTeam = body['_id'];
        removedId.push(body['_id']);
        // session['myTeams'].push(body);
        teamModel.createTeam(dummyData.associate.validDoc(), dummyData.userDetails.valid())
          .then(function(body) {
            var associateDataParentValid = {
              teamId: targetTeam,
              targetParent: [body['_id']]
            };
            removedId.push(body['_id']);
            // session['myTeams'].push(body);
            teamModel.associateTeams(associateDataParentValid, 'associateParent', userDetails)
              .then(function(body) {
                removedId.push(body[0]['_id']);
                // session['myTeams'].push(body[0]);
                // session['myTeams'].push(body[1]);
                teamModel.updateOrDeleteTeam(body[0], userDetails, 'delete')
                  .then(function(body) {
                    expect(body).to.not.equal(null);
                    expect(body['child_team_id']).to.have.equal(createdId);
                    expect(body['doc_status']).to.have.equal('delete');
                  })
                  .catch(function(err) {})
                  .finally(function() {
                    done();
                  });
              });
          });
      });
  });

  /* delete all association records */
  after(function(done) {
    removedId = _.uniq(removedId);
    for (var i = 0; i < removedId.length; i++) {
      teamModel.getTeam(removedId[i])
        .then(function(result) {
          common.deleteRecord(result._id, result._rev)
            .then(function(result) {})
            .catch(function(err) {
              done(err);
            });
        })
        .catch(function(err) {
          done(err);
        });
    }
    done();
  });
});

describe('Team models [deleteTeam] : delete existing team document', function() {
  // before(function(done) {
  //   cache.setHomeCache(userDetails['shortEmail'])
  //   .then(function(body){
  //     session = body;
  //     session['user'] = userDetails;
  //     done();
  //   })
  // })
  it('it will return error because user is not authorized to delete document', function(done) {
    // cache.setHomeCache(dummyData.associate.invalidUser())
    // .then(function(body){
    //   invalidUser = body;
    //   invalidUser['user'] = dummyData.userDetails.invalid();
    teamModel.updateOrDeleteTeam(teamDocValid, dummyData.userDetails.invalid(), 'delete')
      .then(function(body) {
        expect(body).to.be.equal(null);
      })
      .catch(function(err) {
        expect(err).to.not.equal(null);
        expect(err).to.have.property('error');
      })
      .finally(function() {
        done();
      });
    // });
  });

  it('it will return error when deleting a document', function(done) {
    var teamToDelete = {};
    teamToDelete['doc_status'] = 'delete';
    teamToDelete['_id'] = createdId;
    teamModel.updateOrDeleteTeam(teamToDelete, userDetails, 'delete')
      .catch(function(err) {
        expect(err.error).to.contain('id is required');
      })
      .finally(function() {
        done();
      });
  });

  it('it will return error because team id is not existing', function(done) {
    var docu = {
      '_id': 'none-existing-docu' + new Date().getTime()
    };
    docu['doc_status'] = 'delete';
    teamModel.updateOrDeleteTeam(docu, userDetails, 'delete')
      .then(function(body) {
        expect(body).to.be.equal(null);
      })
      .catch(function(err) {
        expect(err).to.not.equal(null);
        expect(err).to.have.property('error');
        expect(err.error).to.be.equal('not_found');
      })
      .finally(function() {
        done();
      });
  });

  it('it will return error because action is not allowed', function(done) {
    teamDocUpdateValid['doc_status'] = 'delete';
    teamDocUpdateValid['_id'] = createdId;
    teamModel.updateOrDeleteTeam(teamDocUpdateValid, userDetails, 'delete')
      .then(function(body) {
        expect(body).to.be.equal(null);
      })
      .catch(function(err) {
        expect(err).to.not.equal(null);
        expect(err).to.have.property('error');
        // expect(err.error).to.be.equal('Invalid action');
      })
      .finally(function() {
        done();
      });
  });
});

describe('Team models [getTeam]: get all teams or get team details if team id is set ', function() {
  // before(function(done) {
  //   cache.setHomeCache(userDetails['shortEmail'])
  //   .then(function(body){
  //     session = body;
  //     session['user'] = userDetails;
  //     done();
  //   })
  // })
  it('retrieve all team', function(done) {
    teamModel.getTeam(null)
      .then(function(body) {
        expect(body).to.be.a('array');
        validId = body[0]['id'];
        validTeamName = body[0]['value']['name'];
      })
      .finally(function() {
        done();
      });
  });

  it('return empty none existent team details', function(done) {
    teamModel.getTeam('none-existing-team')
      .then(function(body) {
        expect(body).to.be.equal(null);
      })
      .catch(function(err) {
        expect(err).to.not.equal(null);
        expect(err).to.have.property('error');
        expect(err.error).to.be.equal('not_found');
      })
      .finally(function() {
        done();
      });
  });

  it('return team details', function(done) {
    teamModel.getTeam(validId)
      .then(function(body) {
        expect(body).to.be.a('object');
        expect(body).to.have.property('type');
      })
      .catch(function(err) {
        expect(err.error).to.be.an('undefined');
      })
      .finally(function() {
        done();
      });
  });
});

describe('Team models [getRole]: get team role type', function(done) {
  // before(function(done) {
  //   cache.setHomeCache(userDetails['shortEmail'])
  //   .then(function(body){
  //     session = body;
  //     session['user'] = userDetails;
  //     done();
  //   })
  // })
  it('retrieve all team role type', function(done) {
    teamModel.getRole()
      .then(function(body) {
        expect(body).to.be.a('object');
        expect(body).to.have.property('rows');
      })
      .catch(function(err) {
        expect(err.error).to.be.an('undefined');
      })
      .finally(function() {
        done();
      });
  });
});

describe('Team models [getName]: get all team names or team details if name is given', function() {
  // before(function(done) {
  //   cache.setHomeCache(userDetails['shortEmail'])
  //   .then(function(body){
  //     session = body;
  //     session['user'] = userDetails;
  //     done();
  //   })
  // })
  it('retrieve all team names', function(done) {
    teamModel.getName(null)
      .then(function(body) {
        expect(body).to.be.a('object');
        expect(body).to.have.property('rows');
      })
      .catch(function(err) {
        expect(err).to.be.equal(null);
      })
      .finally(function() {
        done();
      });
  });

  it('return empty details for none existing team name', function(done) {
    teamModel.getName('none-existing-team-name')
      .then(function(body) {
        expect(body).to.be.empty;
      })
      .catch(function(err) {
        expect(err).to.be.equal(null);
      })
      .finally(function() {
        done();
      });
  });

  it('return details for team name', function(done) {
    teamModel.getName(validTeamName)
      .then(function(body) {
        expect(body[0]['key']).to.be.equal(validTeamName);
      })
      .finally(function() {
        done();
      });
  });
});

describe('Team models [getTeamByEmail]: get all team lists for a given email address', function() {
  // before(function(done) {
  //   cache.setHomeCache(userDetails['shortEmail'])
  //   .then(function(body){
  //     session = body;
  //     session['user'] = userDetails;
  //     done();
  //   })
  // })
  it('return error for invalid email address', function(done) {
    teamModel.getTeamByEmail('invalid-email-add')
      .then(function(body) {
        expect(body[0]['key']).to.be.equal(validTeamName);
      })
      .catch(function(err) {
        expect(err).to.not.equal(null);
        expect(err).to.have.property('error');
      })
      .finally(function() {
        done();
      });
  });

  it('return empty team lists email without team', function(done) {
    teamModel.getTeamByEmail('emailWithoutTeam@email.com')
      .then(function(body) {
        expect(body).to.be.empty;
      })
      .finally(function() {
        done();
      });
  });

  it('return team lists for this email', function(done) {
    teamModel.getTeamByEmail(userDetails['shortEmail'])
      .then(function(body) {
        if (body.length > 0)
          expect(body[0]['key']).to.be.equal(userDetails['shortEmail']);
        else
          expect(body).to.be.empty;
      })
      .catch(function(err) {
        expect(err).to.be.equal(null);
      })
      .finally(function() {
        done();
      });
  });

});

describe('Team models [getTeamByUid]: get all team lists for a given serial number/ uid', function() {
  // before(function(done) {
  //   cache.setHomeCache(userDetails['shortEmail'])
  //   .then(function(body){
  //     session = body;
  //     session['user'] = userDetails;
  //     done();
  //   })
  // })

  it('return error because serial number/ uid is empty', function(done) {
    teamModel.getTeamByUid(null)
      .catch(function(err) {
        expect(err).to.not.equal(null);
        expect(err).to.have.property('error');
        expect(err.error).to.have.property('uid');
      })
      .finally(function() {
        done();
      });
  });

  it('return empty team lists serial number/ uid without team', function(done) {
    teamModel.getTeamByUid('invalid-uid')
      .then(function(body) {
        expect(body).to.be.empty;
      })
      .finally(function() {
        done();
      });
  });

  it('return team lists for this serial number/ uid', function(done) {
    teamModel.getTeamByUid(userDetails['ldap']['serialNumber'])
      .then(function(body) {
        expect(body[0]['key']).to.be.equal(userDetails['ldap']['serialNumber']);
      })
      .catch(function(err) {
        expect(err).to.be.equal(null);
      })
      .finally(function() {
        done();
      });
  });

});

describe('Team models [getRootTeams]: get top level, children or parent teams', function() {
  it('return team lists for top level teams', function(done) {
    var data = {
      'parent_team_id': ''
    };
    teamModel.getRootTeams(data)
      .then(function(body) {
        expect(body).to.be.have.property('docs');
        expect(body.docs).to.not.empty;
        done();
      })
      .catch(function(err) {
        done(err);
      });
  });

  /* delete created team */
  after(function(done) {
    teamModel.getTeam(createdId)
      .then(function(result) {
        common.deleteRecord(result._id, result._rev)
          .then(function(result) {
            done();
          })
          .catch(function(err) {
            done(err);
          });
      })
      .catch(function(err) {
        done(err);
      });
  });
});

describe('Team models [getLookupTeamByType]: get lookup team list or object', function() {
  before(function(done) {
    teamModel.getLookupIndex()
      .then(function(lookupIndex) {
        var team1 = _.find(lookupIndex, {
          squadteam: 'Yes'
        });
        lookupSquadId = team1._id;
        var team2 = _.find(lookupIndex, {
          squadteam: 'No'
        });
        lookupNonsquadId = team2._id;
        done();
      });
  });

  it('return squad lookup object', function(done) {
    var squadType = true;
    teamModel.getLookupTeamByType(lookupSquadId, squadType)
      .then(function(body) {
        expect(body).to.be.a('object');
        expect(body).to.have.property('_id');
        expect(body).to.have.property('name');
        expect(body['_id']).to.be.equal(lookupSquadId);
        done();
      })
      .catch(function(err) {
        done(err);
      });
  });

  it('return empty squad lookup object', function(done) {
    var squadType = false;
    teamModel.getLookupTeamByType(lookupSquadId, squadType)
      .then(function(body) {
        expect(body).to.be.a('object');
        expect(body).to.be.empty;
        done();
      })
      .catch(function(err) {
        done(err);
      });
  });

  it('return squad lookup lists', function(done) {
    var squadType = true;
    teamModel.getLookupTeamByType(null, squadType)
      .then(function(body) {
        expect(body).to.be.a('array');
        if (!_.isEmpty(body)) {
          expect(body[0]).to.have.property('_id');
          expect(body[0]).to.have.property('name');
        }
        done();
      })
      .catch(function(err) {
        done(err);
      });
  });

  it('return non-squad lookup object', function(done) {
    var squadType = false;
    teamModel.getLookupTeamByType(lookupNonsquadId, squadType)
      .then(function(body) {
        expect(body).to.be.a('object');
        expect(body).to.have.property('_id');
        expect(body).to.have.property('name');
        expect(body['_id']).to.be.equal(lookupNonsquadId);
        done();
      })
      .catch(function(err) {
        done(err);
      });
  });

  it('return empty non-squad lookup object', function(done) {
    var squadType = true;
    teamModel.getLookupTeamByType(lookupNonsquadId, squadType)
      .then(function(body) {
        expect(body).to.be.a('object');
        expect(body).to.be.empty;
        done();
      })
      .catch(function(err) {
        done(err);
      });
  });

  it('return non-squad lookup lists', function(done) {
    var squadType = false;
    teamModel.getLookupTeamByType(null, squadType)
      .then(function(body) {
        expect(body).to.be.a('array');
        if (!_.isEmpty(body)) {
          expect(body[0]).to.have.property('_id');
          expect(body[0]).to.have.property('name');
        }
        done();
      })
      .catch(function(err) {
        done(err);
      });
  });
});

describe('Team models [indexDocument]: updates the team relation lookup document ', function() {
  before(function(done) {
    teamIndex.getIndexDocument()
      .then(function(body) {
        if (!_.isEmpty(body)) {
          indexDocument = body;
          expect(body).to.be.have.property('lookup');
          expect(body['lookup']).to.be.a('array');
        } else {
          teamIndex.initIndex()
            .then(function(body) {
              indexDocument = body;
              expect(body).to.be.have.property('lookup');
              expect(body['lookup']).to.be.a('array');
            });
        }
        done();
      });
  });
  it('add new associations to the lookup index', function(done) {
    teamIndex.updateLookup(indexDocument, teamAssociations)
      .then(function(body) {
        expect(body).to.be.a('array');
        expect(body).to.have.length.above(0);
        _.each(teamAssociations, function(team) {
          expect(_.find(body, {
            _id: team._id
          })).to.exist;
        });
        indexDocument.lookup = body;
        done();
      })
      .catch(function(err) {
        done(err);
      });
  });
  it('add new 3 level associations (child->parent) to the lookup index A->B->C', function(done) {
    var newParent = _.find(teamAssociations, {
      _id: 'teamA'
    });
    newParent.newParentId = 'teamB';
    teamIndex.updateLookup(indexDocument, [newParent])
      .then(function(body) {
        expect(body).to.be.a('array');
        expect(body).to.have.length.above(0);
        var teamA = _.find(body, {
          _id: 'teamA'
        });
        var teamB = _.find(body, {
          _id: 'teamB'
        });
        expect(teamA.parents).to.have.members(['teamB']);
        expect(teamB.children).to.have.members(['teamA']);

        var newParent = _.find(teamAssociations, {
          _id: 'teamB'
        });
        newParent.newParentId = 'teamC';
        teamIndex.updateLookup(indexDocument, [newParent])
          .then(function(body) {
            expect(body).to.be.a('array');
            expect(body).to.have.length.above(0);
            var teamA = _.find(body, {
              _id: 'teamA'
            });
            var teamB = _.find(body, {
              _id: 'teamB'
            });
            var teamC = _.find(body, {
              _id: 'teamC'
            });
            expect(teamA.parents).to.have.members(['teamB', 'teamC']);
            expect(teamB.parents).to.have.members(['teamC']);
            expect(teamB.children).to.have.members(['teamA']);
            expect(teamC.children).to.have.members(['teamB', 'teamA']);
          });
        done();
      })
      .catch(function(err) {
        done(err);
      });
  });
  it('move associations (child->parent) to the lookup index FROM (A->B->C) TO (A->C and B->C)', function(done) {
    var newParent = _.find(teamAssociations, {
      _id: 'teamA'
    });
    newParent.newParentId = 'teamC';
    newParent.oldParentId = 'teamB';
    teamIndex.updateLookup(indexDocument, [newParent])
      .then(function(body) {
        expect(body).to.be.a('array');
        expect(body).to.have.length.above(0);
        var teamA = _.find(body, {
          _id: 'teamA'
        });
        var teamB = _.find(body, {
          _id: 'teamB'
        });
        var teamC = _.find(body, {
          _id: 'teamC'
        });
        expect(teamA.parents).to.have.members(['teamC']);
        expect(teamB.parents).to.have.members(['teamC']);
        expect(teamB.children).to.be.empty;
        expect(teamC.children).to.have.members(['teamB', 'teamA']);
        done();
      })
      .catch(function(err) {
        done(err);
      });
  });
  it('add associations (child->parent) to the lookup index FROM (A->C and B->C) TO (C->D and E->A->C->D)', function(done) {
    var newParent = _.find(teamAssociations, {
      _id: 'teamC'
    });
    newParent.newParentId = 'teamD';
    var newChild = _.find(teamAssociations, {
      _id: 'teamE'
    });
    newChild.newParentId = 'teamA';
    teamIndex.updateLookup(indexDocument, [newParent, newChild])
      .then(function(body) {
        expect(body).to.be.a('array');
        expect(body).to.have.length.above(0);
        var teamA = _.find(body, {
          _id: 'teamA'
        });
        expect(teamA.parents).to.have.members(['teamC', 'teamD']);
        expect(teamA.children).to.have.members(['teamE']);

        var teamB = _.find(body, {
          _id: 'teamB'
        });
        expect(teamB.parents).to.have.members(['teamC', 'teamD']);
        expect(teamB.children).to.be.empty;

        var teamC = _.find(body, {
          _id: 'teamC'
        });
        expect(teamC.parents).to.have.members(['teamD']);
        expect(teamC.children).to.have.members(['teamB', 'teamA', 'teamE']);

        var teamD = _.find(body, {
          _id: 'teamD'
        });
        expect(teamD.parents).to.be.empty;
        expect(teamD.children).to.have.members(['teamB', 'teamA', 'teamC', 'teamE']);

        var teamE = _.find(body, {
          _id: 'teamE'
        });
        expect(teamE.parents).to.have.members(['teamA', 'teamC', 'teamD']);
        expect(teamE.children).to.be.empty;

        done();
      })
      .catch(function(err) {
        done(err);
      });
  });
  it('deletes a team and remove association from the lookup index FROM (C->D and E->A->C->D) delete C', function(done) {
    var deleteTeam = _.find(teamAssociations, {
      _id: 'teamC'
    });
    deleteTeam.newParentId = '';
    deleteTeam.oldParentId = 'teamD';
    deleteTeam.doc_status = 'delete';
    var lookupSize = _.size(indexDocument.lookup);
    teamIndex.updateLookup(indexDocument, [deleteTeam])
      .then(function(body) {
        expect(body).to.be.a('array');
        expect(body).to.have.length.above(0);
        var teamA = _.find(body, {
          _id: 'teamA'
        });
        expect(teamA.parents).to.be.empty;
        expect(teamA.children).to.have.members(['teamE']);

        var teamB = _.find(body, {
          _id: 'teamB'
        });
        expect(teamB.parents).to.be.empty;
        expect(teamB.children).to.be.empty;

        var teamC = _.find(body, {
          _id: 'teamC'
        });
        expect(teamC).to.be.empty;

        var teamD = _.find(body, {
          _id: 'teamD'
        });
        expect(teamD.parents).to.be.empty;
        expect(teamD.children).to.be.empty;

        var teamE = _.find(body, {
          _id: 'teamE'
        });
        expect(teamE.parents).to.have.members(['teamA']);
        expect(teamE.children).to.be.empty;

        expect(body).to.have.length.below(lookupSize);

        done();
      })
      .catch(function(err) {
        done(err);
      });
  });
  it('deletes a team and remove association from the lookup index FROM (C and E->A and D) delete D', function(done) {
    var deleteTeam = _.find(teamAssociations, {
      _id: 'teamD'
    });
    deleteTeam.newParentId = '';
    deleteTeam.oldParentId = '';
    deleteTeam.doc_status = 'delete';
    var lookupSize = _.size(indexDocument.lookup);
    teamIndex.updateLookup(indexDocument, [deleteTeam])
      .then(function(body) {
        expect(body).to.be.a('array');
        expect(body).to.have.length.above(0);
        var teamD = _.find(body, {
          _id: 'teamD'
        });
        expect(teamD).to.be.empty;
        expect(body).to.have.length.below(lookupSize);

        done();
      })
      .catch(function(err) {
        done(err);
      });
  });
});

describe('Team models [getSelectableParents]', function() {
  it('it will return empty array because team id is empty', function(done) {
    teamModel.getSelectableParents(null)
      .then(function(body) {
        expect(body).to.be.a('array');
        expect(body).to.have.length(0);
      })
      .finally(function() {
        done();
      });
  });
});

describe('Team models [getSquadsOfParent]', function() {
  it('it will return empty array because team id is empty', function(done) {
    teamModel.getSquadsOfParent(null)
      .then(function(body) {
        expect(body).to.be.a('array');
        expect(body).to.have.length(0);
      })
      .finally(function() {
        done();
      });
  });
});

describe('Team models [getLookupIndex]', function() {
  it('it will return empty array because team id is none existent', function(done) {
    teamModel.getLookupIndex(dummyData.teams.invalidId())
      .then(function(body) {
        expect(body).to.be.empty;
      })
      .finally(function() {
        done();
      });
  });
});

describe('Team models [defaultTeamDoc]', function() {
  it('it will return default team doc format/ structure', function(done) {
    var body = teamModel.defaultTeamDoc({
      'squadTeam': 'Yes'
    }, userDetailsValid);
    expect(body).to.be.a('object');
    expect(body).to.have.property('_id');
    done();
  });

  it('it will return default team doc format/ structure', function(done) {
    var body = teamModel.defaultTeamDoc({
      'squadTeam': 'No'
    }, userDetailsValid);
    expect(body).to.be.a('object');
    expect(body).to.have.property('_id');
    done();
  });
});

//modifyTeamMembers: function(teamId, userId, members) {
describe('Team models [modifyTeamMembers]', function() {
  var validTeamMembers = teamMembersDummy['teams'].validMembers();
  it('it will return an error because teamId is required', function(done) {
    teamModel.modifyTeamMembers(null, null, [])
      .catch(function(body){
        expect(body).to.be.a('object');
        expect(body).to.have.property('error');
        expect(body.error).to.have.property('teamId');
        done();
      });
  });

  it('it will return an error because userId is required', function(done) {
    teamModel.modifyTeamMembers('temp-team-id', null, [])
      .catch(function(body){
        expect(body).to.be.a('object');
        expect(body).to.have.property('error');
        expect(body.error).to.have.property('userId');
        done();
      });
  });

  it('it will return an success in modifying team member', function(done) {
    teamDocValid['name'] = 'name ' + Date.now();
    teamModel.createTeam(teamDocValid, userDetails)
      .then(function(body) {
        var modifyTeamId = body['_id'];
        removedId.push(body['_id']);
        teamModel.modifyTeamMembers(modifyTeamId, userDetails['shortEmail'], validTeamMembers)
          .then(function(body){
            expect(body).to.be.a('object');
            expect(body).to.have.property('ok');
            expect(body['ok']).to.have.equal(true);
            done();
          });
      });
  });
});
