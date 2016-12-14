// v2, do not bind req, res and next param to every method
var Promise = require('bluebird');
var _ = require('underscore');
var validate = require('validate.js');
var loggers = require('../middleware/logger');
var teamModel = require('../models/teams');
var util = require('../helpers/util');
var users = require('../models/users');

var infoLogs = function(msg) {
  tMsg = typeof msg === 'object' ? JSON.stringify(msg) : msg;
  loggers.get('cache').verbose(tMsg);
  return;
};

var isValidEmail = function(email) {
  var constraints = {
    email: {
      email: true
    }
  };
  return validate({
    email: email
  }, constraints);
};

var isModel = function(req) {
  return (typeof req === 'string' && !(_.isEmpty(req)) && isValidEmail(req) === undefined) ? true : false;
};

var formattedCache = function(allCache) {
  var cacheFormat = {};
  _.each(allCache, function(v, i, l) {
    var obj = {};
    var list = {};
    switch (i) {
      case 'allTeamsLookup':
        list = util.returnObject(v);
        obj = _.indexBy(list, function(team) {
          return team._id;
        });
        break;
      case 'allTeams':
        list = util.returnObject(v);
        obj = _.sortBy(list, function(team) {
          return team.name;
        });
        break;
      case 'userTeamList':
      case 'systemAdmin':
      case 'systemStatus':
      case 'memberRoles':
        obj = util.returnObject(v);
        break;
    }
    cacheFormat[i] = obj;
  });
  return cacheFormat;
};

var userCache = {
  setSystemInfoCache: function() {
    return new Promise(function(resolve, reject) {
      var allCache = {
        'systemAdmin': [],
        'systemStatus': []
      };
      Promise.all(
        [
          users.getAdmins(),
          util.getSystemStatus('ag_ref_system_status_control')
        ])
        .then(function(result) {
          allCache = {
            'systemAdmin': result[0],
            'systemStatus': result[1]
          };
          resolve(formattedCache(allCache));
        })
        .catch(function(err) {
          infoLogs(err);
          resolve(allCache);
        });
    });
  },

  setAllTeams: function() {
    return new Promise(function(resolve, reject) {
      teamModel.getByName(null)
        .then(function(result) {
          resolve(util.returnObject(result));
        })
        .catch(function(err) {
          infoLogs(err);
          resolve([]);
        });
    });
  },

  setHomeCache: function(userEmail) {
    return new Promise(function(resolve, reject) {
      var allCache = {
        'allTeamsLookup': [],
        'allTeams': [],
        'userTeamList': [],
        'systemAdmin': [],
        'systemStatus': []
      };
      Promise.all(
        [
          teamModel.getByName(null),
          teamModel.getUserTeams(userEmail),
          users.getAdmins(),
          util.getSystemStatus('ag_ref_system_status_control')
        ])
        .then(function(result) {
          allCache = {
            'allTeamsLookup': result[0],
            'allTeams': result[0],
            'userTeamList': result[1],
            'systemAdmin': result[2],
            'systemStatus': result[3]
          };
          resolve(formattedCache(allCache));
        })
        .catch(function(err) {
          infoLogs(err);
          resolve(allCache);
        });
    });
  },

  setTeamCache: function(userEmail) {
    return new Promise(function(resolve, reject) {
      var allCache = {
        'allTeamsLookup': [],
        'allTeams': [],
        'userTeamList': [],
        'systemAdmin': [],
        'systemStatus': [],
        'memberRoles': []
      };
      Promise.all(
        [
          teamModel.getByName(null),
          teamModel.getUserTeams(userEmail),
          users.getAdmins(),
          util.getSystemStatus('ag_ref_system_status_control'),
          teamModel.getRole()
        ])
        .then(function(result) {
          allCache = {
            'allTeamsLookup': result[0],
            'allTeams': result[0],
            'userTeamList': result[1],
            'systemAdmin': result[2],
            'systemStatus': result[3],
            'memberRoles': result[4]
          };
          resolve(formattedCache(allCache));
        })
        .catch(function(err) {
          infoLogs(err);
          resolve(allCache);
        });
    });
  },

  setActiveSquadTeams: function() {
    return new Promise(function(resolve, reject) {
      teamModel.getLookupTeamByType(null, true)
        .then(function(result) {
          resolve(result);
        })
        .catch(function(err) {
          infoLogs(err);
          resolve([]);
        });
    });
  },

  setUserTeams: function(userEmail) {
    return new Promise(function(resolve, reject) {
      teamModel.getUserTeams(userEmail)
        .then(function(result) {
          resolve(result);
        })
        .catch(function(err) {
          infoLogs(err);
          resolve([]);
        });
    });
  }
};

module.exports = userCache;
