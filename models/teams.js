// team modules
var Promise = require('bluebird');
var common = require('./common-cloudant');
var _ = require('underscore');
var loggers = require('../middleware/logger');
var validate = require('validate.js');
var settings = require('../settings');
var globalUtil = require('./others');
var msg;

var formatErrMsg = function(msg){
  tMsg = typeof msg === 'object' ? JSON.stringify(msg) : msg;
  loggers.get('models').error('Error: ' + tMsg);
  return { error : msg };
};

var successLogs = function(msg){
  tMsg = typeof msg === 'object' ? JSON.stringify(msg) : msg;
  loggers.get('models').info('Success: ' + tMsg);
  return;
};

var infoLogs = function(msg){
  tMsg = typeof msg === 'object' ? JSON.stringify(msg) : msg;
  loggers.get('models').info(tMsg);
  return;
};

var teamDocRules = {
  name : {
    presence : true
  },
  desc : {
    presence : true,
    length : {
      maximum : 200
    }
  },
  squadteam : {
    presence : true ,
    inclusion : [ 'Yes', 'No']
  },
  created_user : {
    presence : true,
    email : true
  },
  doc_status : {
    inclusion : ['delete', '']
  }};

isUserMemberOfTeam = function(teamId, checkParent, teamLists, userTeams) {
  var userExist = false;
  if (teamLists == null)
    return userExist;

  if (userTeams != null) {
    for (var i in userTeams) {
      if (userTeams[i]._id == teamId) {         
        userExist = true;
        break;
      }
    }
  } 

  if (!userExist && checkParent) {
    for ( var i = 0; i < teamLists.length; i++) {
      if (teamLists[i]._id == teamId && teamLists[i].parent_team_id != "") 
        return isUserMemberOfTeam(teamLists[i].parent_team_id, checkParent, teamLists, userTeams);
    }
  }

  return userExist;
}


