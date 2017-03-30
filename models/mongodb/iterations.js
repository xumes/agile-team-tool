'use strict';
var _ = require('underscore');
var Promise = require('bluebird');
var mongoose = require('mongoose');
var ObjectId = require('mongodb').ObjectID;
var loggers = require('../../middleware/logger');
var Users = require('./users.js');
var util = require('../../helpers/util');
var teamModel = require('./teams');
var moment = require('moment');
var business = require('moment-business');
var dateFormat = 'YYYY-MM-DD HH:mm:ss';
var Schema   = mongoose.Schema;

require('../../settings');

var IterationSchema = {
  cloudantId: {
    type: String
  },
  createDate: {
    type: Date,
    required: [true, 'Creation date is required.']
  },
  createdByUserId: {
    type: String,
    required: [true, 'UserId of creator is required.']
  },
  createdBy: {
    type: String,
    required: [true, 'Name of creator is required.']
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
    type: String,
    default: null
  },
  docStatus: {
    type: String,
    default:null
  },
  startDate: {
    type: Date,
    required: [true, 'Start date of Iteration is required.']
  },
  endDate: {
    type: Date,
    required: [true, 'End date of Iteration is required.'],
    validate: [validateDate, 'End date must be >= start date']
  },
  name: {
    type: String,
    required: [true, 'Name of Iteration is required.']
  },
  teamId: {
    type: Schema.Types.ObjectId,
    required: [true, 'TeamId of Iteration is required.']
  },
  memberCount: {
    type: Number,
    //required: [true, 'Member count is required.']
  },
  memberFte: {
    type: Number,
    default: null
  },
  status: {
    type: String,
    default: 'Not complete'
  },
  committedStories: {
    type: Number,
    default: null
  },
  deliveredStories: {
    type: Number,
    default: null
  },
  committedStoryPoints: {
    type: Number,
    default: null
  },
  storyPointsDelivered: {
    type: Number,
    default: null
  },
  deployments: {
    type: Number,
    default: null
  },
  clientSatisfaction: {
    type: Number,
    min: [1, 'Client satisfaction should be between 1.0 - 4.0'],
    max: [4, 'Client satisfaction should be between 1.0 - 4.0'],
    default: null
  },
  teamSatisfaction: {
    type: Number,
    min: [1, 'Team satisfaction should be between 1.0 - 4.0'],
    max: [4,'Team satisfaction should be between 1.0 - 4.0'],
    default: null
  },
  comment: {
    type: String,
    default: null
  },
  memberChanged: {
    type: Boolean,
    default: false
  },
  defectsStartBal: {
    type: Number,
    default: null
  },
  defects: {
    type: Number,
    default: null
  },
  defectsClosed: {
    type: Number,
    default: null
  },
  defectsEndBal: {
    type: Number,
    min: [0, 'Closing balance defects must be a number'],
    default: null
  },
  cycleTimeWIP: {
    type: Number,
    default: null
  },
  cycleTimeInBacklog: {
    type: Number,
    default: null
  },
  teamAvailability: {
    type: Number,
    default: null
  },
  personDaysUnavailable: {
    type: Number,
    default: null
  },
  personDaysAvailable: {
    type: Number,
    default: null
  },
  storiesDays: {
    type: Number,
    default: null
  },
  storyPointDays: {
    type: Number,
    default: null
  }
};

function isIterationNumExist(iterationName, iterData, docId) {
  var duplicate = false;
  _.find(iterData, function(iter){
    if (iter.name == iterationName) {
      if (docId && docId.toString() == iter._id.toString()) {
        return duplicate = false;
      } else {
        return duplicate = true;
      }
    }
  });
  return duplicate;
};

function validateDate(value) {
  var dateFormat = 'MM/DD/YYYY';
  var error = false;
  var d1, d2;
  if (_.isFunction(this.getUpdate)){
    d1 = moment(new Date(this.getUpdate().$set.startDate), dateFormat);
    d2 = moment(new Date(this.getUpdate().$set.endDate), dateFormat);
  }
  else {
    d1 = moment(new Date(this.startDate), dateFormat);
    d2 = moment(new Date(this.endDate), dateFormat);
  }
  var diff = moment(d1).diff(d2, 'days', true);
  if (diff < 1) {
    error = true;
  }
  return error;
};

