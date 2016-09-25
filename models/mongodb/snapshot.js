var _ = require('underscore');
var Promise = require('bluebird');
var mongoose = require('mongoose');
var loggers = require('../../middleware/logger');
var userModel = require('./users.js');
var teamModel = require('./teams.js');
var iterationModel = require('./iteration.js');
var moment = require('moment');
var util = require('../../helpers/util');
var dateFormat = 'YYYY-MM-DD HH:mm:ss';
var Schema   = mongoose.Schema;

var iterationMonth = 5;
var lastUpdate = moment().format(dateFormat);
var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
var monthArray = [];

require('../../settings');

var pointsSchema = {
  totalPoints: {
    type: Number,
    default: 0
  },
  totalCommPoints: {
    type: Number,
    default: 0
  },
  totalStories: {
    type: Number,
    default: 0
  },
  totalCommStories: {
    type: Number,
    default: 0
  },
  totalCompleted: {
    type: Number,
    default: 0
  },
  totalDefects: {
    type: Number,
    default: 0
  },
  totalDplymts: {
    type: Number,
    default: 0
  },
  totTeamStat: {
    type: Number,
    default: 0
  },
  totClientStat: {
    type: Number,
    default: 0
  },
  totTeamStatIter: {
    type: Number,
    default: 0
  },
  totClientStatIter: {
    type: Number,
    default: 0
  },
  teamsLt5: {
    type: Number,
    default: 0
  },
  teams5to12: {
    type: Number,
    default: 0
  },
  teamsGt12: {
    type: Number,
    default: 0
  },
  totalSquad: {
    type: Number,
    default: 0
  },
  month: {
    type: String,
    default: ''
  },
  partialMonth: {
    type: Boolean,
    default: false
  }
};

var teamMemberSchema = {
  teamsLt5: {
    type: Number,
    default: 0
  },
  tcLt5: {
    type: Number,
    default: 0
  },
  fteLt5: {
    type: Number,
    default: 0
  },
  teams5to12: {
    type: Number,
    default: 0
  },
  tc5to12: {
    type: Number,
    default: 0
  },
  fte5to12: {
    type: Number,
    default: 0
  },
  teamsGt12: {
    type: Number,
    default: 0
  },
  tcGt12: {
    type: Number,
    default: 0
  },
  fteGt12: {
    type: Number,
    default: 0
  }
};

var snapshotSchema = {
  teamId: {
    type: Schema.Types.ObjectId,
    required: [true, 'team id is required.']
  },
  lastUpdate: {
    type: Date,
    default: moment().format(dateFormat)
  },
  pathId: {
    type: String,
    default: ''
  },
  iterationData: [pointsSchema],
  teamMemberData: [teamMemberSchema]
};

var snapshot_schema = new Schema(snapshotSchema);
var snapshotModel = mongoose.model('snapshot', snapshot_schema);

