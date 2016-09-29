var lodash = require('lodash');
var Promise = require('bluebird');
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var config = require('../../settings');
mongoose.createConnection(config.mongoURL);
var loggers = require('../../middleware/logger');
var Schema   = mongoose.Schema;
var lodash = require('lodash');
var Users = require('./users');

var actionPlansSchema = new Schema({
  id : {
    type: Number
  },
  isUserCreated: {
    type: Boolean
  },
  componentName: {
    type: String
  },
  principleId: {
    type: Number
  },
  practiceName: {
    type: String
  },
  improveDescription: {
    type: String
  },
  currentLevel: {
    type: String
  },
  targetLevel: {
    type: String
  },
  progressComment: {
    type: String
  },
  keyMetric: {
    type: String
  },
  reviewDate: {
    type: Date
  },
  actionStatus: {
    type: String
  }
});

var componentResultsAssessedSchema = new Schema({
  principleId: {
    type: Number
  },
  principleName: {
    type: String
  },
  practiceId: {
    type: Number
  },
  practiceName: {
    type: String
  },
  currentLevelName: {
    type: String
  },
  currentScore: {
    type: Number
  },
  targetLevelName: {
    type: String
  },
  targetScore: {
    type: Number
  },
  improveDescription: {
    type: String
  },
  assessorComment: {
    type: String
  }
});

var componentResultsSchema = new Schema({
  componentName: {
    type: String
  },
  currentScore: {
    type: Number
  },
  targetScore: {
    type: Number
  },
  assessedComponents: [componentResultsAssessedSchema]
});

var assessmentsSchema = new Schema({
  cloudantId: {
    type: String
  },
  teamId: {
    type: Schema.Types.ObjectId,
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
  componentResults: [componentResultsSchema],
  actionPlans: [actionPlansSchema]
}, {collection:'assessments'});

var Assessment = mongoose.model('assessments', assessmentsSchema);

module.exports.addTeamAssessment = function(userEmail, data){
  return new Promise(function(resolve, reject) {
    if (lodash.isEmpty(userEmail) && lodash.isEmpty(data)) {
      var err = {'error': 'User email and Assessment data is required'};
      loggers.get('models').error('Error: ' + err);
      reject(err);
    } else {
      var teamId = data['teamId'];
      Users.isUserAllowed(userEmail, teamId)
      .then(function(isAllowed){
        if (!isAllowed) {
          var err = {'error': 'Not allowed to add assessment for this team'};
          loggers.get('models').error('Error: ' + err);
          reject(err);
        } else {
          return true;
        }
      })
      .then(function() {
        var newAssessmentData = new Assessment(data);
        var error = newAssessmentData.validateSync();
        if (error) {
          loggers.get('models').error('Error: ' + error);
          return reject(error);
        } else {
          newAssessmentData.save()
          .then(function(result) {
            return resolve(result);
          })
          .catch( /* istanbul ignore next */ function(err) {
            /* cannot simulate MongoDB error during testing */
            loggers.get('models').error('Error: ' + err.error);
            return reject(err);
          });
        }
      });
    }
  });
};

module.exports.getTeamAssessments = function(teamId, docs){
  return new Promise(function(resolve, reject) {
    if (lodash.isEmpty(teamId)) {
      var err = {'error': 'Team ID is required'};
      loggers.get('models').error('Error: ' + err);
      reject(err);
    } else {
      Assessment.find({'teamId': teamId})
      .then(function(result) {
        resolve(result);
      })
      .catch( /* istanbul ignore next */ function(err) {
        /* cannot simulate MongoDB error during testing */
        loggers.get('models').error('Error: ' + err.error);
        return reject(err);
      });
    }
  });
};

module.exports.getAssessment = function(assessmentId){
  return new Promise(function(resolve, reject) {
    if (lodash.isEmpty(assessmentId)) {
      var err = {'error': 'Assessment ID is required'};
      loggers.get('models').error('Error: ' + err);
      reject(err);
    } else {
      Assessment.find({'_id': assessmentId})
      .then(function(result) {
        resolve(result);
      })
      .catch( /* istanbul ignore next */ function(err) {
        /* cannot simulate MongoDB error during testing */
        loggers.get('models').error('Error: ' + err.error);
        return reject(err);
      });
    }
  });
};

module.exports.updateTeamAssessment = function(userEmail, data){
  return new Promise(function(resolve, reject) {
    if (lodash.isEmpty(assessmentId) || lodash.isEmpty(userEmail)) {
      var msg = 'Assessment ID and user email is required';
      msg={'error':msg};
      loggers.get('models').error('Error: ' + msg);
      return reject(msg);
    } else {
      if (lodash.isEmpty(data['teamId']) || lodash.isEmpty(data['_id'])) {
        var msg = 'Invalid assessment or team id';
        msg={'error':msg};
        loggers.get('models').error('Error: ' + msg);
        return reject(msg);
      } else {
        var teamId = data['teamId'];
        Users.isUserAllowed(userEmail, teamId)
        .then(function(isAllowed) {
          if (!isAllowed) {
            var err = {'error': 'Not allowed to update assessment'};
            loggers.get('models').error('Error: ' + err);
            reject(err);
          } else {
            return true;
          }
        })
        .then(function() {
          return Assessment.findOneAndUpdate({'_id' :  data['_id']}, data, {'new':true});
        })
        .then(function(result) {
          resolve(result);
        })
        .catch( /* istanbul ignore next */ function(err) {
          /* cannot simulate MongoDB error during testing */
          return reject(err);
        });
      }
    }
  });
};

module.exports.deleteAssessment = function(userEmail, assessmentId){
  return new Promise(function(resolve, reject) {
    if (lodash.isEmpty(assessmentId) || lodash.isEmpty(userEmail)) {
      var msg = 'Assessment ID and user email is required';
      msg={'error':msg};
      loggers.get('models').error('Error: ' + msg);
      return reject(msg);
    } else {
      Assessment.findOne({'_id': assessmentId}, {teamId: 1})
      .then( function(result) {
        var teamId = result['teamId'];
        return Users.isUserAllowed(userEmail, teamId);
      })
      .then(function(isAllowed){
        if (!isAllowed) {
          var err = {'error': 'Not allowed to delete assessment'};
          loggers.get('models').error('Error: ' + err);
          reject(err);
        } else {
          return true;
        }
      })
      .then(function() {
        return Assessment.remove({'_id': assessmentId});
      })
      .then(function(body) {
        return resolve(body);
      })
      .catch( /* istanbul ignore next */ function(err) {
        /* cannot simulate MongoDB error during testing */
        var msg = err.message;
        return reject(formatErrMsg(msg));
      });
    }
  });
};
