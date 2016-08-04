var Promise = require('bluebird');
var common = require('./cloudant-driver');
var _ = require('underscore');
var loggers = require('../middleware/logger');
var validate = require('validate.js');
var settings = require('../settings');
var util = require('../helpers/util');
var iterationModels = require('./iteration');
var assessmentModels = require('./assessment');
var rules = require("./validate_rules/teams");

var teamDocRules = rules.teamDocRules;
var isAllowedUser = false;
var msg;

var formatErrMsg = function(msg){
  tMsg = typeof msg === 'object' ? JSON.stringify(msg) : msg;
  loggers.get('models').error(tMsg);
  return { error : msg };
};

var infoLogs = function(msg){
  tMsg = typeof msg === 'object' ? JSON.stringify(msg) : msg;
  loggers.get('models').info(tMsg);
  return;
};

var team = {
  // define team documents default value when creating a new document
  defaultTeamDoc : function(raw, user){
    var newDocu = raw;
    var fullName = user['ldap']['hrFirstName'] + ' ' + user['ldap']['hrLastName'];
    var email = user['shortEmail'];
    var transTime = util.getServerTime();
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
                  loggers.get('models').info('Success: New team record created');
                  resolve(teamDoc);
                })
                .catch( /* istanbul ignore next */ function(err){
                  // cannot simulate Cloudant error during testing
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
        var updateOrDeleteTeamValidation = [];
        infoLogs('Getting team document latest records');
        updateOrDeleteTeamValidation.push(team.getTeam(teamId));
        infoLogs('Getting tool admins');
        updateOrDeleteTeamValidation.push(util.getAdmins('ag_ref_access_control'));
        infoLogs('Getting all team document');
        updateOrDeleteTeamValidation.push(team.getTeam(null)); // teamLists
        infoLogs('Getting all team document associated to user ' + user['shortEmail']);
        updateOrDeleteTeamValidation.push(team.getTeamByEmail(user['shortEmail'])); // userTeams
        infoLogs('Getting iterations associated to ' + teamId);
        updateOrDeleteTeamValidation.push(iterationModels.getByIterInfo(teamId));
        infoLogs('Getting assessments associated to ' + teamId);
        updateOrDeleteTeamValidation.push(assessmentModels.getTeamAssessments(teamId));
        infoLogs('Start validation for team UPDATE or DELETE');
        Promise.all(updateOrDeleteTeamValidation)
        .then(function(res){
          // res[0] team details
          // res[1] admin lists
          // res[2] teamLists
          // res[3] team by email
          // res[4] team iterations
          // res[5] team assessments
          var oldTeamDocu = res[0];
          var adminLists = res[1];
          var teamLists = res[2]['rows'];
          var userTeams = res[3];
          var teamIterations = res[4];
          var teamAssesments = res[5];
          var userEmail = user['shortEmail'];
          if(oldTeamDocu['doc_status'] === 'delete'){
            msg = 'Invalid action';
            reject(formatErrMsg(msg));
          }

          isAllowedUser = util.isUserMemberOfTeam(teamId, checkParent, teamLists, userTeams);
          
          if((isAllowedUser === false) && (adminLists['ACL_Full_Admin'].indexOf(userEmail) === -1)){
              msg = 'User not authorized to do action';
              reject(formatErrMsg(msg));
          }

          // START team document update
          if(action === 'delete'){
            var bulkDocu = [];
            oldTeamDocu['doc_status'] = 'delete';
            bulkDocu.push(oldTeamDocu);
            bulkDocu.push(teamIterations.rows);
            bulkDocu.push(teamAssesments.rows);
            bulkDocu = _.flatten(bulkDocu);
            // reformat into delete docu
            bulkDocu = util.formatForBulkDelete(bulkDocu, userEmail);

            infoLogs('Start team, assessment and iteration documents bulk delete');
            common.bulkUpdate(bulkDocu)
            .then(function(body){
              loggers.get('models').info('Success: Team, assessment and iteration documents bulk deleted');
              resolve(body);
            })
            .catch( /* istanbul ignore next */ function(err){
              // cannot simulate Cloudant error during testing
              infoLogs('Team, assessment and iteration documents bulk delete FAIL');
              reject(formatErrMsg(err.error));
            })
          }else{
            var errorLists = [];
            // this is team update, need additional validation
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
            if(updatedTeamDoc['squadteam'] === 'No' && !(_.isEmpty(teamIterations.rows))){
              errorLists.push( { squadteam : ['Cannot changed squadteam status to NO if iteration data exists'] });              
            }else if(updatedTeamDoc['squadteam'] === 'Yes'){
              var newChild = updatedTeamDoc['child_team_id'];
              if(!(_.isEmpty(newChild))){
                errorLists.push( { squadteam : ['Cannot changed squadteam status to YES if child teams are not empty'] });              
              }
            }

            /*
            parent_id 
                not allowed to be a parent of self
                selected parent team should not be a squad team
                query team details
            */
            infoLogs('Validating parent_id');
            if(!(_.isEmpty(updatedTeamDoc['parent_team_id'])) && updatedTeamDoc['parent_team_id'] === oldTeamDocu['_id'])
              errorLists.push({ parent_id : ['Cannot set self as parent']});                              

            if(!(_.isEmpty(updatedTeamDoc['parent_team_id']))){
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
              if(updatedTeamDoc['child_team_id'].indexOf(oldTeamDocu['_id']) > -1)
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

            if(!(_.isEmpty(updatedTeamDoc['child_team_id'])) && (updatedTeamDoc['squadteam'] === 'Yes')){
              errorLists.push({ child_team_id : ['Squad team cannot have child']});
            }

            // start saving
            if(_.isEmpty(errorLists)){
              infoLogs('Updated document valid, begin save');
              updatedTeamDoc['last_updt_user'] = user['shortEmail'];
              updatedTeamDoc['last_updt_dt'] = util.getServerTime();
              updatedTeamDoc['_rev'] = oldTeamDocu['_rev'];
                var finalTeamDoc = {};
                _.each(oldTeamDocu,function(v,i,l){
                  if(_.isUndefined(updatedTeamDoc[i]))
                    finalTeamDoc[i] = oldTeamDocu[i];
                  else
                    finalTeamDoc[i] = updatedTeamDoc[i];
                });
                common.updateRecord(finalTeamDoc)
                .then(function(body){
                  loggers.get('models').info('Success: Team document ' + finalTeamDoc['_id'] + ' successfully updated');
                  resolve(finalTeamDoc);
                })
                .catch( /* istanbul ignore next */ function(err){
                  // cannot simulate Cloudant error during testing
                  reject(formatErrMsg(err.error));
                });
            }else{
              infoLogs('Error updating ' + oldTeamDocu['_id']);
              reject(formatErrMsg(errorLists));
            }
          }
        })
        .catch(function(err){
          reject(err);
        });
      }
    });
  },
  getTeam : function(teamId){
    return new Promise(function(resolve, reject){
      if(_.isEmpty(teamId)){
      infoLogs('Getting all team records from Cloudant');
      common.getByView('teams', 'teams')
        .then(function(body){
          loggers.get('models').info('Success: Team records obtained');
          resolve(body);
        })
        .catch( /* istanbul ignore next */ function(err){
          // cannot simulate Cloudant error during testing
          msg = err.error;
          reject(formatErrMsg(msg));
        });
    }else{
      infoLogs('Getting team records for ' + teamId + ' from Cloudant');
      common.getRecord(teamId)
        .then(function(body){
          loggers.get('models').info('Success: Team records obtained');
          resolve(body);
        })
        .catch( /* istanbul ignore next */ function(err){
          // cannot simulate Cloudant error during testing
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
          loggers.get('models').info('Success: Team roles obtained');
          resolve(body);
        })
        .catch( /* istanbul ignore next */ function(err){
          // cannot simulate Cloudant error during testing
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
            loggers.get('models').info('Success: Team names obtained');
            resolve(body);
          })
          .catch( /* istanbul ignore next */ function(err){
            // cannot simulate Cloudant error during testing
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
              loggers.get('models').info('Success: No team document with name ' + teamName);
            else
              loggers.get('models').info('Success: Team with name ' + teamName + ' obtained');
            resolve(body.rows);
          })
          .catch( /* istanbul ignore next */ function(err){
            // cannot simulate Cloudant error during testing
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
              loggers.get('models').info('No team for email ' + email);
            else
              loggers.get('models').info('Team lists for email ' + email + ' obtained');
            resolve(body.rows);
          })
          .catch( /* istanbul ignore next */ function(err){
            // cannot simulate Cloudant error during testing
            reject(formatErrMsg(err));
          })
        }
    });
  },
  associateActions: function(action){
    var validActions = ['associateParent', 'associateChild', 'removeParent', 'removeChild'];
    if(_.isEmpty(action))
      return validActions;
    else{
      if(validActions.indexOf(action) > -1){
        return true;
      }else{
        return false;
      }
    }
  },
  associateTeams: function(teamObj, action, userEmail){
    var errorLists = {};
    errorLists['error'] = {};
    return new Promise(function(resolve, reject){
      if(!(team.associateActions(action))){
        errorLists['error']['action'] = 'Invalid action';
        infoLogs(errorLists);
        reject(errorLists);
      }else if(_.isEmpty(teamObj['teamId'])){
        errorLists['error']['teamId'] = 'Invalid teamd document ID';
        infoLogs(errorLists);
        reject(errorLists);
      }else{
        // check if user is authorized to do action
        util.isValidUser(userEmail, teamObj['teamId'], true)
        .then(function(body){
          infoLogs('Validating for ' + action );
          /*
          sa child team update
          - 2 team docs kung mag add kag new child (current team and child team)
          - pag multiple child selected for delete, sample 3 child teams to delete, total of 4 docs ang iupdate (3 child team to remove the current team as parent, ug ang current team to remove the child teams)


          */
          /*
          FOR TEAM DELETE
          kung naay parent tong team, iremove sya as child sa parent team..
          kung naay children ang team, iremove sya sa parent sa child teams...
          */
          /*
          for bulk updates
          by the way, kato gani nay mga related na bulk operation na multiple team documents ang ginaupdate.... 
          pwede nimo ireturn as array of team docs tong mga doc?
          */
          switch(action){
            case 'associateParent':
               // parent_id 
              if(teamObj['teamId'] === teamObj['targetParent']){
                // not allowed to be a parent of self
                errorLists['error']['targetParent'] = 'Invalid target parent';
                infoLogs(errorLists);
                reject(errorLists);
              }else{
                team.getTeam(teamObj['targetParent'])
                .then(function(body){
                  if(body['squadteam'] === 'Yes'){
                    // selected parent team should not be a squad team
                    errorLists['error']['targetParent'] = 'Invalid target parent';
                    infoLogs(errorLists);
                    reject(errorLists);
                  }else{
                    // ** selected parent team should not be from a team under  it
                    team.getTeam(null)
                    .then(function(body){
                      var teamChildren = util.getChildrenOfParent(teamObj['teamId'], body['rows']);
                      if(teamChildren.indexOf(teamObj['targetParent']) > -1){
                        errorLists['error']['targetParent'] = 'Selected parent team should not be under your current team';
                        infoLogs(errorLists);
                        reject(errorLists);
                      }else{
                        infoLogs('Data valid for savings in ' + action);
                        // do saving
                        var associateParent = [];
                        associateParent.push(team.getTeam(teamObj['teamId']));
                        associateParent.push(team.getTeam(teamObj['targetParent']));
                        Promise.all(associateParent)
                        .then(function(result){
                          formattedDocuments(result, action, team)
                          .then(function(res){
                            var bulkDocu = util.formatForBulkUpdate(res, userEmail);
                            common.bulkUpdate(bulkDocu)
                            .then(function(body){
                              loggers.get('models').info('Success: Team successfully associated to parent');
                              resolve(body);
                            })
                            .catch( /* istanbul ignore next */ function(err){
                              // cannot simulate Cloudant error during testing
                              loggers.get('models').error('Error associating team to a parent');
                              reject(formatErrMsg(err.error));
                            })
                          })
                          .catch(function(err){
                            reject(err);
                          })
                        })
                      }
                    })
                  }
                })
                .catch(function(err){
                  errorLists['error']['targetParent'] = 'Invalid target parent';
                  infoLogs(errorLists);
                  reject(errorLists);
                })
              }
              break;
            case 'associateChild':
              if(typeof teamObj['targetChild'] != 'object'){
                // target child must be array of team id
                errorLists['error']['targetChild'] = 'Invalid target child';
                infoLogs(errorLists);
                reject(errorLists);
              }else if(teamObj['targetChild'].indexOf(teamObj['teamId']) > -1){
                // not allowed to add self as a child
                errorLists['error']['targetChild'] = 'Cannot add self as target child';
                infoLogs(errorLists);
                reject(errorLists);
              }else{
                var childLists = [];
                _.each(teamObj['targetChild'], function(v,i,l){
                  childLists.push(team.getTeam(v))
                })
                Promise.all(childLists)
                .then(function(result){
                  //squad teams cannot have child teams
                  //only allowed to add teams that has no parent
                  _.each(result, function(v,i,l){
                    if(!(_.isEmpty(v['child_team_id'])) || !(_.isEmpty(v['parent_team_id']))){
                      errorLists['error']['targetChild'] = 'Child team cannot have child or parent';
                      infoLogs(errorLists);
                      reject(errorLists);
                    }
                  })
                  // do saving
                  infoLogs('do the saving: ', teamObj);
                  resolve(true);
                })
                .catch(function(err){
                  reject(err);
                })
              }
              break;
            case 'removeParent':
              if(_.isEmpty(teamObj['targetParent'])){
                // not allowed to be a parent of self
                errorLists['error']['targetParent'] = 'Target parent cannot be blank';
                infoLogs(errorLists);
                reject(errorLists);
              }else if(teamObj['teamId'] === teamObj['targetParent']){
                // not allowed to be a parent of self
                errorLists['error']['targetParent'] = 'Target parent cannot be equal to self';
                infoLogs(errorLists);
                reject(errorLists);
              }else{
                team.getTeam(teamObj['targetParent'])
                .then(function(result){
                  // do the saving
                  //kung naay parent tong team, iremove sya as child sa parent team..
                  //kung naay children ang team, iremove sya sa parent sa child teams...
                  // do saving
                  infoLogs('do the saving: ', teamObj);
                  resolve(true);
                })
                .catch(function(err){
                  // not allowed to be a parent of self
                  errorLists['error']['targetParent'] = 'Invalid target parent';
                  infoLogs(errorLists);
                  reject(errorLists);
                })
              }
              break;
            case 'removeChild':
              if(typeof teamObj['targetChild'] != 'object'){
                // target child must be array of team id
                errorLists['error']['targetChild'] = 'Invalid target child';
                infoLogs(errorLists);
                reject(errorLists);
              }else if(teamObj['targetChild'].indexOf(teamObj['teamId']) > -1){
                // not allowed to add self as a child
                errorLists['error']['targetChild'] = 'Invalid target child';
                infoLogs(errorLists);
                reject(errorLists);
              }else{
                var childLists = [];
                _.each(teamObj['targetChild'], function(v,i,l){
                  childLists.push(team.getTeam(v))
                })
                Promise.all(childLists)
                .then(function(result){
                  // do saving
                  // kung naay parent tong team, iremove sya as child sa parent team..
                  // kung naay children ang team, iremove sya sa parent sa child teams...
                  infoLogs('do the saving: ', teamObj);
                  resolve(true);
                })
                .catch(function(err){
                  reject(err);
                })
              }
              break;
          }
        })
        .catch(function(err){
          errorLists['error']['user'] = 'User not authorized to do action';
          infoLogs(errorLists);
          reject(errorLists);
        });
      }
    });
  }
};

