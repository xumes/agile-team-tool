var _ = require('underscore');
var Promise = require('bluebird');
var mongoose = require('mongoose');
var loggers = require('../middleware/logger');
var userModel = require('./users.js');
var teamModel = require('./teams.js');
var iterationModel = require('./iterations.js');
//var teamScoreModel = require('../teamscore.js');
var assessmentModel = require('./assessments.js');
var assessmentTemplateModel = require('./assessmentTemplates.js');
var userTimezone = require('./data/uniqueUserTimezone.js');
var moment = require('moment');
var util = require('../helpers/util');
var dateFormat = 'YYYY-MM-DD HH:mm:ss';
var Schema   = mongoose.Schema;

var ITERATION_MONTHS = 7;
var lastUpdate = moment().format(dateFormat);
var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
var monthArray = [];

var ASSESSMENT_MAX_DAYS_SUBMISSION = 120;
var ASSESSMENT_PERIOD = 5;

var quarterArray = [];
var assessmentTemplate = {};
var ASSESSMENT_QUARTERS = 4;

var settings = require('../settings');

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

var practiceResultSchema = {
  principleId: {
    type: Number,
    default: 0
  },
  practiceId: {
    type: Number,
    default: 0
  },
  practiceName: {
    type: String,
    default: ''
  },
  totalCurrentScore: {
    type: Number,
    default: 0
  },
  practiceResultCount: {
    type: Number,
    default: 0
  }
};

var practiceQuarterResultSchema = {
  quarter: {
    type: String,
    default: ''
  },
  practices: [practiceResultSchema]
};

var assessmentResultSchema = {
  componentName: {
    type: String,
    default: ''
  },
  componentDescription: {
    type: String,
    default: ''
  },
  componentIdentifier: {
    type: String,
    default: ''
  },
  assessmentResultCount: {
    type: Number,
    default: 0
  },
  quarterResults: [practiceQuarterResultSchema]
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
  teamMemberData: [teamMemberSchema],
  assessmentData: [assessmentSchema],
  assessmentData2: [assessmentResultSchema]
};

var snapshot_schema = new Schema(snapshotSchema);
var snapshotModel = mongoose.model('snapshot', snapshot_schema);

