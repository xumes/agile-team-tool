var querystring = require('querystring');
var chai = require('chai');
var expect = chai.expect;
var app = require('../../../app');
var request = require('supertest');
var dummyData = require('../../dummy-data.js');
var teamModel = require('../../../models/teams');
var assessmentModel = require('../../../models/assessment');
var _ = require('underscore');

var currRevisionId = '';
var invalidTeamId ='team_12323';
var invalidAssessId ='assess_test';
var invalidRevisionId = '12-*219#';
var noId = {"type":"matassessmtrslt","team_id":"ag_team_JM_002_1466170971836","assessmt_version":"ag_ref_atma_components_v06","team_proj_ops":"Project","team_dlvr_software":"Yes","assessmt_status":"Submitted","submitter_id":"mondigjd@ph.ibm.com","self-assessmt_dt":"2016-07-11 00:00:01 EDT","ind_assessor_id":"","ind_assessmt_status":"","ind_assessmt_dt":"","created_dt":"2016-07-19 17:47:28 SGT","created_user":"mondigjd@ph.ibm.com","last_updt_dt":"2016-07-19 17:47:28 SGT","last_updt_user":"mondigjd@ph.ibm.com","doc_status":"","assessmt_cmpnt_rslts":[{"assessed_cmpnt_name":"Team Agile Leadership and Collaboration - Projects","assessed_cmpnt_tbl":[{"principle_id":"1","principle_name":"Collaboration and Teamwork","practice_id":"1","practice_name":"Standups","cur_mat_lvl_achieved":"Practicing","cur_mat_lvl_score":2,"tar_mat_lvl_achieved":"Transforming","tar_mat_lvl_score":3,"ind_mat_lvl_achieved":"","ind_target_mat_lvl_score":0,"how_better_action_item":"","ind_assessor_cmnt":""},{"principle_id":"1","principle_name":"Collaboration and Teamwork","practice_id":"2","practice_name":"Walls of Work","cur_mat_lvl_achieved":"Practicing","cur_mat_lvl_score":2,"tar_mat_lvl_achieved":"Transforming","tar_mat_lvl_score":3,"ind_mat_lvl_achieved":"","ind_target_mat_lvl_score":0,"how_better_action_item":"","ind_assessor_cmnt":""},{"principle_id":"2","principle_name":"Focus on the Customer and Business Value","practice_id":"3","practice_name":"Engaging the Product Owner","cur_mat_lvl_achieved":"Transforming","cur_mat_lvl_score":3,"tar_mat_lvl_achieved":"Scaling","tar_mat_lvl_score":4,"ind_mat_lvl_achieved":"","ind_target_mat_lvl_score":0,"how_better_action_item":"","ind_assessor_cmnt":""},{"principle_id":"2","principle_name":"Focus on the Customer and Business Value","practice_id":"4","practice_name":"Backlog Refinement","cur_mat_lvl_achieved":"Practicing","cur_mat_lvl_score":2,"tar_mat_lvl_achieved":"Transforming","tar_mat_lvl_score":3,"ind_mat_lvl_achieved":"","ind_target_mat_lvl_score":0,"how_better_action_item":"","ind_assessor_cmnt":""},{"principle_id":"3","principle_name":"Flexible, Adaptive and Continuously Improving","practice_id":"5","practice_name":"Release and Iteration Planning","cur_mat_lvl_achieved":"Transforming","cur_mat_lvl_score":3,"tar_mat_lvl_achieved":"Scaling","tar_mat_lvl_score":4,"ind_mat_lvl_achieved":"","ind_target_mat_lvl_score":0,"how_better_action_item":"","ind_assessor_cmnt":""},{"principle_id":"3","principle_name":"Flexible, Adaptive and Continuously Improving","practice_id":"6","practice_name":"Retrospectives","cur_mat_lvl_achieved":"Practicing","cur_mat_lvl_score":2,"tar_mat_lvl_achieved":"Transforming","tar_mat_lvl_score":3,"ind_mat_lvl_achieved":"","ind_target_mat_lvl_score":0,"how_better_action_item":"","ind_assessor_cmnt":""},{"principle_id":"3","principle_name":"Flexible, Adaptive and Continuously Improving","practice_id":"7","practice_name":"Work Estimation (Relative Estimates)","cur_mat_lvl_achieved":"Practicing","cur_mat_lvl_score":2,"tar_mat_lvl_achieved":"Transforming","tar_mat_lvl_score":3,"ind_mat_lvl_achieved":"","ind_target_mat_lvl_score":0,"how_better_action_item":"","ind_assessor_cmnt":""},{"principle_id":"4","principle_name":"Iterative and Fast","practice_id":"8","practice_name":"Story Cards","cur_mat_lvl_achieved":"Practicing","cur_mat_lvl_score":2,"tar_mat_lvl_achieved":"Transforming","tar_mat_lvl_score":3,"ind_mat_lvl_achieved":"","ind_target_mat_lvl_score":0,"how_better_action_item":"","ind_assessor_cmnt":""},{"principle_id":"5","principle_name":"Empowered and Self Directed Teams","practice_id":"9","practice_name":"Stable Cross-Functional Teams","cur_mat_lvl_achieved":"Transforming","cur_mat_lvl_score":3,"tar_mat_lvl_achieved":"Scaling","tar_mat_lvl_score":4,"ind_mat_lvl_achieved":"","ind_target_mat_lvl_score":0,"how_better_action_item":"","ind_assessor_cmnt":""},{"principle_id":"5","principle_name":"Empowered and Self Directed Teams","practice_id":"10","practice_name":"Social Contract","cur_mat_lvl_achieved":"Practicing","cur_mat_lvl_score":2,"tar_mat_lvl_achieved":"Transforming","tar_mat_lvl_score":3,"ind_mat_lvl_achieved":"","ind_target_mat_lvl_score":0,"how_better_action_item":"","ind_assessor_cmnt":""},{"principle_id":"5","principle_name":"Empowered and Self Directed Teams","practice_id":"11","practice_name":"Risk and Issue Management","cur_mat_lvl_achieved":"Transforming","cur_mat_lvl_score":3,"tar_mat_lvl_achieved":"Scaling","tar_mat_lvl_score":4,"ind_mat_lvl_achieved":"","ind_target_mat_lvl_score":0,"how_better_action_item":"","ind_assessor_cmnt":""}],"ovralcur_assessmt_score":"2.4","ovraltar_assessmt_score":"3.4"},{"assessed_cmpnt_name":"Team Delivery","assessed_cmpnt_tbl":[{"principle_id":"1","principle_name":"Continuous Development","practice_id":"1","practice_name":"Automated builds & Continuous Integration","cur_mat_lvl_achieved":"Practicing","cur_mat_lvl_score":2,"tar_mat_lvl_achieved":"Transforming","tar_mat_lvl_score":3,"ind_mat_lvl_achieved":"","ind_target_mat_lvl_score":0,"how_better_action_item":"","ind_assessor_cmnt":""},{"principle_id":"1","principle_name":"Continuous Development","practice_id":"2","practice_name":"Managing Technical Debt","cur_mat_lvl_achieved":"Transforming","cur_mat_lvl_score":3,"tar_mat_lvl_achieved":"Scaling","tar_mat_lvl_score":4,"ind_mat_lvl_achieved":"","ind_target_mat_lvl_score":0,"how_better_action_item":"","ind_assessor_cmnt":""},{"principle_id":"1","principle_name":"Continuous Development","practice_id":"3","practice_name":"Dev & Ops Collaboration / Shared Understanding","cur_mat_lvl_achieved":"Transforming","cur_mat_lvl_score":3,"tar_mat_lvl_achieved":"Scaling","tar_mat_lvl_score":4,"ind_mat_lvl_achieved":"","ind_target_mat_lvl_score":0,"how_better_action_item":"","ind_assessor_cmnt":""},{"principle_id":"1","principle_name":"Continuous Development","practice_id":"4","practice_name":"Infrastructure Automation / Provisioning","cur_mat_lvl_achieved":"Initiating","cur_mat_lvl_score":1,"tar_mat_lvl_achieved":"Practicing","tar_mat_lvl_score":2,"ind_mat_lvl_achieved":"","ind_target_mat_lvl_score":0,"how_better_action_item":"","ind_assessor_cmnt":""},{"principle_id":"2","principle_name":"Continuous Testing","practice_id":"5","practice_name":"Automated Testing","cur_mat_lvl_achieved":"Practicing","cur_mat_lvl_score":2,"tar_mat_lvl_achieved":"Transforming","tar_mat_lvl_score":3,"ind_mat_lvl_achieved":"","ind_target_mat_lvl_score":0,"how_better_action_item":"","ind_assessor_cmnt":""},{"principle_id":"3","principle_name":"Continuous Release & Deployment","practice_id":"6","practice_name":"Automated Deployments","cur_mat_lvl_achieved":"Practicing","cur_mat_lvl_score":2,"tar_mat_lvl_achieved":"Transforming","tar_mat_lvl_score":3,"ind_mat_lvl_achieved":"","ind_target_mat_lvl_score":0,"how_better_action_item":"","ind_assessor_cmnt":""},{"principle_id":"4","principle_name":"Continuous Feedback & Optimization","practice_id":"7","practice_name":"Customer Feedback","cur_mat_lvl_achieved":"Practicing","cur_mat_lvl_score":2,"tar_mat_lvl_achieved":"Transforming","tar_mat_lvl_score":3,"ind_mat_lvl_achieved":"","ind_target_mat_lvl_score":0,"how_better_action_item":"","ind_assessor_cmnt":""},{"principle_id":"5","principle_name":"Continuous Monitoring","practice_id":"8","practice_name":"Monitoring of Environments","cur_mat_lvl_achieved":"Practicing","cur_mat_lvl_score":2,"tar_mat_lvl_achieved":"Transforming","tar_mat_lvl_score":3,"ind_mat_lvl_achieved":"","ind_target_mat_lvl_score":0,"how_better_action_item":"","ind_assessor_cmnt":""}],"ovralcur_assessmt_score":"2.1","ovraltar_assessmt_score":"3.1"}],"assessmt_action_plan_tbl":[
]};
var teamData = {name:'JM Test Team',desc:'JM Test Team',squadteam:'Yes'};
var curr_assessment = {'_id':'','type':'matassessmtrslt','team_id':'','assessmt_version':'ag_ref_atma_components_v06','team_proj_ops':'Project','team_dlvr_software':'Yes','assessmt_status':'Submitted','submitter_id':'mondigjd@ph.ibm.com','self-assessmt_dt':'2016-07-11 00:00:01 EDT','ind_assessor_id':'','ind_assessmt_status':'','ind_assessmt_dt':'','created_dt':'2016-07-19 17:47:28 SGT','created_user':'mondigjd@ph.ibm.com','last_updt_dt':'2016-07-19 17:47:28 SGT','last_updt_user':'mondigjd@ph.ibm.com','doc_status':'','assessmt_cmpnt_rslts':[{'assessed_cmpnt_name':'Team Agile Leadership and Collaboration - Projects','assessed_cmpnt_tbl':[{'principle_id':'1','principle_name':'Collaboration and Teamwork','practice_id':'1','practice_name':'Standups','cur_mat_lvl_achieved':'Practicing','cur_mat_lvl_score':3,'tar_mat_lvl_achieved':'Transforming','tar_mat_lvl_score':4,'ind_mat_lvl_achieved':'','ind_target_mat_lvl_score':0,'how_better_action_item':'','ind_assessor_cmnt':''},{'principle_id':'1','principle_name':'Collaboration and Teamwork','practice_id':'2','practice_name':'Walls of Work','cur_mat_lvl_achieved':'Practicing','cur_mat_lvl_score':2,'tar_mat_lvl_achieved':'Transforming','tar_mat_lvl_score':3,'ind_mat_lvl_achieved':'','ind_target_mat_lvl_score':0,'how_better_action_item':'','ind_assessor_cmnt':''},{'principle_id':'2','principle_name':'Focus on the Customer and Business Value','practice_id':'3','practice_name':'Engaging the Product Owner','cur_mat_lvl_achieved':'Transforming','cur_mat_lvl_score':3,'tar_mat_lvl_achieved':'Scaling','tar_mat_lvl_score':4,'ind_mat_lvl_achieved':'','ind_target_mat_lvl_score':0,'how_better_action_item':'','ind_assessor_cmnt':''},{'principle_id':'2','principle_name':'Focus on the Customer and Business Value','practice_id':'4','practice_name':'Backlog Refinement','cur_mat_lvl_achieved':'Practicing','cur_mat_lvl_score':2,'tar_mat_lvl_achieved':'Transforming','tar_mat_lvl_score':3,'ind_mat_lvl_achieved':'','ind_target_mat_lvl_score':0,'how_better_action_item':'','ind_assessor_cmnt':''},{'principle_id':'3','principle_name':'Flexible, Adaptive and Continuously Improving','practice_id':'5','practice_name':'Release and Iteration Planning','cur_mat_lvl_achieved':'Transforming','cur_mat_lvl_score':3,'tar_mat_lvl_achieved':'Scaling','tar_mat_lvl_score':4,'ind_mat_lvl_achieved':'','ind_target_mat_lvl_score':0,'how_better_action_item':'','ind_assessor_cmnt':''},{'principle_id':'3','principle_name':'Flexible, Adaptive and Continuously Improving','practice_id':'6','practice_name':'Retrospectives','cur_mat_lvl_achieved':'Practicing','cur_mat_lvl_score':2,'tar_mat_lvl_achieved':'Transforming','tar_mat_lvl_score':3,'ind_mat_lvl_achieved':'','ind_target_mat_lvl_score':0,'how_better_action_item':'','ind_assessor_cmnt':''},{'principle_id':'3','principle_name':'Flexible, Adaptive and Continuously Improving','practice_id':'7','practice_name':'Work Estimation (Relative Estimates)','cur_mat_lvl_achieved':'Practicing','cur_mat_lvl_score':2,'tar_mat_lvl_achieved':'Transforming','tar_mat_lvl_score':3,'ind_mat_lvl_achieved':'','ind_target_mat_lvl_score':0,'how_better_action_item':'','ind_assessor_cmnt':''},{'principle_id':'4','principle_name':'Iterative and Fast','practice_id':'8','practice_name':'Story Cards','cur_mat_lvl_achieved':'Practicing','cur_mat_lvl_score':2,'tar_mat_lvl_achieved':'Transforming','tar_mat_lvl_score':3,'ind_mat_lvl_achieved':'','ind_target_mat_lvl_score':0,'how_better_action_item':'','ind_assessor_cmnt':''},{'principle_id':'5','principle_name':'Empowered and Self Directed Teams','practice_id':'9','practice_name':'Stable Cross-Functional Teams','cur_mat_lvl_achieved':'Transforming','cur_mat_lvl_score':3,'tar_mat_lvl_achieved':'Scaling','tar_mat_lvl_score':4,'ind_mat_lvl_achieved':'','ind_target_mat_lvl_score':0,'how_better_action_item':'','ind_assessor_cmnt':''},{'principle_id':'5','principle_name':'Empowered and Self Directed Teams','practice_id':'10','practice_name':'Social Contract','cur_mat_lvl_achieved':'Practicing','cur_mat_lvl_score':2,'tar_mat_lvl_achieved':'Transforming','tar_mat_lvl_score':3,'ind_mat_lvl_achieved':'','ind_target_mat_lvl_score':0,'how_better_action_item':'','ind_assessor_cmnt':''},{'principle_id':'5','principle_name':'Empowered and Self Directed Teams','practice_id':'11','practice_name':'Risk and Issue Management','cur_mat_lvl_achieved':'Transforming','cur_mat_lvl_score':3,'tar_mat_lvl_achieved':'Scaling','tar_mat_lvl_score':4,'ind_mat_lvl_achieved':'','ind_target_mat_lvl_score':0,'how_better_action_item':'','ind_assessor_cmnt':''}],'ovralcur_assessmt_score':'2.4','ovraltar_assessmt_score':'3.4'},{'assessed_cmpnt_name':'Team Delivery','assessed_cmpnt_tbl':[{'principle_id':'1','principle_name':'Continuous Development','practice_id':'1','practice_name':'Automated builds & Continuous Integration','cur_mat_lvl_achieved':'Practicing','cur_mat_lvl_score':2,'tar_mat_lvl_achieved':'Transforming','tar_mat_lvl_score':3,'ind_mat_lvl_achieved':'','ind_target_mat_lvl_score':0,'how_better_action_item':'','ind_assessor_cmnt':''},{'principle_id':'1','principle_name':'Continuous Development','practice_id':'2','practice_name':'Managing Technical Debt','cur_mat_lvl_achieved':'Transforming','cur_mat_lvl_score':3,'tar_mat_lvl_achieved':'Scaling','tar_mat_lvl_score':4,'ind_mat_lvl_achieved':'','ind_target_mat_lvl_score':0,'how_better_action_item':'','ind_assessor_cmnt':''},{'principle_id':'1','principle_name':'Continuous Development','practice_id':'3','practice_name':'Dev & Ops Collaboration / Shared Understanding','cur_mat_lvl_achieved':'Transforming','cur_mat_lvl_score':3,'tar_mat_lvl_achieved':'Scaling','tar_mat_lvl_score':4,'ind_mat_lvl_achieved':'','ind_target_mat_lvl_score':0,'how_better_action_item':'','ind_assessor_cmnt':''},{'principle_id':'1','principle_name':'Continuous Development','practice_id':'4','practice_name':'Infrastructure Automation / Provisioning','cur_mat_lvl_achieved':'Initiating','cur_mat_lvl_score':1,'tar_mat_lvl_achieved':'Practicing','tar_mat_lvl_score':2,'ind_mat_lvl_achieved':'','ind_target_mat_lvl_score':0,'how_better_action_item':'','ind_assessor_cmnt':''},{'principle_id':'2','principle_name':'Continuous Testing','practice_id':'5','practice_name':'Automated Testing','cur_mat_lvl_achieved':'Practicing','cur_mat_lvl_score':2,'tar_mat_lvl_achieved':'Transforming','tar_mat_lvl_score':3,'ind_mat_lvl_achieved':'','ind_target_mat_lvl_score':0,'how_better_action_item':'','ind_assessor_cmnt':''},{'principle_id':'3','principle_name':'Continuous Release & Deployment','practice_id':'6','practice_name':'Automated Deployments','cur_mat_lvl_achieved':'Practicing','cur_mat_lvl_score':2,'tar_mat_lvl_achieved':'Transforming','tar_mat_lvl_score':3,'ind_mat_lvl_achieved':'','ind_target_mat_lvl_score':0,'how_better_action_item':'','ind_assessor_cmnt':''},{'principle_id':'4','principle_name':'Continuous Feedback & Optimization','practice_id':'7','practice_name':'Customer Feedback','cur_mat_lvl_achieved':'Practicing','cur_mat_lvl_score':2,'tar_mat_lvl_achieved':'Transforming','tar_mat_lvl_score':3,'ind_mat_lvl_achieved':'','ind_target_mat_lvl_score':0,'how_better_action_item':'','ind_assessor_cmnt':''},{'principle_id':'5','principle_name':'Continuous Monitoring','practice_id':'8','practice_name':'Monitoring of Environments','cur_mat_lvl_achieved':'Practicing','cur_mat_lvl_score':2,'tar_mat_lvl_achieved':'Transforming','tar_mat_lvl_score':3,'ind_mat_lvl_achieved':'','ind_target_mat_lvl_score':0,'how_better_action_item':'','ind_assessor_cmnt':''}],'ovralcur_assessmt_score':'2.1','ovraltar_assessmt_score':'3.1'}],'assessmt_action_plan_tbl':[
]};