var team = {
  // define team documents default value when creating a new document
  defaultTeamDoc : function(raw, user){
    var newDocu = raw;
    var fullName = user['ldap']['hrFirstName'] + ' ' + user['ldap']['hrLastName'];
    var email = user['shortEmail'];
    var transTime = globalUtil.getServerTime();
    var memberInfo = {
      "key": user['ldap']['serialNumber'],
      "id": email,
      "name": fullName,
      "allocation": 0,
      "role": " Team Lead"
    };
    newDocu['type'] = 'team';
    newDocu['created_user'] = email;
    newDocu['created_dt'] = transTime;
    newDocu['last_updt_dt'] = transTime;
    newDocu['last_updt_user'] = email;
    newDocu['members'] = [ memberInfo ];
    newDocu['child_team_id'] = [];
    newDocu['doc_status'] = '';
    var newTeamId = settings.prefixes.team + raw['name'] + "_" + new Date().getTime(); // define predefine document id
    newTeamId = newTeamId.replace(/^[^a-z]+|[^\w:.-]+/gi, "");
    newDocu['_id'] = newTeamId;
    return newDocu;
  },
  createTeam : function(teamDoc, user){
    infoLogs('Creating new team records to Cloudant');
    return new Promise(function(resolve, reject){
      teamDoc = team.defaultTeamDoc(teamDoc, user);
      var validateTeam = validate(teamDoc, teamDocRules);
      if(_.isEmpty(validateTeam)){
        team.getName(teamDoc['name'])
          .then(function(body){
            if(_.isEmpty(body) && _.isEmpty(validateTeam)){
              common.addRecord(teamDoc)
                .then(function(body){
                  successLogs('New team record created');
                  resolve(teamDoc);
                })
                .catch(function(err){
                  reject(err);
                })
            }else{
              msg = { name : ['Team documents with name ' + teamDoc['name'] + ' is already existing'] };
              reject(formatErrMsg(msg));  
            }
          })
        }else
          reject(formatErrMsg(validateTeam));  
    });
  },
  updateOrDeleteTeam : function(updatedTeamDoc, user, action){ // transfer on routes
    var teamId = updatedTeamDoc['_id'];
    var checkParent = true;
    return new Promise(function(resolve, reject){
      if(_.isEmpty(teamId)){
        msg = 'Team documents id is required';
        reject(formatErrMsg(msg));
      }else{
        team.getTeam(teamId)
          .then(function(body){
            var oldTeamDocu = body;
            if(oldTeamDocu['doc_status'] === 'delete'){
              msg = 'Cannot update deleted document';
              reject(formatErrMsg(msg));
            }
            team.getTeamByEmail(user['shortEmail'])
              .then(function(body){
                if(_.isEmpty(body)){
                  msg = 'User not allowed to edit team document';
                  reject(formatErrMsg(msg));
                }else{
                  var userTeams = body;
                  team.getTeam(null)
                    .then(function(body){
                      var teamLists = body.rows;

                      /* TODO: create view with compacted results */
                      var remappedTeamLists = [];
                      _.reduce(teamLists, function(memo, item){ 
                        remappedTeamLists.push(item['value']); 
                      });
                      teamLists = remappedTeamLists;
                      
                      /* TODO: create view with compacted results */
                      var remappedUserTeams = [];
                      _.reduce(userTeams, function(memo, item){ 
                        remappedUserTeams.push(item['value']); 
                      });
                      userTeams = remappedUserTeams;

                      var isAllowedUser = isUserMemberOfTeam(teamId, checkParent, teamLists, userTeams);
                      if(!isAllowedUser){
                        msg = 'User not allowed to edit team document';
                        reject(formatErrMsg(msg));
                      }else{
                        if(action === 'delete'){
                          infoLogs('Do delete team document: ' + oldTeamDocu['_id']);
                          oldTeamDocu['doc_status'] = 'delete';
                          oldTeamDocu['last_updt_user'] = user['shortEmail'];
                          oldTeamDocu['last_updt_dt'] = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
                          common.updateRecord(oldTeamDocu)
                            .then(function(body){
                              //-> cascade "delete" on iteration and assessment related data
                              //resolve(body);
                              resolve(oldTeamDocu);
                            })
                            .catch(function(err){
                              msg = 'Internal error';
                              reject(formatErrMsg(msg));
                            })
                        }else{
                          if(!(_.isEmpty(updatedTeamDoc['doc_status']))){
                            msg = 'Cannot perform action';
                            reject(formatErrMsg(msg));
                          }else{
                            infoLogs('Do update team document: ' + oldTeamDocu['_id']);
                            var errorLists = [];
                            /*
                            name 
                              can be the same to existing docu but cannot be existing to DB when updated
                              TODO: create view "where name === new name and _id != _id" if not empty, update not allowed
                            */
                            infoLogs('Validating name');
                            var nameExists = [];
                            _.reduce(teamLists, function(memo, item){
                              if(item['name'] === updatedTeamDoc['name'] && item['_id'] != updatedTeamDoc['_id'])
                                nameExists.push(item);
                            });
                            
                            if(!(_.isEmpty(nameExists)))
                              errorLists.push( { name : ['Team document name is already existing'] });

                            /*
                            squadteam
                                from Yes to No = only allowed if no iteration data exist
                                from No to Yes = only allowed if no child teams are associated
                            
                            */
                            infoLogs('Validating squadteam');
                            if(updatedTeamDoc['squadteam'] === 'No'){
                              // get iteration data
                            }

                            if(oldTeamDocu['squadteam'] ==='No' && updatedTeamDoc['squadteam'] === 'Yes' && !(_.isEmpty(oldTeamDocu['child_team_id'])))
                              errorLists.push({ squadteam : ['Squad team type cannot be changed to Yes']});

                            /*
                            parent_id 
                                not allowed to be a parent of self
                                selected parent team should not be a squad team
                                query team details
                            */
                            infoLogs('Validating parent_id');
                            if(!(_.isEmpty(updatedTeamDoc['parent_team_id'])) && updatedTeamDoc['parent_team_id'] === oldTeamDocu['_id'])
                              errorLists.push({ parent_id : ['Cannot set self as parent']});                              

                            if( _.isEmpty(oldTeamDocu['parent_team_id']) && !(_.isEmpty(updatedTeamDoc['parent_team_id']))){
                              var isSquadTeam = [];
                              _.reduce(teamLists, function(memo, item){
                                if(item['parent_team_id'] === updatedTeamDoc['parent_team_id'] && item['squadteam'] === 'Yes')
                                  isSquadTeam.push(item);
                              });
                              
                              if(!(_.isEmpty(isSquadTeam)))
                                isSquadTeam.push( { parent_team_id : ['Parent team id must not be a squad team'] });
                            }

                            /*
                            child_team_id
                                not allowed to add self as a child
                                squad teams cannot have child teams
                                only allowed to add teams that has no parent
                            */
                            if(!(_.isEmpty(updatedTeamDoc['child_team_id']))){
                              if((oldTeamDocu['child_team_id'].indexOf(updatedTeamDoc['_id']) > -1) || (updatedTeamDoc['child_team_id'].indexOf(updatedTeamDoc['_id']) > -1))
                                errorLists.push({ child_team_id : ['Cannot set self as child']});
                              else{
                                var isValidChildTeam2 = [];
                                var isValidChildTeamId = _.every(updatedTeamDoc['child_team_id'], function(cId){
                                  _.reduce(teamLists, function(memo, item){
                                    if(item['_id'] === cId && !(_.isEmpty(item['parent_team_id'])) )
                                      isValidChildTeam2.push(item);
                                  });
                                  return _.isEmpty(isValidChildTeam2);
                                });

                                if(!isValidChildTeamId){
                                  errorLists.push({ child_team_id : ['Child team cannot have parent']});
                                }
                               }
                            }

                            if(!(_.isEmpty(updatedTeamDoc['child_team_id'])) && (updatedTeamDoc['squadteam'] === 'Yes' || oldTeamDocu['squadteam'] === 'Yes')){
                              errorLists.push({ child_team_id : ['Squad team cannot cannot have child']});
                            }

                            updatedTeamDoc['last_updt_user'] = user['shortEmail'];
                            updatedTeamDoc['last_updt_dt'] = globalUtil.getServerTime();

                            if(_.isEmpty(errorLists)){
                              infoLogs('Updated document valid, begin save');
                              updatedTeamDoc['_rev'] = oldTeamDocu['_rev'];
                              var finalTeamDoc = {};
                              _.each(oldTeamDocu,function(v,i,l){
                                if(_.isEmpty(updatedTeamDoc[i]))
                                  finalTeamDoc[i] = oldTeamDocu[i];
                                else
                                  finalTeamDoc[i] = updatedTeamDoc[i];
                              });
                              common.updateRecord(finalTeamDoc)
                                .then(function(body){
                                  //resolve(body);
                                  resolve(finalTeamDoc);
                                })
                                .catch(function(err){
                                  msg = 'Internal error';
                                  reject(formatErrMsg(msg));
                                });
                            }else
                              reject(formatErrMsg(errorLists));
                          }
                        }
                      }
                    })
                    .catch(function(err){
                      msg = 'Internal error';
                      reject(formatErrMsg(msg));
                    })
                }
              })
              .catch(function(err){
                msg = 'Internal error';
                reject(formatErrMsg(msg));     
              });
          })
          .catch(function(err){
            msg = 'Invalid team document id';
            reject(formatErrMsg(msg));
          })
      }
    });
  },
  getTeam : function(teamId){
    return new Promise(function(resolve, reject){
      if(_.isEmpty(teamId)){
      infoLogs('Getting all team records from Cloudant');
      common.getByView('teams', 'teams')
        .then(function(body){
          successLogs('Team records obtained');
          resolve(body);
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
  getName : function(teamName){
    if(_.isEmpty(teamName)){
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
    }else{
      infoLogs('Getting team document with name: ' + teamName);
      return new Promise(function(resolve, reject) {
        common.getByViewKey('teams', 'getTeamNames', teamName)
          .then(function(body){
            if(_.isEmpty(body.rows))
              successLogs('No team document with name ' + teamName);
            else
              successLogs('Team with name ' + teamName + ' obtained');
            resolve(body.rows);
          })
          .catch(function(err){
            reject(formatErrMsg(err));
          })
      });  
    }
  },
  getTeamByEmail : function(email){
    return new Promise(function(resolve, reject){
      var err = validate({ email: email}, { email : { email : true }});
      if(err){
        reject(formatErrMsg(err));
      }else{
        common.getByViewKey('teams', 'teamsWithMember', email)
          .then(function(body){
            if(_.isEmpty(body.rows))
              successLogs('No team for email ' + email);
            else
              successLogs('Team lists for email ' + email + ' obtained');
            resolve(body.rows);
          })
          .catch(function(err){
            reject(formatErrMsg(err));
          })
        }
    });
  }
};

module.exports = team;