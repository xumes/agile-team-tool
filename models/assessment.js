/* Put cloudant calls for team here */
var Promise = require('bluebird');
var common = require('./common-cloudant');
var _ = require('underscore');
var loggers = require('../middleware/logger');
var validate = require("validate.js");
var others = require('./others');
var teams = require('./teams');
var lodash = require('lodash');
var validationError = [];
var msg;
var recordConstraints = {
  _id:{
    presence : {
      message: '^Record id is required.'
    }
  },
  type:{
    presence: true
  },
  team_id:{
    presence : {
      message: '^Team id is required.'
    }
  },
  assessmt_version:{
    presence : {
      message: '^Assessment version is required.'
    }
  },
  team_proj_ops: {
    presence : {
      message: '^Team primary type is required.'
    },
    inclusion: {
      within: ["Project", "Operations"]
    }
  },
  team_dlvr_software:{
    presence : {
      message: '^Team software delivery is required.'
    },
    inclusion: {
      within: ["Yes", "No"]
    }
  },
  assessmt_status:{
    presence : {
      message: '^Assessment status is required.'
    },
    inclusion: {
      within: ["Draft", "Submitted"]
    }
  },
  created_dt:{
    presence : {
      message: '^Created date is required.'
    }
  },
  created_user: {
    presence : {
      message: '^Created user id is required.'
    },
    email: true
  },
  last_updt_dt:{
    presence : {
      message: '^Last update date is required.'
    }
  },
  last_updt_user:{
    presence : {
      message: '^Last update user id is required.'
    },
    email: true
  }
};

var assessmentConstraints = {
  _id:{
    presence : {
      message: '^Record id is required.'
    }
  },
  type:{
    presence: true
  },
  team_id:{
    presence : {
      message: '^Team id is required.'
    }
  },
  assessmt_version:{
    presence : {
      message: '^Assessment version is required.'
    }
  },
  team_proj_ops: {
    presence : {
      message: '^Team primary type is required.'
    },
    inclusion: {
      within: ["Project", "Operations"]
    }
  },
  team_dlvr_software:{
    presence : {
      message: '^Team software delivery is required.'
    },
    inclusion: {
      within: ["Yes", "No"]
    }
  },
  assessmt_status:{
    presence : {
      message: '^Assessment status is required.'
    },
    inclusion: {
      within: ["Draft", "Submitted"]
    }
  },
  submitter_id:{
    presence : {
      message: '^Submitter id is required.'
    },
    email: true
  },  
  "self-assessmt_dt":{
    presence : {
      message: '^Self assessment date is required.'
    }
  },
  ind_assessor_id:{
    presence: false
  },
  ind_assessmt_status:{
    presence: false,
    inclusion: {
      within: ["Draft", "Submitted"]
    }
  },
  ind_assessmt_dt:{
    presence: false
  },
  created_dt:{
    presence : {
      message: '^Created date is required.'
    }
  },
  created_user: {
    presence : {
      message: '^Created user id is required.'
    },
    email: true
  },
  last_updt_dt:{
    presence : {
      message: '^Last update date is required.'
    }
  },
  last_updt_user:{
    presence : {
      message: '^Last update user id is required.'
    },
    email: true
  },  
  doc_status:{
    presence: false
  },
  assessmt_cmpnt_rslts:{
    presence : {
      message: '^Assessment component results is required.'
    },
    checkComponents: true
  },
  assessmt_action_plan_tbl:{
    checkActionTable: true
  }
};

var compTbl ={
  principle_id:{
    presence : {
      message: '^Principle id is required.'
    }
  },
  principle_name:{
    presence : {
      message: '^Principle name is required.'
    }
  },
  practice_id:{
    presence : {
      message: '^Practice id is required.'
    }
  },
  practice_name:{
    presence : {
      message: '^Practice name is required.'
    }
  },
  cur_mat_lvl_achieved:{
    presence : {
      message: '^All assessment maturity practices need to be answered.  See highlighted practices in yellow.'
    }
  },
  cur_mat_lvl_score :{
    presence : {
      message: '^Current maturity level achieved is required.'
    },
    numericality: {
      message: '^Current maturity level score must be numeric.'
    }
  },
  tar_mat_lvl_achieved:{
    presence : {
      message: '^All assessment maturity practices need to be answered.  See highlighted practices in yellow.'
    }
  },
  tar_mat_lvl_score:{
    presence : {
      message: '^Target maturity level achieved is required.'
    },
    numericality: {
      message: '^Target maturity level score must be numeric.'
    }
  },
  ind_mat_lvl_achieved:{
    presence : false
  },
  ind_target_mat_lvl_score:{
    presence : false,
    numericality: {
      message: '^Independent target maturity level score must be numeric.'
    }
  },
  how_better_action_item:{
    presence: false,
    length: {
      maximum: 350
    }
  },
  ind_assessor_cmnt:{
    presence: false
  }
};