var agent = request.agent(app);

// do the login befre testing
before(function(done) {
  agent
    .get('/api/login/masquerade/Yanliang.Gu1@ibm.com')
    .send()
    .end(function(err, res) {
      if (err) throw err;
      agent.saveCookies(res);
      done();
    })
});

// prepare the team data
before(function(done){
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
    //console.log(err);
  })
  .finally(function(){
    //console.log('team data preparation done. '+curr_assessment._id+' for team '+curr_assessment.team_id);
    done();
  });
});

describe('Assesment API Test [GET /api/assessment/template]: get assessment template', function(){
  it("retrieve assessment template", function(done){
    var req = request(app).get('/api/assessment/template');
    agent.attachCookies(req);
    req.expect(200);
    req.end(function(err, res){
      if (err) {
        //console.log(err);
      } else {
        expect(res.body).to.be.a('object');
        expect(res.body).to.have.property('rows');
      }
      done();
    });
  });
});

describe('Assesment API Test [POST /api/assessment]: add team assessment', function(){
  it('add assessment with no assessment id', function(done){
    var req = request(app).post('/api/assessment/');
    agent.attachCookies(req);
    req.send(noId);
    req.expect(400);
    req.end(function(err, res){
      if (err) {
        //console.log(err);
      } else {
        expect(res.body).to.be.a('object');
        expect(res.body).to.have.property('error');
        expect(res.body.error).to.have.property('_id');
        expect(res.body.error._id[0]).to.be.equal('Record id is required.');
      }
      done();
    });
  });

  it('add assesment with empty assesment id', function(done){
    var emptyId = _.clone(curr_assessment);
    emptyId._id = '';
    var req = request(app).post('/api/assessment/');
    agent.attachCookies(req);
    req.send(emptyId);
    req.expect(400);
    req.end(function(err, res){
      if (err) {
        //console.log(err);
      } else {
        expect(res.body).to.be.a('object');
        expect(res.body).to.have.property('error');
        expect(res.body.error).to.have.property('_id');
        expect(res.body.error._id[0]).to.be.equal('Record id is required.');
      }
      done();
    });
  });

  it('add assessment with valid assessment data', function(done){
    var req = request(app).post('/api/assessment/');
    agent.attachCookies(req);
    req.send(curr_assessment);
    req.expect(200);
    req.end(function(err, res){
      if (err) {
        //console.log(err);
      } else {
        expect(res.body).to.be.a('object');
        expect(res.body.ok).to.be.true;
        expect(res.body.id).to.be.equal(curr_assessment._id);
        currRevisionId = res.body.rev;
        //console.log(currRevisionId);
      }
      done();
    });
  });

  it('add assessment with duplicate assessment id', function(done){
    var req = request(app).post('/api/assessment/');
    agent.attachCookies(req);
    req.send(curr_assessment);
    req.expect(400);
    req.end(function(err, res){
      if (err) {
        //console.log(err);
      } else {
        expect(res.body).to.be.a('object');
        expect(res.body).to.have.property('error');
        expect(res.body.error).to.be.equal('conflict');
      }
      done();
    });
  });
});