function validateIteration(data, iterData, docId){
  var errorMsg = {};
  var errorsList = {};
  var duplicate = isIterationNumExist(data['name'], iterData, docId);
  if (duplicate) {
    errorsList.name = {
      message:'Iteration number/identifier: ' + data['name'] + ' already exists'
    };
  }

  if (_.keys(errorsList).length > 0){
    errorMsg.errors = errorsList;
  }

  return errorMsg;
};

var iterationSchema = new Schema(IterationSchema);

var Iteration = mongoose.model('iterations', iterationSchema);

var IterationExport = {
  getModel: /* istanbul ignore next */ function() {
    return Iteration;
  },

  hasIterations: function(teamId) {
    return new Promise(function(resolve, reject) {
      Iteration.find({'teamId': teamId, docStatus:{$ne:'delete'}}, {_id:1})
        .then(function(results) {
          if (_.isEmpty(results))
            resolve(false);
          else
            resolve(true);
        })
        .catch( /* istanbul ignore next */ function(err){
          reject({'error':err});
        });
    });
  },

  getByIterInfo: function(teamId, limit) {
    return new Promise(function(resolve, reject) {
      if (teamId) {
        Iteration.find({'teamId': teamId}).sort('endDate').exec()
          .then(function(results){
            loggers.get('model-iteration').verbose('getByIterInfo() - Team Iteration docs obtained. teamId: ' + teamId);
            resolve(results);
          })
          .catch( /* istanbul ignore next */ function(err){
            reject({'error':err});
          });
      }
      else {
        loggers.get('model-iteration').verbose('getByIterInfo() - no teamId, Getting all team Iteration docs');
        if (limit) {
          Iteration.find().limit(limit).exec()
            .then(function(results){
              loggers.get('model-iteration').verbose('getByIterInfo() - Team Iteration docs obtained with limit: ' + limit);
              resolve(results);
            })
            .catch( /* istanbul ignore next */ function(err){
              reject({'error':err});
            });
        }
        else {
          /* istanbul ignore next */ Iteration.find().exec()
            .then( /* istanbul ignore next */ function(results){
              loggers.get('model-iteration').verbose('getByIterInfo() - All team iteration docs obtained');
              resolve(results);
            })
            .catch( /* istanbul ignore next */ function(err){
              reject({'error':err});
            });
        }
      }
    });
  },

  get: function(docId) {
    return new Promise(function(resolve, reject) {
      Iteration.findOne({'_id':docId}).exec()
      .then(function(iteration){
        resolve(iteration);
      })
      .catch( /* istanbul ignore next */ function(err){
        reject({'error':err});
      });
    });
  },

  getCompletedIterationsByKey: function(startkey, endkey) {
    return new Promise(function(resolve, reject) {
      var qReq = {
        '$or': [
          {'docStatus': null},
          {'docStatus': {'$ne': 'delete'}}
        ],
        'status': 'Completed'
      };
      if (startkey && endkey) {
        qReq['endDate'] = {
          '$gte': moment(new Date(startkey)).format(dateFormat),
          '$lte': moment(new Date(endkey)).format(dateFormat)
        };
      } else if (startkey) {
        qReq['endDate'] = {
          '$gte': moment(new Date(startkey)).format(dateFormat)
        };
      } else if (endkey) {
        qReq['endDate'] = {
          '$lte': moment(new Date(endkey)).format(dateFormat)
        };
      }
      Iteration.find(qReq).sort('endDate').exec()
        .then(function(body) {
          loggers.get('model-iteration').verbose('getCompletedIterationsByKey() - '+body.length+' Completed Iteration docs obtained');
          resolve(body);
        })
        .catch( /* istanbul ignore next */ function(err) {
          reject({'error':err});
        });
    });
  },

  add: function(data, user) {
    return new Promise(function(resolve, reject) {
      // user validated through apikey works with users collection object, session ldap object if otherwise
      var userId = user.userId || user.ldap.uid;
      data['createDate'] = new Date(moment.utc());
      data['updateDate'] = new Date(moment.utc());
      data['status'] = IterationExport.calculateStatus(data);
      Users.findUserByUserId(userId.toUpperCase())
      .then(function(userInfo){
        if (userInfo == null) {
          var msg = 'This user is not in the database: ' + userId;
          loggers.get('model-iteration').error(msg);
          return Promise.reject(msg);
        }
        else {
          data['createdBy'] = userInfo.email;
          data['createdByUserId'] = userInfo.userId;
          data['updatedBy'] = userInfo.email;
          data['updatedByUserId'] = userInfo.userId;
          return Users.isUserAllowed(userInfo.userId, data['teamId']);
        }
      })
      .then(function(validUser){
        if (validUser) {
          return IterationExport.getByIterInfo(data['teamId']);
        } else {
          var msg = 'This user is not allowed to add Iteration: ' + userId;
          loggers.get('model-iteration').error(msg);
          return Promise.reject(msg);
        }
      })
      .then(function(iterData){
        if (iterData != undefined) {
          var errors = validateIteration(data, iterData);
          if (!_.isEmpty(errors)){
            return Promise.reject(errors);
          }
        }
        delete data['_id'];
        return data;
      })
      .then(function(cleanData) {
        return IterationExport.getDefectsOpenBalance(cleanData.teamId, cleanData.startDate);
      })
      .then(function(openBalance) {
        if (_.isUndefined(data['defectsStartBal']) && _.isEmpty(data['defectsStartBal'])) {
          data['defectsStartBal'] = openBalance;
        } else {
          openBalance = util.getIntegerValue(data['defectsStartBal']);
        }
        var newDefects = util.getIntegerValue(data['defects']);
        var closedDefects = util.getIntegerValue(data['defectsClosed']);
        var endBalance = openBalance + newDefects - closedDefects;
        if (_.isUndefined(data['defects']) || !_.isEmpty(data['defects']))
          data['defects'] = newDefects;
        if (_.isUndefined(data['defectsClosed']) || !_.isEmpty(data['defectsClosed']))
          data['defectsClosed'] = closedDefects;
        data['defectsEndBal'] = endBalance;

        return Iteration.create(data);
      })
      .then(function(result){
        loggers.get('model-iteration').verbose('Iteration added ' + result);
        return resolve(result);
      })
      .catch( /* istanbul ignore next */ function(err){
        loggers.get('model-iteration').error('Iteration add error: ' + err);
        reject({'error':err});
      });
    });
  },

  edit: function(docId, data, user) {
    return new Promise(function(resolve, reject) {
      // user validated through apikey works with users collection object, session ldap object if otherwise
      var userId = user.userId || user.ldap.uid;
      IterationExport.get(docId)
      .then(function(iterData){
        if (_.isEmpty(iterData)) {
          var msg = 'Iteration does not exist: ' + docId;
          loggers.get('model-iteration').error(msg);
          return Promise.reject(msg);
        }
        if (_.isEmpty(data['teamId']))
          data['teamId'] = iterData['teamId'];
        return Users.isUserAllowed(userId.toUpperCase(), data['teamId']);
      })
      .then(function(isAllowed){
        if (isAllowed)
          return IterationExport.getByIterInfo(data['teamId']);
          //return Iteration.where({'_id': docId}).update({'$set':data});
        else
          return Promise.reject('The user is not allowed to edit iteration:' + userId);
      })
      .then(function(iterData){
        if (iterData != undefined && iterData.length > 0) {
          var errors = validateIteration(data, iterData, docId);
          if (!_.isEmpty(errors)){
            return Promise.reject(errors);
          }

        }
        return Users.findUserByUserId(userId.toUpperCase());
      })
      .then(function(userInfo){
        if (userInfo == null) {
          var msg = 'This user is not in the database: ' + userId;
          loggers.get('model-iteration').error(msg);
          return Promise.reject(msg);
        }
        else {
          data['updateDate'] = new Date(moment.utc());
          data['updatedBy'] = userInfo.email;
          data['updatedByUserId'] = userInfo.userId;
          data['status'] = IterationExport.calculateStatus(data);
          data['defectsEndBal'] = IterationExport.calculateDefectEndngBalance(data);
          return Iteration.where({'_id': docId}).update({},{'$set':data}, {runValidators:true, context: 'query'});
        }
      })
      .then(function(result){
        return resolve(result);
      })
      .catch( /* istanbul ignore next */ function(err){
        loggers.get('model-iteration').error('Iteration edit error: ' + err);
        return reject({'error':err});
      });
    });
  },

  /*
   * Get previous iteration's closing defect balance
   * @params teamid - team ID
   * @params iterEndDate - iteration end date
   */
  getDefectsOpenBalance: function(teamId, iterEndDate) {
    return new Promise(function(resolve, reject) {
      var params = {
        id: teamId,
        endDate: iterEndDate,
        limit: 1
      };
      IterationExport.searchTeamIteration(params)
      .then(function(iteration) {
        //console.log('[getDefectsOpenBalance] body: '+JSON.stringify(iteration));
        if (!_.isEmpty(iteration)) {
          if (!_.isUndefined(iteration[0].defectsEndBal) & !isNaN(iteration[0].defectsEndBal))
            return util.getIntegerValue(iteration[0].defectsEndBal);
        }
        return 0;
      })
      .then(function(body) {
        resolve(body);
      })
      .catch( /* istanbul ignore next */ function(err) {
        loggers.get('models').error('[iterationModel.getOpeningDefectBalance]:', err);
        reject({'error':err});
      });
    });
  },

  searchTeamIteration: function(p) {
    return new Promise(function(resolve, reject){
      var qReq = {'docStatus': {'$ne': 'delete'}};
      if (!_.isEmpty(p.id))
        qReq['teamId'] = new ObjectId(p.id);

      if (!_.isEmpty(p.status))
        qReq['status'] = p.status;

      if (!_.isEmpty(p.startDate) || !_.isEmpty(p.endDate)){
        var startDate = p.startDate;
        var endDate = p.endDate;
        if (startDate && endDate)
          qReq['endDate'] = {
            '$gte': moment(new Date(startDate)).format(dateFormat),
            '$lte': moment(new Date(endDate)).format(dateFormat)
          };
        else if (startDate)
          qReq['endDate'] = {
            '$gte': moment(new Date(startDate)).format(dateFormat)
          };
        else if (endDate)
          qReq['endDate'] = {
            '$lte': moment(new Date(endDate)).format(dateFormat)
          };
      }
      var limit = util.getIntegerValue(p.limit);
      if (limit > 0) {
        loggers.get('model-iteration').verbose('Querying Iteration w/ limit :' + JSON.stringify(qReq), p.limit);
        Iteration.find(qReq).sort('-endDate').limit(limit).exec()
        .then(function(iterations){
          resolve(iterations);
        })
        .catch( /* istanbul ignore next */ function(err){
          reject({'error':err});
        });
      } else {
        loggers.get('model-iteration').verbose('Querying Iteration:' + JSON.stringify(qReq));
        Iteration.find(qReq).sort('-endDate').exec()
        .then(function(iterations){
          resolve(iterations);
        })
        .catch( /* istanbul ignore next */ function(err){
          reject({'error':err});
        });
      }
    });
  },

  calculateStatus: function(data) {
    var Iteration_end_dt = data['endDate'];
    var nbr_stories_dlvrd = data['deliveredStories'] || 0;
    var nbr_story_pts_dlvrd = data['storyPointsDelivered'] || 0;
    var nbr_dplymnts = data['deployments'] || 0;
    var nbr_defects = data['defects'] || 0;
    var team_sat = data['teamSatisfaction'] || 0;
    var client_sat = data['clientSatisfaction'] || 0;
    var status;
    var endDate = new Date(Iteration_end_dt);
    var d1 = moment(endDate).format(dateFormat);
    //var d2 = util.getServerTime();
    var d2 = moment().format(dateFormat);
    var d1 = moment(d1, dateFormat);
    var d2 = moment(d2, dateFormat);
    if (d1 <= d2) {
      // console.log('endDate is <= than serDate');
      var diffDays = d2.diff(d1, 'days');
      // updating status for only having more than 3 days from Iteration end date
      if (diffDays > 3) {
        // console.log("diffDays > 3");
        status = 'Completed';
      } else if (nbr_stories_dlvrd != 0 ||
        nbr_story_pts_dlvrd != 0 ||
        nbr_dplymnts != 0 ||
        nbr_defects != 0 ||
        team_sat != 0 ||
        client_sat != 0) {
        status = 'Completed';
      } else {
        status = 'Not complete';
      }
    } else {
      status = 'Not complete';
    }

    return status;
  },

  calculateDefectEndngBalance: function(data) {
    var defectStartingBalanace = util.getIntegerValue(data['defectsStartBal'] || 0);
    var defectNew = util.getIntegerValue(data['defects'] || 0);
    var defectClosing = util.getIntegerValue(data['defectsClosed'] || 0);
    var defectEndingBalance = defectStartingBalanace + defectNew - defectClosing;
    if (defectEndingBalance < 0)
      defectEndingBalance = 0;
    return defectEndingBalance;
  },

  getNotCompletedIterations: function() {
    return new Promise(function(resolve, reject){
      Iteration.find({'status': 'Not complete', 'docStatus': {'$ne': 'delete'}}).exec()
      .then(function(iterations){
        resolve(iterations);
      })
      .catch( /* istanbul ignore next */ function(err){
        reject({'error':err});
      });
    });
  },

  bulkUpdateIterations: /* istanbul ignore next */ function(Iterations) {
    return new Promise(function(resolve, reject) {
      var bulk = Iteration.collection.initializeUnorderedBulkOp();
      if (_.isEmpty(Iterations)) {
        resolve([]);
      } else {
        _.each(Iterations, function(Iteration){
          bulk.find({'_id':Iteration._id}).update({'$set':Iteration.set});
        });
        bulk.execute(function(error, result){
          if (error) {
            /* istanbul ignore next */
            reject(error);
          } else {
            resolve(result);
          }
        });
      }
    });
  },

  softDelete: function(docId, user) {
    return new Promise(function(resolve, reject) {
      var updateDoc = {};
      var userId = user['ldap']['uid'].toUpperCase();
      var userEmail = user['shortEmail'].toLowerCase();
      updateDoc.docStatus = 'delete';
      updateDoc.updatedByUserId = userId;
      updateDoc.updatedBy = userEmail;
      updateDoc.updateDate = new Date(moment.utc());
      Iteration.update({'_id': docId}, {'$set': updateDoc}).exec()
        .then(function(result){
          return resolve(result);
        })
        .catch( /* istanbul ignore next */ function(err){
          return reject(err);
        });
    });
  },
  // used in tests
  deleteIter: function(docId, user) {
    return new Promise(function(resolve, reject) {
      // using apikey works with users collection object, session ldap object if otherwise
      var userId = user.userId || user.ldap.uid;
      if (!docId) {
        var msg = {
          _id: ['_id/_rev is missing']
        };
        loggers.get('model-iteration').error('delete() ' + msg);
        reject({'error':msg});
      } else {
        Iteration.remove({'_id': docId})
          .then(function(body) {
            resolve(body);
          })
          .catch( /* istanbul ignore next */ function(err) {
            loggers.get('model-iteration').error('delete() ' + err);
            reject({'error':err});
          });
      }
    });
  },
  deleteByFields: /* istanbul ignore next */ function(request) {
    return new Promise(function(resolve, reject) {
      if (!request) {
        var msg = 'request is missing';
        loggers.get('model-iteration').error('delete() ' + msg);
        reject({'error':msg});
      }
      else {
        Iteration.findOneAndRemove(request).exec()
          .then(function(body) {
            resolve(body);
          })
          .catch( /* istanbul ignore next */ function(err) {
            loggers.get('model-iteration').error('deleteByFields() ' + err);
            reject({'error':err});
          });
      }
    });
  },

  updateSprintAvailability: function() {
    var promiseArray = [];
    var uniqueTeamIdArray = [];
    var iterationArray = [];
    var readyToUpdateIterations = [];
    return new Promise(function(resolve, reject) {

      IterationExport.getNotCompletedIterations()
      .then(function(iterations) {
          //loop through here to calculate Sprint
        _.each(iterations, function(iteration) {
          iterationArray.push(iteration);
          uniqueTeamIdArray.push(iteration.teamId.toHexString());
        });
          //get unique team id for team extract in preparation for iteration sprint calculation
        uniqueTeamIdArray=_.uniq(uniqueTeamIdArray);

        _.each(uniqueTeamIdArray, function(uniqueTeam){
          promiseArray.push(teamModel.getTeam(uniqueTeam));
        });

        return Promise.all(promiseArray);
      })
        .then(function(teams) {
          _.each(iterationArray, function(iteration){
            var maxWorkDays  = 0;
            if (iteration.startDate !=undefined && iteration.endDate!=undefined)
            {
              maxWorkDays = business.weekDays(moment.utc(iteration.startDate),moment.utc(iteration.endDate));
              if (business.isWeekDay(moment.utc(iteration.endDate)))
                maxWorkDays++;
            }

            var matchedTeam = _.find(teams, function(team) {
              if (JSON.stringify(team._id) == JSON.stringify(iteration.teamId)) return team;
            });


            var members = [];
            var availability = 0;
            if (matchedTeam.members!=undefined && matchedTeam.members.length>0)
              members = matchedTeam.members;

            _.each(members, function(member){
              var allocation =  member.allocation/100;
              var avgWorkWeek = 0;
              if (member.workTime !=null)
              {
                if (!isNaN(parseInt(member.workTime)))
                  avgWorkWeek = member.workTime;
                else
                  avgWorkWeek = 0;
              }
              else
                avgWorkWeek = 100;

              avgWorkWeek = avgWorkWeek/100;
              availability += (allocation * avgWorkWeek * maxWorkDays);
            });

            iteration.teamAvailability = availability;
            iteration.personDaysUnavailable = 0;
            iteration.personDaysAvailable = (iteration.teamAvailability - iteration.personDaysUnavailable).toFixed(2);
      //    console.log('Team Name: '+matchedTeam.name + ' | Iteration Name: '+ iteration.name+' id: '+iteration._id+ ' | # of team members: '+matchedTeam.members.length+' Work days in this iteration: '+maxWorkDays+' | Team availability: '+iteration.teamAvailability + ' | Person days available: '+iteration.personDaysAvailable);
            var updateIteration = {
              '_id': iteration._id,
              'set': {
                'teamAvailability': iteration.teamAvailability,
                'personDaysUnavailable': iteration.personDaysUnavailable,
                'personDaysAvailable': iteration.personDaysAvailable
              }
            };

            //push ready to update onto a collection:
            readyToUpdateIterations.push(updateIteration);
          });
          return readyToUpdateIterations;
        })
        .then(function (readyToUpdateIterations){
          return IterationExport.bulkUpdateIterations(readyToUpdateIterations);
        })
        .then(function(result) {
          loggers.get('model-iteration').verbose('Successfully get "Not Complete" iterations.');
          resolve('Successfully completed this operation');
        })
        .catch(function(err) {
          loggers.get('model-iteration').verbose('Unable to process "Not Complete" iterations err='+err.error);
          reject({'error':err});
        });
    });
  }

};



module.exports = IterationExport;