var actionPlanTbl ={
  action_plan_entry_id:{
    presence : {
      message: '^Action plan entry id is required.'
    },
    numericality: {
      message: '^Action plan entry id must be numeric.'
    }
  },
  user_created:{
    presence : {
      message: '^User created is required.'
    },
    inclusion: {
      within: ["Yes", "No"]
    }
  },
  assessmt_cmpnt_name:{
    presence : {
      message: '^Assessment component name is required.'
    }
  },
  principle_id:{
    presence : {
      message: '^Principle id is required.'
    },
    numericality: {
      message: '^Principle id must be numeric.'
    }
  },
  principle_name:{
    presence : {
      message: '^Principle name is required.'
    }
  },
  practice_id:{
    presence : {
      message: '^Practice id is required.'
    },
    numericality: {
      message: '^Practice id must be numeric.'
    }
  },
  practice_name:{
    presence : {
      message: '^Practice name is required.'
    }
  },
  how_better_action_item:{
    presence : false,
    length: {
      maximum: 350
    }
  },
  cur_mat_lvl_score :{
    presence : {
      message: '^Current maturity level score is required.'
    },
    numericality: {
      message: '^Current maturity level score must be numeric.'
    }
  },
  tar_mat_lvl_score:{
    presence : {
      message: '^Target maturity level score is required.'
    },
    numericality: {
      message: '^Target maturity level score must be numeric.'
    }
  },
  progress_summ:{
    presence : false,
    length: {
      maximum: 350
    }
  },
  key_metric:{
    presence: false,
    length: {
      maximum: 350
    }
  },
  review_dt:{
    presence: false
  },
  action_item_status:{
    presence : {
      message: '^Action item status is required.'
    },
    inclusion: {
      within: ["Open", "In-progress", "Closed"]
    }
  }
};

var cmpnt_rslts = {
  assessed_cmpnt_name: {
    presence: { 
      message: '^Assessment component name is required.'
    }
  },
  assessed_cmpnt_tbl: {
    checkComponentsTable: true
  },
  ovralcur_assessmt_score: {
    presence: {
      message: '^Overall current assessment score is required.'
    },
    numericality: {
      message: '^Overall current assessment score must be numeric.'
    }
  },
  ovraltar_assessmt_score:{
    presence: {
      message: '^Overall target assessment score is required.'
    },
    numericality: {
      message: '^Overall target assessment score must be numeric.'
    }    
  }
};

validate.validators.checkComponents = function(value, options , key, attrib) {
  lodash.forEach(value, function(value, key){
    var result = validate.validate(value, cmpnt_rslts);
    if (result){
      var index = lodash.findIndex(validationError, result);
      if (index == -1){
        validationError.push(result);
      }
    }
  });
};

validate.validators.checkComponentsTable = function(value, options, key, attrib) {
  lodash.forEach(value, function(value, key){
      var result = validate.validate(value, compTbl);
      if (result){
        var index = lodash.findIndex(validationError, result);
        if (index == -1){
          validationError.push(result);
        }
      }      
  });
};

validate.validators.checkActionTable = function(value, options, key, attrib) {
  lodash.forEach(value, function(value, key){
      var result = validate.validate(value, actionPlanTbl);
      if (result){
        var index = lodash.findIndex(validationError, result);
        if (index == -1){
          validationError.push(result);
        }
      }      
  });
};

var formatErrMsg = function(msg){
  loggers.get('models').info('Error: ' + msg);
  return { error : msg };
};

var successLogs = function(msg){
  loggers.get('models').info('Success: ' + msg);
  return;
};

var infoLogs = function(msg){
  loggers.get('models').info(msg);
  return;
};

