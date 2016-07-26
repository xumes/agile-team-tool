/* Put cloudant calls for team here */
var Promise = require('bluebird');
var common = require('./common-cloudant');
var _ = require('underscore');
var loggers = require('../middleware/logger');
var validate = require("validate.js");
var recordConstraints = {
  _id:{
    presence: true
  },
  team_id:{
    presence: true
  },
  team_proj_ops: {
    presence: true
  },
  team_dlvr_software:{
    presence: true
  }
};

var msg;

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
  addTeamAssessment : function(data, callback){
    var validateError = validate(data, recordConstraints);
    if (validateError){
      return new Promise(function(resolve, reject){
        reject(formatErrMsg(validateError));
      });
      
    }else{
      return new Promise(function(resolve, reject){
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
      });
    }
  },
  updateTeamAssessment : function(data, callback){
    var validateError = validate(data, recordConstraints);
    if (validateError){
      return new Promise(function(resolve, reject){
        reject(formatErrMsg(validateError));
      });      
    }else{      
      return new Promise(function(resolve, reject){
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
      });
    }
  },
  deleteAssessment : function(_id, _rev, callback){
    return new Promise(function(resolve, reject){
      if(!_.isNull(_id) && !_.isEmpty(_id)
        && !_.isNull(_rev) && !_.isEmpty(_rev)){
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
      }else{
        msg = 'No id/rev for record deletion.';
        reject(formatErrMsg(msg));
      }
    });
  }
};

module.exports = assessment;