function resetData() {
  return [{
    'totalPoints': 0,
    'totalCommPoints': 0,
    'totalStories': 0,
    'totalCommStories': 0,
    'totalCompleted': 0,
    'totalDefects': 0,
    'totalDplymts': 0,
    'totTeamStat': 0,
    'totClientStat': 0,
    'totTeamStatIter': 0,
    'totClientStatIter': 0,
    'teamsLt5': 0,
    'teams5to12': 0,
    'teamsGt12': 0,
    'totalSquad': 0,
    'month': '',
    'partialMonth': false

  }, {
    'totalPoints': 0,
    'totalCommPoints': 0,
    'totalStories': 0,
    'totalCommStories': 0,
    'totalCompleted': 0,
    'totalDefects': 0,
    'totalDplymts': 0,
    'totTeamStat': 0,
    'totClientStat': 0,
    'totTeamStatIter': 0,
    'totClientStatIter': 0,
    'teamsLt5': 0,
    'teams5to12': 0,
    'teamsGt12': 0,
    'totalSquad': 0,
    'month': '',
    'partialMonth': false

  }, {
    'totalPoints': 0,
    'totalCommPoints': 0,
    'totalStories': 0,
    'totalCommStories': 0,
    'totalCompleted': 0,
    'totalDefects': 0,
    'totalDplymts': 0,
    'totTeamStat': 0,
    'totClientStat': 0,
    'totTeamStatIter': 0,
    'totClientStatIter': 0,
    'teamsLt5': 0,
    'teams5to12': 0,
    'teamsGt12': 0,
    'totalSquad': 0,
    'month': '',
    'partialMonth': false

  }, {
    'totalPoints': 0,
    'totalCommPoints': 0,
    'totalStories': 0,
    'totalCommStories': 0,
    'totalCompleted': 0,
    'totalDefects': 0,
    'totalDplymts': 0,
    'totTeamStat': 0,
    'totClientStat': 0,
    'totTeamStatIter': 0,
    'totClientStatIter': 0,
    'teamsLt5': 0,
    'teams5to12': 0,
    'teamsGt12': 0,
    'totalSquad': 0,
    'month': '',
    'partialMonth': false

  }, {
    'totalPoints': 0,
    'totalCommPoints': 0,
    'totalStories': 0,
    'totalCommStories': 0,
    'totalCompleted': 0,
    'totalDefects': 0,
    'totalDplymts': 0,
    'totTeamStat': 0,
    'totClientStat': 0,
    'totTeamStatIter': 0,
    'totClientStatIter': 0,
    'teamsLt5': 0,
    'teams5to12': 0,
    'teamsGt12': 0,
    'totalSquad': 0,
    'month': '',
    'partialMonth': false
  }, {
    'totalPoints': 0,
    'totalCommPoints': 0,
    'totalStories': 0,
    'totalCommStories': 0,
    'totalCompleted': 0,
    'totalDefects': 0,
    'totalDplymts': 0,
    'totTeamStat': 0,
    'totClientStat': 0,
    'totTeamStatIter': 0,
    'totClientStatIter': 0,
    'teamsLt5': 0,
    'teams5to12': 0,
    'teamsGt12': 0,
    'totalSquad': 0,
    'month': '',
    'partialMonth': false
  }];
};

/**
 * Get completed iteration docs from startTime to endTime,
 * and seperate them by team.
 * @param string startTime (03/18/2016)
 * @param string endTime (08/18/2016)
 * @return Object squadIterationDocs
 */
function getIterationDocs(startTime, endTime) {
  var squadIterationDocs = {};
  return new Promise(function(resolve, reject) {
    iterationModel.getCompletedIterationsByKey(startTime, endTime)
      .then(function(completedIterations) {
        _.each(completedIterations, function(doc) {
          var teamId = doc.teamId;
          if (_.isEmpty(squadIterationDocs[teamId])) {
            squadIterationDocs[teamId] = [];
          }
          squadIterationDocs[teamId].push(doc);
        });
        return resolve(squadIterationDocs);
      })
      .catch( /* istanbul ignore next */ function(err) {
        return reject(err);
      });
  });
};

/**
 * Get all squads teams and return an Object [{parantId, [squads]},...]
 * @return Array squadTeams
 */
function getAllSquads() {
  return new Promise(function(resolve, reject) {
    var promiseArray = [];
    promiseArray.push(teamModel.getNonSquadTeams());
    promiseArray.push(teamModel.getSquadTeams());
    Promise.all(promiseArray)
      .then(function(results){
        var squadsByParent = {};
        var nonSquadTeams = results[0];
        var squadTeams = results[1];
        _.each(nonSquadTeams, function(nonSquadTeam) {
          if (!(_.isUndefined(nonSquadTeam.pathId)) && !(_.isEmpty(nonSquadTeam.pathId))) {
            var id = nonSquadTeam.pathId;
            squadsByParent[id] = {
              'teamId': nonSquadTeam._id,
              'children': []
            };
          }
        });
        _.each(squadTeams, function(squadTeam) {
          if (squadTeam.path != null) {
            // remove the first comma and the last comma, then reparate them into array
            var parentsList = squadTeam.path.substring(1,squadTeam.path.length-1).split(',');
            _.each(parentsList, function(parent){
              if (!_.isUndefined(squadsByParent[parent])) {
                squadsByParent[parent]['children'].push(squadTeam._id);
              }
            });
          }
        });
        return resolve(squadsByParent);
      })
      .catch( /* istanbul ignore next */ function(err){
        return reject(err);
      });
  });
};

