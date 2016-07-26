var chai = require('chai');

var expect = chai.expect;
var Promise = require('bluebird');
var assessmentModel = require('../../models/assessment');
var teamModel = require('../../models/teams');
var dummyData = require('../dummy-data.js');
var _ = require('underscore');
var timeout = 30000;
var currRevisionId = '';
var invalidTeamId ='team_12323';
var invalidAssessId ='assess_test';
var invalidRevisionId = '12-*219#';
var noId = {"type":"matassessmtrslt","team_id":"ag_team_JM_002_1466170971836","assessmt_version":"ag_ref_atma_components_v06","team_proj_ops":"Project","team_dlvr_software":"Yes","assessmt_status":"Submitted","submitter_id":"mondigjd@ph.ibm.com","self-assessmt_dt":"2016-07-11 00:00:01 EDT","ind_assessor_id":"","ind_assessmt_status":"","ind_assessmt_dt":"","created_dt":"2016-07-19 17:47:28 SGT","created_user":"mondigjd@ph.ibm.com","last_updt_dt":"2016-07-19 17:47:28 SGT","last_updt_user":"mondigjd@ph.ibm.com","doc_status":"","assessmt_cmpnt_rslts":[{"assessed_cmpnt_name":"Team Agile Leadership and Collaboration - Projects","assessed_cmpnt_tbl":[{"principle_id":"1","principle_name":"Collaboration and Teamwork","practice_id":"1","practice_name":"Standups","cur_mat_lvl_achieved":"Practicing","cur_mat_lvl_score":2,"tar_mat_lvl_achieved":"Transforming","tar_mat_lvl_score":3,"ind_mat_lvl_achieved":"","ind_target_mat_lvl_score":0,"how_better_action_item":"","ind_assessor_cmnt":""},{"principle_id":"1","principle_name":"Collaboration and Teamwork","practice_id":"2","practice_name":"Walls of Work","cur_mat_lvl_achieved":"Practicing","cur_mat_lvl_score":2,"tar_mat_lvl_achieved":"Transforming","tar_mat_lvl_score":3,"ind_mat_lvl_achieved":"","ind_target_mat_lvl_score":0,"how_better_action_item":"","ind_assessor_cmnt":""},{"principle_id":"2","principle_name":"Focus on the Customer and Business Value","practice_id":"3","practice_name":"Engaging the Product Owner","cur_mat_lvl_achieved":"Transforming","cur_mat_lvl_score":3,"tar_mat_lvl_achieved":"Scaling","tar_mat_lvl_score":4,"ind_mat_lvl_achieved":"","ind_target_mat_lvl_score":0,"how_better_action_item":"","ind_assessor_cmnt":""},{"principle_id":"2","principle_name":"Focus on the Customer and Business Value","practice_id":"4","practice_name":"Backlog Refinement","cur_mat_lvl_achieved":"Practicing","cur_mat_lvl_score":2,"tar_mat_lvl_achieved":"Transforming","tar_mat_lvl_score":3,"ind_mat_lvl_achieved":"","ind_target_mat_lvl_score":0,"how_better_action_item":"","ind_assessor_cmnt":""},{"principle_id":"3","principle_name":"Flexible, Adaptive and Continuously Improving","practice_id":"5","practice_name":"Release and Iteration Planning","cur_mat_lvl_achieved":"Transforming","cur_mat_lvl_score":3,"tar_mat_lvl_achieved":"Scaling","tar_mat_lvl_score":4,"ind_mat_lvl_achieved":"","ind_target_mat_lvl_score":0,"how_better_action_item":"","ind_assessor_cmnt":""},{"principle_id":"3","principle_name":"Flexible, Adaptive and Continuously Improving","practice_id":"6","practice_name":"Retrospectives","cur_mat_lvl_achieved":"Practicing","cur_mat_lvl_score":2,"tar_mat_lvl_achieved":"Transforming","tar_mat_lvl_score":3,"ind_mat_lvl_achieved":"","ind_target_mat_lvl_score":0,"how_better_action_item":"","ind_assessor_cmnt":""},{"principle_id":"3","principle_name":"Flexible, Adaptive and Continuously Improving","practice_id":"7","practice_name":"Work Estimation (Relative Estimates)","cur_mat_lvl_achieved":"Practicing","cur_mat_lvl_score":2,"tar_mat_lvl_achieved":"Transforming","tar_mat_lvl_score":3,"ind_mat_lvl_achieved":"","ind_target_mat_lvl_score":0,"how_better_action_item":"","ind_assessor_cmnt":""},{"principle_id":"4","principle_name":"Iterative and Fast","practice_id":"8","practice_name":"Story Cards","cur_mat_lvl_achieved":"Practicing","cur_mat_lvl_score":2,"tar_mat_lvl_achieved":"Transforming","tar_mat_lvl_score":3,"ind_mat_lvl_achieved":"","ind_target_mat_lvl_score":0,"how_better_action_item":"","ind_assessor_cmnt":""},{"principle_id":"5","principle_name":"Empowered and Self Directed Teams","practice_id":"9","practice_name":"Stable Cross-Functional Teams","cur_mat_lvl_achieved":"Transforming","cur_mat_lvl_score":3,"tar_mat_lvl_achieved":"Scaling","tar_mat_lvl_score":4,"ind_mat_lvl_achieved":"","ind_target_mat_lvl_score":0,"how_better_action_item":"","ind_assessor_cmnt":""},{"principle_id":"5","principle_name":"Empowered and Self Directed Teams","practice_id":"10","practice_name":"Social Contract","cur_mat_lvl_achieved":"Practicing","cur_mat_lvl_score":2,"tar_mat_lvl_achieved":"Transforming","tar_mat_lvl_score":3,"ind_mat_lvl_achieved":"","ind_target_mat_lvl_score":0,"how_better_action_item":"","ind_assessor_cmnt":""},{"principle_id":"5","principle_name":"Empowered and Self Directed Teams","practice_id":"11","practice_name":"Risk and Issue Management","cur_mat_lvl_achieved":"Transforming","cur_mat_lvl_score":3,"tar_mat_lvl_achieved":"Scaling","tar_mat_lvl_score":4,"ind_mat_lvl_achieved":"","ind_target_mat_lvl_score":0,"how_better_action_item":"","ind_assessor_cmnt":""}],"ovralcur_assessmt_score":"2.4","ovraltar_assessmt_score":"3.4"},{"assessed_cmpnt_name":"Team Delivery","assessed_cmpnt_tbl":[{"principle_id":"1","principle_name":"Continuous Development","practice_id":"1","practice_name":"Automated builds & Continuous Integration","cur_mat_lvl_achieved":"Practicing","cur_mat_lvl_score":2,"tar_mat_lvl_achieved":"Transforming","tar_mat_lvl_score":3,"ind_mat_lvl_achieved":"","ind_target_mat_lvl_score":0,"how_better_action_item":"","ind_assessor_cmnt":""},{"principle_id":"1","principle_name":"Continuous Development","practice_id":"2","practice_name":"Managing Technical Debt","cur_mat_lvl_achieved":"Transforming","cur_mat_lvl_score":3,"tar_mat_lvl_achieved":"Scaling","tar_mat_lvl_score":4,"ind_mat_lvl_achieved":"","ind_target_mat_lvl_score":0,"how_better_action_item":"","ind_assessor_cmnt":""},{"principle_id":"1","principle_name":"Continuous Development","practice_id":"3","practice_name":"Dev & Ops Collaboration / Shared Understanding","cur_mat_lvl_achieved":"Transforming","cur_mat_lvl_score":3,"tar_mat_lvl_achieved":"Scaling","tar_mat_lvl_score":4,"ind_mat_lvl_achieved":"","ind_target_mat_lvl_score":0,"how_better_action_item":"","ind_assessor_cmnt":""},{"principle_id":"1","principle_name":"Continuous Development","practice_id":"4","practice_name":"Infrastructure Automation / Provisioning","cur_mat_lvl_achieved":"Initiating","cur_mat_lvl_score":1,"tar_mat_lvl_achieved":"Practicing","tar_mat_lvl_score":2,"ind_mat_lvl_achieved":"","ind_target_mat_lvl_score":0,"how_better_action_item":"","ind_assessor_cmnt":""},{"principle_id":"2","principle_name":"Continuous Testing","practice_id":"5","practice_name":"Automated Testing","cur_mat_lvl_achieved":"Practicing","cur_mat_lvl_score":2,"tar_mat_lvl_achieved":"Transforming","tar_mat_lvl_score":3,"ind_mat_lvl_achieved":"","ind_target_mat_lvl_score":0,"how_better_action_item":"","ind_assessor_cmnt":""},{"principle_id":"3","principle_name":"Continuous Release & Deployment","practice_id":"6","practice_name":"Automated Deployments","cur_mat_lvl_achieved":"Practicing","cur_mat_lvl_score":2,"tar_mat_lvl_achieved":"Transforming","tar_mat_lvl_score":3,"ind_mat_lvl_achieved":"","ind_target_mat_lvl_score":0,"how_better_action_item":"","ind_assessor_cmnt":""},{"principle_id":"4","principle_name":"Continuous Feedback & Optimization","practice_id":"7","practice_name":"Customer Feedback","cur_mat_lvl_achieved":"Practicing","cur_mat_lvl_score":2,"tar_mat_lvl_achieved":"Transforming","tar_mat_lvl_score":3,"ind_mat_lvl_achieved":"","ind_target_mat_lvl_score":0,"how_better_action_item":"","ind_assessor_cmnt":""},{"principle_id":"5","principle_name":"Continuous Monitoring","practice_id":"8","practice_name":"Monitoring of Environments","cur_mat_lvl_achieved":"Practicing","cur_mat_lvl_score":2,"tar_mat_lvl_achieved":"Transforming","tar_mat_lvl_score":3,"ind_mat_lvl_achieved":"","ind_target_mat_lvl_score":0,"how_better_action_item":"","ind_assessor_cmnt":""}],"ovralcur_assessmt_score":"2.1","ovraltar_assessmt_score":"3.1"}],"assessmt_action_plan_tbl":[
]};
var teamData = {name:'JM Test Team',desc:'JM Test Team',squadteam:'Yes'};
var curr_assessment = {'_id':'','type':'matassessmtrslt','team_id':'','assessmt_version':'ag_ref_atma_components_v06','team_proj_ops':'Project','team_dlvr_software':'Yes','assessmt_status':'Submitted','submitter_id':'mondigjd@ph.ibm.com','self-assessmt_dt':'2016-07-11 00:00:01 EDT','ind_assessor_id':'','ind_assessmt_status':'','ind_assessmt_dt':'','created_dt':'2016-07-19 17:47:28 SGT','created_user':'mondigjd@ph.ibm.com','last_updt_dt':'2016-07-19 17:47:28 SGT','last_updt_user':'mondigjd@ph.ibm.com','doc_status':'','assessmt_cmpnt_rslts':[{'assessed_cmpnt_name':'Team Agile Leadership and Collaboration - Projects','assessed_cmpnt_tbl':[{'principle_id':'1','principle_name':'Collaboration and Teamwork','practice_id':'1','practice_name':'Standups','cur_mat_lvl_achieved':'Practicing','cur_mat_lvl_score':3,'tar_mat_lvl_achieved':'Transforming','tar_mat_lvl_score':4,'ind_mat_lvl_achieved':'','ind_target_mat_lvl_score':0,'how_better_action_item':'','ind_assessor_cmnt':''},{'principle_id':'1','principle_name':'Collaboration and Teamwork','practice_id':'2','practice_name':'Walls of Work','cur_mat_lvl_achieved':'Practicing','cur_mat_lvl_score':2,'tar_mat_lvl_achieved':'Transforming','tar_mat_lvl_score':3,'ind_mat_lvl_achieved':'','ind_target_mat_lvl_score':0,'how_better_action_item':'','ind_assessor_cmnt':''},{'principle_id':'2','principle_name':'Focus on the Customer and Business Value','practice_id':'3','practice_name':'Engaging the Product Owner','cur_mat_lvl_achieved':'Transforming','cur_mat_lvl_score':3,'tar_mat_lvl_achieved':'Scaling','tar_mat_lvl_score':4,'ind_mat_lvl_achieved':'','ind_target_mat_lvl_score':0,'how_better_action_item':'','ind_assessor_cmnt':''},{'principle_id':'2','principle_name':'Focus on the Customer and Business Value','practice_id':'4','practice_name':'Backlog Refinement','cur_mat_lvl_achieved':'Practicing','cur_mat_lvl_score':2,'tar_mat_lvl_achieved':'Transforming','tar_mat_lvl_score':3,'ind_mat_lvl_achieved':'','ind_target_mat_lvl_score':0,'how_better_action_item':'','ind_assessor_cmnt':''},{'principle_id':'3','principle_name':'Flexible, Adaptive and Continuously Improving','practice_id':'5','practice_name':'Release and Iteration Planning','cur_mat_lvl_achieved':'Transforming','cur_mat_lvl_score':3,'tar_mat_lvl_achieved':'Scaling','tar_mat_lvl_score':4,'ind_mat_lvl_achieved':'','ind_target_mat_lvl_score':0,'how_better_action_item':'','ind_assessor_cmnt':''},{'principle_id':'3','principle_name':'Flexible, Adaptive and Continuously Improving','practice_id':'6','practice_name':'Retrospectives','cur_mat_lvl_achieved':'Practicing','cur_mat_lvl_score':2,'tar_mat_lvl_achieved':'Transforming','tar_mat_lvl_score':3,'ind_mat_lvl_achieved':'','ind_target_mat_lvl_score':0,'how_better_action_item':'','ind_assessor_cmnt':''},{'principle_id':'3','principle_name':'Flexible, Adaptive and Continuously Improving','practice_id':'7','practice_name':'Work Estimation (Relative Estimates)','cur_mat_lvl_achieved':'Practicing','cur_mat_lvl_score':2,'tar_mat_lvl_achieved':'Transforming','tar_mat_lvl_score':3,'ind_mat_lvl_achieved':'','ind_target_mat_lvl_score':0,'how_better_action_item':'','ind_assessor_cmnt':''},{'principle_id':'4','principle_name':'Iterative and Fast','practice_id':'8','practice_name':'Story Cards','cur_mat_lvl_achieved':'Practicing','cur_mat_lvl_score':2,'tar_mat_lvl_achieved':'Transforming','tar_mat_lvl_score':3,'ind_mat_lvl_achieved':'','ind_target_mat_lvl_score':0,'how_better_action_item':'','ind_assessor_cmnt':''},{'principle_id':'5','principle_name':'Empowered and Self Directed Teams','practice_id':'9','practice_name':'Stable Cross-Functional Teams','cur_mat_lvl_achieved':'Transforming','cur_mat_lvl_score':3,'tar_mat_lvl_achieved':'Scaling','tar_mat_lvl_score':4,'ind_mat_lvl_achieved':'','ind_target_mat_lvl_score':0,'how_better_action_item':'','ind_assessor_cmnt':''},{'principle_id':'5','principle_name':'Empowered and Self Directed Teams','practice_id':'10','practice_name':'Social Contract','cur_mat_lvl_achieved':'Practicing','cur_mat_lvl_score':2,'tar_mat_lvl_achieved':'Transforming','tar_mat_lvl_score':3,'ind_mat_lvl_achieved':'','ind_target_mat_lvl_score':0,'how_better_action_item':'','ind_assessor_cmnt':''},{'principle_id':'5','principle_name':'Empowered and Self Directed Teams','practice_id':'11','practice_name':'Risk and Issue Management','cur_mat_lvl_achieved':'Transforming','cur_mat_lvl_score':3,'tar_mat_lvl_achieved':'Scaling','tar_mat_lvl_score':4,'ind_mat_lvl_achieved':'','ind_target_mat_lvl_score':0,'how_better_action_item':'','ind_assessor_cmnt':''}],'ovralcur_assessmt_score':'2.4','ovraltar_assessmt_score':'3.4'},{'assessed_cmpnt_name':'Team Delivery','assessed_cmpnt_tbl':[{'principle_id':'1','principle_name':'Continuous Development','practice_id':'1','practice_name':'Automated builds & Continuous Integration','cur_mat_lvl_achieved':'Practicing','cur_mat_lvl_score':2,'tar_mat_lvl_achieved':'Transforming','tar_mat_lvl_score':3,'ind_mat_lvl_achieved':'','ind_target_mat_lvl_score':0,'how_better_action_item':'','ind_assessor_cmnt':''},{'principle_id':'1','principle_name':'Continuous Development','practice_id':'2','practice_name':'Managing Technical Debt','cur_mat_lvl_achieved':'Transforming','cur_mat_lvl_score':3,'tar_mat_lvl_achieved':'Scaling','tar_mat_lvl_score':4,'ind_mat_lvl_achieved':'','ind_target_mat_lvl_score':0,'how_better_action_item':'','ind_assessor_cmnt':''},{'principle_id':'1','principle_name':'Continuous Development','practice_id':'3','practice_name':'Dev & Ops Collaboration / Shared Understanding','cur_mat_lvl_achieved':'Transforming','cur_mat_lvl_score':3,'tar_mat_lvl_achieved':'Scaling','tar_mat_lvl_score':4,'ind_mat_lvl_achieved':'','ind_target_mat_lvl_score':0,'how_better_action_item':'','ind_assessor_cmnt':''},{'principle_id':'1','principle_name':'Continuous Development','practice_id':'4','practice_name':'Infrastructure Automation / Provisioning','cur_mat_lvl_achieved':'Initiating','cur_mat_lvl_score':1,'tar_mat_lvl_achieved':'Practicing','tar_mat_lvl_score':2,'ind_mat_lvl_achieved':'','ind_target_mat_lvl_score':0,'how_better_action_item':'','ind_assessor_cmnt':''},{'principle_id':'2','principle_name':'Continuous Testing','practice_id':'5','practice_name':'Automated Testing','cur_mat_lvl_achieved':'Practicing','cur_mat_lvl_score':2,'tar_mat_lvl_achieved':'Transforming','tar_mat_lvl_score':3,'ind_mat_lvl_achieved':'','ind_target_mat_lvl_score':0,'how_better_action_item':'','ind_assessor_cmnt':''},{'principle_id':'3','principle_name':'Continuous Release & Deployment','practice_id':'6','practice_name':'Automated Deployments','cur_mat_lvl_achieved':'Practicing','cur_mat_lvl_score':2,'tar_mat_lvl_achieved':'Transforming','tar_mat_lvl_score':3,'ind_mat_lvl_achieved':'','ind_target_mat_lvl_score':0,'how_better_action_item':'','ind_assessor_cmnt':''},{'principle_id':'4','principle_name':'Continuous Feedback & Optimization','practice_id':'7','practice_name':'Customer Feedback','cur_mat_lvl_achieved':'Practicing','cur_mat_lvl_score':2,'tar_mat_lvl_achieved':'Transforming','tar_mat_lvl_score':3,'ind_mat_lvl_achieved':'','ind_target_mat_lvl_score':0,'how_better_action_item':'','ind_assessor_cmnt':''},{'principle_id':'5','principle_name':'Continuous Monitoring','practice_id':'8','practice_name':'Monitoring of Environments','cur_mat_lvl_achieved':'Practicing','cur_mat_lvl_score':2,'tar_mat_lvl_achieved':'Transforming','tar_mat_lvl_score':3,'ind_mat_lvl_achieved':'','ind_target_mat_lvl_score':0,'how_better_action_item':'','ind_assessor_cmnt':''}],'ovralcur_assessmt_score':'2.1','ovraltar_assessmt_score':'3.1'}],'assessmt_action_plan_tbl':[
]};

