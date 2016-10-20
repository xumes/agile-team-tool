var _ = require('underscore');
var Promise = require('bluebird');
var mongoose = require('mongoose');
var loggers = require('../../middleware/logger');
var userModel = require('./users.js');
var teamModel = require('./teams.js');
var iterationModel = require('./iterations.js');
var teamScoreModel = require('../teamscore.js');
var assessmentModel = require('./assessments.js');
var userLocations = require('./data/userLocations.js');
var userTimezone = require('./data/uniqueUserTimezone.js');
var moment = require('moment');
var https = require('https');
var request = Promise.promisifyAll(require('request'));
var util = require('../../helpers/util');
var async = require('async');
var dateFormat = 'YYYY-MM-DD HH:mm:ss';
var Schema   = mongoose.Schema;

var iterationMonth = 5;
var lastUpdate = moment().format(dateFormat);
var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
var monthArray = [];

var ASSESSMENT_MAX_DAYS_SUBMISSION = 120;
var ASSESSMENT_PERIOD = 5;
var assessmentMonths = [];

var settings = require('../../settings');

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
  totalDefectsStartBal: {
    type: Number,
    default: 0
  },
  totalDefects: {
    type: Number,
    default: 0
  },
  totalDefectsClosed: {
    type: Number,
    default: 0
  },
  totalDefectsEndBal: {
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
  totTeamStat: {
    type: Number,
    default: 0
  },
  totClientStat: {
    type: Number,
    default: 0
  },
  totCycleTimeBacklog: {
    type: Number,
    default: 0
  },
  totCycleTimeBacklogIter: {
    type: Number,
    default: 0
  },
  totCycleTimeWIP: {
    type: Number,
    default: 0
  },
  totCycleTimeWIPIter: {
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

var assessmentSchema = {
  less_120_days: {
    type: Number,
    default: 0
  },
  gt_120_days: {
    type: Number,
    default: 0
  },
  no_submission: {
    type: Number,
    default: 0
  },
  prj_foundation_score: {
    type: Number,
    default: 0
  },
  prj_devops_score: {
    type: Number,
    default: 0
  },
  operation_score: {
    type: Number,
    default: 0
  },
  total_prj_foundation: {
    type: Number,
    default: 0
  },
  total_prj_devops: {
    type: Number,
    default: 0
  },
  total_operation: {
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

var assessmentsRollupSchema = {
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
  assessmentData: [assessmentSchema]
};
var marRollup_schema = new Schema(assessmentsRollupSchema, { collection: 'assessmentRollup' });
var marRollupModel = mongoose.model('assessmentRollup', marRollup_schema);

function resetData() {
  return [{
    'totalPoints': 0,
    'totalCommPoints': 0,
    'totalStories': 0,
    'totalCommStories': 0,
    'totalCompleted': 0,
    'totalDefectsStartBal': 0,
    'totalDefects': 0,
    'totalDefectsClosed': 0,
    'totalDefectsEndBal': 0,
    'totalDplymts': 0,
    'totTeamStat': 0,
    'totClientStat': 0,
    'totTeamStatIter': 0,
    'totClientStatIter': 0,
    'totCycleTimeBacklog': 0,
    'totCycleTimeWIP': 0,
    'totCycleTimeBacklogIter': 0,
    'totCycleTimeWIPIter': 0,
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
    'totalDefectsStartBal': 0,
    'totalDefects': 0,
    'totalDefectsClosed': 0,
    'totalDefectsEndBal': 0,
    'totalDplymts': 0,
    'totTeamStat': 0,
    'totClientStat': 0,
    'totTeamStatIter': 0,
    'totClientStatIter': 0,
    'totCycleTimeBacklog': 0,
    'totCycleTimeWIP': 0,
    'totCycleTimeBacklogIter': 0,
    'totCycleTimeWIPIter': 0,
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
    'totalDefectsStartBal': 0,
    'totalDefects': 0,
    'totalDefectsClosed': 0,
    'totalDefectsEndBal': 0,
    'totalDplymts': 0,
    'totTeamStat': 0,
    'totClientStat': 0,
    'totTeamStatIter': 0,
    'totClientStatIter': 0,
    'totCycleTimeBacklog': 0,
    'totCycleTimeWIP': 0,
    'totCycleTimeBacklogIter': 0,
    'totCycleTimeWIPIter': 0,
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
    'totalDefectsStartBal': 0,
    'totalDefects': 0,
    'totalDefectsClosed': 0,
    'totalDefectsEndBal': 0,
    'totalDplymts': 0,
    'totTeamStat': 0,
    'totClientStat': 0,
    'totTeamStatIter': 0,
    'totClientStatIter': 0,
    'totCycleTimeBacklog': 0,
    'totCycleTimeWIP': 0,
    'totCycleTimeBacklogIter': 0,
    'totCycleTimeWIPIter': 0,
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
    'totalDefectsStartBal': 0,
    'totalDefects': 0,
    'totalDefectsClosed': 0,
    'totalDefectsEndBal': 0,
    'totalDplymts': 0,
    'totTeamStat': 0,
    'totClientStat': 0,
    'totTeamStatIter': 0,
    'totClientStatIter': 0,
    'totCycleTimeBacklog': 0,
    'totCycleTimeWIP': 0,
    'totCycleTimeBacklogIter': 0,
    'totCycleTimeWIPIter': 0,
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
    'totalDefectsStartBal': 0,
    'totalDefects': 0,
    'totalDefectsClosed': 0,
    'totalDefectsEndBal': 0,
    'totalDplymts': 0,
    'totTeamStat': 0,
    'totClientStat': 0,
    'totTeamStatIter': 0,
    'totClientStatIter': 0,
    'totCycleTimeBacklog': 0,
    'totCycleTimeWIP': 0,
    'totCycleTimeBacklogIter': 0,
    'totCycleTimeWIPIter': 0,
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
            // remove the first comma and the last comma, then separate them into array
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
        console.log(msg);
        //return reject(Error(msg));
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

/**
 * Retrieve all submitted assessments records
 * @return assessments
 */
function getSubmittedAssessments() {
  var squadAssessments = {};
  return new Promise(function(resolve, reject) {
    assessmentModel.getSubmittedAssessments()
      .then(function(assessments) {
        _.each(assessments, function(doc) {
          var teamId =  doc.teamId;
          if ( teamId != '') {
            if (_.isEmpty(squadAssessments[teamId])) {
              squadAssessments[teamId] = [];
            }
            squadAssessments[teamId].push(doc);
          }
        });
        return resolve(squadAssessments);
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
 * Process assessment rollup data in squad level
 * @param assessments - squad assessment data
 * @param teamId - squad record id
 * @return squad rollup data
 */
function rollUpAssessmentsBySquad(assessments, teamId) {
  return new Promise(function(resolve, reject) {
    var currData = resetAssessmentData();
    var rollUpAssessmentData = {};
    rollUpAssessmentData[teamId] = currData;

    _.each(assessments, function(assessment ) {
      var assessmentDate = new Date(assessment['submittedDate']);

      for (var i = 0; i <= ASSESSMENT_PERIOD; i++) {
        var period = assessmentMonths[i];
        var month = monthNames.indexOf(period.substring(0, period.indexOf(' ')));

        var year = period.substring(period.indexOf(' '), period.length);
        var date;
        var nowTime = new Date();
        if (month == nowTime.getMonth()){
          date = nowTime.getDate();
        }
        else {
          date = daysInMonth(month + 1, year);
        }

        var targetDate = new Date(year, month, date);
        if ((assessmentDate.getFullYear() == year && assessmentDate.getMonth() <= month) ||
          assessmentDate.getFullYear() < year){
          var days = daysDiff(targetDate, assessmentDate);

          if (days <= ASSESSMENT_MAX_DAYS_SUBMISSION){
            currData[i].less_120_days += 1;
          }
          else {
            currData[i].gt_120_days += 1;
          }

          //process team average scores
          if (currData[i].mar_date != undefined){
            var time = timeDiff(currData[i].mar_date,assessmentDate);
            // get latest assessment data
            if (time < 0){
              setMaturityData(assessment, currData[i], assessmentDate);
            }
          }
          else {
            setMaturityData(assessment, currData[i], assessmentDate);
          }
        }
        else {
          continue;
        }
      }
    });

    _.each(currData, function(period, index) {
      if (period.less_120_days >= 1){
        period.less_120_days = 1;
        period.gt_120_days = 0;
        period.no_submission = 0;
      }
      else if (period.gt_120_days >= 1 &&
        currData[index].less_120_days == 0){
        period.gt_120_days = 1;
        period.no_submission = 0;
      }
      else {
        period.no_submission = 1;
      }
      delete period.mar_date;
    });
    resolve(rollUpAssessmentData);
  });
};

/**
 * Process assessment rollup data in tribe/non squad level
 * @param squads - list of squads under specific tribe
 * @param nonSquadTeamId - tribe record id
 * @param squadsCalResults - squad assessment data
 * @param isUpdate - is document to be updated
 * @param oldRollUpDataRev - last document revision number
 * @return tribe rollup data
 */
function rollUpAssessmentsByNonSquad(squads, nonSquadTeamId, squadsCalResults, nonSquadTeamPathId) {
  return new Promise(function(resolve, reject) {
    var squadDoc = squads;
    var currData = resetAssessmentData();
    var nonSquadCalResult = {
      'assessmentData': currData,
      'teamId': nonSquadTeamId,
      'lastUpdate': moment().format(dateFormat),
      'pathId': nonSquadTeamPathId
    };

    for (var i = 0; i <= ASSESSMENT_PERIOD; i++) {
      currData[i].totalSquad = squadDoc.length;
      currData[i].month = assessmentMonths[i];
    }

    for (var i = 0; i < squadDoc.length; i++) {
      for (var j = 0; j <= ASSESSMENT_PERIOD; j++) {
        var squadAssessmentResult = squadsCalResults[squadDoc[i]];
        if (!(_.isEmpty(squadAssessmentResult)) && !(_.isUndefined(squadAssessmentResult))) {
          currData[j].less_120_days += squadAssessmentResult[j].less_120_days;
          currData[j].gt_120_days += squadAssessmentResult[j].gt_120_days;
          currData[j].no_submission += squadAssessmentResult[j].no_submission;

          currData[j].prj_foundation_score += squadAssessmentResult[j].prj_foundation_score;
          currData[j].operation_score += squadAssessmentResult[j].operation_score;
          currData[j].prj_devops_score += squadAssessmentResult[j].prj_devops_score;

          currData[j].total_prj_foundation += squadAssessmentResult[j].total_prj_foundation;
          currData[j].total_prj_devops += squadAssessmentResult[j].total_prj_devops;
          currData[j].total_operation += squadAssessmentResult[j].total_operation;
        }
        else {
          currData[j].no_submission += 1;
        }
      }
    }
    _.each(currData, function(period, index) {
      if (period.total_prj_foundation > 1){
        period.prj_foundation_score = (period.prj_foundation_score/period.total_prj_foundation).toFixed(1);
      }
      if (period.total_operation > 1){
        period.operation_score = (period.operation_score/period.total_operation).toFixed(1);
      }
      if (period.total_prj_devops > 1) {
        period.prj_devops_score = (period.prj_devops_score/period.total_prj_devops).toFixed(1);
      }
    });

    var newDate = new Date();
    var days = daysInMonth(newDate.getMonth() + 1, newDate.getFullYear());
    if (newDate.getDate() < days) {
      currData[ASSESSMENT_PERIOD].partialMonth = true;
    }
    resolve(nonSquadCalResult);
  });
};

/**
 * Get difference of dates in days
 * @param date1
 * @param date2
 * @return days difference
 */
function daysDiff(date1, date2) {
  var dateFormat = 'YYYY-MM-DD';
  var d1 = moment(date1, dateFormat);
  var d2 = moment(date2, dateFormat);
  var days = moment(d1).diff(d2, 'days', true);
  return days;
};

/**
 * Get difference of dates in time format
 * @param date1
 * @param date2
 * @return time difference
 */
function timeDiff(date1, date2) {
  var dateFormat = 'YYYY-MM-DD HH:mm:ss';
  var d1 = moment(date1, dateFormat);
  var d2 = moment(date2, dateFormat);
  var time = moment(d1).diff(d2);
  return time;
};

/**
 * Set to default assessment rollup data values
 * @return default data
 */
function resetAssessmentData() {
  var rollupDataList = [];
  for (var i=0; i<=iterationMonth; i++) {
    rollupDataList.push({
      'less_120_days': 0,
      'gt_120_days': 0,
      'no_submission': 0,
      'prj_foundation_score': 0,
      'prj_devops_score': 0,
      'operation_score': 0,
      'total_prj_foundation': 0,
      'total_prj_devops': 0,
      'total_operation': 0,
      'totalSquad': 0,
      'month': '',
      'partialMonth': false
    });
  }
  return rollupDataList;
};

/**
 * Retrieve assessment average score per type
 * @param data - raw assessment data
 * @param type - team type
 * @return average score
 */
function getAssessmentAveScore(data, type){
  var ave_score = 0;
  if (data != null && !_.isEmpty(data)){
    if (type == 'Project'){
      ave_score = data.componentResults[0].currentScore;
    }
    else if (type == 'Delivery'){
      ave_score = data.componentResults[1].currentScore;
    }
  }
  return ave_score;
}

/**
 * Set assessment maturity data used for rollup
 * @param assessment - raw assessment data
 * @param mat_data - maturity data
 * @param assessmentDate - date of assessment
 * @return updated data
 */
function setMaturityData(assessment, mat_data, assessmentDate){
  mat_data.mar_date = assessmentDate;
  if (assessment.team_proj_ops == 'Project'){
    mat_data.prj_foundation_score = getAssessmentAveScore(assessment, 'Project');
    mat_data.total_prj_foundation = 1;
  }
  else {
    //operation project average score
    mat_data.operation_score = getAssessmentAveScore(assessment, 'Project');
    mat_data.total_operation = 1;
  }
  if (assessment.team_dlvr_software == 'Yes'){
    mat_data.prj_devops_score = getAssessmentAveScore(assessment, 'Delivery');
    mat_data.total_prj_devops = 1;
  }
  return mat_data;
}

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

  completeIterations: function() {
    return new Promise(function(resolve, reject){
      iterationModel.getNotCompletedIterations()
        .then(function(iterations){
          var completedIterations = [];
          if (!_.isEmpty(iterations)) {
            _.each(iterations, function(iteration){
              var status = iterationModel.calculateStatus(iteration);
              if (!_.isEqual(iteration['status'], status)) {
                var updateIteration = {
                  '_id': iteration._id,
                  'set': {
                    'status': status
                  }
                };
                completedIterations.push(updateIteration);
              }
            });
          }
          return iterationModel.bulkUpdateIterations(completedIterations);
        })
        .then(function(result){
          resolve(result);
        })
        .catch( /* istanbul ignore next */ function(err){
          reject(err);
        });
    });
  },

  updateUsersLocation: function() {
    return new Promise(function(resolve, reject){
      var ulocation = {};
      _.each(userTimezone, function(tz){
        ulocation[tz.location] = tz.timezone;
      });
      var updateUsers = [];
      _.each(userLocations, function(location){
        var updateUser = {
          'email': location.email.toLowerCase(),
          'set': {
            'location': {
              'site': location.location.toLowerCase(),
              'timezone': ulocation[location.location.toLowerCase()]
            }
          }
        };
        updateUsers.push(updateUser);
      });
      userModel.bulkUpdateUsers(updateUsers)
        .then(function(result){
          resolve(result);
        })
        .catch(function(err){
          reject(err);
        });
      // var returnTimezone = [];
      // var uniquelocations = _.uniq((_.pluck(userLocations.locations, 'location')));
      // Promise.mapSeries(uniquelocations, function(item, index, length) {
      //   return new Promise(function(resolve, reject){
      //     teamScoreModel.getTimezone([item])
      //       .then(function(result){
      //         var obj = {
      //           'location': item,
      //           'timezone': result
      //         };
      //         returnTimezone.push(obj);
      //         return resolve(obj);
      //       })
      //       .catch(function(err){
      //         var obj = {
      //           'location': item,
      //           'timezone': null
      //         };
      //         returnTimezone.push(obj);
      //         return resolve(obj);
      //       });
      //   });
      // })
      // .then(function() {
      //   resolve(returnTimezone);
      // })
      // .catch(function(err){
      //   reject(err);
      // });
      // var timezone = _.sortBy(userTimezone.timezone, function(tz){
      //   return tz.location.toLowerCase();
      // });
      // _.each(timezone, function(tz){
      //   tz.location = tz.location.toLowerCase();
      // });
      // var uniqTz = _.uniq(_.pluck(timezone, 'location'));
      // var returnObj = [];
      // _.each(uniqTz, function(utz){
      //   var obj = {
      //     'location': utz,
      //     'timezone': null
      //   };
      //   _.find(timezone, function(tz){
      //     if (tz.location == utz) {
      //       obj.timezone = tz.timezone;
      //       return returnObj.push(obj);
      //     }
      //   });
      // });
      // resolve(returnObj);
    });
  },
  /**
   * Update/create assessment rollup data document
   * @return update result
   */
  updateAssessmentRollUpData: function() {
    return new Promise(function(resolve, reject) {
      var nowTime = new Date();
      var options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      };

      for (var i = 0; i <= ASSESSMENT_PERIOD; i++) {
        var time = (addMonths(nowTime, -(ASSESSMENT_PERIOD - i))).toLocaleDateString('en-US', options);
        var month = monthNames[parseInt(time.substring(0, 2)) - 1];
        var year = time.substring(time.length - 4, time.length);
        assessmentMonths[i] = month + ' ' + year;
      }

      var promiseArray = [];
      var squadAssessments = {};
      var oldRollUpDataRevs = {};
      var squadsByParent = {};

      promiseArray.push(getSubmittedAssessments());
      promiseArray.push(getAllSquads());
      promiseArray.push(marRollupModel.remove({}));
      Promise.all(promiseArray)
        .then(function(promiseResults) {
          squadAssessments = promiseResults[0];
          squadsByParent = promiseResults[1];
          var promiseArray2 = [];
          _.each(Object.keys(squadAssessments), function(squadTeamId) {
            promiseArray2.push(rollUpAssessmentsBySquad(squadAssessments[squadTeamId], squadTeamId));
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

            promiseArray3.push(rollUpAssessmentsByNonSquad(squadsByParent[nonSquadTeamId]['children'], squadsByParent[nonSquadTeamId]['teamId'], squadsCalResults, nonSquadTeamId));
          });
          return Promise.all(promiseArray3);
        })
        .then(function(nonSquadCalResults){
          return marRollupModel.insertMany(nonSquadCalResults);
        })
        .then(function(results){
          if (results) {
            resolve('Assessment rollup data inserted successfully.');
          }
          else {
            resolve('Empty records.');
          }
        })
        .catch( /* istanbul ignore next */ function(err) {
          var msg;
          if (err.error) {
            msg = err.error;
          } else {
            msg = err;
          }
          loggers.get('models').error('Error: ', msg);
          reject(msg);
        });
    });
  },

  /**
   * Retrieve assessment rollup data by team
   * @param teamId - team record id
   * @return team rollup data
   */
  getAssessmentRollUpByTeam: function(teamId) {
    return new Promise(function(resolve, reject) {
      marRollupModel.findOne({teamId: teamId})
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
          loggers.get('models').error('Error: ', msg);
          reject(msg);
        });
    });
  }
};

module.exports = snapshot;
