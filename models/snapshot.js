var Promise = require('bluebird');
var common = require('./cloudant-driver');
var _ = require('underscore');
var loggers = require('../middleware/logger');
var util = require('../helpers/util');
var iterationModel = require('./iteration');
var teamModel = require('./teams');
var moment = require('moment');
var validate = require('validate.js');

var iterationMonth = 5;
var prefix = 'ag_iter_data_';
var timestamp = Math.floor(Date.now() / 1000);
var iterationDocRules = require('./validate_rules/iteration.js');
var snapshotValidationRules = require('./validate_rules/snapshot.js');
var nonSquadTeamRule = snapshotValidationRules.nonSquadTeamRule;
var squadTeamRule = snapshotValidationRules.squadTeamRule;


var formatErrMsg = /* istanbul ignore next */ function(msg){
  loggers.get('models').info('Error: ', msg);
  return { error : msg };
};

var successLogs = /* istanbul ignore next */ function(msg){
  loggers.get('models').info('Success: ' + msg);
  return;
};

var infoLogs = /* istanbul ignore next */ function(msg){
  loggers.get('models').info(msg);
  return;
};

function resetData(){
  return [
    {
      'totalPoints' : 0,
      'totalStories' : 0,
      'totalCompleted' : 0,
      'totalDefects' : 0,
      'totalDplymts' : 0,
      'totTeamStat' : 0,
      'totClientStat' : 0,
      'totTeamStatIter' : 0,
      'totClientStatIter' : 0,
      'teamsLt5' : 0,
      'teams5to12' : 0,
      'teamsGt12' : 0
    },
    {
      'totalPoints' : 0,
      'totalStories' : 0,
      'totalCompleted' : 0,
      'totalDefects' : 0,
      'totalDplymts' : 0,
      'totTeamStat' : 0,
      'totClientStat' : 0,
      'totTeamStatIter' : 0,
      'totClientStatIter' : 0,
      'teamsLt5' : 0,
      'teams5to12' : 0,
      'teamsGt12' : 0
    },
    {
      'totalPoints' : 0,
      'totalStories' : 0,
      'totalCompleted' : 0,
      'totalDefects' : 0,
      'totalDplymts' : 0,
      'totTeamStat' : 0,
      'totClientStat' : 0,
      'totTeamStatIter' : 0,
      'totClientStatIter' : 0,
      'teamsLt5' : 0,
      'teams5to12' : 0,
      'teamsGt12' : 0
    },
    {
      'totalPoints' : 0,
      'totalStories' : 0,
      'totalCompleted' : 0,
      'totalDefects' : 0,
      'totalDplymts' : 0,
      'totTeamStat' : 0,
      'totClientStat' : 0,
      'totTeamStatIter' : 0,
      'totClientStatIter' : 0,
      'teamsLt5' : 0,
      'teams5to12' : 0,
      'teamsGt12' : 0
    },
    {
      'totalPoints' : 0,
      'totalStories' : 0,
      'totalCompleted' : 0,
      'totalDefects' : 0,
      'totalDplymts' : 0,
      'totTeamStat' : 0,
      'totClientStat' : 0,
      'totTeamStatIter' : 0,
      'totClientStatIter' : 0,
      'teamsLt5' : 0,
      'teams5to12' : 0,
      'teamsGt12' : 0
    },
    {
      'totalPoints' : 0,
      'totalStories' : 0,
      'totalCompleted' : 0,
      'totalDefects' : 0,
      'totalDplymts' : 0,
      'totTeamStat' : 0,
      'totClientStat' : 0,
      'totTeamStatIter' : 0,
      'totClientStatIter' : 0,
      'teamsLt5' : 0,
      'teams5to12' : 0,
      'teamsGt12' : 0
    }
  ];
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
  return new Promise(function(resolve, reject){
    iterationModel.getCompletedIterationsByKey(startTime,endTime)
      .then(function(completedIterations){
        _.each(completedIterations.rows, function(doc){
          var validationErrors = validate(doc.value, iterationDocRules);
          if (!validationErrors) {
            if (doc.value.team_id != '') {
              var teamId = doc.value.team_id;
              if (_.isEmpty(squadIterationDocs[teamId])) {
                squadIterationDocs[teamId] = [];
              }
              squadIterationDocs[teamId].push(doc.value);
            }
          }
        });
        return resolve(squadIterationDocs);
      })
      .catch( /* istanbul ignore next */ function(err){
        var msg = err.error;
        console.log('1: ',err);
        reject(formatErrMsg(msg));
      })
  });
};

