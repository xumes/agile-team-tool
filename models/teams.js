// team modules
var Promise = require('bluebird');
var common = require('./common-cloudant');
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
  getTeam : function(teamId){
    return new Promise(function(resolve, reject){
      if(_.isEmpty(teamId)){
      infoLogs('Getting all team records from Cloudant');
      common.getByView('teams', 'teams')
        .then(function(body){
          successLogs('Team records obtained');
          resolve(body)
        })
        .catch(function(err){
          msg = err.error;
          reject(formatErrMsg(msg));
        });
    }else{
      infoLogs('Getting team records for ' + teamId + ' from Cloudant');
      common.getRecord(teamId)
        .then(function(body){
          successLogs('Team records obtained');
          resolve(body);
        })
        .catch(function(err){
          msg = err.error;
          reject(formatErrMsg(msg));
        });
    }
    });
  },
  getRole : function(){
    infoLogs('Getting all team role records from Cloudant');
    return new Promise(function(resolve, reject) {
      common.getByView('agile', 'roles')
        .then(function(body){
          successLogs('Team roles obtained');
          resolve(body);
        })
        .catch(function(err){
          msg = err.error;
          reject(formatErrMsg(msg));
        })
    });
  },
  getName : function(){
    infoLogs('Getting all team name records from Cloudant');
    return new Promise(function(resolve, reject) {
      common.getByView('teams', 'getTeamNames')
        .then(function(body){
          successLogs('Team names obtained');
          resolve(body);
        })
        .catch(function(err){
          msg = err.error;
          reject(formatErrMsg(msg));
        })
    });
  }
};

module.exports = team;