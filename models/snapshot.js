var Promise = require('bluebird');
var common = require('./cloudant-driver');
var _ = require('underscore');
var loggers = require('../middleware/logger');
var util = require('../helpers/util');
var iterationModel = require('./iteration');
var teamModel = require('./teams');
var moment = require('moment');

var iterationMonth = 5;
var squadteamData = {};
var iterationDocsBySquad = {}
var iterationDocsCalResults = {};

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

var prefix = 'ag_iter_data_';
var timestamp = Math.floor(Date.now() / 1000);

var getTimeRange = function(){
  var date = new Date();
  var day  = date.getDate() + 1;
  var month = date.getMonth() + 1;
  var year = date.getFullYear();
  if (day < 10) {
    day = '0' + day;
  }
  var beforeDate;
  var beforeMonth;
  var beforeYear;
  if ((month - iterationMonth) <= 0) {
    beforeMonth = 12 + (month - iterationMonth);
    beforeYear = year - 1;
  } else {
    beforeMonth = month - iterationMonth;
    beforeYear = year;
  }
  if (beforeMonth < 10) {
    beforeMonth = '0' + beforeMonth;
  }
  if (month < 10) {
    month = '0' + month;
  }
  var nowDate = month + '/' + day + '/' + year;
  beforeDate = beforeMonth + '/' + day + '/' + beforeYear;
  return [beforeDate, nowDate];
}

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

function rollUpSquads(data){
  return new Promise(function(resolve, reject){
    var currData = resetData();
    squads = data.value;
    var returnData = {
                        '_id' : prefix + data._id,
                        'value' : [],
                        'timestamp' : timestamp,
                        'type' : 'roll_up_data'
                     };
    for (var i = 0; i < squads.length; i++) {
      for (var j = 0; j < iterationMonth; j++) {
        currData[j].totalPoints = currData[j].totalPoints + squads[i][j].totalPoints;
        currData[j].totalStories = currData[j].totalStories + squads[i][j].totalStories;
        currData[j].totalDefects = currData[j].totalDefects + squads[i][j].totalDefects;
        currData[j].totalDplymts = currData[j].totalDplymts + squads[i][j].totalDplymts;
        currData[j].totTeamStat = currData[j].totTeamStat + squads[i][j].totTeamStat;
        currData[j].totTeamStatIter = currData[j].totTeamStatIter + squads[i][j].totTeamStatIter;
        currData[j].totClientStat = currData[j].totClientStat + squads[i][j].totClientStat;
        currData[j].totClientStatIter = currData[j].totClientStatIter + squads[i][j].totClientStatIter;
        currData[j].teamsLt5 = currData[j].teamsLt5 + squads[i][j].teamsLt5;
        currData[j].teamsGt12 = currData[j].teamsGt12 + squads[i][j].teamsGt12;
        currData[j].teams5to12 = currData[j].teams5to12 + squads[i][j].teams5to12;
        currData[j].totalCompleted = currData[j].totalCompleted + squads[i][j].totalCompleted;
      }
    }
    returnData.value = currData;
    common.getByViewKey('iterations','rollUpData',returnData._id)
      .then(function(result){
        if (result.rows.length > 0) {
          returnData._rev = result.rows[0].value._rev;
        }
        resolve(returnData);
      })
      .catch( /* istanbul ignore next */ function(err){
        var msg = err.error;
        reject(formatErrMsg(msg));
      });
  });
}

function rollUpSquadIterations(iterationDocs, teamId) {

  return new Promise(function(resolve, reject){
    var currData = resetData();
    var currDate = new Date(util.getServerTime());
    var currMonth = currDate.getMonth();
    var currYear = currDate.getYear();
    var startDate = 0;
    if ((currMonth - iterationMonth) < 0) {
      startDate = (currYear - 1) * 100 + (12 - Math.abs(currMonth - iterationMonth));
    } else {
      startDate = currYear * 100 + (currMonth - iterationMonth);
    }
    var finishDate = currYear * 100 + currMonth;
    if (iterationDocs.length > 0) {
      for (var i = 0; i < iterationDocs.length; i++) {
        var iterationDoc = iterationDocs[i];
        var dataDate = new Date(iterationDoc['iteration_end_dt']);
        var dataMonth = dataDate.getMonth();
        var dataYear = dataDate.getYear();
        if ((dataYear * 100 + dataMonth) >= startDate && (dataYear * 100 + dataMonth) <= finishDate) {
            dataIndex = 5 - Math.abs(currMonth - dataMonth);
            var pts = iterationDoc["nbr_story_pts_dlvrd"];
            var stories = iterationDoc["nbr_stories_dlvrd"];
            var teamCnt = iterationDoc["team_mbr_cnt"];
            var defects = iterationDoc["nbr_defects"];
            var dplymnts = iterationDoc["nbr_dplymnts"];
            var teamStat = iterationDoc["team_sat"];
            var clientStat = iterationDoc["client_sat"];
            if (pts != undefined && pts !=""){
              currData[dataIndex].totalPoints = currData[dataIndex].totalPoints + parseInt(pts);
            }
            if (stories != undefined && stories !=""){
              currData[dataIndex].totalStories = currData[dataIndex].totalStories+ parseInt(stories);
            }

            if (defects != undefined && defects !=""){
              currData[dataIndex].totalDefects = currData[dataIndex].totalDefects + parseInt(defects);
            }
            if (dplymnts != undefined && dplymnts !=""){
              currData[dataIndex].totalDplymts = currData[dataIndex].totalDplymts+ parseInt(dplymnts);
            }

            if (teamStat != undefined && teamStat !="" && (parseInt(teamStat) != 0)){
              currData[dataIndex].totTeamStat = currData[dataIndex].totTeamStat + parseInt(teamStat);
              currData[dataIndex].totTeamStatIter = currData[dataIndex].totTeamStatIter + 1;
            }
            if (clientStat != undefined && clientStat !="" && (parseInt(clientStat) != 0)){
              currData[dataIndex].totClientStat = currData[dataIndex].totClientStat+ parseInt(clientStat);
              currData[dataIndex].totClientStatIter = currData[dataIndex].totClientStatIter + 1;
            }

            if(teamCnt != undefined && teamCnt !=""){
              teamCnt = parseInt(teamCnt);
              if(teamCnt < 5){
                currData[dataIndex].teamsLt5 = currData[dataIndex].teamsLt5 + 1;
              }else if(teamCnt > 12){
                currData[dataIndex].teamsGt12 = currData[dataIndex].teamsGt12 + 1;
              }else{
                currData[dataIndex].teams5to12 = currData[dataIndex].teams5to12 + 1;
              }
            }
            currData[dataIndex].totalCompleted = currData[dataIndex].totalCompleted + 1;
        }
      }
    }
    iterationDocsCalResults[teamId] = currData;

    resolve(teamId);
  });
};