describe("assessment models [getAssessmentTemplate]", function(){
  this.timeout(timeout);
  it("retrieve assessment template", function(done){
    assessmentModel.getAssessmentTemplate()
      .then(function(body){
        expect(body).to.be.a('object');
        expect(body).to.have.property('rows');
      })
      .catch(function(err){
        expect(err.error).to.be.equal('undefined');
      })
      .finally(function(){
        done();
      });
  });
});

describe("assessment model [addTeamAssessment] ", function(){
  this.timeout(timeout);
  it("team data preparation", function(done){
    var teamId;
    var revDelete;
    teamModel.getName(teamData.name)
    .then(function(body){
      if (_.isEmpty(body)){
        return teamModel.createTeam(teamData, dummyData.user.details);
      }
      else{
        return body;
      }
    })
    .then(function(body){
      if (Array.isArray(body)){
        teamId  = body[0].id;
      }
      else{
        teamId = body._id;
      }
      //set current team id for assessment
      curr_assessment.team_id = teamId;
      curr_assessment._id = 'ag_mar_'+teamId+'_1469112933083';
      return assessmentModel.getAssessment(curr_assessment._id);
    })
    .then(function(body){
      return assessmentModel.deleteAssessment(body._id, body._rev);
    })
    .catch(function(err){
      console.log(err);
    })
    .finally(function(){
      console.log('team data preparation done. '+curr_assessment._id+' for team '+curr_assessment.team_id);
      done();
    });
  });

  it("add assessment [no assessment id]", function(done){
    assessmentModel.addTeamAssessment(noId)
      .then(function(body){
        expect(body).to.be.equal(null);
      })
      .catch(function(err){
        expect(err).to.have.property('error');
        expect(err.error._id[0]).to.be.equal(' id can\'t be blank');
      })
      .finally(function(){
        done();
      })
  });

  it("add assessment [empty assessment id]", function(done){
    var emptyId = _.clone(curr_assessment);
    emptyId._id = '';
    assessmentModel.addTeamAssessment(emptyId)
      .then(function(body){
        expect(body).to.be.equal(null);
      })
      .catch(function(err){
        expect(err).to.not.equal(null);
        expect(err).to.have.property('error');
        expect(err.error._id[0]).to.be.equal(' id can\'t be blank');
      })
      .finally(function(){
        done();
      })
  });

  it("add assessment [valid assessment data]", function(done){
    assessmentModel.addTeamAssessment(curr_assessment)
    .then(function(body){
      expect(body).to.be.a('object');
      expect(body.ok).to.be.true;
      expect(body.id).to.be.equal(curr_assessment._id);
      currRevisionId = body.rev;
    })
    .catch(function(err){
      expect(err.error).to.be.an('conflict');
    })
    .finally(function(){
      done();
    });
  });

  it("add assessment [duplicate assessment id]", function(done){
    assessmentModel.addTeamAssessment(curr_assessment)
      .then(function(body){
        expect(body).to.be.equal(null);
      })
      .catch(function(err){
        expect(err.error).to.be.equal('conflict');
      })
      .finally(function(){
        done();
      });
  });
});