function resetData() {
  var rollupDataList = [];
  for (var i=0; i<=ITERATION_MONTHS; i++) {
    rollupDataList.push({
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
    });
  }
  return rollupDataList;
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
function getAllTeams() {
  return new Promise(function(resolve, reject) {
    var promiseArray = [];
    promiseArray.push(teamModel.getNonSquadTeams());
    promiseArray.push(teamModel.getSquadTeams());
    Promise.all(promiseArray)
      .then(function(results){
        var squadsByParent = {};
        var squadTeamMemberData = {};
        var teamInformation = {
          squadsByParent: squadsByParent,
          squadTeamMemberData: squadTeamMemberData
        };
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
                var team = {
                  _id: squadTeam._id,
                  createDate: squadTeam.createDate,
                  docStatus: squadTeam.docStatus
                };
                //squadsByParent[parent]['children'].push(squadTeam._id);
                squadsByParent[parent]['children'].push(team);
              }
            });
          }

          if (_.isEmpty(squadTeam.members) || squadTeam.members.length == 0 || squadTeam.members == undefined) {
            squadTeamMemberData[squadTeam._id] = {
              'teamCnt': 0,
              'teamFTE': 0
            };
          } else {
            var allocationScore = 0;
            var memCount = 0;
            var tmArr = [];
            _.each(squadTeam.members, function(member){
              if (tmArr.indexOf(member.userId) == -1 && parseInt(member.allocation) > 0) {
                memCount++;
                tmArr.push(member.userId);
              }
              if (_.isNumber(member.allocation)) {
                allocationScore = allocationScore + member.allocation;
              }
            });
            squadTeamMemberData[squadTeam._id] = {
              'teamCnt': memCount,
              'teamFTE': allocationScore / 100.0
            };
          }

        });
        return resolve(teamInformation);
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
    var iterData = resetData();
    var rollUpIterationsData = {};
    rollUpIterationsData[teamId] = iterData;
    var nowTime = moment().endOf('month').format(dateFormat);
    _.each(iterationDocs, function(iterationDoc){
      var iterDate = moment(iterationDoc['endDate']).format(dateFormat);
      var monthDiff = calMonthDiff(moment(iterDate), moment(nowTime));
      if (monthDiff < 0 || monthDiff > ITERATION_MONTHS || _.isNaN(monthDiff)) {
        var msg = 'iteationDoc: ' + iterationDoc._id + ' end date is not correct';
        loggers.get('models-snapshot').error(msg);
        //return reject(Error(msg));
      } else {
        var monthIndex = ITERATION_MONTHS - monthDiff;
        var pts = util.getIntegerValue(iterationDoc['storyPointsDelivered']);
        var commPts = util.getIntegerValue(iterationDoc['committedStoryPoints']);
        var stories = util.getIntegerValue(iterationDoc['deliveredStories']);
        var commStories = util.getIntegerValue(iterationDoc['committedStories']);
        var teamCnt = util.getIntegerValue(iterationDoc['memberCount']);
        var defectsStartBal = util.getIntegerValue(iterationDoc['defectsStartBal']);
        var defects = util.getIntegerValue(iterationDoc['defects']);
        var defectsClosed = util.getIntegerValue(iterationDoc['defectsClosed']);
        var defectsEndBal = util.getIntegerValue(iterationDoc['defectsEndBal']);
        var dplymnts = util.getIntegerValue(iterationDoc['deployments']);
        var teamStat = util.getFloatValue(iterationDoc['teamSatisfaction']);
        var clientStat = util.getFloatValue(iterationDoc['clientSatisfaction']);
        var cycleTimeBacklog = util.getFloatValue(iterationDoc['cycleTimeInBacklog']);
        var cycleTimeWIP = util.getFloatValue(iterationDoc['cycleTimeWIP']);

        iterData[monthIndex].totalPoints = iterData[monthIndex].totalPoints + pts;
        iterData[monthIndex].totalCommPoints = iterData[monthIndex].totalCommPoints + commPts;
        iterData[monthIndex].totalStories = iterData[monthIndex].totalStories + stories;
        iterData[monthIndex].totalCommStories = iterData[monthIndex].totalCommStories + commStories;
        iterData[monthIndex].totalDefectsStartBal = iterData[monthIndex].totalDefects + defectsStartBal;
        iterData[monthIndex].totalDefects = iterData[monthIndex].totalDefects + defects;
        iterData[monthIndex].totalDefectsClosed = iterData[monthIndex].totalDefects + defectsClosed;
        iterData[monthIndex].totalDefectsEndBal = defectsEndBal;
        iterData[monthIndex].totalDplymts = iterData[monthIndex].totalDplymts + dplymnts;

        if (teamStat > 0) {
          iterData[monthIndex].totTeamStat = iterData[monthIndex].totTeamStat + teamStat;
          iterData[monthIndex].totTeamStatIter = iterData[monthIndex].totTeamStatIter + 1;
        }
        if (clientStat > 0) {
          iterData[monthIndex].totClientStat = iterData[monthIndex].totClientStat + clientStat;
          iterData[monthIndex].totClientStatIter = iterData[monthIndex].totClientStatIter + 1;
        }
        if (cycleTimeBacklog > 0) {
          iterData[monthIndex].totCycleTimeBacklog = iterData[monthIndex].totCycleTimeBacklog + cycleTimeBacklog;
          iterData[monthIndex].totCycleTimeBacklogIter = iterData[monthIndex].totCycleTimeBacklogIter + 1;
        }
        if (cycleTimeWIP > 0) {
          iterData[monthIndex].totCycleTimeWIP = iterData[monthIndex].totCycleTimeWIP + cycleTimeWIP;
          iterData[monthIndex].totCycleTimeWIPIter = iterData[monthIndex].totCycleTimeWIPIter + 1;
        }
        if (teamCnt > 0) {
          if (teamCnt < 5) {
            iterData[monthIndex].teamsLt5 = iterData[monthIndex].teamsLt5 + 1;
          } else if (teamCnt > 12) {
            iterData[monthIndex].teamsGt12 = iterData[monthIndex].teamsGt12 + 1;
          } else {
            iterData[monthIndex].teams5to12 = iterData[monthIndex].teams5to12 + 1;
          }
        }
        iterData[monthIndex].totalCompleted = iterData[monthIndex].totalCompleted + 1;
      }
    });
    return resolve(rollUpIterationsData);
  });
};

