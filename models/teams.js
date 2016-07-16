// team modules
var common = require('./common-cloudant');
var _ = require('underscore');
var loggers = require('../middleware/logger');
var msg;

var formatErrMsg = function(msg){
  loggers.get('models').info('Error: ' + msg);
  return { msg : msg };
};

var successLogs = function(msg){
  loggers.get('models').info('Success: ' + msg);
  return;
};

var infoLogs = function(msg){
  loggers.get('models').info(msg);
  return;
};

var team = {
  getTeam : function(teamId, callback){
    if(_.isEmpty(teamId)){
      infoLogs('Getting all team records from Cloudant');
      common.getByView('teams', 'teams', function(err, body){
        if(err){
          msg = err.error;
          callback(formatErrMsg(msg), null);
        }else{
          successLogs('Team records obtained');
          callback(null, body);
        }
      });
    }else{
      infoLogs('Getting team records for ' + teamId + ' from Cloudant');
      common.getRecord(teamId, function(err, body){
        if(err){
          msg = teamId + ' ' + err.error;
          callback(formatErrMsg(msg), null);
        }else{
          successLogs('Team record for ' + teamId + ' obtained');
          callback(null, body);
        }
      });
    }
  },
  getRole : function(callback){
    infoLogs('Getting all team role records from Cloudant');
    common.getByView('agile', 'roles', function(err, body){
      if(err){
          msg = err.error;
          callback(formatErrMsg(msg), null);
        }else{
          successLogs('Team roles obtained');
          callback(null, body);
        }
    });
  },
  getName : function(callback){
    infoLogs('Getting all team name records from Cloudant');
    common.getByView('teams', 'getTeamNames', function(err, body){
      if(err){
          msg = err.error;
          callback(formatErrMsg(msg), null);
        }else{
          successLogs('Team names obtained');
          callback(null, body);
        }
    });
  }
};

module.exports = team;