describe("assessment models [getTeamAssessments]", function(){ 
  this.timeout(timeout);
  it("retrieve team assessments [valid team id]", function(done){
    assessmentModel.getTeamAssessments(curr_assessment.team_id)
      .then(function(body){
        expect(body).to.be.a('object');
        expect(body).to.have.property('rows');
        expect(body.rows[0].key).to.be.equal(teamData._id);
      })
      .catch(function(err){
        expect(err.error).to.be.an('undefined');
      })
      .finally(function(){
        done();
      });
  });

  it("retrieve team assessments [non-existing team id]", function(done){
    assessmentModel.getTeamAssessments(invalidTeamId)
      .then(function(body){
        expect(body.rows).to.be.empty;
      })
      .catch(function(err){
        expect(err.error).to.be.an('undefined');
      })
      .finally(function(){
        done();
      })
  });

  it("retrieve team assessments [empty team id]", function(done){
    assessmentModel.getTeamAssessments('')
      .then(function(body){
        expect(body).to.be.equal(null);
      })
      .catch(function(err){
        expect(err).to.not.equal(null);
        expect(err).to.have.property('error');
        expect(err.error).to.be.equal('No team id provided.');
      })
      .finally(function(){
        done();
      })
  });
});
  
describe("assessment model [getAssessment] ", function(){ 
  this.timeout(timeout);
  
  it("retrieve assessment [non-existing assessment id]", function(done){
    assessmentModel.getAssessment(invalidAssessId)
      .then(function(body){
        expect(body.rows).to.be.empty;
      })
      .catch(function(err){
        expect(err).to.have.property('error');
      })
      .finally(function(){
        done();
      })
  });

  it("retrieve assessment [empty assessment id]", function(done){
    assessmentModel.getAssessment('')
      .then(function(body){
        expect(body).to.be.equal(null);
      })
      .catch(function(err){
        expect(err).to.not.equal(null);
        expect(err).to.have.property('error');
        expect(err.error).to.be.equal('No assessment id provided.');
      })
      .finally(function(){
        done();
      })
  });

  it("retrieve assessment [valid assessment id]", function(done){
    assessmentModel.getAssessment(curr_assessment._id)
      .then(function(body){
        expect(body).to.be.a('object');
        expect(body._id).equal(curr_assessment._id);
        currRevisionId = body._rev;
      })
      .catch(function(err){
        expect(err.error).to.be.equal('not_found');
      })
      .finally(function(){
        done();
      });
  });

});

