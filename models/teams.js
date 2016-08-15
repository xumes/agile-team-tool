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
var users = require('./users');

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
  getRootTeams : function(data) {
    return new Promise(function(resolve, reject){
        data.type = 'team';
        common.findBySelector(data)
          .then(function(results){
            resolve(results);
          })
          .catch( /* istanbul ignore next */ function(err){
            reject(err);
          });
      });
  },

  // define team documents default value when creating a new document
  defaultTeamDoc : function(raw, user){
    var newDocu = raw;
    var fullName = user['ldap']['hrFirstName'] + ' ' + user['ldap']['hrLastName'];
    var email = user['shortEmail'];
    var transTime = util.getServerTime();
    var isSquad = _.isUndefined(newDocu['squadTeam']) || newDocu['squadTeam'] == 'Yes' ? true : false;
    var memberInfo = {
      "key": user['ldap']['serialNumber'],
      "id": email,
      "name": fullName,
      "allocation": 0,
      "role": isSquad ? "Iteration Manager" : "Team Lead"
    };
    newDocu['type'] = 'team';
    newDocu['created_user'] = email;
    newDocu['created_dt'] = transTime;
    newDocu['last_updt_dt'] = transTime;
    newDocu['last_updt_user'] = email;
    // default current user as the first member of the team
    if (_.isUndefined(newDocu['members']) || _.size(newDocu['members']) == 0)
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
      teamDoc = util.trimData(teamDoc);
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
              msg = { name : ['This team name already exists. Please enter a different team name'] };
              return reject(formatErrMsg(msg));
            }
          })
        }else
          return reject(formatErrMsg(validateTeam));
    });
  },
  updateOrDeleteTeam : function(updatedTeamDoc, session, action){ // transfer on routes
    var user = session['user'];
    updatedTeamDoc = util.trimData(updatedTeamDoc);
    var teamId = updatedTeamDoc['_id'];
    var checkParent = true;
    return new Promise(function(resolve, reject){
      if(_.isEmpty(teamId)){
        msg = 'Team documents id is required';
        return reject(formatErrMsg(msg));
      }else{
        var updateOrDeleteTeamValidation = [];
        infoLogs('Getting team document latest records');
        updateOrDeleteTeamValidation.push(team.getTeam(teamId));
        infoLogs('Getting iterations associated to ' + teamId);
        updateOrDeleteTeamValidation.push(iterationModels.getByIterInfo(teamId));
        infoLogs('Getting assessments associated to ' + teamId);
        updateOrDeleteTeamValidation.push(assessmentModels.getTeamAssessments(teamId));
        infoLogs('Start validation for team UPDATE or DELETE');
        Promise.all(updateOrDeleteTeamValidation)
        .then(function(res){
          var oldTeamDocu = res[0];
          var adminLists = session['systemAdmin'];
          var teamLists = session['allTeams'];
          var userTeams = session['myTeams'];
          var teamIterations = res[1];
          var teamAssesments = res[2];
          var userEmail = user['shortEmail'];
          if(oldTeamDocu['doc_status'] === 'delete'){
            msg = 'Invalid action';
            return reject(formatErrMsg(msg));
          }
          util.isUserAllowed(userEmail, teamId, true, teamLists, userTeams)
          .then(function(){
            // START team document update
            if(action === 'delete'){
              var bulkDocu = [];
              oldTeamDocu['doc_status'] = 'delete';
              bulkDocu.push(oldTeamDocu);
              bulkDocu.push(teamIterations.rows);
              bulkDocu.push(teamAssesments.rows);
              bulkDocu = _.flatten(bulkDocu);
              // reformat into delete docu
              bulkDocu = util.formatForBulkTransaction(bulkDocu, userEmail, 'delete');

              infoLogs('Start team, assessment and iteration documents bulk delete');
              common.bulkUpdate(bulkDocu)
              .then(function(body){
                loggers.get('models').info('Success: Team, assessment and iteration documents bulk deleted');
                resolve(body);
              })
              .catch( /* istanbul ignore next */ function(err){
                // cannot simulate Cloudant error during testing
                infoLogs('Team, assessment and iteration documents bulk delete FAIL');
                return reject(formatErrMsg(err.error));
              })
            }else{
              var errorLists = [];
              // validating required fields
              var validateTeam = validate(updatedTeamDoc, teamDocRules);
              if(!(_.isEmpty(validateTeam))){
                return reject(formatErrMsg(validateTeam));
              }
              // this is team update, need additional validation
              /*
              name
                can be the same to existing docu but cannot be existing to DB when updated
              */
              infoLogs('Validating name');
              if(_.isEmpty(updatedTeamDoc['name'])){
                return reject(formatErrMsg({ name : ['Team name cannot be blank. Please enter a team name.'] }));
              }else{
                var nameExists = [];
                _.reduce(teamLists, function(memo, item){
                  if(item['name'] === updatedTeamDoc['name'] && item['_id'] != updatedTeamDoc['_id'])
                    nameExists.push(item);
                });

                if(!(_.isEmpty(nameExists))){
                  return reject(formatErrMsg({ name : ['This team name already exists. Please enter a different team name'] }));
                }
              }
              /*
              squadteam
                  from Yes to No = only allowed if no iteration data exist
                  from No to Yes = only allowed if no child teams are associated
              */
              infoLogs('Validating squadteam');
              if(updatedTeamDoc['squadteam'] === 'No' && !(_.isEmpty(teamIterations.rows))){
                return reject(formatErrMsg({ squadteam : ['Cannot change this team into a non squad team. Iteration information has been entered for this team.'] }));
              }else if(updatedTeamDoc['squadteam'] === 'Yes'){
                var newChild = updatedTeamDoc['child_team_id'];
                if(!(_.isEmpty(newChild))){
                  return reject(formatErrMsg({ squadteam : ['Cannot change this team into a squad team. Child team has been entered for this team.'] }));
                }
              }
              /*
              parent_id
                  not allowed to be a parent of self
                  selected parent team should not be a squad team
              */
              infoLogs('Validating parent_id');
              if(!(_.isEmpty(updatedTeamDoc['parent_team_id'])) && updatedTeamDoc['parent_team_id'] === oldTeamDocu['_id']){
                return reject(formatErrMsg({ parent_id : ['Cannot set self as parent']}));
              }

              if(oldTeamDocu['parent_team_id'] != updatedTeamDoc['parent_team_id'] && !(_.isEmpty(updatedTeamDoc['parent_team_id']))){
                var refParent = _.findWhere(teamLists, { '_id' : updatedTeamDoc['parent_team_id'] });
                if(refParent['squadteam'] === 'Yes'){
                  return reject(formatErrMsg({ parent_team_id : ['Parent team id must not be a squad team'] }))
                }
              }
              /*
              child_team_id
                  not allowed to add self as a child
                  squad teams cannot have child teams
                  only allowed to add teams that has no parent
              */
              if( typeof updatedTeamDoc['child_team_id'] != 'undefined' && !(_.isEqual(oldTeamDocu['child_team_id'], updatedTeamDoc['child_team_id']))){
                if(updatedTeamDoc['child_team_id'].indexOf(oldTeamDocu['_id']) > -1)
                  return reject(formatErrMsg({ child_team_id : ['Cannot set self as child']}))
                else{
                  var newChildToBe = _.difference(updatedTeamDoc['child_team_id'], oldTeamDocu['child_team_id']);
                  var isValidChildTeam2 = [];
                  var isValidChildTeamId = _.every(newChildToBe, function(cId){
                    _.reduce(teamLists, function(memo, item){
                      if(item['_id'] === cId && !(_.isEmpty(item['parent_team_id'])) ){
                        isValidChildTeam2.push(item);
                      }
                    });
                    return _.isEmpty(isValidChildTeam2);
                  });
                  if(!isValidChildTeamId){
                    return reject(formatErrMsg({ child_team_id : ['Unable to add selected team as a child. Team may have been updated with another parent.']}))
                  }
                 }
              }

              if(!(_.isEmpty(updatedTeamDoc['child_team_id'])) && (updatedTeamDoc['squadteam'] === 'Yes')){
                return reject(formatErrMsg({ child_team_id : ['Squad team cannot have child']}));
              }

              // validating team members
              if(!_.isEmpty(updatedTeamDoc['members']) && typeof updatedTeamDoc['members'] === 'object'){
                infoLogs('Validation Team members');
                for(var i in updatedTeamDoc['members']) {
                  if (updatedTeamDoc['members'][i].name == '' || updatedTeamDoc['members'][i].id == '' || updatedTeamDoc['members'][i].key == '') { 
                    reject(formatErrMsg({'member.name': ['Member details are required.']}));
                  }
                  if (updatedTeamDoc['members'][i].role == '') {
                    reject(formatErrMsg({'member.role': ['Please select a valid role.  If "Other" was selected, indicate the role description.']})); 
                  }
                }
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
                    return reject(formatErrMsg(err.error));
                  });
              }else{
                infoLogs('Error updating ' + oldTeamDocu['_id']);
                return reject(formatErrMsg(errorLists));
              }
            }
          })
          .catch(function(err){
            msg = 'User not authorized to do action';
            return reject(formatErrMsg(msg));
          })
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
          resolve(body.rows);
        })
        .catch( /* istanbul ignore next */ function(err){
          // cannot simulate Cloudant error during testing
          msg = err.error;
          return reject(formatErrMsg(msg));
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
          return reject(formatErrMsg(msg));
        });
    }
    });
  },
  getRole : function(){
    infoLogs('Getting all team role records from Cloudant');
    return new Promise(function(resolve, reject) {
      common.getByView('utility', 'teamMemberRoles')
        .then(function(body){
          loggers.get('models').info('Success: Team roles obtained');
          resolve(body);
        })
        .catch( /* istanbul ignore next */ function(err){
          // cannot simulate Cloudant error during testing
          msg = err.error;
          return reject(formatErrMsg(msg));
        })
    });
  },
  getName : function(teamName){
    if(_.isEmpty(teamName)){
      infoLogs('Getting all team name records from Cloudant');
      return new Promise(function(resolve, reject) {
        common.getByView('teams', 'teamNames')
          .then(function(body){
            loggers.get('models').info('Success: Team names obtained');
            resolve(body);
          })
          .catch( /* istanbul ignore next */ function(err){
            // cannot simulate Cloudant error during testing
            msg = err.error;
            return reject(formatErrMsg(msg));
          })
      });
    }else{
      infoLogs('Getting team document with name: ' + teamName);
      return new Promise(function(resolve, reject) {
        common.getByViewKey('teams', 'teamNames', teamName)
          .then(function(body){
            if(_.isEmpty(body.rows))
              loggers.get('models').info('Success: No team document with name ' + teamName);
            else
              loggers.get('models').info('Success: Team with name ' + teamName + ' obtained');
            resolve(body.rows);
          })
          .catch( /* istanbul ignore next */ function(err){
            // cannot simulate Cloudant error during testing
            return reject(formatErrMsg(err));
          })
      });
    }
  },
  getTeamByEmail : function(email){
    return new Promise(function(resolve, reject){
      var err = validate({ email: email}, { email : { email : true }});
      if(err){
        return reject(formatErrMsg(err));
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
            return reject(formatErrMsg(err));
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
  associateTeams: function(teamObj, action, session){
    var userEmail = session['user']['shortEmail'];
    var errorLists = {};
    errorLists['error'] = {};
    return new Promise(function(resolve, reject){
      if(!(team.associateActions(action))){
        errorLists['error']['action'] = 'Invalid action';
        infoLogs(errorLists);
        reject(errorLists);
      }else if(_.isEmpty(teamObj['teamId'])){
        errorLists['error']['teamId'] = 'Invalid team document ID';
        infoLogs(errorLists);
        reject(errorLists);
      }else{
        // check if user is authorized to do action
        var teamLists = session['allTeams'];
        var userTeams = session['myTeams'];
        util.isUserAllowed(userEmail, teamObj['teamId'], true, teamLists, userTeams)
        .then(function(body){
          infoLogs('Validating for ' + action );
          switch(action){
            case 'associateParent':
               // parent_id
              if(_.isEmpty(teamObj['targetParent'])){
                errorLists['error']['targetParent'] = 'Unable to associate selected team as a parent. Parent team may have been updated as a descendant of this team.';
                infoLogs(errorLists);
                reject(errorLists);
              }
              if(teamObj['teamId'] === teamObj['targetParent']){
                // not allowed to be a parent of self
                errorLists['error']['targetParent'] = 'Unable to associate selected team as a parent. Parent team may have been updated as a descendant of this team.';
                infoLogs(errorLists);
                reject(errorLists);
              }else{
                team.getTeam(teamObj['targetParent'])
                .then(function(body){
                  if(body['squadteam'] === 'Yes'){
                    // selected parent team should not be a squad team
                    errorLists['error']['targetParent'] = 'Unable to associate selected team as a parent. Parent team may have been updated as a descendant of this team.';
                    infoLogs(errorLists);
                    reject(errorLists);
                  }else{
                    // ** selected parent team should not be from a team under  it
                    team.getTeam(null)
                    .then(function(body){
                      var teamChildren = getChildrenOfParent(teamObj['teamId'], body);
                      if(teamChildren.indexOf(teamObj['targetParent']) > -1){
                        errorLists['error']['targetParent'] = 'Unable to associate selected team as a parent. Parent team may have been updated as a descendant of this team.';
                        infoLogs(errorLists);
                        reject(errorLists);
                      }else{
                        infoLogs('Data valid for savings in ' + action);
                        // merge documents for update
                        var associateParent = [];
                        associateParent.push(team.getTeam(teamObj['teamId']));
                        associateParent.push(team.getTeam(teamObj['targetParent']));
                        Promise.all(associateParent)
                        .then(function(result){
                          formattedDocuments(result, action)
                          .then(function(res){
                            var bulkDocu = util.formatForBulkTransaction(res, userEmail, 'update');
                            common.bulkUpdate(bulkDocu)
                            .then(function(body){
                              loggers.get('models').info('Success: Team ' + teamObj['teamId'] + ' successfully associated to parent ' + teamObj['targetParent']);
                              // return updated documents
                              resolve(bulkDocu['docs']);
                            })
                            .catch( /* istanbul ignore next */ function(err){
                              // cannot simulate Cloudant error during testing
                              loggers.get('models').error('Unable to associate selected team as a parent. Parent team may have been updated as a descendant of this team.');
                              return reject(formatErrMsg(err.error));
                            })
                          })
                          .catch(/* istanbul ignore next */function(err){
                            // cannot simulate Cloudant error during testing
                            reject(err);
                          })
                        })
                      }
                    })
                  }
                })
                .catch(/* istanbul ignore next */function(err){
                  // cannot simulate Cloudant error during testing
                  errorLists['error']['targetParent'] = 'Unable to associate selected team as a parent. Parent team may have been updated as a descendant of this team.';
                  infoLogs(errorLists);
                  reject(errorLists);
                })
              }
              break;
            case 'associateChild':
              if(_.isEmpty(teamObj['targetChild'])){
                errorLists['error']['targetChild'] = 'No team selected to associate as a Child team.';
                infoLogs(errorLists);
                reject(errorLists);
              }
              if(typeof teamObj['targetChild'] != 'object'){
                // target child must be array of team id
                errorLists['error']['targetChild'] = 'Unable to add selected team as a child. Team may have been updated with another parent.';
                infoLogs(errorLists);
                reject(errorLists);
              }else if(teamObj['targetChild'].indexOf(teamObj['teamId']) > -1){
                // not allowed to add self as a child
                errorLists['error']['targetChild'] = 'Unable to add selected team as a child. Team may have been updated with another parent.';
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
                      errorLists['error']['targetChild'] = 'Unable to add selected team as a child. Team may have been updated with another parent.';
                      infoLogs(errorLists);
                      reject(errorLists);
                    }
                  })
                  var associateChild = [];
                  associateChild.push(team.getTeam(teamObj['teamId']));
                  _.each(teamObj['targetChild'], function(v,i,l){
                    associateChild.push(team.getTeam(v));
                  });
                  Promise.all(associateChild)
                  .then(function(result){
                    formattedDocuments(result, action)
                    .then(function(res){
                      var bulkDocu = util.formatForBulkTransaction(res, userEmail, 'update');
                      common.bulkUpdate(bulkDocu)
                      .then(function(body){
                        loggers.get('models').info('Success: Team ' + teamObj['teamId'] + ' successfully associated to child ' + JSON.stringify(teamObj['targetChild']));
                        //resolve(body);
                        // return updated documents
                        resolve(bulkDocu['docs']);
                      })
                    })
                  })
                  .catch( /* istanbul ignore next */ function(err){
                    // cannot simulate Cloudant error during testing
                    loggers.get('models').error('Unable to add selected team as a child. Team may have been updated with another parent.');
                    reject(err);
                  })
                })
                .catch(/* istanbul ignore next */function(err){
                  // cannot simulate Cloudant error during testing
                  loggers.get('models').error('Unable to add selected team as a child. Team may have been updated with another parent.');
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
                var removeParent = [];
                removeParent.push(team.getTeam(teamObj['teamId']));
                removeParent.push(team.getTeam(teamObj['targetParent']));
                Promise.all(removeParent)
                .then(function(result){
                  // target parent must be equal to current team parent team id
                  if(result[0]['parent_team_id'] != result[1]['_id']){
                    errorLists['error']['targetParent'] = 'Target parent is not parent of current team';
                    infoLogs(errorLists);
                    reject(errorLists);
                  }else{
                    formattedDocuments(result, action)
                    .then(function(res){
                      var bulkDocu = util.formatForBulkTransaction(res, userEmail, 'update');
                      common.bulkUpdate(bulkDocu)
                      .then(function(body){
                        loggers.get('models').info('Success: Team ' + teamObj['teamId'] + ' successfully removed parent team' + teamObj['targetParent']);
                        //resolve(body);
                        // return updated documents
                        resolve(bulkDocu['docs']);
                      })
                      .catch( /* istanbul ignore next */ function(err){
                        // cannot simulate Cloudant error during testing
                        loggers.get('models').error('Error removing team parent');
                        reject(err);
                      })
                    })
                    .catch( /* istanbul ignore next */ function(err){
                  // cannot simulate Cloudant error during testing
                  loggers.get('models').error('Error removing team parent');
                  reject(err);
                })
                  }
                })
                .catch( /* istanbul ignore next */ function(err){
                  // cannot simulate Cloudant error during testing
                  loggers.get('models').error('Error removing team parent');
                  reject(err);
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
                var removeChild = [];
                removeChild.push(team.getTeam(teamObj['teamId']));
                _.each(teamObj['targetChild'], function(v,i,l){
                  removeChild.push(team.getTeam(v))
                })
                Promise.all(removeChild)
                .then(function(result){
                  formattedDocuments(result, action)
                  .then(function(res){
                    var bulkDocu = util.formatForBulkTransaction(res, userEmail, 'update');
                    common.bulkUpdate(bulkDocu)
                    .then(function(body){
                      loggers.get('models').info('Success: Team ' + teamObj['teamId'] + ' successfully removed child team' + JSON.stringify(teamObj['targetChild']));
                      //resolve(body);
                      // return updated documents
                      resolve(bulkDocu['docs']);
                    })
                  })
                })
                .catch(/* istanbul ignore next */function(err){
                  // cannot simulate Cloudant error during testing
                  reject(err);
                })
              }
              break;
          }
        })
        .catch(/* istanbul ignore next */ function(err){
          // cannot simulate Cloudant error during testing
          errorLists['error']['user'] = 'User not authorized to do action';
          infoLogs(errorLists);
          reject(errorLists);
        });
      }
    });
  }
};

var formattedDocuments = function(doc, action){
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
          resolve(tempDocHolder);
        }
        /*
        tempDocHolder[0] : currentTeam
        tempDocHolder[1] : teamToBeParent
        tempDocHolder[2] : previousParent
        */
        break;
      case 'associateChild':
        var childToBe = [];
        _.each(doc, function(v,i,l){
          if(i > 0)
            childToBe.push(v['_id']);
        });
        tempDocHolder[0] = doc[0];
        if(_.isEmpty(tempDocHolder[0]['child_team_id']))
          tempDocHolder[0]['child_team_id'] = childToBe;
        else{
          var newChildArr =  tempDocHolder[0]['child_team_id'].concat(childToBe);
          tempDocHolder[0]['child_team_id'] = newChildArr;
        }
        var currentTeamId = tempDocHolder[0]['_id'];
       _.each(doc, function(v,i,l){
          if(i > 0){
            tempDocHolder[i] = v;
            tempDocHolder[i]['parent_team_id'] = currentTeamId;
          }
        });
        resolve(tempDocHolder);
        /*
        tempDocHolder[0] : currentTeam
        tempDocHolder[n > 0] : new child
        */
        break;
      case 'removeParent':
        // get current team
        tempDocHolder[0] = doc[0];
        // remove parent_team_id === ''
        tempDocHolder[0]['parent_team_id'] = '';
        // get targetParent
        tempDocHolder[1] = doc[1];
        // remove current team id to target parent child_team_id
        var newChild = _.without(tempDocHolder[1]['child_team_id'], tempDocHolder[0]['_id']);
        tempDocHolder[1]['child_team_id'] = newChild;
        resolve(tempDocHolder);
        /*
        tempDocHolder[0] : currentTeam
        tempDocHolder[1] : parent to be removed
        */
        break;
      case 'removeChild':
        var currentChild = doc[0]['child_team_id'];
        var childToRemove = [];
        _.each(doc, function(v,i,l){
          if(i > 0){
            childToRemove.push(v['_id'])
          }
        });
        // remove child
        _.each(childToRemove, function(v,i,l){
          currentChild = _.without(currentChild, v);
        });
        doc[0]['child_team_id'] = currentChild;
        tempDocHolder[0] = doc[0];
        _.each(doc, function(v,i,l){
          if(i > 0){
            tempDocHolder[i] = v;
            tempDocHolder[i]['parent_team_id'] = '';
          }
        });
        resolve(tempDocHolder);
         /*
        tempDocHolder[0] : currentTeam
        tempDocHolder[n > 0] : child to be removed
        */
        break;
    }
  });
}

module.exports = team;

/**
 * Get children of team in flatten structure
 *
 * @param parentId - team document id to get children to
 * @param allTeams - array of all team document
 * @returns {array}
 */
var getChildrenOfParent = function(parentId, allTeams){
var children = _.isEmpty(children) ? [] : children;
 var currentTeam = _.isEmpty(allTeams[parentId]) ? allTeams[parentId] : null;
  if (currentTeam != null) {
    if (currentTeam.child_team_id != undefined) {
      for (var j = 0; j < currentTeam.child_team_id.length; j++) {
        if (children.indexOf(currentTeam.child_team_id[j]) == -1) {
          children.push(currentTeam.child_team_id[j]);
          module.exports.getChildrenOfParent(currentTeam.child_team_id[j], allTeams);
        }
      }
    }
  }
  return children;
}