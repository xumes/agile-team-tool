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
  },
  partialMonth: {
    type: Boolean,
    default: false
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
  value: [pointsSchema]
};

var formatErrMsg = function(msg) {
  loggers.get('model-snapshot').error('Error: ', msg);
  return {
    error: msg
  };
};

var successLogs = function(msg) {
  loggers.get('model-snapshot').info('Success: ' + msg);
  return;
};

var infoLogs = function(msg) {
  loggers.get('model-snapshot').info(msg);
  return;
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
        var msg;
        if (err.error) {
          msg = err.error;
        } else {
          msg = err;
        }
        return reject(formatErrMsg(msg));
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
            squadsByParent[id] = [];
          }
        });
        // _.each(squadTeams, function(squadTeam) {
        //   if (squad) {
        //
        //   }
        // });
        _.each(squadTeams, function(squadTeam) {
          if (squadTeam.value.squadteam == 'Yes') {
            _.each(squadTeam.value.parents, function(parent) {
              if (!_.isUndefined(squadsByParent[parent])) {
                squadsByParent[parent].push(squadTeam.value._id);
              }
            });
          }
        });
        return resolve(squadsByParent);
      })
      .catch( /* istanbul ignore next */ function(err){
        var msg;
        if (err.error) {
          msg = err.error;
        } else {
          msg = err;
        }
        return reject(formatErrMsg(msg));
      });
  });
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

var snapshot = {
  /**
   * Roll up data to the non-squads.
   * @return Array _revs (return rev if successfully update)
   */
  updateRollUpData: function() {
    return new Promise(function(resolve, reject) {
      lastUpdate = moment().format(dateFormat);
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
      for (var i = 0; i <= iterationMonth; i++) {
        var time = (addMonths(nowTime, -(iterationMonth - i))).toLocaleDateString('en-US', options);
        var month = monthNames[parseInt(time.substring(0, 2)) - 1];
        var year = time.substring(time.length - 4, time.length);
        monthArray[i] = month + '-' + year;
      }
      var promiseArray = [];
      var squadIterationDocs = {};
      var oldRollUpDataRevs = {};
      var squadsByParent = {};
      promiseArray.push(getIterationDocs(startTime, endTime));
      promiseArray.push(getAllSquads());
      Promise.all(promiseArray)
        .then(function(results){
          resolve(results[0]);
        })
        .catch(function(err){
          reject(err);
        });
    });
  },
};

module.exports = snapshot;