describe("assessment model [updateTeamAssessment] ", function(){
  this.timeout(timeout);
  it("update assessment [no assessment id]", function(done){
    assessmentModel.updateTeamAssessment(noId)
      .then(function(body){
        expect(body).to.be.equal(null);
      })
      .catch(function(err){
        expect(err).to.have.property('error');
        expect(err.error._id[0]).to.be.equal(' id can\'t be blank');
      })
      .finally(function(){
        done();
      })
  });

  it("update assessment [empty assessment id]", function(done){
    var tempData = _.clone(curr_assessment);
    tempData._id='';
    assessmentModel.updateTeamAssessment(tempData)
      .then(function(body){
        expect(body).to.be.equal(null);
      })
      .catch(function(err){
        expect(err).to.not.equal(null);
        expect(err).to.have.property('error');
        expect(err.error._id[0]).to.be.equal(' id can\'t be blank');
      })
      .finally(function(){
        done();
      })
  });

  it("update assessment [valid assessment data]", function(done){
    //make sure to have latest document revision id
    var tempData = _.clone(curr_assessment);
    tempData.last_updt_user = dummyData.user.details.shortEmail;
    tempData._rev = currRevisionId;
    assessmentModel.updateTeamAssessment(tempData)
      .then(function(body){
        expect(body).to.be.a('object');
        expect(body.id).equal(tempData._id);
        expect(body.ok).to.be.true;
        currRevisionId = body.rev;
      })
      .catch(function(err){
        expect(err.error).to.be.equal('conflict');
      })
      .finally(function(){
        done();
      });
  });
});

