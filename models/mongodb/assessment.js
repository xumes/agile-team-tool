var lodash = require('lodash');
var Promise = require('bluebird');
var mongoose = require('mongoose');
var loggers = require('../../middleware/logger');
var validate = require('validate.js');
var rules = require('../../validate_rules/assessment');
var Schema   = mongoose.Schema;
require('../../settings');

var lodash = require('lodash');
var rules = require('./validate_rules/assessment');
var settings = require('../settings');

var recordConstraints = rules.recordConstraints;
var assessmentConstraints = rules.assessmentConstraints;
var compTbl = rules.compTbl;
var actionPlanTbl = rules.actionPlanTbl;
var cmpnt_rslts = rules.cmpnt_rslts;

validate.validators.checkComponentsTable = function(value, options, key, attrib) {
  lodash.forEach(value, function(value, key) {
    var result = validate.validate(value, compTbl);
    if (result) {
      var index = lodash.findIndex(validationError, result);
      if (index == -1) {
        validationError.push(result);
      }
    }
  });
};

var assesmentSchema = new Schema({
  cloudantId: {
    type: String
  },
  teamId: {
    type: String,
    required: [true, 'teamId is required.']
  },
  version: {
    type: String,
    required: [true, 'version is required.']
  },
  docStatus: {
    type: String,
    default: null
  },
  type: {
    type: String
  },
  deliversSoftware: {
    type: Boolean,
    required: [true, 'deliversSoftware is required.']
  },
  assessmentStatus: {
    type: String,
    enum: ['Submitted', 'Draft']
  },
  assessorUserId: {
    type: String,
    required: [true, 'assessorUserId is required.']
  },
  assessor: {
    type: String
  },
  assessorStatus: {
    type: String
  },
  assessedDate: {
    type: Date
  },
  submittedByUserId: {
    type: String
  },
  submittedBy: {
    type: String
  },
  submittedDate: {
    type: Date
  },
  createDate: {
    type: Date,
    required: [true, 'createDate is required.']
  },
  createdByUserId: {
    type: String,
    required: [true, 'createdByUserId is required']
  },
  createdBy: {
    type: String,
    required: [true, 'createdBy is required']
  },
  updateDate: {
    type: Date,
    default: new Date()
  },
  updatedByUserId: {
    type: String,
    default: null
  },
  updatedBy: {
    type: String
  },
  componentResults: {
    type: Array,
    validate: {
      validator: function(value) {
        return lodash.forEach(value, function(value, key) {
          var result = validate.validate(value, cmpnt_rslts);
          if (result) {
            var index = lodash.findIndex(validationError, result);
            if (index == -1) {
              return false;
            }
          }
        });
      },
      message: 'Invalid assessment component'
    }
  },
  actionPlans: {
    type: Array,
    validate: {
      validator: function(value) {
        lodash.forEach(value, function(value, key) {
          var result = validate.validate(value, actionPlanTbl);
          if (result) {
            var index = lodash.findIndex(validationError, result);
            if (index == -1) {
              validationError.push(result);
            }
          }
        });
      },
      message: 'Invalid assessment action plan'
    }
  }
});

var assessmentModel = mongoose.model('assesment', assesmentSchema);

module.exports.getTeamAssessments = function(teamId, docs){
  return new Promise(function(resolve, reject) {
    if (lodash.isEmpty(teamId)) {
      var msg = {
        message: 'Team ID is required'
      };
      loggers.get('models').error('Error: ' + msg.message);
      return reject(msg);
    } else {
      var sort =  {assessorStatus: 1, assessedDate: -1};
      if (docs) {
        return assessmentModel
        .find({'teamId' : teamId})
        .sort(sort)
        .then(function(result){
          return resolve(result);
        })
        .catch( /* istanbul ignore next */ function(err) {
          /* cannot simulate MongoDB error during testing */
          var msg = err.message;
          return reject(formatErrMsg(msg));
        });
      } else {
        return assessmentModel
        .find({'teamId' : teamId})
        .select({
          team_id: 1,
          assessmt_status: 1,
          created_dt: 1,
          last_updt_user: 1
        })
        .sort(sort)
        .then(function(result){
          return resolve(result);
        })
        .catch( /* istanbul ignore next */ function(err) {
          /* cannot simulate MongoDB error during testing */
          loggers.get('models').error('Error: ' + err.error);
          return reject(err);
        });
      }
    }
  });
};

module.exports.getAssessmentTemplate = function(){
  return new Promise(function(resolve, reject){
    return assessmentModel
      .find({'type' : 'ref_matassessment'})
      .then(function(result){
        return resolve(result);
      })
      .catch( /* istanbul ignore next */ function(err) {
        /* cannot simulate MongoDB error during testing */
        loggers.get('models').error('Error: ' + err.error);
        return reject(err);
      });
  });
};