/**
 * Roll up iteration docs data in the same squad
 * @param Array iterationDocs
 * @param string teamId (nonsquad team id)
 * @return Object rollUpIterationsData
 */
function rollUpIterationsBySquad(iterationDocs, teamId) {
  return new Promise(function(resolve, reject) {
    var currData = resetData();
    var rollUpIterationsData = {};
    rollUpIterationsData[teamId] = currData;
    var nowTime = moment().endOf('month').format(dateFormat);
    _.each(iterationDocs, function(iterationDoc){
      var iterDate = moment(iterationDoc['endDate']).format(dateFormat);
      var monthDiff = Math.floor(moment(nowTime).diff(moment(iterDate), 'months', true));
      if (monthDiff < 0 || monthDiff > iterationMonth || _.isNaN(monthDiff)) {
        var msg = 'iteationDoc: ' + iterationDoc._id + ' end date is not correct';
        return reject(Error(msg));
      } else {
        var monthIndex = 5 - monthDiff;
        var pts = iterationDoc['storyPointsDelivered'];
        var commPts = iterationDoc['commitedStoryPoints'];
        var stories = iterationDoc['deliveredStories'];
        var commStories = iterationDoc['committedStories'];
        var teamCnt = iterationDoc['memberCount'];
        var defects = iterationDoc['defects'];
        var dplymnts = iterationDoc['deployments'];
        var teamStat = iterationDoc['teamSatisfaction'];
        var clientStat = iterationDoc['clientSatisfaction'];
        if (pts != undefined && pts != null && !_.isNaN(pts)) {
          currData[monthIndex].totalPoints = currData[monthIndex].totalPoints + parseInt(pts);
        }
        if (commPts != undefined && commPts != null && !_.isNaN(pts)) {
          currData[monthIndex].totalCommPoints = currData[monthIndex].totalCommPoints + parseInt(commPts);
        }
        if (stories != undefined && stories != null && !_.isNaN(stories)) {
          currData[monthIndex].totalStories = currData[monthIndex].totalStories + parseInt(stories);
        }
        if (commStories != undefined && commStories != null && !_.isNaN(commStories)) {
          currData[monthIndex].totalCommStories = currData[monthIndex].totalCommStories + parseInt(commStories);
        }
        if (defects != undefined && defects != null && !_.isNaN(defects)) {
          currData[monthIndex].totalDefects = currData[monthIndex].totalDefects + parseInt(defects);
        }
        if (dplymnts != undefined && dplymnts != null && !_.isNaN(dplymnts)) {
          currData[monthIndex].totalDplymts = currData[monthIndex].totalDplymts + parseInt(dplymnts);
        }
        if (teamStat != undefined && teamStat != null && !_.isNaN(teamStat) && (parseInt(teamStat) != 0)) {
          currData[monthIndex].totTeamStat = currData[monthIndex].totTeamStat + parseInt(teamStat);
          currData[monthIndex].totTeamStatIter = currData[monthIndex].totTeamStatIter + 1;
        }
        if (clientStat != undefined && clientStat != null && !_.isNaN(clientStat) && (parseInt(clientStat) != 0)) {
          currData[monthIndex].totClientStat = currData[monthIndex].totClientStat + parseInt(clientStat);
          currData[monthIndex].totClientStatIter = currData[monthIndex].totClientStatIter + 1;
        }
        if (teamCnt != undefined && teamCnt != null && !_.isNaN(teamCnt)) {
          teamCnt = parseInt(teamCnt);
          if (teamCnt < 5) {
            currData[monthIndex].teamsLt5 = currData[monthIndex].teamsLt5 + 1;
          } else if (teamCnt > 12) {
            currData[monthIndex].teamsGt12 = currData[monthIndex].teamsGt12 + 1;
          } else {
            currData[monthIndex].teams5to12 = currData[monthIndex].teams5to12 + 1;
          }
        }
        currData[monthIndex].totalCompleted = currData[monthIndex].totalCompleted + 1;
      }
    });
    return resolve(rollUpIterationsData);
  });
};

