var chai = require('chai');
var expect = chai.expect;
var Promise = require('bluebird');
var assessmentModel = require('../../models/assessment');
var teamModel = require('../../models/teams');
var dummyData = require('../data/dummy-data.js');
var _ = require('underscore');
var util = require('../../helpers/util');
var users = require('../../models/users');

var common = require('../../models/cloudant-driver');
var lodash = require('lodash');
var testData = require('../data/assessment');
var users  = require('../../models/users')

var noId = testData.noId;
var teamData = testData.teamData;
var curr_assessment = testData.currentAssessment;
var invalidTeamId = testData.invalidTeamId;
var invalidAssessId = testData.invalidAssessId;
var invalidRevisionId = testData.invalidRevisionId;
var draft_assessment = testData.draftAssessment;
var sub_assessment = testData.submitAssessment;
var del_assessment = testData.deleteAssessment;

var parentTeamId = testData.parentTeamId;
var childTeamId = testData.childTeamId;
var draftAddId = testData.draftAddId;
var submitAddId = testData.submitAddId;
var parentTeamData = testData.parentTeamData;
var parentUser = testData.parentUser;

var adminList;
var allTeams = [];
var userTeams = [];

function returnObject(data) {
  // pre process returnd rows so we deal directly with the document objects
  // doc attribute of data are valid for compacted views that requested for "include_doc=true"
  if (_.has(data, "rows")) {
    if (_.has(data.rows, "doc"))
      return _.pluck(data.rows, 'doc');
    else
      return _.pluck(data.rows, 'value');
  } else if (data.length > 0) {
    if (!_.isEmpty(data[0].doc))
      return _.pluck(data, 'doc');
    else
      return _.pluck(data, 'value');
  } else
    return data;
};

function createDraft1(){
  common.addRecord(draft_assessment)
  .then(function(body){
    if (!lodash.isEmpty(body))
      draft_assessment._rev = body.rev;
  })
  .catch(function(err){
    return assessmentModel.getAssessment(draft_assessment._id)
  })
  .then(function(body){
    if (!lodash.isEmpty(body))
      draft_assessment = body;
  });
};

function createSubmit1(){
  common.addRecord(sub_assessment)
  .then(function(body){
    if (!lodash.isEmpty(body))
      sub_assessment._rev = body.rev;
  })
  .catch(function(err){
    return assessmentModel.getAssessment(sub_assessment._id)
  })
  .then(function(body){
    if (!lodash.isEmpty(body))
      sub_assessment = body;
  });
};

function createDelete1(){
  common.addRecord(del_assessment)
  .then(function(body){
    if (!lodash.isEmpty(body))
      del_assessment._rev = body.rev;
  })
  .catch(function(err){
    return assessmentModel.getAssessment(del_assessment._id)
  })
  .then(function(body){
    if (!lodash.isEmpty(body))
      del_assessment = body;
  });
};
function createTribe(){
  parentTeamData = teamModel.defaultTeamDoc(parentTeamData, parentUser);
  parentTeamData._id = parentTeamId;
  parentTeamData.parent_team_id = '';
  parentTeamData.child_team_id = [childTeamId];
  common.addRecord(parentTeamData)
  .then(function(body){
    if (!lodash.isEmpty(body))
      parentTeamData._rev = body.rev;
  })
  .catch(function(err){
    return teamModel.getTeam(parentTeamData._id);
  })
  .then(function(body){
    if (!lodash.isEmpty(body))
      parentTeamData = body;
  });
};

function createSquad(){
  teamData = teamModel.defaultTeamDoc(teamData, dummyData.user.details);
  teamData._id = childTeamId;
  teamData.parent_team_id = parentTeamId;
  teamData.child_team_id = [];
  common.addRecord(teamData)
  .then(function(body){
    if (!lodash.isEmpty(body))
      teamData._rev = body.rev;
  })
  .catch(function(err){
    return teamModel.getTeam(teamData._id);
  })
  .then(function(body){
    if (!lodash.isEmpty(body))
      teamData = body;
  });
};

function cleanupAssessment(recId){
  assessmentModel.getAssessment(recId)
   .then(function(body){
      return common.deleteRecord(body._id, body._rev);
    });
};