function getSquads(teamId) {
  var squads = {};
  squads['_id'] = teamId;
  squads['value'] = [];
  var schema = resetData();
  return new Promise(function(resolve, reject){
    teamModel.getSquadsTeams(teamId)
      .then(function(result){
        _.each(result.rows, function(squad){
          if (_.isEmpty(iterationDocsCalResults[squad.value._id])) {
            squads['value'].push(schema);
          } else {
            squads['value'].push(iterationDocsCalResults[squad.value._id]);
          }
        });
        resolve(squads);
      })
      .catch( /* istanbul ignore next */ function(err){
        var msg = err.error;
        reject(formatErrMsg(msg));
      })
  });
}

function getAllSquads() {
  return new Promise(function(resolve, reject){
    teamModel.getNonSquadsTeams()
      .then(function(results){
        var promiseArray = [];
        _.each(results.rows, function(team){
          promiseArray.push(getSquads(team.value._id));
        });
        Promise.all(promiseArray)
          .then( /* istanbul ignore next */ function(results){
            resolve(results);
          })
          .catch( /* istanbul ignore next */ function(err){
            var msg = err.error;
            reject(formatErrMsg(msg));
          });
      })
      .catch( /* istanbul ignore next */ function(err){
        var msg = err.error;
        reject(formatErrMsg(msg));
      })
  });
}

function getAllIterationDocs(startTime, endTime) {
  return new Promise(function(resolve, reject){
    iterationDocsBySquad = {};
    iterationModel.getCompletedIterationsByKey(startTime,endTime)
      .then(function(results){
        _.each(results.rows, function(doc){
          if (!(_.isEmpty(doc.value.team_id))) {
            var teamId = doc.value.team_id;
            if (_.isEmpty(iterationDocsBySquad[teamId])) {
              iterationDocsBySquad[teamId] = [];
            }
            iterationDocsBySquad[teamId].push(doc.value);
          }
        });
        var promiseArray = [];
        _.each(Object.keys(iterationDocsBySquad), function(teamId){
          promiseArray.push(rollUpSquadIterations(iterationDocsBySquad[teamId], teamId));
        });
        Promise.all(promiseArray)
          .then(function(results){
            //resolve(iterationDocsCalResults);
            getAllSquads()
              .then(function(results){
                var promiseArray2 = []
                _.each(results, function(team){
                  promiseArray2.push(rollUpSquads(team));
                });
                Promise.all(promiseArray2)
                  .then(function(results){
                    var updateRequest = {'docs' : results};
                    common.bulkUpdate(updateRequest)
                      .then(function(results){
                        resolve(results);
                      })
                      .catch( /* istanbul ignore next */ function(err){
                        var msg = err.error;
                        reject(formatErrMsg(msg));
                      });
                  })
                  .catch( /* istanbul ignore next */ function(err){
                    var msg = err.error;
                    reject(formatErrMsg(msg));
                  });
              })
              .catch( /* istanbul ignore next */ function(err){
                var msg = err.error;
                reject(formatErrMsg(msg));
              })
          })
          .catch( /* istanbul ignore next */ function(err){
            var msg = err.error;
            reject(formatErrMsg(msg));
          });
        //resolve(iterationDocsBySquad);
      })
      .catch( /* istanbul ignore next */ function(err){
        var msg = err.error;
        reject(formatErrMsg(msg));
      });
  });
}

var snapshot = {
  calculation : function() {
    var timeRange = getTimeRange();
    return new Promise(function(resolve, reject){
      getAllIterationDocs(timeRange[0],timeRange[1])
        .then(function(result){
          resolve(result);
        })
        .catch(function(err){
          var msg = err.error;
          reject(formatErrMsg(msg));
        })
    });
  }
};

module.exports = snapshot;