/**
 * Roll up squads data together by non-squad team
 * @param Object squads
 * @param string teamId (non-squad team id)
 * @param Object squadsCalResults
 * @return nonSquadCalResult
 */
function rollUpIterationsByNonSquad(squads, nonSquadTeamId, squadsCalResults, nonSquadTeamPathId, teamMemberData) {
  return new Promise(function(resolve, reject) {
    var squadDoc = squads;
    var currData = resetData();
    var nonSquadCalResult = {
      'iterationData': currData,
      'teamMemberData': {},
      'teamId': nonSquadTeamId,
      'lastUpdate': lastUpdate,
      'pathId': nonSquadTeamPathId
    };
    var teams = [];
    for (var i = 0; i <= iterationMonth; i++) {
      teams.push(0);
    }
    for (var i = 0; i < squadDoc.length; i++) {
      for (var j = 0; j <= iterationMonth; j++) {
        if (!(_.isEmpty(squadsCalResults[squadDoc[i]])) && !(_.isUndefined(squadsCalResults[squadDoc[i]]))) {
          var squadIterationResult = squadsCalResults[squadDoc[i]];
          currData[j].totalPoints = currData[j].totalPoints + squadIterationResult[j].totalPoints;
          currData[j].totalCommPoints = currData[j].totalPoints + squadIterationResult[j].totalCommPoints;
          currData[j].totalStories = currData[j].totalStories + squadIterationResult[j].totalStories;
          currData[j].totalCommStories = currData[j].totalStories + squadIterationResult[j].totalCommStories;
          currData[j].totalDefects = currData[j].totalDefects + squadIterationResult[j].totalDefects;
          currData[j].totalDplymts = currData[j].totalDplymts + squadIterationResult[j].totalDplymts;
          currData[j].totTeamStat = currData[j].totTeamStat + squadIterationResult[j].totTeamStat;
          currData[j].totTeamStatIter = currData[j].totTeamStatIter + squadIterationResult[j].totTeamStatIter;
          currData[j].totClientStat = currData[j].totClientStat + squadIterationResult[j].totClientStat;
          currData[j].totClientStatIter = currData[j].totClientStatIter + squadIterationResult[j].totClientStatIter;
          currData[j].teamsLt5 = currData[j].teamsLt5 + squadIterationResult[j].teamsLt5;
          currData[j].teamsGt12 = currData[j].teamsGt12 + squadIterationResult[j].teamsGt12;
          currData[j].teams5to12 = currData[j].teams5to12 + squadIterationResult[j].teams5to12;
          currData[j].totalCompleted = currData[j].totalCompleted + squadIterationResult[j].totalCompleted;
          if (squadIterationResult[j].totalCompleted > 0) {
            teams[j] = teams[j] + 1;
          }
        }
      }
    }
    nonSquadCalResult['teamMemberData'] = rollUpTeamMemberData(squadDoc, teamMemberData);
    var newDate = moment();
    var endOfMonth = moment().endOf('month');
    if (newDate.diff(endOfMonth) < 0) {
      currData[iterationMonth].partialMonth = true;
    }
    for (var i = 0; i <= iterationMonth; i++) {
      currData[i].totalSquad = teams[i];
      currData[i].month = monthArray[5-i];
      if (currData[i].totTeamStatIter > 0) {
        currData[i].totTeamStat = currData[i].totTeamStat / currData[i].totTeamStatIter;
      }
      if (currData[i].totClientStatIter > 0) {
        currData[i].totClientStat = currData[i].totClientStat / currData[i].totClientStatIter;
      }
    }
    resolve(nonSquadCalResult);
  });
};