describe('Assessment API Test [GET /api/assessment/view]: get team assessments', function(){
  it('retrieve team assessments with non-existing team id', function(done){
    var req = request(app).get('/api/assessment/view/' + 'teamId=' + invalidTeamId);
    agent.attachCookies(req);
    req.expect(404);
    req.end(function(err, res){
      if (err) {
        //console.log(err);
      } else {
        expect(res.body).to.be.empty;
      }
      done();
    });
  });

  it('retrieve team assessments with empty team id', function(done){
    var req = request(app).get('/api/assessment/view/' + 'teamId=' + '');
    agent.attachCookies(req);
    req.expect(404);
    req.end(function(err, res){
      if (err) {
        //console.log(err);
      } else {
        expect(res.body).to.be.empty;
      }
      done();
    });
  });

  it('retrieve team assessments with valid id', function(done){
    var query = querystring.stringify({'teamId': curr_assessment.team_id});
    var req = request(app).get('/api/assessment/view?' + query);
    agent.attachCookies(req);
    req.expect(200);
    req.end(function(err, res){
      if (err) {
        //console.log(err);
      } else {
        expect(res.body).to.be.a('object');
        expect(res.body).to.have.property('rows');
        expect(res.body.rows[0]).to.have.property('key');
        expect(res.body.rows[0].key).to.be.equal(curr_assessment.team_id);
      }
      done();
    });
  });

  it('retrieve assessment with non-existing id', function(done){
    var req = request(app).get('/api/assessment/view/' + 'assessId=' + invalidAssessId);
    agent.attachCookies(req);
    req.expect(404);
    req.end(function(err, res){
      if (err) {
        //console.log(err);
      } else {
        expect(res.body).to.be.empty
      }
      done();
    });
  });

  it('retrieve assessments with empty team id', function(done){
    var req = request(app).get('/api/assessment/view/' + 'assessId=' + '');
    agent.attachCookies(req);
    req.expect(404);
    req.end(function(err, res){
      if (err) {
        //console.log(err);
      } else {
        expect(res.body).to.be.empty;
      }
      done();
    });
  });

  it('retrieve team assessments with valid id', function(done){
    var query = querystring.stringify({'assessId': curr_assessment._id});
    var req = request(app).get('/api/assessment/view?' + query);
    agent.attachCookies(req);
    req.expect(200);
    req.end(function(err, res){
      if (err) {
        //console.log(err);
      } else {
        expect(res.body).to.be.a('object');
        expect(res.body).to.have.property('_id');
        expect(res.body._id).equal(curr_assessment._id);
        currRevisionId = res.body._rev;
      }
      done();
    });
  });
});

