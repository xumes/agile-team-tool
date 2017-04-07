'use strict';
var _ = require('underscore');
var lodash = require('lodash');
var Promise = require('bluebird');
var config = require('../settings');
var mongoose = config.mongoose;
var loggers = require('../middleware/logger');
var Schema   = require('mongoose').Schema;
var lodash = require('lodash');
var Users = require('./users');
var moment = require('moment');
var self = this;

var actionPlansSchema = new Schema({
  actionPlanId: {
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
  principleName: {
    type: String
  },
  practiceName: {
    type: String
  },
  practiceId: {
    type: Number
  },
  improveDescription: {
    type: String
  },
  currentScore: {
    type: Number
  },
  targetScore: {
    type: Number
  },
  progressSummary: {
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
    type: String
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
    default: new Date()
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
}, {
  collection: 'assessments'
});

var Assessment = mongoose.model('assessments', assessmentsSchema);


module.exports.hasAssessments = function(teamId) {
  return new Promise(function(resolve, reject) {
    // Team.find({path:new RegExp(','+pathId+',$')}, docStatus:{$ne:'delete'}}, {_id:1})
    Assessment.find({
      'teamId': teamId,
      docStatus: {
        $ne: 'delete'
      }
    }, {
      _id: 1
    })
      .then(function(results) {
        if (_.isEmpty(results))
          resolve(false);
        else
          resolve(true);
      })
      .catch( /* istanbul ignore next */ function(err) {
        reject(err);
      });
  });
};

module.exports.addTeamAssessment = function(user, data) {
  return new Promise(function(resolve, reject) {
    if (lodash.isEmpty(user) && lodash.isEmpty(data)) {
      var err = {
        'error': 'User ID and Assessment data is required'
      };
      loggers.get('models').error('Error: ' + err);
      reject(err);
    } else {
      if (lodash.isEmpty(data['teamId'])) {
        var err = {
          'error': 'Assessment team id is required'
        };
        loggers.get('models').error('Error: ' + err);
        reject(err);
      } else {
        var teamId = data['teamId'];
        Users.isUserAllowed(user['ldap']['uid'].toUpperCase(), teamId)
          .then(function(isAllowed) {
            if (!isAllowed) {
              var err = {
                'error': 'Not allowed to add assessment for this team'
              };
              loggers.get('models').error('Error: ' + err);
              return Promise.reject(err);
            } else {
              return Users.findUserByUserId(user['ldap']['uid'].toUpperCase());
            }
          })
          .then(function(createdUser) {
            if (createdUser == null) {
              /* istanbul ignore next */
              return Promise.reject({
                'error': 'This user is not exist.'
              });
            } else {
              data['createdByUserId'] = createdUser.userId;
              data['createdBy'] = createdUser.email;
              data['createDate'] = new Date(moment.utc());
              data['updatedByUserId'] = createdUser.userId;
              data['updatedBy'] = createdUser.email;
              data['updateDate'] = new Date(moment.utc());
              if (data['assessmentStatus'] == 'Submitted' || data['assessmentStatus'] == 'Draft') {
                data['submittedByUserId'] = createdUser.userId;
                data['submittedBy'] = createdUser.email;
                if (_.isEmpty(data['submittedDate'])) {
                  data['submittedDate'] = new Date(moment.utc());
                }
              }
              var newAssessmentData = new Assessment(data);
              var error = newAssessmentData.validateSync();
              if (error) {
                loggers.get('models').error('Error: ' + error);
                return Promise.reject(error);
              } else {
                return newAssessmentData.save();
              }
            }
          })
          .then(function(result) {
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

module.exports.getTeamAssessments = function(teamId) {
  return new Promise(function(resolve, reject) {
    if (lodash.isEmpty(teamId)) {
      var err = {
        'error': 'Team ID is required'
      };
      loggers.get('models').error('Error: ' + err);
      reject(err);
    } else {
      Assessment.find({
        'teamId': teamId,
        'docStatus': {
          '$ne': 'delete'
        }
      }).exec()
        .then(function(result) {
          var returnAssessments = _.sortBy(result, function(assess) {
            if (assess.assessmentStatus == 'Submitted') {
              return new Date(assess.submittedDate);
            }
          });
          returnAssessments = returnAssessments.reverse();
          resolve(returnAssessments);
        })
        .catch( /* istanbul ignore next */ function(err) {
          /* cannot simulate MongoDB error during testing */
          loggers.get('models').error('Error: ' + err.error);
          return reject(err);
        });
    }
  });
};

module.exports.getAssessment = function(assessmentId) {
  return new Promise(function(resolve, reject) {
    if (lodash.isEmpty(assessmentId)) {
      var err = {
        'error': 'Assessment ID is required'
      };
      loggers.get('models').error('Error: ' + err);
      reject(err);
    } else {
      Assessment.findOne({
        '_id': assessmentId
      })
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

module.exports.updateTeamAssessment = function(user, data) {
  return new Promise(function(resolve, reject) {
    if (lodash.isEmpty(data) || lodash.isEmpty(user)) {
      var msg = 'Assessment ID and user ID is required';
      msg = {
        'error': msg
      };
      loggers.get('models').error('Error: ' + msg);
      return reject(msg);
    } else {
      if (lodash.isEmpty(data['teamId']) || lodash.isEmpty(data['_id'])) {
        var msg = 'Invalid assessment or team id';
        msg = {
          'error': msg
        };
        loggers.get('models').error('Error: ' + msg);
        return reject(msg);
      } else {
        var teamId = data['teamId'];
        Users.isUserAllowed(user['ldap']['uid'].toUpperCase(), teamId)
          .then(function(isAllowed) {
            if (!isAllowed) {
              var err = {
                'error': 'Not allowed to update assessment'
              };
              loggers.get('models').error('Error: ' + err);
              return Promise.reject(err);
            } else {
              return Users.findUserByUserId(user['ldap']['uid'].toUpperCase());
            }
          })
          .then(function(updatedUser) {
            if (updatedUser == null) {
              /* istanbul ignore next */
              return Promise.reject({
                'error': 'This user is not exist.'
              });
            } else {
              data['updatedByUserId'] = updatedUser.userId;
              data['updatedBy'] = updatedUser.email;
              data['updateDate'] = new Date(moment.utc());
              if (data['assessmentStatus'] == 'Submitted' || data['assessmentStatus'] == 'Draft') {
                data['submittedByUserId'] = updatedUser.userId;
                data['submittedBy'] = updatedUser.email;
                if (_.isEmpty(data['submittedDate'])) {
                  data['submittedDate'] = new Date(moment.utc());
                }
              }
            }
            return Assessment.findOneAndUpdate({
              '_id': data['_id']
            }, data, {
              'new': true
            });
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

module.exports.softDelete = function(docId, user) {
  return new Promise(function(resolve, reject) {
    if (lodash.isEmpty(docId)) {
      return reject({
        'error': 'Assessment Id is required'
      });
    } else {
      Assessment.findOne({
        '_id': docId
      }).exec()
        .then(function(result) {
          return Users.isUserAllowed(user['ldap']['uid'].toUpperCase(), result['teamId']);
        })
        .then(function(result) {
          if (!result) {
            return Promise.reject({
              'error': 'Not allowed to delete assessment'
            });
          } else {
            var updateDoc = {};
            var userId = user['ldap']['uid'].toUpperCase();
            var userEmail = user['shortEmail'].toLowerCase();
            updateDoc.docStatus = 'delete';
            updateDoc.updatedByUserId = userId;
            updateDoc.updatedBy = userEmail;
            updateDoc.updateDate = new Date(moment.utc());
            return Assessment.update({
              '_id': docId
            }, {
              '$set': updateDoc
            }).exec();
          }
        })
        .then(function(result) {
          return resolve(result);
        })
        .catch( /* istanbul ignore next */ function(err) {
          return reject(err);
        });
    }
    // var updateDoc = {};
    // var userId = user['ldap']['uid'].toUpperCase();
    // var userEmail = user['shortEmail'].toLowerCase();
    // updateDoc.docStatus = 'delete';
    // updateDoc.updatedByUserId = userId;
    // updateDoc.updatedBy = userEmail;
    // updateDoc.updateDate = new Date(moment.utc());
    // Assessment.update({'_id': docId}, {'$set': updateDoc}).exec()
    //   .then(function(result){
    //     return resolve(result);
    //   })
    //   .catch( /* istanbul ignore next */ function(err){
    //     return reject(err);
    //   });
  });
};

module.exports.deleteAssessment = function(userId, assessmentId) {
  return new Promise(function(resolve, reject) {
    if (lodash.isEmpty(assessmentId) || lodash.isEmpty(userId)) {
      var msg = 'Assessment ID and user ID is required';
      msg = {
        'error': msg
      };
      loggers.get('models').error('Error: ' + msg);
      return reject(msg);
    } else {
      Assessment.findOne({
        '_id': assessmentId
      }).exec()
        .then(function(result) {
          var teamId = result['teamId'];
          return Users.isUserAllowed(userId, teamId);
        })
        .then(function(isAllowed) {
          if (!isAllowed) {
            var err = {
              'error': 'Not allowed to delete assessment'
            };
            loggers.get('models').error('Error: ' + err);
            return Promise.reject(err);
          } else {
            return true;
          }
        })
        .then(function() {
          return Assessment.remove({
            '_id': assessmentId
          });
        })
        .then(function(body) {
          return resolve(body);
        })
        .catch( /* istanbul ignore next */ function(err) {
          /* cannot simulate MongoDB error during testing */
          var msg = err.message;
          return reject(err);
        });
    }
  });
};

module.exports.getSubmittedAssessments = function() {
  return new Promise(function(resolve, reject) {
    loggers.get('models').verbose('Getting all submitted assessments record from database.');
    Assessment.find({
      assessmentStatus: 'Submitted',
      docStatus: {
        $ne: 'delete'
      }
    })
      .then(function(body) {
        loggers.get('models').verbose('Submitted assessments record retrieved.');
        resolve(body);
      })
      .catch( /* istanbul ignore next */ function(err) {
        reject(err);
      });
  });
};

module.exports.deleteByCloudantId = function(cloudantId) {
  return new Promise(function(resolve, reject) {
    Assessment.remove({
      cloudantId: cloudantId
    })
      .then(function(body) {
        resolve(body);
      })
      .catch( /* istanbul ignore next */ function(err) {
        reject(err);
      });
  });
};
