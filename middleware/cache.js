var Promise = require('bluebird');
var _ = require('underscore');
var loggers = require('../middleware/logger');
var teamModel = require('../models/teams');
var util = require('../helpers/util');

var infoLogs = function(msg){
  tMsg = typeof msg === 'object' ? JSON.stringify(msg) : msg;
  loggers.get('cache').info(tMsg);
  return;
};


var returnObject = function(data) {
  // pre process returnd rows so we deal directly with the document objects
  // doc attribute of data are valid for compacted views that requested for "include_doc=true"
  if (_.has(data, "rows")) {
    if (_.has(data.rows, "doc"))
      return _.pluck(data.rows, 'doc');
    else 
      return _.pluck(data.rows, 'value');
  } else if (data.length > 0) {
    if (!_.isEmpty(data[0].doc)) 
      return _.pluck(data, 'doc');
    else
      return _.pluck(data, 'value');
  } else
    return data;
};

var userCache = {
  setAllTeams: function(req, res) {
    return new Promise(function(resolve, reject) {
      teamModel.getTeam(null)
        .then(function(result) {
          var list = returnObject(result);
          req.session['allTeamsLookup'] = _.indexBy(list, function(team) {return team._id});
          req.session['allTeams'] = _.sortBy(list, function(team) {return team.name});
          resolve();
        })
        .catch(function(err) {
          req.session['allTeams'] = [];
          resolve();
        });
      });
  },

  setMyTeams: function(req, res) {
    return new Promise(function(resolve, reject) {
      teamModel.getTeamByEmail(req.session['email'])
        .then(function(result) {
          var list = returnObject(result);
          req.session['myTeams'] = list;
          resolve();
        })
        .catch(function(err) {
          req.session['myTeams'] = [];
          resolve();
        });
      });
  },

  setTeamNames: function(req, res) {
    return new Promise(function(resolve, reject) {
      teamModel.getName(null)
        .then(function(result) {
          var list = returnObject(result);
          req.session['allTeams'] = list;
          resolve();
        })
        .catch(function(err) {
          req.session['allTeams'] = [];
          resolve();
        });
      });
  },

  setMemberRoles: function(req, res) {
    return new Promise(function(resolve, reject) {
      teamModel.getRole()
        .then(function(result) {
          var list = returnObject(result);
          req.session['memberRoles'] = list;
          resolve();
        })
        .catch(function(err) {
          req.session['memberRoles'] = [];
          resolve();
        });
      });
  },

  setSystemAdmins: function(req, res) {
    return new Promise(function(resolve, reject) {
      util.getAdmins('ag_ref_access_control')
        .then(function(result) {
          req.session['systemAdmin'] = returnObject(result);
          resolve();
        })
        .catch(function(err) {
          req.session['systemAdmin'] = [];
          resolve();
        });
      });
  },

  setSystemStatus: function(req, res) {
    return new Promise(function(resolve, reject) {
      util.getSystemStatus('ag_ref_system_status_control')
        .then(function(result) {
          req.session['systemStatus'] = returnObject(result);
          resolve();
        })
        .catch(function(err) {
          req.session['systemStatus'] = [];
          resolve();
        });
      });
  },

  setHomeCache: function(req, res, next) {
    Promise.all(
      [
        userCache.setAllTeams(req, res), 
        userCache.setMyTeams(req, res),
        userCache.setSystemAdmins(req, res),
        userCache.setSystemStatus(req, res)
      ])
      .then(function() {
        infoLogs("Done loading user cache.");
        return next();
      })
      .catch(function(err) {
        infoLogs(err);
        return next();
      });
  },


  setTeamCache: function(req, res, next) {
    Promise.all(
      [
        userCache.setAllTeams(req, res), 
        userCache.setMyTeams(req, res),
        userCache.setSystemAdmins(req, res),
        userCache.setSystemStatus(req, res),
        userCache.setMemberRoles(req, res)
      ])
      .then(function() {
        infoLogs("Done loading user cache.");
        return next();
      })
      .catch(function(err) {
        infoLogs(err);
        return next();
      });
  },

  compactTeam: function(team) {
    var compactedTeam = new Object();
    if (!_.isEmpty(team)) {
      var teamMembers = [];
      var teamCount = 0;
      var teamAlloc = 0;
      for (var i in team.members) {
        if (teamMembers.indexOf(team.members[i].id) == -1) {
          teamCount++;
          teamMembers.push(team.members[i].id);
        }
        teamAlloc += parseInt(team.members[i].allocation);
      }
      teamAlloc = teamAlloc/100;
      compactedTeam['_id'] = team._id, 
      compactedTeam['name'] = team.name, 
      compactedTeam['squadteam'] = team.squadteam,
      compactedTeam['parent_team_id'] = team.parent_team_id,
      compactedTeam['child_team_id'] = team.child_team_id,
      compactedTeam['total_members'] = teamCount,
      compactedTeam['total_allocation'] = teamAlloc
      compactedTeam['doc'] = team;
    }
    infoLogs('Done compacting team data.');
    return compactedTeam;
  },

  updateTeamCache: function(req, team) {
    var allTeamsLookup = req.session['allTeamsLookup'];
    var allTeams = req.session['allTeams'];
    if (!_.isEmpty(allTeamsLookup) && !_.isEmpty(team)) {
      var compactedTeam = compactTeam(team);
      if (!_.isEmpty(allTeamsLookup[team._id]))
        allTeams.push(compactedTeam);
      else
        _.extend(_.findWhere(allTeams, { _id: team._id}), compactedTeam)

      allTeamsLookup[team._id] = compactedTeam;
    }
    req.session['allTeamsLookup'] = allTeamsLookup;
    req.session['allTeams'] = _.sortBy(list, function(team) {return team.name});
    infoLogs('Done updating cached team data.');
  }
};

module.exports = userCache;