describe("assessment model [deleteAssessment] ", function(){
  this.timeout(timeout);
  it("delete assessment [non-existing assessment id]", function(done){
    assessmentModel.deleteAssessment(invalidAssessId, currRevisionId)
      .then(function(body){
        expect(body).to.be.equal(null);
      })
      .catch(function(err){
        expect(err).to.have.property('error');
        expect(err.error).to.be.equal('not_found');
      })
      .finally(function(){
        done();
      })
  });

  it("delete assessment [empty assessment id]", function(done){
    assessmentModel.deleteAssessment('', currRevisionId)
      .then(function(body){
        expect(body).to.be.equal(null);
      })
      .catch(function(err){
        expect(err).to.have.property('error');
        expect(err.error).to.be.equal('No id/rev for record deletion.');
      })
      .finally(function(){
        done();
      })
  });

  it("delete assessment [non-existing revision id]", function(done){
    assessmentModel.deleteAssessment(curr_assessment._id, invalidRevisionId)
      .then(function(body){
        expect(body).to.be.equal(null);
      })
      .catch(function(err){
        expect(err).to.have.property('error');
        expect(err.error).to.be.equal('conflict');
      })
      .finally(function(){
        done();
      })
  });

  it("delete assessment [empty revision id]", function(done){
    assessmentModel.deleteAssessment(curr_assessment._id, '')
      .then(function(body){
        expect(body).to.be.equal(null);
      })
      .catch(function(err){
        expect(err).to.not.equal(null);
        expect(err).to.have.property('error');
        expect(err.error).to.be.equal('No id/rev for record deletion.');
      })
      .finally(function(){
        done();
      })
  });

  it("delete assessment [invalid assessment id and revision id]", function(done){
    assessmentModel.deleteAssessment(invalidAssessId, invalidRevisionId)
      .then(function(body){
        expect(body).to.be.equal(null);
      })
      .catch(function(err){
        expect(err).to.have.property('error');
        expect(err.error).to.be.equal('not_found');
      })
      .finally(function(){
        done();
      })
  });
  
  it("delete assessment [valid assessment and revision id]", function(done){
    //make sure to have latest document revision id
    assessmentModel.deleteAssessment(curr_assessment._id, currRevisionId)
      .then(function(body){
        expect(body).to.be.a('object');
        expect(body.ok).to.be.true;
      })
      .catch(function(err){
        expect(err.error).to.be.an('not_found');
      })
      .finally(function(){
        done();
      });
    });
});