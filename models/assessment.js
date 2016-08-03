/* Put cloudant calls for team here */
var Promise = require('bluebird');
var common = require('./common-cloudant');
var _ = require('underscore');
var loggers = require('../middleware/logger');
var validate = require("validate.js");
var util = require('../helpers/util');
var teams = require('./teams');
var lodash = require('lodash');
var validationError = [];
var msg;

var rules = require('./validate_rules/assessment')
var recordConstraints = rules.recordConstraints;
var assessmentConstraints = rules.assessmentConstraints;
var compTbl = rules.compTbl;
var actionPlanTbl = rules.actionPlanTbl;
var cmpnt_rslts = rules.cmpnt_rslts;

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
      util.isValidUser(userId, teamId, true)
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