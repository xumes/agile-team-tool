'use strict';
var _          = require('underscore');
var cloudantDb = require('./data');
var MongoClient = require('mongodb').MongoClient;
var assert     = require('assert');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

var cloudantAssessments = _.filter(cloudantDb.rows, function(row){ return row.doc.type === 'matassessmtrslt'; });
var cloudantAssessments = _.pluck(cloudantAssessments, 'doc');

var util = require('./util.js');
var userMap = util.getUserMap();


var mongoAssessments = [];
_.each(cloudantAssessments, function(doc) {
  if (doc.doc_status==='delete')
    return;
  //set empty string values to be undefined
  doc = _.mapObject(doc, function(val){ return _.isEmpty(val) ? null : val; });
  doc = JSON.stringify(doc);

  var mappedDoc = JSON.parse(doc, function(k, v) {
    //I probably should have used a switch statement here :^)
    if (k === '_rev' || k==='type' || k==='review_dt'){
      //console.log('skipping: ' + k);
    }
    else if (k === '_id'){
      this.cloudantId = v;
    }
    else if (k === 'team_id')
      this.teamId = v;
    else if (k === 'assessmnt_version' || k==='assessmt_version')
      this.version = v;
    else if (k === 'doc_status')
      this.docStatus = v;
    else if (k === 'action_item_status' && !_.isEmpty(v))
      this.actionStatus = v;
    else if (k === 'team_proj_ops')
      this.type = v;
    else if (k === 'team_dlvr_software')
      this.deliversSoftware = (v==='Yes')?true:false;
    else if (k === 'assessmt_status'){
      this.assessmentStatus = v;
    }
    else if (k === 'ind_assessor_id'){
      this.assessorUserId = util.getUserId(userMap, v);
      this.assessor = util.lowerCase(v);
    }
    else if (k === 'ind_assessmt_status'){
      this.assessorStatus = v;
    }
    else if (k === 'ind_assessmt_dt')
      this.assessedDate = util.stringToUtcDate(v);
    else if (k === 'submitter_id'){
      this.submittedByUserId = util.getUserId(userMap, v);
      this.submittedBy = util.getUserName(userMap, v);
    }
    else if (k === 'self-assessmt_dt')
      this.submittedDate = util.stringToUtcDate(v);
    else if (k === 'created_dt')
      this.createDate = util.stringToUtcDate(v);
    else if (k === 'created_user'){
      this.createdByUserId = util.getUserId(userMap, v);
      this.createdBy = util.getUserName(userMap, v);
    }
    else if (k === 'last_updt_dt')
      this.updateDate = util.stringToUtcDate(v);
    else if (k === 'last_updt_user'){
      this.updatedByUserId = util.getUserId(userMap, v);
      this.updatedBy = util.getUserName(userMap, v);
    }
    //nested objs
    else if (k === 'assessmt_cmpnt_rslts')
      this.componentResults = v;
    else if (k === 'assessed_cmpnt_name')
      this.componentName = v;
    else if (k === 'user_created')
      this.isUserCreated = (v==='No' || _.isEmpty(v))? false : true;
    else if (k === 'assessmt_cmpnt_name')
      this.componentName = v;
    else if (k === 'ovralcur_assessmt_score'){
      this.currentScore = (typeof v === 'string')? parseFloat(v) : v;
    }
    else if (k === 'ovraltar_assessmt_score')
      this.targetScore = (typeof v === 'string')? parseFloat(v) : v;
    else if (k === 'assessed_cmpnt_tbl')
      this.assessedComponents = v;
    else if (k === 'principle_id')
      this.principleId = (typeof v === 'string')? parseInt(v) : v;
    else if (k === 'principle_name')
      this.principleName = v;
    else if (k === 'practice_id')
      this.practiceId = (typeof v === 'string')? parseInt(v) : v;
    else if (k === 'practice_name')
      this.practiceName = v;
    else if (k === 'cur_mat_lvl_achieved')
      this.currentLevelName = v;
    else if (k === 'cur_mat_lvl_score')
      this.currentScore = (typeof v === 'string')? parseInt(v) : v;
    else if (k === 'tar_mat_lvl_achieved')
      this.targetLevelName = v;
    else if (k === 'tar_mat_lvl_score')
      this.targetScore = (typeof v === 'string')? parseInt(v) : v;
    else if (k === 'how_better_action_item')
      this.improveDescription = v;
    else if (k === 'ind_assessor_cmnt')
      this.assessorComment = v;
    else if (k === 'assessmt_action_plan_tbl')
      this.actionPlans = v;
    else if (k === 'action_plan_entry_id')
      this.actionPlanId = (typeof v === 'string')? parseInt(v) : v;
    else if (k === 'key_metric')
      this.keyMetric = v;
    else if (k === 'ind_target_mat_lvl_score')
      this.assessorTarget = v;
    else if (k === 'ind_mat_lvl_achieved')
      this.assessorLevel = v;
    else if (k === 'progress_summ')
      this.progressSummary = v;
    else {
      //console.log('WARN: ' + k + ' was never mapped w/ value = ' + v);
      return v;
    }
  });
  mongoAssessments.push(mappedDoc);
});

var creds = require('./creds');
// Use connect method to connect to the server
MongoClient.connect(creds.url, function(err, db) {
  assert.equal(null, err);
  console.log('Connected successfully to server');
  db.collection('assessments')
    .drop()
    .then(function(){
      db.collection('assessments').insertMany(mongoAssessments, function(err, r) {
        assert.equal(null, err);
        console.log('Done!  ' + JSON.stringify(r.result));
        db.close();
        process.exit();
      });
    });
});