/**
 * Get suqad team data
 * @return Object squadTeams
 */
function getSquadsData() {
  var squadTeams = new Object();
  return new Promise(function(resolve, reject) {
    teamModel.getSquadTeams()
      .then(function(teams) {
        if (teams.length <= 0) {
          var msg;
          msg = {'error' :'no team found'};
          reject(msg);
        } else {
          _.each(teams, function(team) {
            if (_.isEmpty(team.members) || team.members.length == 0 || team.members == undefined) {
              squadTeams[team._id] = {
                'teamCnt': 0,
                'teamFTE': 0
              };
            } else {
              var allocationScore = 0;
              _.each(team.members, function(member){
                if (_.isNumber(member.allocation)) {
                  allocationScore = allocationScore + member.allocation;
                }
              });
              squadTeams[team._id] = {
                'teamCnt': team.members.length,
                'teamFTE': allocationScore / 100.0
              };
            }
          });
          resolve(squadTeams);
        }
      })
      .catch( /* istanbul ignore next */ function(err) {
        reject(err);
      });
  });
};

/**
 * Roll up total_members and total_allocation data
 * @param Array squadsList
 * @param Object squadTeams
 * @return Object entry
 */
function rollUpTeamMemberData(squadsList, squadTeams) {
  var entry = new Object();
  var teamsLt5 = 0;
  var teams5to12 = 0;
  var teamsGt12 = 0;
  var tcLt5 = 0;
  var tc5to12 = 0;
  var tcGt12 = 0;
  var fteLt5 = 0;
  var fte5to12 = 0;
  var fteGt12 = 0;

  _.each(squadsList, function(squadId) {
    if (!_.isEmpty(squadTeams[squadId]) && squadTeams[squadId] != undefined) {
      var squad = squadTeams[squadId];
      var teamCnt = squad.teamCnt;
      var teamFTE = squad.teamFTE;
      if (teamCnt < 5) {
        teamsLt5 = teamsLt5 + 1;
        fteLt5 = fteLt5 + teamFTE;
        tcLt5 = tcLt5 + teamCnt;
      } else if (teamCnt > 12) {
        teamsGt12 = teamsGt12 + 1;
        fteGt12 = fteGt12 + teamFTE;
        tcGt12 = tcGt12 + teamCnt;

      } else {
        teams5to12 = teams5to12 + 1;
        fte5to12 = fte5to12 + teamFTE;
        tc5to12 = tc5to12 + teamCnt;
      }
    }
  });

  entry.teamsLt5 = teamsLt5;
  entry.tcLt5 = tcLt5;
  entry.fteLt5 = fteLt5;

  entry.teams5to12 = teams5to12;
  entry.tc5to12 = tc5to12;
  entry.fte5to12 = fte5to12;

  entry.teamsGt12 = teamsGt12;
  entry.tcGt12 = tcGt12;
  entry.fteGt12 = fteGt12;

  return entry;
};