var formattedDocuments = function(doc, action, team){
  return new Promise(function(resolve, reject){
    var tempDocHolder = [];
    switch(action){
      case 'associateParent':
        var currentTeam = doc[0];
        var teamToBeParent = doc[1];
        tempDocHolder[0] = currentTeam;
        tempDocHolder[1] = teamToBeParent;
        tempDocHolder[1]['child_team_id'].push(currentTeam['_id']);
        if(!(_.isEmpty(currentTeam['parent_team_id']))){
          infoLogs('Current team has existing parent, clear the parent child association');
          //- 3 team docs kung naa syay parent lain, unya giilisan nimo (so old parent, current parent, ug current team)..
          team.getTeam(currentTeam['parent_team_id'])
          .then(function(body){
            tempDocHolder[2] = body;
            var newChildTeamId = _.without(tempDocHolder[2]['child_team_id'], currentTeam['_id']);
            tempDocHolder[0]['parent_team_id'] = teamToBeParent['_id'];
            tempDocHolder[2]['child_team_id'] = newChildTeamId;
            resolve(tempDocHolder);
          })
        }else{
          infoLogs('Current team has no parent, reformat document and do save');
          tempDocHolder[0]['parent_team_id'] = teamToBeParent['_id'];
          //- 2 team docs kung walay parent daan si current team, or kung gi remove lang nimo iyang association sa parent..
          resolve(tempDocHolder);
        }
        /*
        tempDocHolder[0]  : currentTeam
        tempDocHolder[1]  : teamToBeParent
        tempDocHolder[2]  : previousParent
        */
        break;  
    }
  });
}

module.exports = team;