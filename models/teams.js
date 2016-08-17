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
// var Queue = require('bee-queue');
// var lookupQueue = new Queue('lookup', {removeOnSuccess: true});

var teamDocRules = rules.teamDocRules;
var isAllowedUser = false;
var msg;

// lookupQueue.on('ready', function () {
//   lookupQueue.process(function (job, done) {
//     console.log('processing job ' + job.id);
//     done();
//   });

//   console.log('processing jobs...');
// });


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
  // getSelectableParents: function(teamId) {
  //   return new Promise(function(resolve, reject) {
  //     if (_.isEmpty(teamId))
  //       resolve([]);
  //     else {
  //       Promise.join(team.getLookupIndex(teamId), team.getLookupTeamType(null, false), function(currentTeam, nonSquadTeams) {
  //         if (!_.isEmpty(currentTeam)) {
  //           var invalidTeams = currentTeam.children;
  //           invalidTeams.push(teamId);
  //           var parentList = _.reject(nonSquadTeams, function(team) {
  //             return (invalidTeams.indexOf(team._id) > -1)
  //           });
  //           infoLogs("Selectable parent teams for " + currentTeam.name + ": " + parentList.length);
  //           resolve(parentList);
  //         } else
  //           infoLogs("No selectable parent teams found for " + currentTeam.name);
  //           resolve([]);
  //       });
  //     }
  //   });
  // },

  // getSelectableChildren: function(teamId) {
  //   return new Promise(function(resolve, reject) {
  //     if (_.isEmpty(teamId))
  //       resolve([]);
  //     else {
  //       Promise.join(team.getLookupIndex(teamId), team.getLookupIndex(), function(currentTeam, stanadAloneTeams) {
  //         var childrenList = _.reject(stanadAloneTeams, function(team) {
  //           return (!_.isEmpty(team.parents) || _.isEqual(team._id, teamId))
  //         });
  //         infoLogs("Selectable child teams for " + currentTeam.name + ": " + childrenList.length);
  //         resolve(childrenList);
  //       });
  //     }
  //   });
  // },

  // getSquadsOfParent: function(teamId) {
  //   return new Promise(function(resolve, reject) {
  //     if (_.isEmpty(teamId)) {
  //       resolve([]);
  //     } else {
  //       common.getByViewKey('teams', 'lookupTeamsWithSquad', teamId)
  //       .then(function(result) {
  //         infoLogs("All squad teams lookup loaded for " + teamId);
  //         resolve(util.returnObject(result));
  //       })
  //       .catch( /* istanbul ignore next */ function(err) {
  //         reject(err);
  //       });
  //     }
  //   });
  // },

  // getLookupIndex: function(teamId) {
  //   return new Promise(function(resolve, reject) {
  //     if (_.isEmpty(teamId)) {
  //       common.getByView('teams', 'lookup')
  //       .then(function(result) {
  //         infoLogs("All teams lookup loaded.");
  //         resolve(util.returnObject(result));
  //       })
  //       .catch( /* istanbul ignore next */ function(err) {
  //         reject(err);
  //       });
  //     } else {
  //       common.getByViewKey('teams', 'lookup', teamId)
  //       .then(function(result) {
  //         result = util.returnObject(result);
  //         resolve(result[0]);
  //       })
  //       .catch( /* istanbul ignore next */ function(err) {
  //         reject(err);
  //       });
  //     }
  //   });
  // },

  // getLookupTeamType: function(teamId, squadType) {
  //   return new Promise(function(resolve, reject) {
  //     if (_.isEmpty(teamId)) {
  //       if (_.isEmpty(squadType) || !squadType) {
  //         common.getByView('teams', 'lookupNonSquad')
  //         .then(function(result) {
  //           infoLogs("All nonsquad teams lookup loaded.");
  //           resolve(util.returnObject(result));
  //         })
  //         .catch( /* istanbul ignore next */ function(err) {
  //           reject(err);
  //         });
  //       } else {
  //         common.getByView('teams', 'lookupSquad')
  //         .then(function(result) {
  //           infoLogs("All squad teams lookup loaded.");
  //           resolve(util.returnObject(result));
  //         })
  //         .catch( /* istanbul ignore next */ function(err) {
  //           reject(err);
  //         });
  //       }
  //     } else {
  //       if (_.isEmpty(squadType) || !squadType) {
  //         common.getByViewKey('teams', 'lookupNonSquad', teamId)
  //         .then(function(result) {
  //           result = util.returnObject(result);
  //           resolve(result[0]);
  //         })
  //         .catch( /* istanbul ignore next */ function(err) {
  //           reject(err);
  //         });
  //       } else {
  //         common.getByViewKey('teams', 'lookupSquad', teamId)
  //         .then(function(result) {
  //           result = util.returnObject(result);
  //           resolve(result[0]);
  //         })
  //         .catch( /* istanbul ignore next */ function(err) {
  //           reject(err);
  //         });
  //       }
  //     }
  //   });
  // },

  // /**
  //   accept
  //   {
  //     _id: current team ID,
  //     name: current team name
  //     squadteam: Yes | No
  //     oldParentId: oldParent ID,
  //     newParentId: newParent ID
  //   }
  // */
  // updateLookupIndex: function(teamAssociation) {
  //   return new Promise(function(resolve, reject) {
  //     common.getRecord("ag_ref_team_index")
  //     .then(function(indexDocument) {
  //       var allTeams = indexDocument.lookup;
  //       loggers.get('models').info('Success: All teams lookup document count: ' + _.size(allTeams));
  //       if (!_.isEmpty(allTeams)) {
  //         var currentTeam = _.findWhere(allTeams, {_id: teamAssociation._id});
  //         var updateRequired = false;
  //         if (!_.isEmpty(currentTeam)) {
  //           loggers.get('models').info('Success: current team found.');
  //           if (!_.isEqual(currentTeam.name, teamAssociation.name) || !_.isEqual(currentTeam.squadteam, teamAssociation.squadteam))
  //             updateRequired = true;

  //           currentTeam.name = teamAssociation.name;
  //           currentTeam.squadteam = teamAssociation.squadteam;            
  //           /* 
  //             there is an existing team lookup data, and association needs to be updated
  //             to remove old parent association 
  //               get current team parents as P
  //               get current team children as C
  //               iterate P teams and remove C + current team id ids in P.children
  //               iterate C teams and remove P + current team id ids in C.parents
  //           */
  //           if (!_.isEmpty(teamAssociation.oldParentId) && currentTeam.parents.indexOf(teamAssociation.oldParentId) > -1) {
  //             loggers.get('models').info('Removing old lookup data for ' + currentTeam.name);
  //             updateRequired = true;
  //             var parents = currentTeam.parents;
  //             var children = currentTeam.children;
  //             var childrenList = _.union([currentTeam._id], currentTeam.children);
  //             // for all parents of the current team, remove current team and children 
  //             var pCount = 0;
  //             _.each(parents, function(parentId) {
  //               var parentTeam = _.findWhere(allTeams, {_id: parentId});
  //               if (!_.isEmpty(parentTeam)) {
  //                 parentTeam.children = _.difference(parentTeam.children, childrenList);
  //                 pCount += 1; 
  //               }
  //             });

  //             var parentList = _.union(currentTeam.parents, [currentTeam._id]);
  //             // for all children of the current team, remove current team and parents
  //             var cCount = 0;
  //             _.each(children, function(childId) {
  //               var childTeam = _.findWhere(allTeams, {_id: childId});
  //               if (!_.isEmpty(childTeam)) {
  //                 childTeam.parents = _.difference(childTeam.parents, currentTeam.parentList);
  //                 cCount += 1; 
  //               }
  //             });
  //             loggers.get('models').info('Done removing old lookup data for ' + currentTeam.name + 
  //               ".  Removed " + pCount + " relationship(s) from parent record(s).  Removed " + cCount + " relationship(s) from child record(s).");
              
  //           }
  //         }
  //         if (!_.isEmpty(currentTeam) && !_.isEmpty(teamAssociation.newParentId)) {
  //           /*
  //             to add parent association
  //               get current team children as currentTeam
  //               get new parent team parents as NP
  //               get new parent team children as NC
  //               set new parent team id and NP as parents for currentTeam
  //               set new parent team NC to include currentTeam._id and currentTeam.children
  //               iterate NP teams to include currentTeam._id and currentTeam.children as new children
  //               iterate currentTeam.children to include NP as parents 
  //           */
  //           var newParentTeam = _.findWhere(allTeams, {_id: teamAssociation.newParentId});
  //           if (!_.isEmpty(newParentTeam)) {
  //             updateRequired = true;
  //             loggers.get('models').info('Updating new lookup data for ' + currentTeam.name);
  //             var parents = newParentTeam.parents;
  //             var children = newParentTeam.children;
  //             // add new parent team as a parent of the current team
  //             var parentList = _.union(newParentTeam.parents, [newParentTeam._id], currentTeam.parents);
  //             currentTeam.parents = parentList;
  //             // add current team as child of the parent team
  //             var childrenList = _.union(newParentTeam.children, [currentTeam._id], currentTeam.children);
  //             newParentTeam.children = childrenList;
              
  //             // for all children of the current team, add new parent list as parents
  //             var pCount = 0;
  //             _.each(currentTeam.children, function(childId) {
  //               var childTeam = _.findWhere(allTeams, {_id: childId});
  //               if (!_.isEmpty(childTeam)) {
  //                 childTeam.parents = _.union(childTeam.parents, parentList);
  //                 pCount += 1;
  //               }
  //             });
  //             // for all parents of the parent team, add current team children as new children.
  //             var cCount = 0;
  //             _.each(newParentTeam.parents, function(parentId) {
  //               var parentTeam = _.findWhere(allTeams, {_id: parentId});
  //               if (!_.isEmpty(parentTeam)) {
  //                 parentTeam.children = _.union(parentTeam.children, childrenList);
  //                 cCount += 1;
  //               }
  //             });
  //             loggers.get('models').info('Done updating new lookup data for ' + currentTeam.name + 
  //               ".  Updated " + pCount + " relationship(s) from parent record(s).  Updated " + cCount + " relationship(s) from child record(s).");
              
  //           } 
  //         }

  //         if (_.isEmpty(currentTeam) && _.isEmpty(teamAssociation.newParentId) && _.isEmpty(teamAssociation.oldParentId)) {
  //           // this is a new team 
  //           loggers.get('models').info('Creating new lookup object for ' + teamAssociation.name);
  //           updateRequired = true;
  //           var lookupObj = new Object();
  //           lookupObj._id = teamAssociation._id;
  //           lookupObj.name = teamAssociation.name;
  //           lookupObj.squadteam = teamAssociation.squadteam;
  //           lookupObj.parents = [];
  //           lookupObj.children = [];

  //           allTeams.push(lookupObj);
  //         }
  //         if (updateRequired) {
  //           loggers.get('models').info('Done getting lookup documnent ' + indexDocument._rev);
  //           indexDocument.lookup = allTeams;
  //           common.updateRecord(indexDocument)
  //           .then(function(result) {
  //             loggers.get('models').info('Done updating lookup document');
  //             resolve(result);
  //           })
  //           .catch( /* istanbul ignore next */ function(err) {
  //             loggers.get('models').error('Error updating lookup document ' + err);
  //             reject(err);
  //           });
  //         } else {
  //           loggers.get('models').info('No update required on lookup document');                
  //           resolve(allTeams);
  //         }
  //       } // if (!_.isEmpty(allTeams)
  //     })
  //     .catch( /* istanbul ignore next */ function(err) {
  //       loggers.get('models').error('Error retrieving lookup document ' + err);
  //       reject(err);
  //     });
  //   });
  // },
  
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

              var lookupObj = new Object();
              lookupObj._id = teamDoc._id;
              lookupObj.name = teamDoc.name;
              lookupObj.squadteam = teamDoc.squadteam;
              lookupObj.oldParentId = "";
              lookupObj.newParentId = "";

              // Promise.all([common.addRecord(teamDoc), team.updateLookupIndex(lookupObj)])
              // .then(function(result) {
              //   loggers.get('models').info('Success: New team record created');
              //   resolve(teamDoc);
              // });
              
              common.addRecord(teamDoc)
                .then(function(body){
                  loggers.get('models').info('Success: New team record created');

              //   lookupQueue.createJob().save(function() {
              //     console.log("Creating job queue for lookup update");
              //     team.updateLookupIndex(lookupObj); 
              //   });

              //   lookupQueue.process(function (job, done) {
              //     console.log('Processing job ' + job.id);
              //     done();
              //   });

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

                  var lookupObj = new Object();
                  lookupObj._id = finalTeamDoc._id;
                  lookupObj.name = finalTeamDoc.name;
                  lookupObj.squadteam = finalTeamDoc.squadteam;
                  lookupObj.oldParentId = oldTeamDocu.parent_team_id;
                  lookupObj.newParentId = finalTeamDoc.parent_team_id;

                  // Promise.all([common.updateRecord(finalTeamDoc), team.updateLookupIndex(lookupObj)])
                  //   .then(function(results) {
                  //     loggers.get('models').info('Success: Team document ' + finalTeamDoc['_id'] + ' successfully updated');
                  //     resolve(finalTeamDoc);
                  //   });


                  common.updateRecord(finalTeamDoc)
                  .then(function(body){
                    loggers.get('models').info('Success: Team document ' + finalTeamDoc['_id'] + ' successfully updated');

                  //   lookupQueue.createJob().save(function() {
                  //     console.log("Creating job queue for lookup update");
                  //     team.updateLookupIndex(lookupObj); 
                  //   });

                  //   lookupQueue.process(function (job, done) {
                  //     console.log('Processing job ' + job.id);
                  //     done();
                  //   });


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
          team.getTeam(teamObj['teamId'])
          .then(function(oldRec){
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
                      if(oldRec['child_team_id'].indexOf(v['_id']) === -1){
                        if(!(_.isEmpty(v['child_team_id'])) || !(_.isEmpty(v['parent_team_id']))){
                          errorLists['error']['targetChild'] = 'Unable to add selected team as a child. Team may have been updated with another parent.';
                          infoLogs(errorLists);
                          reject(errorLists);
                        }
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
            _.each(tempDocHolder, function(v,i,l){
              tempDocHolder[i]['child_team_id'] = _.uniq(tempDocHolder[i]['child_team_id']);  
            
            })
            resolve(tempDocHolder);
          })
        }else{
          infoLogs('Current team has no parent, reformat document and do save');
          _.each(tempDocHolder, function(v,i,l){
            tempDocHolder[i]['child_team_id'] = _.uniq(tempDocHolder[i]['child_team_id']);  
          
          })
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
       _.each(tempDocHolder, function(v,i,l){
          tempDocHolder[i]['child_team_id'] = _.uniq(tempDocHolder[i]['child_team_id']);  
        
        })
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