/**
 * Get all squads teams and return an Object [{parantId, [squads]},...]
 * @return Array squadTeams
 */
function getAllSquads() {
  return new Promise(function(resolve, reject){
    teamModel.getNonSquadTeams()
      .then(function(nonSquadTeams){
        var squadsByParent = {};
        _.each(nonSquadTeams.rows, function(nonSquadTeam){
          if(!(_.isUndefined(nonSquadTeam.value._id)) && !(_.isEmpty(nonSquadTeam.value._id))) {
            var id = nonSquadTeam.value._id
            squadsByParent[id] = [];
          }
        });
        //console.log(squadsByParent);
        teamModel.getSquadTeams()
          .then(function(squadTeams){
            _.each(squadTeams.rows, function(squadTeam){
              if (squadTeam.value.squadteam == 'Yes') {
                _.each(squadTeam.value.parents, function(parent){
                  squadsByParent[parent].push(squadTeam.value._id);
                });
              }
            });
            resolve(squadsByParent);
          })
          .catch(function(err){
            var msg = err.error;
            console.log(err);
            reject(formatErrMsg(msg));
          });
      })
      .catch(function(err){
        var msg = err.error;
        console.log(err);
        reject(formatErrMsg(msg));
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
  return new Promise(function(resolve, reject){
    var currData = resetData();
    var rollUpIterationsData = {};
    rollUpIterationsData[teamId] = currData;
    var currDate = new Date(util.getServerTime());
    _.each(iterationDocs, function(iterationDoc){
      var iterationDocData = new Date(iterationDoc['iteration_end_dt']);
      var iterationDocIndex = 5 - monthDiff(iterationDocData, currDate);
      if (iterationDocIndex < 0 || iterationDocIndex > iterationMonth) {
        var msg = 'iteationDoc: ' + iterationDocData._id + ' end date is not correct';
        reject(formatErrMsg(msg));
      } else {
        var pts = iterationDoc["nbr_story_pts_dlvrd"];
        var stories = iterationDoc["nbr_stories_dlvrd"];
        var teamCnt = iterationDoc["team_mbr_cnt"];
        var defects = iterationDoc["nbr_defects"];
        var dplymnts = iterationDoc["nbr_dplymnts"];
        var teamStat = iterationDoc["team_sat"];
        var clientStat = iterationDoc["client_sat"];
        if (pts != undefined && pts !=""){
          currData[iterationDocIndex].totalPoints = currData[iterationDocIndex].totalPoints + parseInt(pts);
        }
        if (stories != undefined && stories !=""){
          currData[iterationDocIndex].totalStories = currData[iterationDocIndex].totalStories+ parseInt(stories);
        }

        if (defects != undefined && defects !=""){
          currData[iterationDocIndex].totalDefects = currData[iterationDocIndex].totalDefects + parseInt(defects);
        }
        if (dplymnts != undefined && dplymnts !=""){
          currData[iterationDocIndex].totalDplymts = currData[iterationDocIndex].totalDplymts+ parseInt(dplymnts);
        }

        if (teamStat != undefined && teamStat !="" && (parseInt(teamStat) != 0)){
          currData[iterationDocIndex].totTeamStat = currData[iterationDocIndex].totTeamStat + parseInt(teamStat);
          currData[iterationDocIndex].totTeamStatIter = currData[iterationDocIndex].totTeamStatIter + 1;
        }
        if (clientStat != undefined && clientStat !="" && (parseInt(clientStat) != 0)){
          currData[iterationDocIndex].totClientStat = currData[iterationDocIndex].totClientStat+ parseInt(clientStat);
          currData[iterationDocIndex].totClientStatIter = currData[iterationDocIndex].totClientStatIter + 1;
        }

        if(teamCnt != undefined && teamCnt !=""){
          teamCnt = parseInt(teamCnt);
          if(teamCnt < 5){
            currData[iterationDocIndex].teamsLt5 = currData[iterationDocIndex].teamsLt5 + 1;
          }else if(teamCnt > 12){
            currData[iterationDocIndex].teamsGt12 = currData[iterationDocIndex].teamsGt12 + 1;
          }else{
            currData[iterationDocIndex].teams5to12 = currData[iterationDocIndex].teams5to12 + 1;
          }
        }
        currData[iterationDocIndex].totalCompleted = currData[iterationDocIndex].totalCompleted + 1;
      }
    });
    resolve(rollUpIterationsData);
  });
};

/**
 * Roll up squads data together by non-squad team
 * @param Object squads
 * @param string teamId (non-squad team id)
 * @param Object squadsCalResults
 * @return nonSquadCalResult
 */
function rollUpIterationsByNonSquad(squads, nonSquadTeamId, squadsCalResults, isUpdate, oldRollUpDataRev){
  return new Promise(function(resolve, reject){
    var squadDoc = squads;
    var currData = resetData();
    var nonSquadCalResult = {
                        '_id' : prefix + nonSquadTeamId,
                        'value' : currData,
                        'team_id' : nonSquadTeamId,
                        'timestamp' : timestamp,
                        'type' : 'roll_up_data'
                     };
    for (var i = 0; i < squadDoc.length; i++) {
      for (var j = 0; j < iterationMonth; j++) {
        if (!(_.isEmpty(squadsCalResults[squadDoc[i]])) && !(_.isUndefined(squadsCalResults[squadDoc[i]]))) {
          var squadIterationResult = squadsCalResults[squadDoc[i]];
          currData[j].totalPoints = currData[j].totalPoints + squadIterationResult[j].totalPoints;
          currData[j].totalStories = currData[j].totalStories + squadIterationResult[j].totalStories;
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
        }
      }
    }
    if (isUpdate) {
      if(!(_.isEmpty(oldRollUpDataRev)) && !(_.isUndefined(oldRollUpDataRev))) {
        nonSquadCalResult._rev = oldRollUpDataRev;
      }
    }
    resolve(nonSquadCalResult);
  });
};

/**
 * Get _rev for roll up data
 * @return Object {teamid:_rev}
 */
function getRollUpDataHistory() {
  return new Promise(function(resolve, reject){
     common.getByView('iterations','rollUpData')
      .then(function(oldRollUpData){
        var rollUpDataRevs = {};
        _.each(oldRollUpData.rows, function(data){
          rollUpDataRevs[data.value._id] = data.value._rev;
        });
        resolve(rollUpDataRevs);
      })
      .catch(function(err){

      })
  })
}
/**
 * Calculate month different
 * @param date d1 (start time)
 * @param date d2 (end time)
 * @return int months
 */
function monthDiff(d1, d2) {
    var months;
    months = (d2.getFullYear() - d1.getFullYear()) * 12;
    months -= d1.getMonth();
    months += d2.getMonth();
    return months;
};

/**
 * Get a dateobject (Six months previous) from another date object
 * @param date date
 * @param int months
 * @return date newDate
 */
function addMonths(date, months) {
  var newDate = new Date(util.getServerTime());
  newDate.setMonth(date.getMonth() + months);
  return new Date(newDate);
}

var snapshot = {
  updateRollUpData : /* istanbul ignore next */ function() {
    return new Promise(function(resolve, reject){
      iterationMonth = 5;
      var options = { year: 'numeric', month: '2-digit', day: '2-digit' };
      var endTime = new Date(util.getServerTime());
      var startTime = addMonths(endTime, -iterationMonth);
      endTime = endTime.toLocaleDateString('en-US',options);
      startTime = startTime.toLocaleDateString('en-US',options);
      var promiseArray = [];
      promiseArray.push(getIterationDocs(startTime, endTime));
      promiseArray.push(getAllSquads());
      promiseArray.push(getRollUpDataHistory());
      Promise.all(promiseArray)
        .then(function(promiseResults){
          var squadIterationDocs = promiseResults[0];
          var squadsByParent = promiseResults[1];
          var oldRollUpDataRevs = promiseResults[2];
          var promiseArray2 = [];
          _.each(Object.keys(squadIterationDocs), function(squadTeamId){
            promiseArray2.push(rollUpIterationsBySquad(squadIterationDocs[squadTeamId],squadTeamId));
          });
          Promise.all(promiseArray2)
            .then(function(squadsCalResultsArray){
              var squadsCalResults = {};
              _.each(squadsCalResultsArray, function(squadsCalResult){
                squadsCalResults[Object.keys(squadsCalResult)[0]] = squadsCalResult[Object.keys(squadsCalResult)[0]];
              });
              var promiseArray3 = [];
              _.each(Object.keys(squadsByParent), function(nonSquadTeamId){
                promiseArray3.push(rollUpIterationsByNonSquad(squadsByParent[nonSquadTeamId], nonSquadTeamId, squadsCalResults, true, oldRollUpDataRevs[prefix+nonSquadTeamId]));
              });
              Promise.all(promiseArray3)
                .then(function(nonSquadCalResults){
                  var updateRequest = {'docs' : nonSquadCalResults};
                  common.bulkUpdate(updateRequest)
                    .then(function(results){
                      resolve(results);
                    })
                    .catch( /* istanbul ignore next */ function(err){
                      var msg = err.error;
                      console.log(err);
                      reject(formatErrMsg(msg));
                    });
                })
                .catch( /* istanbul ignore next */ function(err){
                  var msg = err.error;
                  console.log(err);
                  reject(formatErrMsg(msg));
                });
            })
            .catch( /* istanbul ignore next */ function(err){
              var msg = err.error;
              console.log(err);
              reject(formatErrMsg(msg));
            });
        })
        .catch( /* istanbul ignore next */ function(err){
          var msg = err.error;
          console.log(err);
          reject(formatErrMsg(msg));
        });
    });
  },

  getRollUpData : function(startTime, endTime) {
    return new Promise(function(resolve, reject){
      var squadIterationDocs = {};
      iterationMonth = monthDiff(new Date(startTime), new Date(endTime));
      if (iterationMonth < 0) {
        var msg = 'end time is before start time';
        reject(formatErrMsg(msg));
      } else {
        var promiseArray = [];
        promiseArray.push(getIterationDocs(startTime, endTime));
        promiseArray.push(getAllSquads());
        Promise.all(promiseArray)
          .then(function(promiseResults){
            var squadIterationDocs = promiseResults[0];
            var squadsByParent = promiseResults[1];
            var promiseArray2 = [];
            _.each(Object.keys(squadIterationDocs), function(squadTeamId){
              promiseArray2.push(rollUpIterationsBySquad(squadIterationDocs[squadTeamId],squadTeamId));
            });
            Promise.all(promiseArray2)
              .then(function(squadsCalResultsArray){
                var squadsCalResults = {};
                _.each(squadsCalResultsArray, function(squadsCalResult){
                  squadsCalResults[Object.keys(squadsCalResult)[0]] = squadsCalResult[Object.keys(squadsCalResult)[0]];
                });
                var promiseArray3 = [];
                _.each(Object.keys(squadsByParent), function(nonSquadTeamId){
                  promiseArray3.push(rollUpIterationsByNonSquad(squadsByParent[nonSquadTeamId], nonSquadTeamId, squadsCalResults, false, {}));
                });
                Promise.all(promiseArray3)
                  .then(function(nonSquadCalResults){
                    resolve(nonSquadCalResults);
                  })
                  .catch( /* istanbul ignore next */ function(err){
                    var msg = err.error;
                    console.log('5: ',err);
                    reject(formatErrMsg(msg));
                  })
              })
              .catch( /* istanbul ignore next */ function(err){
                var msg = err.error;
                console.log('6: ',err);
                reject(formatErrMsg(msg));
              })
          })
          .catch( /* istanbul ignore next */ function(err){
            var msg = err.error;
            console.log('7: ',err);
            reject(formatErrMsg(msg));
          })
      }
    });
  }
};

module.exports = snapshot;