describe('Assessment API Test [PUT /api/assessment/]: update team assessment', function(){
  it('update assessment with no id', function(done){
    var req = request(app).put('/api/assessment/');
    agent.attachCookies(req);
    req.send(noId);
    req.expect(400);
    req.end(function(err, res){
      if (err) {
        //console.log(err);
      } else {
        expect(res.body).to.have.property('error');
        expect(res.body.error).to.have.property('_id');
        expect(res.body.error._id[0]).to.be.equal('Record id is required.');
      }
      done();
    });
  });

  it('update assessment with empty id', function(done){
    var tempData = _.clone(curr_assessment);
    tempData._id='';
    var req = request(app).put('/api/assessment/');
    agent.attachCookies(req);
    req.send(tempData);
    req.expect(400);
    req.end(function(err, res){
      if (err) {
        //console.log(err);
      } else {
        expect(res.body).to.have.property('error');
        expect(res.body.error).to.have.property('_id');
        expect(res.body.error._id[0]).to.be.equal('Record id is required.');
      }
      done();
    });
  });

  it('update assessment with valid data', function(done){
    var tempData = _.clone(curr_assessment);
    tempData.last_updt_user = dummyData.user.details.shortEmail;
    tempData._rev = currRevisionId;
    var req = request(app).put('/api/assessment/');
    agent.attachCookies(req);
    req.send(tempData);
    req.expect(200);
    req.end(function(err, res){
      if (err) {
        //console.log(err);
      } else {
        expect(res.body).to.be.a('object');
        expect(res.body).to.have.property('id');
        expect(res.body.id).equal(tempData._id);
        expect(res.body.ok).to.be.true;
        currRevisionId = res.body.rev;
      }
      done();
    });
  });
});

