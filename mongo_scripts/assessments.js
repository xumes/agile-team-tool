"use strict";
var _          = require('underscore');
var cloudantDb = require('./data');
var MongoClient = require('mongodb').MongoClient
var assert     = require('assert');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

var cloudantAssessments = _.filter(cloudantDb.rows, function(row){ return row.doc.type === 'matassessmtrslt'; });
var cloudantAssessments = _.pluck(cloudantAssessments, 'doc');

var util = require("./util.js");

var mongoAssessments = [];
_.each(cloudantAssessments, function(doc) {
  if(doc.doc_status==='delete')
    return;

  //set empty string values to be undefined
  doc = _.mapObject(doc, function(val){ return _.isEmpty(val) ? undefined : val; });
  
  //componentResults
  var newAssessedComponentResults = [];
  _.each(doc.assessmt_cmpnt_rslts, function(component){
    component = _.mapObject(component, function(val){ return _.isEmpty(val) ? undefined : val; });
    var newComponent = {
      'componentName' : component.assessed_cmpnt_name,
      'currentScore'  : parseFloat(component.ovralcur_assessmt_score),
      'targetScore'   : parseFloat(component.ovraltar_assessmt_score),
      'assessedComponents' : component.assessed_cmpnt_tbl
    }

    //nested array of assessed components
    var newAssessedComponents = [];
    _.each(newComponent.assessedComponents, function(assessedComponent){
      assessedComponent = _.mapObject(assessedComponent, function(val){ return _.isEmpty(val) ? undefined : val; });
      
      var newAssessedComponent = {
        'principleId'      : parseInt(assessedComponent.principle_id),
        'principleName'    : assessedComponent.principle_name,
        'practiceId'       : parseInt(assessedComponent.practice_id),
        'practiceName'     : assessedComponent.practice_name,
        'currentLevelName' : assessedComponent.cur_mat_lvl_achieved,
        'currentScore'     : parseFloat(assessedComponent.cur_mat_lvl_score),
        'targetLevelName'  : assessedComponent.tar_mat_lvl_achieved,
        'targetScore'      : parseFloat(assessedComponent.tar_mat_lvl_score),
        'improveDescription': assessedComponent.how_better_action_item,
        'assessorComment'  : assessedComponent.ind_assessor_cmnt
      }
      //I think these are always empty
      if(!_.isEmpty(assessedComponent.ind_mat_lvl_achieved)){
        console.log("ind_mat_lvl_achieved wasnt empty " + assessedComponent.ind_mat_lvl_achieved);
        newAssessedComponent['assessorLevel'] = assessedComponent.ind_mat_lvl_achieved;  
      }
      if(!_.isEmpty(assessedComponent.ind_target_mat_lvl_score)){
        console.log("ind_target_mat_lvl_score wasnt empty " + assessedComponent.ind_target_mat_lvl_score);
        newAssessedComponent['assessorTarget'] = assessedComponent.ind_target_mat_lvl_score;  
      }
      
      newAssessedComponents.push(newAssessedComponent);
    });
    newComponent.assessedComponents = (newAssessedComponents.length === 0) ? undefined : newAssessedComponents;
    newAssessedComponentResults.push(newComponent);
  });
  
  //actionPlans assessmt_action_plan_tbl
  var newActionPlanTable = [];
  _.each(doc.assessmt_action_plan_tbl, function(actionPlan){
    actionPlan = _.mapObject(actionPlan, function(val){ return _.isEmpty(val) ? undefined : val; });
        
    var newActionPlan = {
      'id'                : parseInt(actionPlan.action_plan_entry_id),
      'isUserCreated'     : (actionPlan.user_created === "Yes") ? true : false,
      'componentName'     : actionPlan.assessmt_cmpnt_name,
      'principleId'       : parseInt(actionPlan.principle_id),
      'practiceName'      : actionPlan.practice_name,
      'improveDescription': actionPlan.how_better_action_item,
      'currentLevel'      : parseFloat(actionPlan.cur_mat_lvl_score),
      'targetLevel'       : parseFloat(actionPlan.tar_mat_lvl_score),
      'progressComment'   : actionPlan.progress_summ,
      'keyMetric'         : actionPlan.key_metric,
      'reviewDate'        : actionPlan.review_dt,
      'actionStatus'      : actionPlan.action_item_status
    }
    newActionPlanTable.push(newActionPlan);
  });
  
  var mongoDoc = {
    'cloudantId' : doc._id,
    'teamId': doc.team_id,
    'version': doc.assessmt_version,
    'docStatus' : doc.doc_status,
    'type': doc.team_proj_ops,
    'deliversSoftware' : (doc.team_dlvr_software==='Yes') ? true:false,
    'assessmentStatus' : doc.assessmt_status,
    'assessorId' : doc.ind_assessor_id,
    'assessorStatus' : doc.ind_assessmt_status,
    'assessedDate' : util.stringToUtcDate(doc.ind_assessmt_dt),
    
    'submittedBy'   : doc.submitter_id,
    'submittedDate' : util.stringToUtcDate(doc['self-assessmt_dt']),
    
    'createDate' : util.stringToUtcDate(doc.created_dt),
    'createdById': doc.created_user,
    'createdBy'  : doc.created_user,
    'updateDate' : util.stringToUtcDate(doc.last_updt_dt),
    'updatedById': doc.last_updt_user,
    'updatedBy'  : doc.last_updt_user,
    
    'componentResults' : (newAssessedComponentResults.length === 0) ? undefined : newAssessedComponentResults,
    'actionPlans' : (newActionPlanTable.length === 0) ? undefined : newActionPlanTable
  };

  
  mongoAssessments.push(mongoDoc);
});


//insert into db
var creds = require('./creds')
// Use connect method to connect to the server
MongoClient.connect(creds.url, function(err, db) {
  
  assert.equal(null, err);
  console.log("Connected successfully to server");
  //console.log(db)
  
  db.collection('assessments').insertMany(mongoAssessments, function(err, r) {
        assert.equal(null, err);
        console.log("Done!  " + JSON.stringify(r.result));
        db.close();
        process.exit();
  });
});