var assessment = {
  getTeamAssessments : function(teamId, callback) {
    return new Promise(function(resolve, reject){
      if(!_.isEmpty(teamId)){
        infoLogs('Getting all team assessment records from Cloudant.');
        common.getByViewKey('agile', 'maturityAssessmentResult', teamId)
          .then(function(body){
            successLogs('Team '+teamId+' assessment records retrieved.');
            resolve(body);
          })
          .catch(function(err){
            msg = err.error;
            reject(formatErrMsg(msg));
          });
      }else{
        msg = 'No team id provided.';
        reject(formatErrMsg(msg));
      }
    });
  },
  getAssessmentTemplate : function(callback){
    return new Promise(function(resolve, reject){
      infoLogs('Getting assessment template from Cloudant.');
      common.getByView('agile', 'maturityAssessment')
        .then(function(body){
          successLogs('Assessment template record retrieved.');
          resolve(body);
        })
        .catch(function(err){
          msg = err.error;
          reject(formatErrMsg(msg));
        });
      });
  },
  getAssessment : function(_id, callback){
    return new Promise(function(resolve, reject){
      if(!_.isNull(_id) && !_.isEmpty(_id)){
        infoLogs('Getting assessment '+ _id +' record from Cloudant.');
        common.getRecord(_id)
          .then(function(body){
            successLogs('Assessment '+ _id +' record retrieved.');
            resolve(body);
          })
          .catch(function(err){
            msg = err.error;
            reject(formatErrMsg(msg));
          });
      }else{
        msg = 'No assessment id provided.';
        reject(formatErrMsg(msg));
      }
    });
  },
  addTeamAssessment : function(userId, data){
    return new Promise(function(resolve, reject){
      infoLogs('addTeamAssessment user:'+userId+' team id:' +data.team_id+' status: '+data.assessmt_status);
      validationError = [];
      assessment.userValidation(userId, data.team_id)
        .then(function(body){
          var validateError;
          if(data.assessmt_status == 'Draft'){
            validateError = validate(data, recordConstraints);
          }else{
            validateError = validate(data, assessmentConstraints);
          }
          if (validateError || lodash.size(validationError) > 0){
            if (!validateError)
              validateError = new Object();
            lodash.forEach(validationError, function(value, key){
              lodash.forEach(lodash.keysIn(value), function(val, k){
                validateError[val] = value[val];
              });
            });
            reject(formatErrMsg(validateError));
          }
          else{
            infoLogs('Add assessment record to Cloudant.');
            common.addRecord(data)
              .then(function(body){
                successLogs('Assessment '+ data._id +' record inserted.');
                resolve(body);
              })
              .catch(function(err){
                msg = err.error;
                reject(formatErrMsg(msg));
              });
          }
        })
        .catch(function(err){
          msg = err.error;
          reject(formatErrMsg(msg));
        });
      });
  },
  updateTeamAssessment : function(userId, data){
    return new Promise(function(resolve, reject){
      validationError = [];
      infoLogs('updateTeamAssessment '+userId+', team id: '+data.team_id);
      assessment.userValidation(userId, data.team_id)
        .then(function(body){
          if(data.assessmt_status == 'Draft'){
            validateError = validate(data, recordConstraints);
          }else{
            validateError = validate(data, assessmentConstraints);
          }
          if (validateError || lodash.size(validationError) > 0){
            if (!validateError)
              validateError = new Object();
            lodash.forEach(validationError, function(value, key){
              lodash.forEach(lodash.keysIn(value), function(val, k){
                validateError[val] = value[val];
              });
            });
            reject(formatErrMsg(validateError));
          }
          else{
            infoLogs('Update assessment '+ data._id +' record '+data._rev+' to Cloudant.');
            common.updateRecord(data)
              .then(function(body){
                successLogs('Assessment '+ data._id +' record updated.');
                resolve(body);
              })
              .catch(function(err){
                msg = err.error;
                reject(formatErrMsg(msg));
              });
          }
        })
        .catch(function(err){
          msg = err.error;
          reject(formatErrMsg(msg));
        });
      });
  },
  deleteAssessment : function(userId, _id, _rev, callback){
    return new Promise(function(resolve, reject){
      infoLogs('Delete assessment '+ _id +' record rev '+_rev+ ' by '+userId+' to Cloudant.');
      if(!lodash.isEmpty(_id) && !lodash.isEmpty(_rev)){
        assessment.getAssessment(_id)
        .then(function(body){
          var teamId = body.team_id;
          return assessment.userValidation(userId, teamId);
        })
        .then(function(body){
          infoLogs('Delete assessment '+ _id +' record rev '+_rev+' to Cloudant.');
            common.deleteRecord(_id, _rev)
              .then(function(body){
                successLogs('Assessment '+ _id +' record deleted.');
                resolve(body);
              })
              .catch(function(err){
                msg = err.error;
                reject(formatErrMsg(msg));
              });
        })
        .catch(function(err){
          msg = err.error;
          reject(formatErrMsg(msg));
        });
      }else{
        msg = 'No id/rev for record deletion.';
        reject(formatErrMsg(msg));
      }
    });
  },
  userValidation : function(userId, teamId){
    return new Promise(function(resolve, reject){
      infoLogs('model validating user '+userId+' for team '+teamId);
      others.isValidUser(userId, teamId, true)
      .then(function(allowedUser){
        resolve(allowedUser);
      })
      .catch(function(err){
         reject(err);
      });
    });
  }
};

module.exports = assessment;