describe('Assessment API Test [DELETE /api/assessment]: delete assessment', function(){
  it('delete assessment with non-existing id', function(done){
    var query = querystring.stringify({'docId': invalidAssessId, 'revId': currRevisionId});
    var req = request(app).delete('/api/assessment?' + query);
    agent.attachCookies(req);
    req.expect(400);
    req.end(function(err, res){
      if (err) {
        //console.log(err);
      } else {
        expect(res.body).to.be.a('object');
        expect(res.body).to.have.property('error');
        expect(res.body.error).equal('not_found');
      }
      done();
    });
  });

  it('delete assessment with empty id', function(done){
    var query = querystring.stringify({'docId': '', 'revId': currRevisionId});
    var req = request(app).delete('/api/assessment?' + query);
    agent.attachCookies(req);
    req.expect(400);
    req.end(function(err, res){
      if (err) {
        //console.log(err);
      } else {
        expect(res.body).to.be.a('object');
        expect(res.body).to.have.property('error');
        expect(res.body.error).equal('No id/rev for record deletion.');
      }
      done();
    });
  });

  it('delete assessment with non-existing rev id', function(done){
    var query = querystring.stringify({'docId': curr_assessment._id, 'revId': invalidRevisionId});
    var req = request(app).delete('/api/assessment?' + query);
    agent.attachCookies(req);
    req.expect(400);
    req.end(function(err, res){
      if (err) {
        //console.log(err);
      } else {
        expect(res.body).to.be.a('object');
        expect(res.body).to.have.property('error');
        expect(res.body.error).equal('conflict');
      }
      done();
    });
  });

  it('delete assessment with empty rev id', function(done){
    var query = querystring.stringify({'docId': curr_assessment._id, 'revId': ''});
    var req = request(app).delete('/api/assessment?' + query);
    agent.attachCookies(req);
    req.expect(400);
    req.end(function(err, res){
      if (err) {
        //console.log(err);
      } else {
        expect(res.body).to.be.a('object');
        expect(res.body).to.have.property('error');
        expect(res.body.error).equal('No id/rev for record deletion.');
      }
      done();
    });
  });

  it('delete assessment with valid id and rev id', function(done){
    var query = querystring.stringify({'docId': curr_assessment._id, 'revId': currRevisionId});
    var req = request(app).delete('/api/assessment?' + query);
    agent.attachCookies(req);
    req.expect(200);
    req.end(function(err, res){
      if (err) {
        //console.log(err);
      } else {
        expect(res.body).to.be.a('object');
        expect(res.body).to.have.property('ok');
        expect(res.body.ok).to.be.true;
      }
      done();
    });
  });
});