describe('Assessment Model', function() {
  before(function(done){

    users.getAdmins()
      .then(function(body){
        adminList = body.ACL_Full_Admin;
        return Promise.all([createTribe(), createSquad()]);
      })
      .then(function(list){
        return teamModel.getTeam('');
      })
      .then(function(body){
        var list = returnObject(body);
        allTeams = _.sortBy(list, function(team) {return team.name});
        return teamModel.getTeamByEmail(dummyData.user.details.shortEmail);
      })
      .then(function(body){
        var list = returnObject(body);
        userTeams = _.sortBy(list, function(team) {return team.name});
        return Promise.all([createDraft1(), createSubmit1(), createDelete1()]);
      })
      .finally(function(){
        done();
      });
  });

  after(function(done){
    Promise.all([cleanupAssessment(draft_assessment._id),cleanupAssessment(sub_assessment._id),
      cleanupAssessment(draftAddId), cleanupAssessment(submitAddId)]);

    teamModel.getTeam(teamData._id)
    .then(function(body){
      return common.deleteRecord(body._id, body._rev)
    })
    .then(function(body){
      return teamModel.getTeam(parentTeamData._id)
    })
    .then(function(body){
      return common.deleteRecord(body._id, body._rev)
    })
    .finally(function(){
      done();
    });
  });

  describe("assessment models [getAssessmentTemplate]", function(){
    it("retrieve assessment template", function(done){
      assessmentModel.getAssessmentTemplate()
        .then(function(body){
          expect(body).to.be.an('object');
          expect(body).to.have.property('rows');
          done();
        })
        .catch(function(err){
          done(err);
        });
    });
  });

  describe("assessment models [document validation]", function(){
    it("draft assessment with no created date", function(done){
      var valAssessment = lodash.cloneDeep(curr_assessment);
      valAssessment.assessmt_status = 'Draft';
      valAssessment.assessmt_cmpnt_rslts[0].assessed_cmpnt_tbl[0].cur_mat_lvl_score = '';
      valAssessment.created_dt = '';
      assessmentModel.addTeamAssessment(dummyData.user.details.shortEmail, valAssessment, allTeams, userTeams)
        .catch(function(err){
          expect(err).to.be.an('object');
          expect(err).to.have.property('error');
          expect(err).to.have.deep.property('error.created_dt[0]', 'Created date is required.');
          done();
        });
    });

    it("valid draft assessment from team member", function(done){
      var valAssessment =lodash.cloneDeep(curr_assessment);
      valAssessment._id = draftAddId;
      valAssessment.assessmt_status = 'Draft';
      valAssessment.assessmt_cmpnt_rslts[0].assessed_cmpnt_tbl[0].cur_mat_lvl_score = '';
      valAssessment.created_dt = util.getServerTime();
      valAssessment.created_user = dummyData.user.details.shortEmail;
      assessmentModel.addTeamAssessment(dummyData.user.details.shortEmail, valAssessment, allTeams, userTeams)
        .then(function(body){
          expect(body.ok).to.be.true;
          expect(body.id).to.be.equal(valAssessment._id);
          done();
        })
        .catch(function(err){
          done(err);
        });
    });

    it("draft assessment for update (using parent team member)", function(done){
      var draftForUpdate = lodash.cloneDeep(draft_assessment);
      draftForUpdate.last_updt_dt = util.getServerTime();
      assessmentModel.updateTeamAssessment(parentUser.shortEmail, draftForUpdate, allTeams, userTeams)
        .then(function(body){
          expect(body.ok).to.be.true;
          expect(body.id).to.be.equal(draftForUpdate._id);
          done();
        })
        .catch(function(err){
          done(err);
        });
    });

    it("new submitted assessment (unaswered question)", function(done){
      var valAssessment = lodash.cloneDeep(curr_assessment);
      valAssessment.assessmt_cmpnt_rslts[0].assessed_cmpnt_tbl[0].cur_mat_lvl_achieved = '';
      assessmentModel.addTeamAssessment(dummyData.user.details.shortEmail, valAssessment, allTeams, userTeams)
        .catch(function(err){
          expect(err).to.be.an('object');
          expect(err).to.have.property('error');
          expect(err).to.have.deep.property('error.cur_mat_lvl_achieved[0]', 'All assessment maturity practices need to be answered.  See highlighted practices in yellow.');
          done();
        });
    });

    it("update assessment (unaswered question)", function(done){
      var valAssessment = lodash.cloneDeep(curr_assessment);
      valAssessment.assessmt_cmpnt_rslts[0].assessed_cmpnt_tbl[0].cur_mat_lvl_achieved = '';
      assessmentModel.updateTeamAssessment(dummyData.user.details.shortEmail, valAssessment, allTeams, userTeams)
        .catch(function(err){
          expect(err).to.be.an('object');
          expect(err).to.have.property('error');
          expect(err).to.have.deep.property('error.cur_mat_lvl_achieved[0]','All assessment maturity practices need to be answered.  See highlighted practices in yellow.');
          done();
        });
    });


    it("new submitted assessment (invalid project type)", function(done){
      var valAssessment = lodash.cloneDeep(curr_assessment);
      valAssessment.team_proj_ops = 'General';
      assessmentModel.addTeamAssessment(dummyData.user.details.shortEmail, valAssessment, allTeams, userTeams)
        .catch(function(err){
          expect(err).to.be.an('object');
          expect(err).to.have.property('error');
          expect(err).to.have.deep.property('error.team_proj_ops[0]','General is not included in the list');
          done();
        });
    });

    it("new submitted assessment (no overall assessment score)", function(done){
     var valAssessment = lodash.cloneDeep(curr_assessment);
      valAssessment.assessmt_cmpnt_rslts[0].ovraltar_assessmt_score = '';
      assessmentModel.addTeamAssessment(dummyData.user.details.shortEmail, valAssessment, allTeams, userTeams)
        .catch(function(err){
          expect(err).to.be.an('object');
          expect(err).to.have.property('error');
          expect(err).to.have.deep.property('error.ovraltar_assessmt_score[0]','Overall target assessment score is required.');
          done();
        });
    });


    it("new submitted assessment (incomplete action plan field)", function(done){
      var valAssessment = lodash.cloneDeep(curr_assessment);
      var action = new Object();
      action.action_plan_entry_id = 0;
      action.user_created = 'No';
      action.assessmt_cmpnt_name = 'Team Agile Leadership and Collaboration - Operations';
      action.principle_id = '';
      action.principle_name = 'Focus on the Customer and Business Value';
      action.practice_id = 3;
      action.practice_name = 'Value Stream Mapping';
      action.how_better_action_item = 'Test data only';
      action.cur_mat_lvl_score = 2;
      action.tar_mat_lvl_score = 3;
      action.progress_summ = '';
      action.key_metric = '';
      action.review_dt = '';
      action.action_item_status = 'Open';
      valAssessment.assessmt_action_plan_tbl[0] = action;
      assessmentModel.addTeamAssessment(dummyData.user.details.shortEmail, valAssessment, allTeams, userTeams)
        .catch(function(err){
          expect(err).to.be.an('object');
          expect(err).to.have.property('error');
          expect(err).to.have.deep.property('error.principle_id[0]','Principle id is required.');
          done();
        });
    });

  });

  describe("assessment model [addTeamAssessment] ", function(){

    it("add assessment [no assessment id]", function(done){
      assessmentModel.addTeamAssessment(dummyData.user.details.shortEmail, noId, allTeams, userTeams)
        .catch(function(err){
          expect(err).to.be.an('object');
          expect(err).to.have.property('error');
          expect(err).to.have.deep.property('error._id[0]','Record id is required.');
          done();
        });
    });

    it("add assessment [empty assessment id]", function(done){
      var emptyId = lodash.cloneDeep(curr_assessment);
      emptyId._id = '';
      assessmentModel.addTeamAssessment(dummyData.user.details.shortEmail, emptyId, allTeams, userTeams)
        .catch(function(err){
          expect(err).to.be.an('object');
          expect(err).to.have.property('error');
          expect(err).to.have.deep.property('error._id[0]','Record id is required.');
          done();
        });
    });

    it("valid assessment with non-existing user", function(done){
      var valAssessment =lodash.cloneDeep(curr_assessment);
      valAssessment._id = submitAddId;
      valAssessment.created_dt = util.getServerTime();
      valAssessment.created_user = 'test.user@ph.ibm.com';
      assessmentModel.addTeamAssessment('test.user@ph.ibm.com', valAssessment, allTeams, [])
        .catch(function(err){
          expect(err).to.be.an('object');
          expect(err).to.have.property('error');
          expect(err.error).to.equal('Unauthorized user.');
          done();
        });
    });

    it("add assessment [valid assessment data]", function(done){
      var valAssessment = lodash.cloneDeep(curr_assessment);
      valAssessment._id = submitAddId;
      assessmentModel.addTeamAssessment(dummyData.user.details.shortEmail, valAssessment, allTeams, userTeams)
      .then(function(body){
        expect(body).to.be.an('object');
        expect(body.ok).to.be.true;
        expect(body.id).to.be.equal(valAssessment._id);
        done();
      })
      .catch(function(err){
        done(err);
      });
    });

    it("add assessment [duplicate assessment id]", function(done){
      var valAssessment = lodash.cloneDeep(curr_assessment);
      valAssessment._id = submitAddId;
      assessmentModel.addTeamAssessment(dummyData.user.details.shortEmail, valAssessment, allTeams, userTeams)
        .catch(function(err){
          expect(err).to.be.an('object');
          expect(err).to.have.property('error');
          expect(err.error).to.be.equal('conflict');
          done();
        });
    });
  });

  describe("assessment models [getTeamAssessments]", function(){
    it("retrieve team assessments [valid team id]", function(done){
      assessmentModel.getTeamAssessments(sub_assessment.team_id)
        .then(function(body){
          expect(body).to.be.instanceof(Array);
          var idRecords = _.pluck(body, '_id');
          expect(idRecords).to.have.contain(sub_assessment._id);
          done();
        })
        .catch(function(err){
          done(err);
        });
    });

    it("retrieve team assessments [valid team id-all assessment information]", function(done){
      assessmentModel.getTeamAssessments(sub_assessment.team_id, 'true')
        .then(function(body){
          expect(body).to.be.instanceof(Array);
          var idRecords = _.pluck(body, '_id');
          expect(idRecords).to.have.contain(sub_assessment._id);
          done();
        })
        .catch(function(err){
          done(err);
        });
    });

    it("retrieve team assessments [non-existing team id]", function(done){
      assessmentModel.getTeamAssessments(invalidTeamId)
        .then(function(body){
          expect(body).to.be.instanceof(Array);
          expect(body).to.be.empty;
          done();
        })
        .catch(function(err){
          done(err);
        });
    });

    it("retrieve team assessments [empty team id]", function(done){
      assessmentModel.getTeamAssessments('')
        .catch(function(err){
          expect(err).to.be.an('object');
          expect(err).to.have.property('error');
          expect(err.error).to.be.equal('No team id provided.');
          done();
        });
    });
  });

  describe("assessment model [getAssessment] ", function(){

    it("retrieve assessment [non-existing assessment id]", function(done){
      assessmentModel.getAssessment(invalidAssessId)
        .catch(function(err){
          expect(err).to.be.an('object');
          expect(err).to.have.property('error');
          expect(err.error).to.be.equal('not_found');
          done();
        });
    });

    it("retrieve assessment [empty assessment id]", function(done){
      assessmentModel.getAssessment('')
        .catch(function(err){
          expect(err).to.be.an('object');
          expect(err).to.have.property('error');
          expect(err.error).to.be.equal('No assessment id provided.');
          done();
        });
    });

    it("retrieve assessment [valid assessment id]", function(done){
      assessmentModel.getAssessment(sub_assessment._id)
        .then(function(body){
          expect(body).to.be.an('object');
          expect(body._id).to.be.equal(sub_assessment._id);
          done();
        })
        .catch(function(err){
          done(err);
        });
    });

  });

  describe("assessment model [updateTeamAssessment] ", function(){
    it("update assessment [no assessment id]", function(done){
      assessmentModel.updateTeamAssessment(dummyData.user.details.shortEmail, noId, allTeams, userTeams)
        .catch(function(err){
          expect(err).to.be.an('object');
          expect(err).to.have.property('error');
          expect(err).to.have.deep.property('error._id[0]','Record id is required.');
          done();
        });
    });

    it("update assessment [empty assessment id]", function(done){
      var tempData = lodash.cloneDeep(curr_assessment);
      tempData._id='';
      assessmentModel.updateTeamAssessment(dummyData.user.details.shortEmail, tempData, allTeams, userTeams)
        .catch(function(err){
          expect(err).to.be.an('object');
          expect(err).to.have.property('error');
          expect(err).to.have.deep.property('error._id[0]','Record id is required.');
          done();
        });
    });

    it("update assessment [valid assessment data] with non-existing user", function(done){
      //make sure to have latest document revision id
      var tempData = lodash.cloneDeep(sub_assessment);
      tempData.last_updt_user = 'test.user@ph.ibm.com';
      tempData.last_updt_dt = util.getServerTime();
      assessmentModel.updateTeamAssessment('test.user@ph.ibm.com', tempData, allTeams, [])
        .catch(function(err){
          expect(err).to.be.an('object');
          expect(err).to.have.property('error');
          expect(err.error).to.equal('Unauthorized user.');
          done();
        });
    });

    it("update assessment [valid assessment data] invalid revision id", function(done){
      //make sure to have latest document revision id
      var tempData = lodash.cloneDeep(sub_assessment);
      tempData.last_updt_user = dummyData.user.details.shortEmail;
      tempData.last_updt_dt = util.getServerTime();
      tempData._rev = invalidRevisionId;
      assessmentModel.updateTeamAssessment(dummyData.user.details.shortEmail, tempData, allTeams, userTeams)
        .catch(function(err){
          expect(err).to.be.an('object');
          expect(err).to.have.property('error');
          expect(err.error).to.be.equal('conflict');
          done();
        });
    });

    it("update assessment [valid assessment data]", function(done){
      //make sure to have latest document revision id
      var tempData = lodash.cloneDeep(sub_assessment);
      tempData.last_updt_user = dummyData.user.details.shortEmail;
      tempData.last_updt_dt = util.getServerTime();
      assessmentModel.updateTeamAssessment(dummyData.user.details.shortEmail, tempData, allTeams, userTeams)
        .then(function(body){
          expect(body).to.be.an('object');
          expect(body.id).equal(tempData._id);
          expect(body.ok).to.be.true;
          done();
        })
        .catch(function(err){
          done(err);
        });
    });
  });

  describe("assessment model [deleteAssessment] ", function(){
    it("delete assessment [non-existing assessment id]", function(done){
      assessmentModel.deleteAssessment(dummyData.user.details.shortEmail, invalidAssessId, del_assessment._rev, allTeams, userTeams)
        .catch(function(err){
          expect(err).to.have.property('error');
          expect(err.error).to.be.equal('not_found');
          done();
        });
    });

    it("delete assessment [empty assessment id]", function(done){
      assessmentModel.deleteAssessment(dummyData.user.details.shortEmail,'', del_assessment._rev, allTeams, userTeams)
        .catch(function(err){
          expect(err).to.have.property('error');
          expect(err.error).to.be.equal('No id/rev for record deletion.');
          done();
        });
    });

    it("delete assessment [non-existing revision id]", function(done){
      assessmentModel.deleteAssessment(dummyData.user.details.shortEmail, del_assessment._id, invalidRevisionId, allTeams, userTeams)
        .catch(function(err){
          expect(err).to.have.property('error');
          expect(err.error).to.be.equal('conflict');
          done();
        });
    });

    it("delete assessment [empty revision id]", function(done){
      assessmentModel.deleteAssessment(dummyData.user.details.shortEmail, del_assessment._id, '', allTeams, userTeams)
        .catch(function(err){
          expect(err).to.not.equal(null);
          expect(err).to.have.property('error');
          expect(err.error).to.be.equal('No id/rev for record deletion.');
          done();
        });
    });

    it("delete assessment [invalid assessment id and revision id]", function(done){
      assessmentModel.deleteAssessment(dummyData.user.details.shortEmail, invalidAssessId, invalidRevisionId, allTeams, userTeams)
        .catch(function(err){
          expect(err).to.have.property('error');
          expect(err.error).to.be.equal('not_found');
          done();
        });
    });

    it("delete assessment [valid assessment and revision id] using admin user", function(done){
      //make sure to have latest document revision id
      assessmentModel.deleteAssessment(adminList[0], del_assessment._id, del_assessment._rev, allTeams, userTeams)
        .then(function(body){
          expect(body).to.be.a('object');
          expect(body.ok).to.be.true;
          done();
        })
        .catch(function(err){
          done(err);
        });
    });
  });
});