var snapshot = {
  /**
   * Check if the snapshot collection exists
   * @return error info if the collection is missing, collection info if it exists.
   */
  // checkSnapshotCollectioExist: function() {
  //   return new Promise(function(resolve, reject){
  //     mongoose.connection.db.listCollections({name:'snapshot'})
  //       .next(function(err, collinfo){
  //         if (err) {
  //           reject(err);
  //         } else {
  //           if (collinfo) {
  //             resolve(collinfo);
  //           } else {
  //             var msg = {'error':'snapshot collection is missing'};
  //             reject(msg);
  //           }
  //         }
  //       });
  //   });
  // },

  /**
   * Roll up data to the non-squads.
   * @return Array _revs (return rev if successfully update)
   */
  updateRollUpData: function() {
    return new Promise(function(resolve, reject) {
      lastUpdate = moment().format(dateFormat);
      iterationMonth = 5;
      var endTime = moment().format(dateFormat);
      var startTime = moment().subtract(iterationMonth,'months').startOf('month').format(dateFormat);
      monthArray = [];
      for (var i = 0; i <= iterationMonth; i++) {
        var time = moment().subtract(i, 'months');
        var month = monthNames[time.month()];
        var year = time.year();
        monthArray[i] = month + '-' + year;
      }
      var promiseArray = [];
      var squadIterationDocs = {};
      var squadsByParent = {};
      var teamMemberData = {};
      promiseArray.push(getIterationDocs(startTime, endTime));
      promiseArray.push(getAllSquads());
      promiseArray.push(getSquadsData());
      promiseArray.push(snapshotModel.remove({}));
      Promise.all(promiseArray)
        .then(function(results){
          squadIterationDocs = results[0];
          squadsByParent = results[1];
          teamMemberData = results[2];
          var promiseArray2 = [];
          _.each(Object.keys(squadIterationDocs), function(squadTeamId) {
            promiseArray2.push(rollUpIterationsBySquad(squadIterationDocs[squadTeamId], squadTeamId));
          });
          return Promise.all(promiseArray2);
        })
        .then(function(squadsCalResultsArray){
          var squadsCalResults = {};
          _.each(squadsCalResultsArray, function(squadsCalResult) {
            squadsCalResults[Object.keys(squadsCalResult)[0]] = squadsCalResult[Object.keys(squadsCalResult)[0]];
          });
          var promiseArray3 = [];
          _.each(Object.keys(squadsByParent), function(nonSquadTeamId) {
            promiseArray3.push(rollUpIterationsByNonSquad(squadsByParent[nonSquadTeamId]['children'], squadsByParent[nonSquadTeamId]['teamId'], squadsCalResults, nonSquadTeamId, teamMemberData));
          });
          return Promise.all(promiseArray3);
        })
        .then(function(nonSquadCalResults){
          // var query = {'teamId': Schema.Types.ObjectId};
          // var update = {
          //   '$set': {
          //     'lastUpdate': moment().format(dateFormat),
          //     'value': [],
          //     'pathId': ''
          //   }
          // };
          // var options = {
          //   'setDefaultsOnInsert': true,
          //   'upsert': true
          // };
          // var promiseArray4 = [];
          // _.each(nonSquadCalResults, function(nonSquadCalResult){
          //   query.teamId = nonSquadCalResult.teamId;
          //   update['$set'].lastUpdate = nonSquadCalResult.lastUpdate;
          //   update['$set'].value = nonSquadCalResult.value;
          //   update['$set'].pathId = nonSquadCalResult.pathId;
          //   promiseArray4.push(snapshotModel.update(query, update, options));
          // });
          return snapshotModel.collection.insert(nonSquadCalResults);
          //return Promise.all(promiseArray4);
        })
        .then(function(results){
          if (results) {
            resolve('update snapshot successfully');
          }
        })
        .catch( /* istanbul ignore next */ function(err){
          reject(err);
        });
    });
  },

  /**
   * Get non-squad's roll up data using team id.
   * @param String teamId
   * @param Object rollUpData
   */
  getRollUpDataByTeamId: function(teamId) {
    return new Promise(function(resolve, reject) {
      snapshotModel.findOne({'teamId': teamId})
        .then(function(rollUpData) {
          resolve(rollUpData);
        })
        .catch( /* istanbul ignore next */ function(err) {
          reject(err);
        });
    });
  },

  /**
   * Get non-squad's roll up data using team id.
   * @param String pathId
   * @param Object rollUpData
   */
  getRollUpDataByPathId: function(pathId) {
    return new Promise(function(resolve, reject) {
      snapshotModel.findOne({'pathId': pathId})
        .then(function(rollUpData) {
          resolve(rollUpData);
        })
        .catch( /* istanbul ignore next */ function(err) {
          reject(err);
        });
    });
  },

  // nameSearchTest: function(keyword) {
  //   return new Promise(function(resolve, reject){
  //     snapshotModel.find({'pathId': {'$regex': keyword, '$options': 'i'}})
  //       .then(function(results){
  //         resolve(results);
  //       })
  //       .catch(function(err){
  //         reject(err);
  //       });
  //   });
  // }
};

module.exports = snapshot;