/**
 * Roll up squads data together by non-squad team
 * @param Object squads
 * @param string nonSquadTeamId (non-squad team id)
 * @param Object squadsIterReults
 * @param Object teamMemberData
 * @param Object squadsAsseResults
 * @param Object assessmentTemplate
 * @return nonSquadCalResult
 */
function rollUpDataByNonSquad(squads, nonSquadTeamId, squadsIterReults, nonSquadTeamPathId, teamMemberData, squadsAsseResults, assessmentTemplate) {
  return new Promise(function(resolve, reject) {
    var iterData = resetData();
    var nonSquadCalResult = {
      'iterationData': iterData,
      'teamMemberData': {},
      'assessmentData': {},
      'assessmentData2': {},
      'teamId': nonSquadTeamId,
      'lastUpdate': lastUpdate,
      'pathId': nonSquadTeamPathId
    };
    var teams = [];
    for (var i = 0; i <= ITERATION_MONTHS; i++) {
      teams.push(0);
    }
    for (var i = 0; i < squads.length; i++) {
      for (var j = 0; j <= ITERATION_MONTHS; j++) {
        if (!(_.isEmpty(squadsIterReults[squads[i]._id])) && !(_.isUndefined(squadsIterReults[squads[i]._id]))) {
          var squadIterationResult = squadsIterReults[squads[i]._id];
          if (squadIterationResult[j].totalPoints != undefined) {
            iterData[j].totalPoints = iterData[j].totalPoints + squadIterationResult[j].totalPoints;
            iterData[j].totalCommPoints = iterData[j].totalCommPoints + squadIterationResult[j].totalCommPoints;
            iterData[j].totalStories = iterData[j].totalStories + squadIterationResult[j].totalStories;
            iterData[j].totalCommStories = iterData[j].totalCommStories + squadIterationResult[j].totalCommStories;
            iterData[j].totalDefectsStartBal = iterData[j].totalDefectsStartBal + squadIterationResult[j].totalDefectsStartBal;
            iterData[j].totalDefects = iterData[j].totalDefects + squadIterationResult[j].totalDefects;
            iterData[j].totalDefectsClosed = iterData[j].totalDefectsClosed + squadIterationResult[j].totalDefectsClosed;
            iterData[j].totalDefectsEndBal = iterData[j].totalDefectsEndBal + squadIterationResult[j].totalDefectsEndBal;
            iterData[j].totalDplymts = iterData[j].totalDplymts + squadIterationResult[j].totalDplymts;
            iterData[j].totTeamStat = iterData[j].totTeamStat + squadIterationResult[j].totTeamStat;
            iterData[j].totTeamStatIter = iterData[j].totTeamStatIter + squadIterationResult[j].totTeamStatIter;
            iterData[j].totClientStat = iterData[j].totClientStat + squadIterationResult[j].totClientStat;
            iterData[j].totClientStatIter = iterData[j].totClientStatIter + squadIterationResult[j].totClientStatIter;
            iterData[j].totCycleTimeBacklog = iterData[j].totCycleTimeBacklog + squadIterationResult[j].totCycleTimeBacklog;
            iterData[j].totCycleTimeBacklogIter = iterData[j].totCycleTimeBacklogIter + squadIterationResult[j].totCycleTimeBacklogIter;
            iterData[j].totCycleTimeWIP = iterData[j].totCycleTimeWIP + squadIterationResult[j].totCycleTimeWIP;
            iterData[j].totCycleTimeWIPIter = iterData[j].totCycleTimeWIPIter + squadIterationResult[j].totCycleTimeWIPIter;
            iterData[j].teamsLt5 = iterData[j].teamsLt5 + squadIterationResult[j].teamsLt5;
            iterData[j].teamsGt12 = iterData[j].teamsGt12 + squadIterationResult[j].teamsGt12;
            iterData[j].teams5to12 = iterData[j].teams5to12 + squadIterationResult[j].teams5to12;
            iterData[j].totalCompleted = iterData[j].totalCompleted + squadIterationResult[j].totalCompleted;
            if (squadIterationResult[j].totalCompleted > 0) {
              teams[j] = teams[j] + 1;
            }
          }
        }
      }
    }
    var newDate = moment();
    var endOfMonth = moment().endOf('month');
    if (newDate.diff(endOfMonth) < 0) {
      iterData[ITERATION_MONTHS].partialMonth = true;
    }
    for (var i = 0; i <= ITERATION_MONTHS; i++) {
      iterData[i].totalSquad = teams[i];
      iterData[i].month = monthArray[ITERATION_MONTHS-i];
      if (iterData[i].totTeamStatIter > 0) {
        iterData[i].totTeamStat = iterData[i].totTeamStat / iterData[i].totTeamStatIter;
      }
      if (iterData[i].totClientStatIter > 0) {
        iterData[i].totClientStat = iterData[i].totClientStat / iterData[i].totClientStatIter;
      }
      if (iterData[i].totCycleTimeBacklogIter > 0) {
        iterData[i].totCycleTimeBacklog = iterData[i].totCycleTimeBacklog / iterData[i].totCycleTimeBacklogIter;
      }
      if (iterData[i].totCycleTimeWIPIter > 0) {
        iterData[i].totCycleTimeWIP = iterData[i].totCycleTimeWIP / iterData[i].totCycleTimeWIPIter;
      }
    }
    nonSquadCalResult['teamMemberData'] = rollUpTeamMemberData(squads, teamMemberData);
    var asseResult = rollUpAssessmentsByNonSquad(squads, squadsAsseResults, assessmentTemplate);
    nonSquadCalResult['assessmentData'] = asseResult.assessmentData;
    nonSquadCalResult['assessmentData2'] = asseResult.assessmentData2;

    resolve(nonSquadCalResult);
  });
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
              var memCount = 0;
              var tmArr = [];
              _.each(team.members, function(member){
                if (tmArr.indexOf(member.userId) == -1) {
                  memCount++;
                  tmArr.push(member.userId);
                }
                if (_.isNumber(member.allocation)) {
                  allocationScore = allocationScore + member.allocation;
                }
              });
              squadTeams[team._id] = {
                'teamCnt': memCount,
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

function isTeamArchived(squad) {
  if (!_.isEmpty(squad.docStatus) && _.isEqual(squad.docStatus, 'archive'))
    return true;
  return false;
};

/**
 * Roll up total_members and total_allocation data
 * @param Array squads
 * @param Object teamMemberData
 * @return Object entry
 */
function rollUpTeamMemberData(squads, teamMemberData) {
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

  _.each(squads, function(team) {
    var teamId = team._id;
    var isArchived = isTeamArchived(team);
    if (!_.isEmpty(teamMemberData[teamId]) && teamMemberData[teamId] != undefined && !isArchived) {
      var squad = teamMemberData[teamId];
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
        reject(msg);
      });
  });
};

/**
 * Process assessment rollup data in squad level
 * @param assessments - squad assessment data
 * @param teamId - squad record id
 * @return squad rollup data
 */
function rollUpAssessmentsBySquad(assessments, teamId, assessmentTemplate) {
  return new Promise(function(resolve, reject) {
    var assessmentData = resetAssessmentData();
    var assessmentData2 = resestQuarterAssessmentData(assessmentTemplate);
    var rollUpAssessmentData = {};
    rollUpAssessmentData[teamId] = {
      assessmentData: assessmentData,
      assessmentData2: assessmentData2
    };

    _.each(assessments, function(assessment ) {
      var assessmentDate = new Date(assessment['submittedDate']);
      var assessmentQuarter = moment(assessment['submittedDate']).format('Q[Q]YY');
      if (quarterArray.indexOf(assessmentQuarter) > -1) {
        _.each(assessment.componentResults, function(cr) {
          var squadAssessmentData = {};
          var componentIdentifier = '';
          var componentDescription = '';
          if ((cr.componentName.toLowerCase().indexOf('leadership') > -1 && cr.componentName.toLowerCase().indexOf('ops') == -1) &&
            (cr.componentName.toLowerCase().indexOf('leadership') > -1 && cr.componentName.toLowerCase().indexOf('operations') == -1)) {
            componentIdentifier = 'prj';
            componentDescription = 'Project Teams (Foundational Practices)';
          } else if ((cr.componentName.toLowerCase().indexOf('leadership') > -1 && cr.componentName.toLowerCase().indexOf('ops') > -1) ||
            (cr.componentName.toLowerCase().indexOf('leadership') > -1 && cr.componentName.toLowerCase().indexOf('operations') > -1)) {
            componentIdentifier = 'ops';
            componentDescription = 'Operations Teams (Foundational Practices)';
          } else if (cr.componentName.toLowerCase().indexOf('delivery') > -1) {
            componentIdentifier = 'devops';
            componentDescription = 'DevOps Practices';
          }
          var practiceList = [];
          _.each(cr.assessedComponents, function(ac) {
            var practiceData = {
              principleId: ac.principleId,
              practiceId: ac.practiceId,
              practiceName: ac.practiceName,
              totalCurrentScore: ac.currentScore,
              totalPracticeCount: 1
            };
            practiceList.push(practiceData);
          });
          var quarterList = [];
          _.each(quarterArray, function(q) {
            var quarterData = {
              quarter: q,
              practices: _.isEqual(assessmentQuarter, q) ? practiceList : []
            };
            quarterList.push(quarterData);
          });
          squadAssessmentData = {
            componentName: cr.componentName,
            componentIdentifier: componentIdentifier,
            componentDescription: componentDescription,
            assessmentResultCount: 1,
            quarterResults: quarterList
          };

          if (_.isEmpty(assessmentData2)) {
            assessmentData2.push(squadAssessmentData);
          } else {
            var componentData = _.find(assessmentData2, function(componentData) {
              if (_.isEqual(squadAssessmentData.componentIdentifier, componentData.componentIdentifier))
                return componentData;
            });
            if (_.isEmpty(componentData)) {
              assessmentData2.push(squadAssessmentData);
            } else {
              componentData.assessmentResultCount += squadAssessmentData.assessmentResultCount;
              var quarterData = _.find(componentData.quarterResults, function(quarterData) {
                if (_.isEqual(assessmentQuarter, quarterData.quarter))
                  return quarterData;
              });

              if (!_.isEmpty(quarterData)) {
                var currAsseData = _.find(squadAssessmentData.quarterResults, function(currAsseData) {
                  if (_.isEqual(assessmentQuarter, currAsseData.quarter))
                    return currAsseData;
                });
                if (_.isEmpty(quarterData.practices)) {
                  quarterData.practices = currAsseData.practices;
                } else {
                  var newPractices = [];
                  _.each(quarterData.practices, function(p1) {
                    var p2 = _.find(currAsseData.practices, function(p2) {
                      if (_.isEqual(p1.principleId, p2.principleId) && _.isEqual(p1.practiceId, p2.practiceId))
                        return p2;
                    });

                    if (!_.isEmpty(p2)) {
                      p1.totalCurrentScore += p2.totalCurrentScore;
                      p1.totalPracticeCount += p2.totalPracticeCount;
                    } else {
                      newPractices.push(p2);
                    }
                  });
                  if (!_.isEmpty(newPractices)) {
                    quarterData.practices = _.union(quarterData.practices, newPractices);
                  }
                }
              }
            }
          }
        });
      }

      for (var i = 0; i <= ASSESSMENT_PERIOD; i++) {
        var period = monthArray[i];
        var month = monthNames.indexOf(period.substring(0, period.indexOf(' ')));

        var year = period.substring(period.indexOf(' '), period.length);
        var date;
        var nowTime = new Date();
        if (month == nowTime.getMonth()){
          date = nowTime.getDate();
        } else {
          date = daysInMonth(month + 1, year);
        }

        var targetDate = new Date(year, month, date);
        if ((assessmentDate.getFullYear() == year && assessmentDate.getMonth() <= month) ||
          assessmentDate.getFullYear() < year){
          var days = daysDiff(targetDate, assessmentDate);

          if (days <= ASSESSMENT_MAX_DAYS_SUBMISSION){
            assessmentData[i].less_120_days += 1;
          } else {
            assessmentData[i].gt_120_days += 1;
          }

          //process team average scores
          if (assessmentData[i].mar_date != undefined) {
            var time = timeDiff(assessmentData[i].mar_date,assessmentDate);
            // get latest assessment data
            if (time < 0 ){
              setMaturityData(assessment, assessmentData[i], assessmentDate);
            }
          } else {
            setMaturityData(assessment, assessmentData[i], assessmentDate);
          }
        } else {
          continue;
        }
      }
    });

    _.each(assessmentData, function(period, index) {
      if (period.less_120_days >= 1){
        period.less_120_days = 1;
        period.gt_120_days = 0;
        period.no_submission = 0;
      }
      else if (period.gt_120_days >= 1 && assessmentData[index].less_120_days == 0){
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
 * @param squadsAsseResults - squad assessment data
 * @param assessmentTemplate - current assessment template
 * @return tribe rollup data
 */
function rollUpAssessmentsByNonSquad(squads, squadsAsseResults, assessmentTemplate) {
  var assessmentData = resetAssessmentData();
  var assessmentData2 = resestQuarterAssessmentData(assessmentTemplate);
  var rollUpAssessmentData = {
    assessmentData: assessmentData,
    assessmentData2: assessmentData2
  };

  for (var i = 0; i <= ASSESSMENT_PERIOD; i++) {
    assessmentData[i].totalSquad = squads.length;
    assessmentData[i].month = monthArray[i];
  }

  for (var i = 0; i < squads.length; i++) {
    for (var j = 0; j <= ASSESSMENT_PERIOD; j++) {
      // check if squad team was already created before the rollup period
      var createPeriod = moment(squads[i].createDate);
      var currentPeriod = moment().subtract(j, 'months');
      var monthDiff = calMonthDiff(createPeriod, currentPeriod);
      var isArchived = isTeamArchived(squads[i]);

      if (!isArchived) {
        if (!_.isUndefined(squadsAsseResults[squads[i]._id]) && !_.isUndefined(squadsAsseResults[squads[i]._id].assessmentData)) {
          var squadAssessmentResult = squadsAsseResults[squads[i]._id].assessmentData;
          if (!(_.isEmpty(squadAssessmentResult)) && !(_.isUndefined(squadAssessmentResult))) {
            if (squadAssessmentResult[j].less_120_days != undefined) {
              assessmentData[j].less_120_days += squadAssessmentResult[j].less_120_days;
              assessmentData[j].gt_120_days += squadAssessmentResult[j].gt_120_days;
              // rollup if team was created within covered period
              if (monthDiff >= 0)
                assessmentData[j].no_submission += squadAssessmentResult[j].no_submission;

              assessmentData[j].prj_foundation_score += squadAssessmentResult[j].prj_foundation_score;
              assessmentData[j].operation_score += squadAssessmentResult[j].operation_score;
              assessmentData[j].prj_devops_score += squadAssessmentResult[j].prj_devops_score;

              assessmentData[j].total_prj_foundation += squadAssessmentResult[j].total_prj_foundation;
              assessmentData[j].total_prj_devops += squadAssessmentResult[j].total_prj_devops;
              assessmentData[j].total_operation += squadAssessmentResult[j].total_operation;
            } else {
              if (monthDiff >= 0)
                assessmentData[j].no_submission += 1;
            }
          }
          else {
            if (monthDiff >= 0)
              assessmentData[j].no_submission += 1;
          }
        } else {
          if (monthDiff >= 0)
            assessmentData[j].no_submission += 1;
        }
      }
    }

    if (!_.isUndefined(squadsAsseResults[squads[i]._id]) && !_.isUndefined(squadsAsseResults[squads[i]._id].assessmentData2)) {
      var squadAssessmentQuarterResult = squadsAsseResults[squads[i]._id].assessmentData2;
      if (!(_.isEmpty(squadAssessmentQuarterResult)) && !(_.isUndefined(squadAssessmentQuarterResult))) {
        if (_.isEmpty(assessmentData2)) {
          // add first assessment component result for roll up
          assessmentData2 = squadAssessmentQuarterResult;
        } else {
          _.each(squadAssessmentQuarterResult, function(saqr) {
            // find existing assessment component result to roll up saqr
            var asseRollupData = _.find(assessmentData2, function(asseRollupData) {
              if (_.isEqual(asseRollupData.componentIdentifier, saqr.componentIdentifier))
                return asseRollupData;
            });
            if (_.isEmpty(asseRollupData)) {
              // add new  current assessment component result
              assessmentData2.push(saqr);
            } else {
              // roll up current assessment component result
              asseRollupData.assessmentResultCount += saqr.assessmentResultCount;
              _.each(asseRollupData.quarterResults, function(quarterData) {
                var qr = _.find(saqr.quarterResults, function(qr) {
                  if (_.isEqual(quarterData.quarter, qr.quarter))
                    return qr;
                });
                if (!_.isEmpty(qr)) {
                  _.each(qr.practices, function(qrp) {
                    var practiceFound = false;
                    _.each(quarterData.practices, function(qdp) {
                      if (_.isEqual(qrp.principleId, qdp.principleId) && _.isEqual(qrp.practiceId, qdp.practiceId)) {
                        qdp.totalCurrentScore += qrp.totalCurrentScore;
                        qdp.totalPracticeCount += qrp.totalPracticeCount;
                        practiceFound = true;
                      }
                    });
                    if (!practiceFound) {
                      quarterData.practices.push(qrp);
                    }
                  });
                }
              });
            }
          });
        }
      }
    }
  }

  rollUpAssessmentData.assessmentData2 = assessmentData2;
  _.each(assessmentData, function(period, index) {
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
  assessmentData.reverse();
  if (newDate.getDate() < days) {
    assessmentData[ASSESSMENT_PERIOD].partialMonth = true;
  }

  return rollUpAssessmentData;
};


function getPeriodName(monthPeriod) {
  var month = monthNames[monthPeriod.month()];
  var year = monthPeriod.year();
  return month + ' ' + year;
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

function calMonthDiff(d1, d2) {
  var months;
  months = (d2.year() - d1.year()) * 12;
  months -= d1.month();
  months += d2.month();
  return months;
};

/**
 * Set to default assessment rollup data values
 * @return default data
 */
function resetAssessmentData() {
  var rollupDataList = [];
  for (var i=0; i<=ASSESSMENT_PERIOD; i++) {
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

function resestQuarterAssessmentData(assessmentTemplate) {
  var componentList = [];
  if (!_.isEmpty(assessmentTemplate)) {
    _.each(assessmentTemplate.components, function(c) {
      var componentIdentifier = '';
      var componentDescription = '';
      if ((c.name.toLowerCase().indexOf('leadership') > -1 && c.name.toLowerCase().indexOf('ops') == -1) &&
        (c.name.toLowerCase().indexOf('leadership') > -1 && c.name.toLowerCase().indexOf('operations') == -1)) {
        componentIdentifier = 'prj';
        componentDescription = 'Project Teams (Foundational Practices)';
      } else if ((c.name.toLowerCase().indexOf('leadership') > -1 && c.name.toLowerCase().indexOf('ops') > -1) ||
        (c.name.toLowerCase().indexOf('leadership') > -1 && c.name.toLowerCase().indexOf('operations') > -1)) {
        componentIdentifier = 'ops';
        componentDescription = 'Operations Teams (Foundational Practices)';
      } else if (c.name.toLowerCase().indexOf('delivery') > -1) {
        componentIdentifier = 'devops';
        componentDescription = 'DevOps Practices';
      }
      var quarterList = [];
      _.each(quarterArray, function(q) {
        var quarterData = {
          quarter: q,
          practices: []
        };
        quarterList.push(quarterData);
      });
      var componentData = {
        componentName: c.name,
        componentIdentifier: componentIdentifier,
        componentDescription: componentDescription,
        assessmentResultCount: 0,
        quarterResults: quarterList
      };
      componentList.push(componentData);
    });
  }
  return componentList;
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
      ave_score = util.getFloatValue(data.componentResults[0].currentScore);
    }
    else if (type == 'Delivery'){
      ave_score = util.getFloatValue(data.componentResults[1].currentScore);
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
  if (assessment.type == 'Project'){
    mat_data.prj_foundation_score = getAssessmentAveScore(assessment, 'Project');
    mat_data.total_prj_foundation = 1;
  }
  else {
    //operation project average score
    mat_data.operation_score = getAssessmentAveScore(assessment, 'Project');
    mat_data.total_operation = 1;
  }
  if (assessment.deliversSoftware){
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
   */
  updateRollUpData: function() {
    return new Promise(function(resolve, reject) {
      lastUpdate = moment().format(dateFormat);
      var endTime = moment().format(dateFormat);
      var startTime = moment().subtract(ITERATION_MONTHS,'months').startOf('month').format(dateFormat);
      //var startTime = moment().startOf('month').format(dateFormat);
      monthArray = [];
      for (var i = 0; i <= ITERATION_MONTHS; i++) {
        var monthPeriod = moment().subtract(i, 'months');
        monthArray.push(getPeriodName(monthPeriod));
      }
      quarterArray = [];
      for (var i=0; i < ASSESSMENT_QUARTERS; i++) {
        quarterArray.push(moment().subtract(i, 'Q').format('Q[Q]YY'));
      }

      var promiseArray = [];
      var squadIterationDocs = {};
      var squadsByParent = {};
      var squadTeamMemberData = {};
      // var teamMemberData = {};
      var squadAssessments = {};
      var squadsCalResultsByIter = {};
      var squadsCalResultsByAsse = {};
      var nonSquadCalResults = {};
      promiseArray.push(getIterationDocs(startTime, endTime));
      promiseArray.push(getSubmittedAssessments());
      promiseArray.push(getAllTeams());
      //promiseArray.push(getSquadsData());
      promiseArray.push(assessmentTemplateModel.get(null, 'active'));
      Promise.all(promiseArray)
        .then(function(results){
          squadIterationDocs = results[0];
          squadAssessments = results[1];
          squadsByParent = results[2].squadsByParent;
          squadTeamMemberData = results[2].squadTeamMemberData;
          assessmentTemplate = results[3][0];
          //squadsByParent = results[2];
          //teamMemberData = results[3];
          //assessmentTemplate = results[4][0];
          var promiseArray2 = [];
          _.each(Object.keys(squadIterationDocs), function(squadTeamId) {
            promiseArray2.push(rollUpIterationsBySquad(squadIterationDocs[squadTeamId], squadTeamId));
          });
          loggers.get('models-snapshot').info('Rollup iterations');
          return Promise.all(promiseArray2);
        })
        .then(function(squadsCalResultsArray){
          _.each(squadsCalResultsArray, function(squadsCalResult) {
            if (Object.keys(squadsCalResult)[0] != null || Object.keys(squadsCalResult)[0] != undefined) {
              squadsCalResultsByIter[Object.keys(squadsCalResult)[0]] = squadsCalResult[Object.keys(squadsCalResult)[0]];
            }
          });
          var promiseArray3 = [];
          _.each(Object.keys(squadAssessments), function(squadTeamId) {
            promiseArray3.push(rollUpAssessmentsBySquad(squadAssessments[squadTeamId], squadTeamId), assessmentTemplate);
          });
          loggers.get('models-snapshot').info('Rollup assessments');
          return Promise.all(promiseArray3);
        })
        .then(function(squadsCalResultsArray){
          _.each(squadsCalResultsArray, function(squadsCalResult) {
            if (Object.keys(squadsCalResult)[0] != null || Object.keys(squadsCalResult)[0] != undefined) {
              squadsCalResultsByAsse[Object.keys(squadsCalResult)[0]] = squadsCalResult[Object.keys(squadsCalResult)[0]];
            }
          });
          var promiseArray4 = [];
          _.each(Object.keys(squadsByParent), function(nonSquadTeamId) {
            promiseArray4.push(rollUpDataByNonSquad(squadsByParent[nonSquadTeamId]['children'], squadsByParent[nonSquadTeamId]['teamId'], squadsCalResultsByIter, nonSquadTeamId, squadTeamMemberData, squadsCalResultsByAsse, assessmentTemplate));
          });
          loggers.get('models-snapshot').info('Rollup iterations/assessments to parents');
          return Promise.all(promiseArray4);
        })
        .then(function(result){
          nonSquadCalResults = result;
          loggers.get('models-snapshot').info('Clearing previous snapshot data');
          return snapshotModel.remove({});
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
          // return snapshotModel.collection.insert(nonSquadCalResults);
          //return Promise.all(promiseArray4);
        })
        .then(function(){
          loggers.get('models-snapshot').info('Saving snapshot data');
          return snapshotModel.collection.insert(nonSquadCalResults);
        })
        .then(function(results){
          if (results) {
            resolve('Updated snapshot successfully.');
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
          if (_.isEmpty(rollUpData))
            rollUpData = new snapshotModel();
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

  deleteSnapshot: function(docId) {
    return new Promise(function(resolve, reject){
      snapshotModel.remove({'_id': docId})
        .then(function(result){
          resolve(result);
        })
        .catch( /* istanbul ignore next */ function(err){
          reject(err);
        });
    });
  }
};

module.exports = snapshot;
