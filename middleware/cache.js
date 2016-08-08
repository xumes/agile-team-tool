// v2, do not bind req, res and next param to every method
var Promise = require('bluebird');
var _ = require('underscore');
var validate = require('validate.js');
var loggers = require('../middleware/logger');
var teamModel = require('../models/teams');
var util = require('../helpers/util');
var users = require('../models/users');

var infoLogs = function(msg){
  tMsg = typeof msg === 'object' ? JSON.stringify(msg) : msg;
  loggers.get('cache').info(tMsg);
  return;
};

var isValidEmail = function(email){
  var constraints = {
    email: {
      email: true
    }
  };
  return  validate({ email:  email }, constraints);
};

var isModel = function(req){
  return (typeof req === 'string' && !(_.isEmpty(req)) && isValidEmail(req) === null) ? true : false;
}


var returnObject = function(data) {
  // pre process returned rows so we deal directly with the document objects
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
      users.getAdmins()
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

  setSystemInfoCache: function(req, res, next) {
    var userEmail = null;
    var isRoute = true;
    if(isModel(req)){ // explicitly passing an email as req means that we are calling this middleware from models
      userEmail = req;
      isRoute = false;
    }else{ // if req is an object, this is from routes
      userEmail = req.session['email'];
    }
    Promise.all(
      [
        util.getAdmins('ag_ref_access_control'),
        util.getSystemStatus('ag_ref_system_status_control')
      ])
      .then(function(result) {
        var allCache = {
          'systemAdmin' : result[0],
          'systemStatus' : result[1]
        };
        if(isRoute){ // this was accessed via routes middleware, set as session
          _.each(allCache, function(v,i,l){
            var obj = returnObject(v);
            req.session[i] = obj;
          });
          infoLogs('Cache variable for setSystemInfoCache set as session');
          return next();
        }else{ // accessed via models, return as object
          infoLogs('Cache variable for setSystemInfoCache is not set as session');
          resolve(formattedCache);
        }
      })
      .catch(function(err) {
        infoLogs(err);
        return next();
      });
  },

  setHomeCache: function(req, res, next) {
    var userEmail = null;
    var isRoute = true;
    if(isModel(req)){ // explicitly passing an email as req means that we are calling this middleware from models
      userEmail = req;
      isRoute = false;
    }else{ // if req is an object, this is from routes
      userEmail = req.session['email'];
    }
    Promise.all(
      [
        teamModel.getTeam(), 
        teamModel.getTeamByEmail(userEmail),
        util.getAdmins('ag_ref_access_control'),
        util.getSystemStatus('ag_ref_system_status_control')
      ])
      .then(function(result){
        var allCache = {
          'allTeamsLookup' : result[0],
          'allTeams' : result[0],
          'myTeams' : result[1],
          'systemAdmin' : result[2],
          'systemStatus' : result[3]
        };
        if(isRoute){ // this was accessed via routes middleware, set as session
          _.each(allCache, function(v,i,l){
            var obj = {};
            var list = {};
            switch(i){
              case 'allTeamsLookup':
                list = returnObject(v);
                obj = _.indexBy(list, function(team) {return team._id});
                break;
              case 'allTeams':
                list = returnObject(v);
                obj = _.sortBy(list, function(team) {return team.name});
                break;
              case 'myTeams':
              case 'systemAdmin':
              case 'systemStatus':
                obj = returnObject(v);
                break;
            }
            req.session[i] = obj;
          });
          infoLogs('Cache variable for setHomeCache set as session');
          return next();
        }else{ // accessed via models, return as object
          infoLogs('Cache variable for setHomeCache is not set as session');
          resolve(formattedCache);
        }
      })
      .catch(function(err) {
        return next();
      });
  },


  setTeamCache: function(req, res, next) {
    var userEmail = null;
    var isRoute = true;
    if(isModel(req)){ // explicitly passing an email as req means that we are calling this middleware from models
      userEmail = req;
      isRoute = false;
    }else{ // if req is an object, this is from routes
      userEmail = req.session['email'];
    }
    Promise.all(
      [
        teamModel.getTeam(), 
        teamModel.getTeamByEmail(userEmail),
        util.getAdmins('ag_ref_access_control'),
        util.getSystemStatus('ag_ref_system_status_control'),
        teamModel.getRole()
      ])
      .then(function(result){
        var allCache = {
          'allTeamsLookup' : result[0],
          'allTeams' : result[0],
          'myTeams' : result[1],
          'systemAdmin' : result[2],
          'systemStatus' : result[3],
          'memberRoles' : result[4]
        };
        if(isRoute){ // this was accessed via routes middleware, set as session
          _.each(allCache, function(v,i,l){
            var obj = {};
            var list = {};
            switch(i){
              case 'allTeamsLookup':
                list = returnObject(v);
                obj = _.indexBy(list, function(team) {return team._id});
                break;
              case 'allTeams':
                list = returnObject(v);
                obj = _.sortBy(list, function(team) {return team.name});
                break;
              case 'myTeams':
              case 'systemAdmin':
              case 'systemStatus':
              case 'memberRoles':
                obj = returnObject(v);
                break;
            }
            req.session[i] = obj;
          });
          infoLogs('Cache variable for setTeamCache set as session');
          return next();
        }else{ // accessed via models, return as object
          infoLogs('Cache variable for setTeamCache is not set as session');
          resolve(formattedCache);
        }
      })
      .catch(function(err) {
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
      var compactedTeam = userCache.compactTeam(team);
      if (_.isEmpty(allTeamsLookup[team._id]))
        allTeams.push(compactedTeam);
      else
        _.extend(_.findWhere(allTeams, { _id: team._id}), compactedTeam)

      allTeamsLookup[team._id] = compactedTeam;
    }

    var myTeams = req.session['myTeams'];
    var user = req.session['user'];
    if (!_.isEmpty(user) && !_.isEmpty(team.members) && _.isEmpty(_.find(team.members, {id: user.shortEmail}))) {
      var newTeam = new Object;
      newTeam['_id'] = team['_id'];
      newTeam['_rev'] = team['_rev'];
      newTeam['name'] = team['name'];
      newTeam['parent_team_id'] = team['parent_team_id'];
      newTeam['child_team_id'] = team['child_team_id'];
      newTeam['squadteam'] = team['squadteam'];
      myTeams.push(newTeam);
      req.session['myTeams'] = myTeams;
    }

    req.session['allTeamsLookup'] = allTeamsLookup;
    req.session['allTeams'] = _.sortBy(allTeams, function(team) {return team.name});
    infoLogs('Done updating cached team data.');
  }
};

module.exports = userCache;