module.exports.getAssessment = function(assessmentId){
  return new Promise(function(resolve, reject) {
    if (lodash.isEmpty(assesmentId)){
      msg = 'No assessment id provided.';
      reject(formatErrMsg(msg));
    } else {
      return assessmentModel
      .find({'_id' : assessmentId})
      .then(function(result) {
        loggers.get('models').verbose('Success: ' + 'Assessment ' + _id + ' record retrieved.');
        return resolve(result);
      })
      .catch( /* istanbul ignore next */ function(err) {
        /* cannot simulate MongoDB error during testing */
        loggers.get('models').error('Error: ' + err.error);
        return reject(err);
      });
    }
  });
};

module.exports.addTeamAssessment = function(userId, data){
  return new Promise(function(resolve, reject) {
    loggers.get('models').verbose('addTeamAssessment user:' + userId + ' status: ' + data.assessmt_status);
    var msg = '';
    validationError = [];
    util.isUserAllowed(userId, data.team_id)
      .then(function(body) {
        var validateError;
        if (data.assessmt_status == 'Draft') {
          validateError = validate(data, recordConstraints);
        } else {
          validateError = validate(data, assessmentConstraints);
        }
        if (validateError || lodash.size(validationError) > 0) {
          if (!validateError)
            validateError = new Object();
          lodash.forEach(validationError, function(value, key) {
            lodash.forEach(lodash.keysIn(value), function(val, k) {
              validateError[val] = value[val];
            });
          });
          reject(formatErrMsg(validateError));
        } else {
          loggers.get('models').verbose('Add assessment record to Cloudant.');
          var assessmentDocu = new assessmentModel(data);
          return assessmentDocu.save();
        }
      })
      .then(function(body) {
        loggers.get('models').verbose('Success: ' + 'Assessment record inserted.');
        resolve(body);
      })
      .catch( /* istanbul ignore next */ function(err) {
        /* cannot simulate MongoDB error during testing */
        loggers.get('models').error('Error: ' + err.error);
        return reject(err);
      });
  });
};

module.exports.updateTeamAssessment = function(userId, data){
  return new Promise(function(resolve, reject) {
    var msg = '';
    validationError = [];
    loggers.get('models').verbose('updateTeamAssessment ' + userId + ', team id: ' + data.team_id);
    util.isUserAllowed(userId, data.team_id)
      .then(function(body) {
        if (data.assessmt_status == 'Draft') {
          validateError = validate(data, recordConstraints);
        } else {
          validateError = validate(data, assessmentConstraints);
        }
        if (validateError || lodash.size(validationError) > 0) {
          if (!validateError)
            validateError = new Object();
          lodash.forEach(validationError, function(value, key) {
            lodash.forEach(lodash.keysIn(value), function(val, k) {
              validateError[val] = value[val];
            });
          });
          reject(formatErrMsg(validateError));
        } else {
          loggers.get('models').verbose('Update assessment ' + data._id + ' record ' + data._rev + ' to Cloudant.');
          var thisId = data['_id'];
          delete data['_id'];
          delete data['_rev'];
          return assessmentModel.findOneAndUpdate({'_id' :  thisId}, data);
        }
      })
      .then(function(body) {
        loggers.get('models').verbose('Success: ' + 'Assessment ' + thisId + ' record updated.');
        resolve(body);
      })
      .catch( /* istanbul ignore next */ function(err) {
        /* cannot simulate MongoDB error during testing */
        loggers.get('models').error('Error: ' + err.error);
        return reject(err);
      });
  });
};

module.exports.deleteAssessment = function(userId, assessmentId){
  return new Promise(function(resolve, reject) {
    loggers.get('models').verbose('Delete assessment ' + assessmentId + ' by ' + userId + ' to MongoDB.');
    if (!lodash.isEmpty(assessmentId) && !lodash.isEmpty(userId)) {
      assessmentModel.getAssessment(assessmentId)
      .then(function(result) {
        if (!lodash.isEmpty(result)) {
          var teamId = result.team_id;
          return util.isUserAllowed(userId, teamId);
        } else {
          msg = 'No record to delete.';
          return reject(formatErrMsg(msg));
        }
      })
      .then(function() {
        return assessmentModel.remove({'_id' : assessmentId});
      })
      .then(function() {
        loggers.get('models').verbose('Success: ' + 'Assessment ' + assessmentId + ' record deleted.');
        return resolve(true);
      })
      .catch( /* istanbul ignore next */ function(err) {
        /* cannot simulate MongoDB error during testing */
        return reject(true);
      });
    } else {
      loggers.get('models').error('Error: ' + msg);
      return reject(msg);
    }
  });
};
