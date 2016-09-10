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
var squad_prefix = 'ag_squad_data_';
var timestamp = Math.floor(Date.now() / 1000);
var iterationDocRules = require('./validate_rules/iteration.js');
var snapshotValidationRules = require('./validate_rules/snapshot.js');
var nonSquadTeamRule = snapshotValidationRules.nonSquadTeamRule;
var squadTeamRule = snapshotValidationRules.squadTeamRule;
var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
var monthArray = [];

var formatErrMsg = /* istanbul ignore next */ function(msg) {
  loggers.get('models').error('Error: ', msg);
  return {
    error: msg
  };
};

var successLogs = /* istanbul ignore next */ function(msg) {
  loggers.get('models').verbose('Success: ' + msg);
  return;
};

var infoLogs = /* istanbul ignore next */ function(msg) {
  loggers.get('models').verbose(msg);
  return;
};

function resetData() {
  return [{
    'totalPoints': 0,
    'totalStories': 0,
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
    'totalStories': 0,
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
    'totalStories': 0,
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
    'totalStories': 0,
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
    'totalStories': 0,
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
    'totalStories': 0,
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
        _.each(completedIterations.rows, function(doc) {
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
      .catch( /* istanbul ignore next */ function(err) {
        var msg;
        if (err.error) {
          msg = err.error;
        } else {
          msg = err;
        }
        reject(formatErrMsg(msg));
      });
  });
};

/**
 * Get all squads teams and return an Object [{parantId, [squads]},...]
 * @return Array squadTeams
 */
function getAllSquads() {
  return new Promise(function(resolve, reject) {
    teamModel.getNonSquadTeams()
      .then(function(nonSquadTeams) {
        var squadsByParent = {};
        _.each(nonSquadTeams.rows, function(nonSquadTeam) {
          if (!(_.isUndefined(nonSquadTeam.value._id)) && !(_.isEmpty(nonSquadTeam.value._id))) {
            var id = nonSquadTeam.value._id;
            squadsByParent[id] = [];
          }
        });
        teamModel.getSquadTeams()
          .then(function(squadTeams) {
            _.each(squadTeams.rows, function(squadTeam) {
              if (squadTeam.value.squadteam == 'Yes') {
                _.each(squadTeam.value.parents, function(parent) {
                  if (!_.isUndefined(squadsByParent[parent])) {
                    squadsByParent[parent].push(squadTeam.value._id);
                  }
                });
              }
            });
            //console.log(squadsByParent);
            resolve(squadsByParent);
          })
          .catch( /* istanbul ignore next */ function(err) {
            var msg;
            if (err.error) {
              msg = err.error;
            } else {
              msg = err;
            }
            reject(formatErrMsg(msg));
          });
      })
      .catch( /* istanbul ignore next */ function(err) {
        var msg;
        if (err.error) {
          msg = err.error;
        } else {
          msg = err;
        }
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
  return new Promise(function(resolve, reject) {
    var currData = resetData();
    var rollUpIterationsData = {};
    rollUpIterationsData[teamId] = currData;
    var currDate = new Date();
    _.each(iterationDocs, function(iterationDoc) {
      var iterationDocDate = new Date(iterationDoc['iteration_end_dt']);
      var iterationDocIndex = 5 - monthDiff(iterationDocDate, currDate);
      if (iterationDocIndex < 0 || iterationDocIndex > iterationMonth) {
        var msg = 'iteationDoc: ' + iterationDocData._id + ' end date is not correct';
        reject(formatErrMsg(msg));
      } else {
        if (!isNaN(iterationDocIndex)) {
          var pts = iterationDoc['nbr_story_pts_dlvrd'];
          var stories = iterationDoc['nbr_stories_dlvrd'];
          var teamCnt = iterationDoc['team_mbr_cnt'];
          var defects = iterationDoc['nbr_defects'];
          var dplymnts = iterationDoc['nbr_dplymnts'];
          var teamStat = iterationDoc['team_sat'];
          var clientStat = iterationDoc['client_sat'];
          if (pts != undefined && pts != '') {
            currData[iterationDocIndex].totalPoints = currData[iterationDocIndex].totalPoints + parseInt(pts);
          }
          if (stories != undefined && stories != '') {
            currData[iterationDocIndex].totalStories = currData[iterationDocIndex].totalStories + parseInt(stories);
          }

          if (defects != undefined && defects != '') {
            currData[iterationDocIndex].totalDefects = currData[iterationDocIndex].totalDefects + parseInt(defects);
          }
          if (dplymnts != undefined && dplymnts != '') {
            currData[iterationDocIndex].totalDplymts = currData[iterationDocIndex].totalDplymts + parseInt(dplymnts);
          }

          if (teamStat != undefined && teamStat != '' && (parseInt(teamStat) != 0)) {
            currData[iterationDocIndex].totTeamStat = currData[iterationDocIndex].totTeamStat + parseInt(teamStat);
            currData[iterationDocIndex].totTeamStatIter = currData[iterationDocIndex].totTeamStatIter + 1;
          }
          if (clientStat != undefined && clientStat != '' && (parseInt(clientStat) != 0)) {
            currData[iterationDocIndex].totClientStat = currData[iterationDocIndex].totClientStat + parseInt(clientStat);
            currData[iterationDocIndex].totClientStatIter = currData[iterationDocIndex].totClientStatIter + 1;
          }

          if (teamCnt != undefined && teamCnt != '') {
            teamCnt = parseInt(teamCnt);
            if (teamCnt < 5) {
              currData[iterationDocIndex].teamsLt5 = currData[iterationDocIndex].teamsLt5 + 1;
            } else if (teamCnt > 12) {
              currData[iterationDocIndex].teamsGt12 = currData[iterationDocIndex].teamsGt12 + 1;
            } else {
              currData[iterationDocIndex].teams5to12 = currData[iterationDocIndex].teams5to12 + 1;
            }
          }
          currData[iterationDocIndex].totalCompleted = currData[iterationDocIndex].totalCompleted + 1;
        }
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
function rollUpIterationsByNonSquad(squads, nonSquadTeamId, squadsCalResults, isUpdate, oldRollUpDataRev) {
  return new Promise(function(resolve, reject) {
    var squadDoc = squads;
    var currData = resetData();
    var nonSquadCalResult = {
      '_id': prefix + nonSquadTeamId,
      'value': currData,
      'team_id': nonSquadTeamId,
      'timestamp': timestamp,
      'type': 'roll_up_data'
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
          if (squadIterationResult[j].totalCompleted > 0) {
            teams[j] = teams[j] + 1;
          }
        }
      }
    }
    var newDate = new Date();
    var days = daysInMonth(newDate.getMonth() + 1, newDate.getFullYear());
    if (newDate.getDate() < days) {
      currData[iterationMonth].partialMonth = true;
    }
    for (var i = 0; i <= iterationMonth; i++) {
      currData[i].totalSquad = teams[i];
      currData[i].month = monthArray[i];
      if (currData[i].totTeamStatIter > 0) {
        currData[i].totTeamStat = currData[i].totTeamStat / currData[i].totTeamStatIter;
      }
      if (currData[i].totClientStatIter > 0) {
        currData[i].totClientStat = currData[i].totClientStat / currData[i].totClientStatIter;
      }
    }

    if (isUpdate) {
      if (!(_.isEmpty(oldRollUpDataRev)) && !(_.isUndefined(oldRollUpDataRev))) {
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
  return new Promise(function(resolve, reject) {
    common.getByView('iterations', 'rollUpData')
      .then(function(oldRollUpData) {
        var rollUpDataRevs = {};
        _.each(oldRollUpData.rows, function(data) {
          rollUpDataRevs[data.value._id] = data.value._rev;
        });
        resolve(rollUpDataRevs);
      })
      .catch( /* istanbul ignore next */ function(err) {
        var msg;
        if (err.error) {
          msg = err.error;
        } else {
          msg = err;
        }
        reject(formatErrMsg(msg));
      });
  });
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
  var newDate = new Date();
  newDate.setDate(1);
  newDate.setMonth(date.getMonth() + months);
  return new Date(newDate);
};

/**
 * Get how many days in the month
 * @param int month
 * @param int year
 * @return int days
 */
function daysInMonth(month, year) {
  return new Date(year, month, 0).getDate();
}

/**
 * Get _rev for roll up squads
 * @return Object {teamid:_rev}
 */
function getRollUpSquadsHistory() {
  return new Promise(function(resolve, reject) {
    common.getByView('iterations', 'rollUpSquads')
      .then(function(oldRollUpData) {
        var rollUpDataRevs = new Object();
        _.each(oldRollUpData.rows, function(data) {
          rollUpDataRevs[data.value._id] = data.value._rev;
        });
        resolve(rollUpDataRevs);
      })
      .catch( /* istanbul ignore next */ function(err) {
        var msg;
        if (err.error) {
          msg = err.error;
        } else {
          msg = err;
        }
        reject(formatErrMsg(msg));
      });
  });
};

/**
 * Get suqad team data
 * @return Object squadTeams
 */
function getSquadsData() {
  var squadTeams = new Object();
  return new Promise(function(resolve, reject) {
    teamModel.getTeam()
      .then(function(teams) {
        if (teams.length <= 0) {
          var msg;
          msg = 'No team found';
          reject(formatErrMsg(msg));
        } else {
          _.each(teams, function(team) {
            if ((team.value.squadteam != undefined) && (team.value.squadteam == 'Yes')) {
              squadTeams[team.value._id] = team.value;
            }
          });
          resolve(squadTeams);
        }
      })
      .catch( /* istanbul ignore next */ function(err) {
        var msg;
        if (err.error) {
          msg = err.error;
        } else {
          msg = err;
        }
        reject(formatErrMsg(msg));
      });
  });
};

/**
 * Roll up total_members and total_allocation data
 * @param Array squadsList
 * @param Object squadTeams
 * @return Object entry
 */
function rollUpSquadsData(squadsList, squadTeams) {
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
    squad = squadTeams[squadId];
    var teamCnt = squad['total_members'] != null ? squad['total_members'] : 0;
    var teamFTE = squad['total_allocation'] != null ? squad['total_allocation'] : 0;
    if (teamCnt != undefined && teamCnt != '') {
      teamCnt = parseInt(teamCnt);
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

  getTopLevelTeams: function(email) {
    return new Promise(function(resolve, reject) {
      teamModel.getTeamByEmail(email)
        .then(function(teams){
          var newTeams = [];
          var requestKeys = [];
          _.each(teams, function(team){
            newTeams.push(team.value);
            requestKeys.push(team.id);
            //promiseArray.push(common.getByViewKey('teams', 'lookup', team.id));
          });
          common.getByViewKeys('teams', 'lookup', requestKeys)
            .then(function(docs){
              var strTeams = [];
              _.each(docs.rows, function(doc){
                strTeams.push(doc.value);
              });
              var childrenList = _.flatten(_.pluck(strTeams, 'children'));
              var rootTeams = [];
              _.each(newTeams, function(team) {
                if (childrenList.indexOf(team._id) == -1) {
                  team.parents = [];
                  if (team.parent_team_id != '') {
                    team.parents.push(team.parent_team_id);
                  }
                  team.children = team.child_team_id;
                  rootTeams.push(team);
                }
              });
              resolve(rootTeams);
            })
            .catch( /* istanbul ignore next */ function(err){
              var msg;
              if (err.error) {
                msg = err.error;
              } else {
                msg = err;
              }
              reject(formatErrMsg(msg));
            });
        })
        .catch( /* istanbul ignore next */ function(err){
          var msg;
          if (err.error) {
            msg = err.error;
          } else {
            msg = err;
          }
          reject(formatErrMsg(msg));
        });
    });
  },

  updateRollUpSquads: function() {
    return new Promise(function(resolve, reject) {
      timestamp = Math.floor(Date.now() / 1000);
      var squadTeams = new Object();
      var oldRollUpDataRevs = new Object();
      var promiseArray = [];
      promiseArray.push(getSquadsData());
      promiseArray.push(getRollUpSquadsHistory());
      Promise.all(promiseArray)
        .then(function(results) {
          squadTeams = results[0];
          oldRollUpDataRevs = results[1];
          var nonsquadsScore = [];
          getAllSquads()
            .then(function(squadsByParent) {
              _.each(Object.keys(squadsByParent), function(nonsquadId) {
                var score = rollUpSquadsData(squadsByParent[nonsquadId], squadTeams);
                var entry = new Object();
                if (!_.isEmpty(oldRollUpDataRevs[squad_prefix + nonsquadId])) {
                  entry['_rev'] = oldRollUpDataRevs[squad_prefix + nonsquadId];
                }
                entry['_id'] = squad_prefix + nonsquadId;
                entry['team_id'] = nonsquadId;
                entry['type'] = 'roll_up_squads';
                entry['timestamp'] = timestamp;
                entry['value'] = score;
                nonsquadsScore.push(entry);
              });
              var updateRequest = {
                'docs': nonsquadsScore
              };
              common.bulkUpdate(updateRequest)
                .then(function(results) {
                  resolve(results);
                })
                .catch( /* istanbul ignore next */ function(err) {
                  var msg;
                  if (err.error) {
                    msg = err.error;
                  } else {
                    msg = err;
                  }
                  reject(formatErrMsg(msg));
                });
            })
            .catch( /* istanbul ignore next */ function(err) {
              var msg;
              if (err.error) {
                msg = err.error;
              } else {
                msg = err;
              }
              reject(formatErrMsg(msg));
            });
        })
        .catch( /* istanbul ignore next */ function(err) {
          var msg;
          if (err.error) {
            msg = err.error;
          } else {
            msg = err;
          }
          reject(formatErrMsg(msg));
        });
    });
  },

  getRollUpSquadsByTeam: function(teamId) {
    return new Promise(function(resolve, reject) {
      rollUpDataId = 'ag_squad_data_' + teamId;
      common.getByViewKey('iterations', 'rollUpSquads', rollUpDataId)
        .then(function(rollUpData) {
          resolve(rollUpData);
        })
        .catch( /* istanbul ignore next */ function(err) {
          var msg;
          if (err.error) {
            msg = err.error;
          } else {
            msg = err;
          }
          reject(formatErrMsg(msg));
        });
    });
  },


  updateRollUpData: function() {
    return new Promise(function(resolve, reject) {
      timestamp = Math.floor(Date.now() / 1000);
      iterationMonth = 5;
      monthArray = [];
      var options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      };
      var nowTime = new Date();
      var endTime = nowTime.toLocaleDateString('en-US', options);
      var startTime = new Date();
      startTime = new Date(startTime.setDate(1));
      startTime = new Date(startTime.setMonth(nowTime.getMonth() - iterationMonth));
      startTime = startTime.toLocaleDateString('en-US', options);

      // var nowTime = new Date();
      // var startTime = addMonths(nowTime, -iterationMonth);
      // var endTime = nowTime.toLocaleDateString('en-US',options);
      // startTime = startTime.toLocaleDateString('en-US',options);

      for (var i = 0; i <= iterationMonth; i++) {
        var time = (addMonths(nowTime, -(iterationMonth - i))).toLocaleDateString('en-US', options);
        var month = monthNames[parseInt(time.substring(0, 2)) - 1];
        var year = time.substring(time.length - 4, time.length);
        monthArray[i] = month + '-' + year;
      }
      var promiseArray = [];
      promiseArray.push(getIterationDocs(startTime, endTime));
      promiseArray.push(getAllSquads());
      promiseArray.push(getRollUpDataHistory());
      Promise.all(promiseArray)
        .then(function(promiseResults) {
          var squadIterationDocs = promiseResults[0];
          var squadsByParent = promiseResults[1];
          var oldRollUpDataRevs = promiseResults[2];
          var promiseArray2 = [];
          _.each(Object.keys(squadIterationDocs), function(squadTeamId) {
            promiseArray2.push(rollUpIterationsBySquad(squadIterationDocs[squadTeamId], squadTeamId));
          });
          Promise.all(promiseArray2)
            .then(function(squadsCalResultsArray) {
              var squadsCalResults = {};
              _.each(squadsCalResultsArray, function(squadsCalResult) {
                squadsCalResults[Object.keys(squadsCalResult)[0]] = squadsCalResult[Object.keys(squadsCalResult)[0]];
              });
              var promiseArray3 = [];
              _.each(Object.keys(squadsByParent), function(nonSquadTeamId) {
                promiseArray3.push(rollUpIterationsByNonSquad(squadsByParent[nonSquadTeamId], nonSquadTeamId, squadsCalResults, true, oldRollUpDataRevs[prefix + nonSquadTeamId]));
              });
              Promise.all(promiseArray3)
                .then(function(nonSquadCalResults) {
                  var updateRequest = {
                    'docs': nonSquadCalResults
                  };
                  common.bulkUpdate(updateRequest)
                    .then(function(results) {
                      resolve(results);
                    })
                    .catch( /* istanbul ignore next */ function(err) {
                      var msg;
                      if (err.error) {
                        msg = err.error;
                      } else {
                        msg = err;
                      }
                      reject(formatErrMsg(msg));
                    });
                })
                .catch( /* istanbul ignore next */ function(err) {
                  var msg;
                  if (err.error) {
                    msg = err.error;
                  } else {
                    msg = err;
                  }
                  reject(formatErrMsg(msg));
                });
            })
            .catch( /* istanbul ignore next */ function(err) {
              var msg;
              if (err.error) {
                msg = err.error;
              } else {
                msg = err;
              }
              reject(formatErrMsg(msg));
            });
        })
        .catch( /* istanbul ignore next */ function(err) {
          var msg;
          if (err.error) {
            msg = err.error;
          } else {
            msg = err;
          }
          reject(formatErrMsg(msg));
        });
    });
  },

  getRollUpDataByTeam: function(teamId) {
    return new Promise(function(resolve, reject) {
      rollUpDataId = 'ag_iter_data_' + teamId;
      common.getByViewKey('iterations', 'rollUpData', rollUpDataId)
        .then(function(rollUpData) {
          resolve(rollUpData);
        })
        .catch( /* istanbul ignore next */ function(err) {
          var msg;
          if (err.error) {
            msg = err.error;
          } else {
            msg = err;
          }
          reject(formatErrMsg(msg));
        });
    });
  }
};

module.exports = snapshot;
