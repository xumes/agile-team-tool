// team modules
var Promise = require('bluebird');
var common = Promise.promisifyAll(require('./common-cloudant'));
var _ = require('underscore');
var loggers = require('../middleware/logger');
var msg;

var formatErrMsg = function(msg){
  loggers.get('models').info('Error: ' + msg);
  return { error : msg };
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
  getTeam : function(teamId, done){
    if(_.isEmpty(teamId)){
      infoLogs('Getting all team records from Cloudant');
      common.getByViewAsync('teams', 'teams')
        .then(function(body){
          successLogs('Team records obtained');
          return done(null, body);
        })
        .catch(function(err){
          msg = err.error;
          return done(formatErrMsg(msg), null);
        });
    }else{
      infoLogs('Getting team records for ' + teamId + ' from Cloudant');
      common.getRecordAsync(teamId)
        .then(function(body){
          successLogs('Team records obtained');
          return done(null, body);
        })
        .catch(function(err){
          msg = err.error;
          return done(formatErrMsg(msg), null);
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