var Promise = require('bluebird');
var common = require('./cloudant-driver');
var _ = require('underscore');
var crypto = require('crypto');
var loggers = require('../middleware/logger');
var validate = require('validate.js');
var settings = require('../settings');
var util = require('../helpers/util');
var iterationModels = require('./iteration');
var assessmentModels = require('./assessment');
var rules = require('./validate_rules/teams');
var memberRules = require('./validate_rules/teamMembers');
var linkRules = require('./validate_rules/teamLinks');
var teamLinkRules = linkRules.teamlinkRules;
var users = require('./users');
var teamIndex = require('./index/teamIndex');
var teamDocRules = rules.teamDocRules;
var teamMemberRules = rules.teamMemberRules;
var isAllowedUser = false;
var msg;

var specialCharsHandler = function(id) {
  return id.replace( /(\.|\[|\]|,|\/|\-|\"|\')/g, '\\$1' );
};

var formatErrMsg = function(msg) {
  tMsg = typeof msg === 'object' ? JSON.stringify(msg) : msg;
  loggers.get('models').error(tMsg);
  return {
    error: msg
  };
};

var infoLogs = function(msg) {
  tMsg = typeof msg === 'object' ? JSON.stringify(msg) : msg;
  loggers.get('models').verbose(tMsg);
  return;
};

var team = {
  // searchTeamWithName: function(name) {
  //   return new Promise(function(resolve, reject){
  //     var query = {};
  //     rename = name.replace(/\"|\'/g,'');
  //     names = rename.split('\ ');
  //     query['q'] = {};
  //     var s = '';
  //     _.each(names, function(queryname){
  //       if (queryname != '' && queryname != ' ') {
  //         s = s + 'name:' + queryname + ' AND ';
  //       }
  //     });
  //     if (s.substring(s.length - 4, s.length) == 'AND ') {
  //       s = s.substring(0, s.length - 5);
  //     }
  //     query['q'] = specialCharsHandler(s + '\*');
  //     common.Search('search', 'nameSearch', query)
  //       .then(function(result){
  //         resolve(result);
  //       })
  //       .catch(function(err){
  //         reject(err);
  //       });
  //   });
  // },
  searchTeamWithName: function(name) {
    return new Promise(function(resolve, reject){
      rename = name.replace(/\"|\'/g,'');
      if (rename=='') {
        resolve({'docs':[]});
      }
      names = rename.split('\ ');
      common.searchBySelector(names)
        .then(function(result) {
          resolve(result);
        })
        .catch( /* istanbul ignore next */ function(err) {
          reject(err);
        });
    });
  },

  getNonSquadTeams: function() {
    return new Promise(function(resolve, reject) {
      common.getByView('teams', 'lookupNonSquad')
        .then(function(result) {
          resolve(result);
        })
        .catch( /* istanbul ignore next */ function(err) {
          reject(err);
        });
    });
  },

  getSquadTeams: function() {
    return new Promise(function(resolve, reject) {
      common.getByView('teams', 'lookup')
        .then(function(result) {
          resolve(result);
        })
        .catch( /* istanbul ignore next */ function(err) {
          reject(err);
        });
    });
  },

  getRootTeams: function(data) {
    return new Promise(function(resolve, reject) {
      //data.type = 'team';
      common.findBySelector(data)
        .then(function(results) {
          resolve(results);
        })
        .catch( /* istanbul ignore next */ function(err) {
          reject(err);
        });
    });
  },

  getSelectableParents: function(teamId) {
    return new Promise(function(resolve, reject) {
      if (_.isEmpty(teamId))
        resolve([]);
      else {
        Promise.join(team.getLookupIndex(teamId), team.getLookupTeamByType(null, false), function(currentTeam, nonSquadTeams) {
          if (!_.isEmpty(currentTeam)) {
            var invalidTeams = currentTeam.children;
            invalidTeams.push(teamId);
            var parentList = _.reject(nonSquadTeams, function(team) {
              return (invalidTeams.indexOf(team._id) > -1);
            });
            infoLogs('Selectable parent teams for ' + currentTeam.name + ': ' + parentList.length);
            resolve(parentList);
          } else {
            infoLogs('No selectable parent teams found for ' + teamId);
            resolve([]);
          }
        });
      }
    });
  },

  getSelectableChildren: function(teamId) {
    return new Promise(function(resolve, reject) {
      if (_.isEmpty(teamId))
        resolve([]);
      else {
        Promise.join(team.getLookupIndex(teamId), team.getLookupIndex(), function(currentTeam, stanadAloneTeams) {
          if (!_.isEmpty(currentTeam)) {
            var childrenList = _.reject(stanadAloneTeams, function(team) {
              return (!_.isEmpty(team.parents) || _.isEqual(team._id, teamId));
            });
            infoLogs('Selectable child teams for ' + currentTeam.name + ': ' + childrenList.length);
            resolve(childrenList);
          } else {
            infoLogs('No selectable parent teams found for ' + teamId);
            resolve([]);
          }
        });
      }
    });
  },

  getSquadsOfParent: function(teamId) {
    return new Promise(function(resolve, reject) {
      if (_.isEmpty(teamId)) {
        resolve([]);
      } else {
        common.getByViewKey('teams', 'lookupTeamsWithSquad', teamId)
          .then(function(result) {
            infoLogs('All squad teams lookup loaded for ' + teamId);
            result = util.returnObject(result);
            result = !_.isEmpty(result) ? result : [];
            resolve(result);
          })
          .catch( /* istanbul ignore next */ function(err) {
            reject(err);
          });
      }
    });
  },

  getLookupIndex: function(teamId) {
    return new Promise(function(resolve, reject) {
      if (_.isEmpty(teamId)) {
        common.getByView('teams', 'lookup')
          .then(function(result) {
            infoLogs('All teams lookup loaded.');
            result = util.returnObject(result);
            result = !_.isEmpty(result) ? result : [];
            resolve(result);
          })
          .catch( /* istanbul ignore next */ function(err) {
            reject(err);
          });
      } else {
        common.getByViewKey('teams', 'lookup', teamId)
          .then(function(result) {
            result = util.returnObject(result);
            result = !_.isEmpty(result) ? result[0] : new Object();
            resolve(result);
          })
          .catch( /* istanbul ignore next */ function(err) {
            reject(err);
          });
      }
    });
  },

  getLookupTeamByType: function(teamId, squadType) {
    teamId = teamId || '';
    squadType = squadType || false;
    return new Promise(function(resolve, reject) {
      if (_.isEmpty(teamId)) {
        if (!squadType) {
          common.getByView('teams', 'lookupNonSquad')
            .then(function(result) {
              infoLogs('All nonsquad teams lookup loaded.');
              result = util.returnObject(result);
              result = !_.isEmpty(result) ? result : [];
              resolve(result);
            })
            .catch( /* istanbul ignore next */ function(err) {
              reject(err);
            });
        } else {
          common.getByView('teams', 'lookupSquad')
            .then(function(result) {
              infoLogs('All squad teams lookup loaded.');
              result = util.returnObject(result);
              result = !_.isEmpty(result) ? result : [];
              resolve(result);
            })
            .catch( /* istanbul ignore next */ function(err) {
              reject(err);
            });
        }
      } else {
        if (!squadType) {
          common.getByViewKey('teams', 'lookupNonSquad', teamId)
            .then(function(result) {
              result = util.returnObject(result);
              result = !_.isEmpty(result) ? result[0] : new Object();
              resolve(result);
            })
            .catch( /* istanbul ignore next */ function(err) {
              reject(err);
            });
        } else {
          common.getByViewKey('teams', 'lookupSquad', teamId)
            .then(function(result) {
              result = util.returnObject(result);
              result = !_.isEmpty(result) ? result[0] : new Object();
              resolve(result);
            })
            .catch( /* istanbul ignore next */ function(err) {
              reject(err);
            });
        }
      }
    });
  },

  // define team documents default value when creating a new document
  defaultTeamDoc: function(raw, user) {
    var newDocu = raw;
    var fullName = user['ldap']['hrFirstName'] + ' ' + user['ldap']['hrLastName'];
    var email = user['shortEmail'];
    var transTime = util.getServerTime();
    newDocu['type'] = 'team';
    newDocu['created_user'] = email;
    newDocu['created_dt'] = transTime;
    newDocu['last_updt_dt'] = transTime;
    newDocu['last_updt_user'] = email;
    // default current user as the first member of the team
    if (_.isUndefined(newDocu['members']) || _.size(newDocu['members']) == 0) {
      var isSquad = _.isUndefined(newDocu['squadTeam']) || newDocu['squadTeam'] == 'Yes' ? true : false;
      var memberInfo = {
        'key': user['ldap']['serialNumber'],
        'id': email,
        'name': fullName,
        'allocation': 0,
        'role': isSquad ? 'Iteration Manager' : 'Team Lead'
      };

      newDocu['members'] = [memberInfo];
    }
    newDocu['child_team_id'] = [];
    newDocu['doc_status'] = '';
    var newTeamId = settings.prefixes.team + raw['name'] + '_' + new Date().getTime(); // define predefine document id
    newTeamId = newTeamId.replace(/^[^a-z]+|[^\w:.-]+/gi, '');
    newDocu['_id'] = newTeamId;
    return newDocu;
  },

  createTeam: function(teamDoc, user) {
    infoLogs('Creating new team record.');
    return new Promise(function(resolve, reject) {
      teamDoc = team.defaultTeamDoc(teamDoc, user);
      teamDoc = util.trimData(teamDoc);
      var validateTeam = validate(teamDoc, teamDocRules);
      if (_.isEmpty(validateTeam)) {
        team.getName(teamDoc['name'])
          .then(function(body) {
            if (_.isEmpty(body) && _.isEmpty(validateTeam)) {
              common.addRecord(teamDoc)
              .then(function(body) {
                return teamIndex.getIndexDocument();
              })
              .then(function(indexDocument) {
                var lookupObj = teamIndex.createLookupObj(teamDoc._id, teamDoc.name, teamDoc.squadteam, '', '', '');
                return teamIndex.updateLookup(indexDocument, [lookupObj]);
              })
              .then(function(lookupIndex) {
                teamIndex.updateIndexDocument(lookupIndex);
              })
              .then(function(result) {
                loggers.get('models').verbose('Success: New team record created');
                return resolve(teamDoc);
              })
              .catch( /* istanbul ignore next */  function(err) {
                // cannot simulate Cloudant error during testing
                reject(err);
              });
            } else {
              msg = {
                name: ['This team name already exists. Please enter a different team name']
              };
              return reject(formatErrMsg(msg));
            }
          });
      } else
        return reject(formatErrMsg(validateTeam));
    });
  },
  updateOrDeleteTeam: function(updatedTeamDoc, user, action) { // transfer on routes
    updatedTeamDoc = util.trimData(updatedTeamDoc);
    var teamId = updatedTeamDoc['_id'];
    var checkParent = true;
    return new Promise(function(resolve, reject) {
      if (_.isEmpty(teamId)) {
        msg = 'Team documents id is required';
        return reject(formatErrMsg(msg));
      } else {
        var updateOrDeleteTeamValidation = [];
        infoLogs('Getting team document latest records');
        updateOrDeleteTeamValidation.push(team.getTeam(teamId)); //res[0]
        infoLogs('Getting iterations associated to ' + teamId);
        updateOrDeleteTeamValidation.push(iterationModels.getByIterInfo(teamId)); //res[1]
        infoLogs('Getting assessments associated to ' + teamId);
        updateOrDeleteTeamValidation.push(assessmentModels.getTeamAssessments(teamId)); //res[2]
        infoLogs('Getting existing team names that might match ' + updatedTeamDoc['name']);
        updateOrDeleteTeamValidation.push(team.getName(updatedTeamDoc['name'])); //res[3]
        infoLogs('Getting teams associated to ' + teamId);
        _.each(updatedTeamDoc['child_team_id'], function(id) {
          updateOrDeleteTeamValidation.push(team.getTeam(id));
        });
        if (!_.isEmpty(updatedTeamDoc['parent_team_id'])) {
          updateOrDeleteTeamValidation.push(team.getTeam(updatedTeamDoc.parent_team_id));
        }
        infoLogs('Start validation for team UPDATE or DELETE');
        Promise.all(updateOrDeleteTeamValidation)
          .then(function(res) {
            var oldTeamDocu = res[0];
            var teamIterations = res[1];
            var teamAssesments = res[2];
            var teamName = res[3];
            var userEmail = user['shortEmail'];
            if (oldTeamDocu['doc_status'] === 'delete') {
              msg = {
                name: ['Invalid action']
              };
              return reject(formatErrMsg(msg));
            }
            util.isUserAllowed(userEmail, teamId)
              .then(function() {
                // START team document update
                var associatedDocu = [];
                if (action === 'delete') {
                  var bulkDocu = [];
                  oldTeamDocu['doc_status'] = 'delete';
                  bulkDocu.push(oldTeamDocu);
                  bulkDocu.push(teamIterations.rows);
                  bulkDocu.push(teamAssesments);
                  bulkDocu = _.flatten(bulkDocu);
                  // reformat into delete docu
                  bulkDocu = util.formatForBulkTransaction(bulkDocu, userEmail, 'delete');

                  // this block pertains to updating the related parent/child team records
                  var parentTeam = new Object();
                  var childTeams = [];
                  var lookupObjArr = [];
                  if (res.length > 4) {
                    for (var i = 4; i < res.length; i++) {
                      var team = res[i];
                      if (!_.isEqual(team._id, oldTeamDocu.parent_team_id)) {
                        childTeams.push[team];
                        var lookupObj = teamIndex.createLookupObj(team._id, team.name, team.squadteam, '', '', team.parent_team_id);
                        lookupObjArr.push(lookupObj);
                        team.parent_team_id = '';
                        associatedDocu.push(team);
                      } else {
                        parentTeam = team;
                        var lookupObj = teamIndex.createLookupObj(oldTeamDocu._id, oldTeamDocu.name, oldTeamDocu.squadteam, 'delete', '', oldTeamDocu.parent_team_id);
                        lookupObjArr.push(lookupObj);
                        team.child_team_id = _.difference(team.child_team_id, [oldTeamDocu._id]);
                        associatedDocu.push(team);
                      }
                    }
                    associatedDocu = util.formatForBulkTransaction(associatedDocu, userEmail, 'update');
                    bulkDocu = {
                      docs: _.union(bulkDocu.docs, associatedDocu.docs)
                    };
                  } else {
                    var lookupObj = teamIndex.createLookupObj(oldTeamDocu._id, oldTeamDocu.name, oldTeamDocu.squadteam, 'delete', '', oldTeamDocu.parent_team_id);
                    lookupObjArr.push(lookupObj);
                  }
                  infoLogs('Start team, assessment and iteration documents bulk delete');
                  common.bulkUpdate(bulkDocu)
                  .then(function(results) {
                    teamIndex.getIndexDocument()
                    .then(function(indexDocument) {
                      return teamIndex.updateLookup(indexDocument, lookupObjArr);
                    })
                    .then(function(lookupIndex) {
                      return teamIndex.updateIndexDocument(lookupIndex);
                    })
                    .then(function(result) {
                      loggers.get('models').verbose('Success: Team, assessment and iteration documents bulk deleted');
                      return resolve(results[0]);
                    })
                    .catch( /* istanbul ignore next */  function(err) {
                      // cannot simulate Cloudant error during testing
                      loggers.get('models').error('Something went wrong while getting the lookup index. ' + err.error);
                      return reject(formatErrMsg(err.error));
                    });
                    return resolve(results[0]);
                  })
                  .catch( /* istanbul ignore next */  function(err) {
                    // cannot simulate Cloudant error during testing
                    infoLogs('Team, assessment and iteration documents bulk delete FAIL');
                    return reject(formatErrMsg(err.error));
                  });
                } else {
                  var errorLists = [];
                  // validating required fields
                  var validateTeam = validate(updatedTeamDoc, teamDocRules);
                  if (!(_.isEmpty(validateTeam))) {
                    return reject(formatErrMsg(validateTeam));
                  }
                  // this is team update, need additional validation
                  /*
                  name
                    can be the same to existing docu but cannot be existing to DB when updated
                  */
                  _.each(util.returnObject(teamName), function(team) {
                    if (team._id != updatedTeamDoc._id && team.name == updatedTeamDoc.name) {
                      infoLogs('Team ' + team._id + ' has the same name with ' + updatedTeamDoc._id);
                      return reject(formatErrMsg({
                        name: ['This team name already exists. Please enter a different team name']
                      }));
                    }
                  });
                    /*
                    squadteam
                        from Yes to No = only allowed if no iteration data exist
                        from No to Yes = only allowed if no child teams are associated
                    */
                  infoLogs('Validating squadteam');
                  if (updatedTeamDoc['squadteam'] === 'No' && !(_.isEmpty(teamIterations.rows))) {
                    return reject(formatErrMsg({
                      squadteam: ['Cannot change this team into a non squad team. Iteration information has been entered for this team.']
                    }));
                  } else if (updatedTeamDoc['squadteam'] === 'Yes') {
                    var newChild = updatedTeamDoc['child_team_id'];
                    if (!(_.isEmpty(newChild))) {
                      return reject(formatErrMsg({
                        squadteam: ['Cannot change this team into a squad team. Child team has been entered for this team.']
                      }));
                    }
                  }
                  /*
                  parent_id
                      not allowed to be a parent of self
                      selected parent team should not be a squad team
                  */
                  infoLogs('Validating parent_id');
                  if (!(_.isEmpty(updatedTeamDoc['parent_team_id'])) && updatedTeamDoc['parent_team_id'] === oldTeamDocu['_id']) {
                    return reject(formatErrMsg({
                      parent_id: ['Cannot set self as parent']
                    }));
                  }

                  if (oldTeamDocu['parent_team_id'] != updatedTeamDoc['parent_team_id'] && !(_.isEmpty(updatedTeamDoc['parent_team_id']))) {
                    var refParent = parentTeam; //_.findWhere(teamLists, { '_id' : updatedTeamDoc['parent_team_id'] });
                    if (refParent['squadteam'] === 'Yes') {
                      return reject(formatErrMsg({
                        parent_team_id: ['Parent team id must not be a squad team']
                      }));
                    }
                  }
                  /*
                  child_team_id
                      not allowed to add self as a child
                      squad teams cannot have child teams
                      only allowed to add teams that has no parent
                  */
                  if (typeof updatedTeamDoc['child_team_id'] != 'undefined' && !(_.isEqual(oldTeamDocu['child_team_id'], updatedTeamDoc['child_team_id']))) {
                    if (updatedTeamDoc['child_team_id'].indexOf(oldTeamDocu['_id']) > -1)
                      return reject(formatErrMsg({
                        child_team_id: ['Cannot set self as child']
                      }));
                    else {
                      var newChildToBe = _.difference(updatedTeamDoc['child_team_id'], oldTeamDocu['child_team_id']);
                      var isValidChildTeam2 = [];
                      var isValidChildTeamId = _.every(newChildToBe, function(cId) {
                        // _.reduce(teamLists, function(memo, item){
                        _.reduce(childTeams, function(memo, item) {
                          if (item['_id'] === cId && !(_.isEmpty(item['parent_team_id']))) {
                            isValidChildTeam2.push(item);
                          }
                        });
                        return _.isEmpty(isValidChildTeam2);
                      });
                      if (!isValidChildTeamId) {
                        return reject(formatErrMsg({
                          child_team_id: ['Unable to add selected team as a child. Team may have been updated with another parent.']
                        }));
                      }
                    }
                  }

                  if (!(_.isEmpty(updatedTeamDoc['child_team_id'])) && (updatedTeamDoc['squadteam'] === 'Yes')) {
                    return reject(formatErrMsg({
                      child_team_id: ['Squad team cannot have child']
                    }));
                  }

                  // validating team members
                  if (!_.isEmpty(updatedTeamDoc['members']) && typeof updatedTeamDoc['members'] === 'object') {
                    infoLogs('Validation Team members');
                    for (var i in updatedTeamDoc['members']) {
                      if (updatedTeamDoc['members'][i].name == '' || updatedTeamDoc['members'][i].id == '' || updatedTeamDoc['members'][i].key == '') {
                        reject(formatErrMsg({
                          'member.name': ['Member details are required.']
                        }));
                      }
                      if (updatedTeamDoc['members'][i].role == '') {
                        reject(formatErrMsg({
                          'member.role': ['Please select a valid role.  If "Other" was selected, indicate the role description.']
                        }));
                      }
                    }
                  }
                  // start saving
                  if (_.isEmpty(errorLists)) {
                    infoLogs('Updated document valid, begin save');
                    updatedTeamDoc['last_updt_user'] = user['shortEmail'];
                    updatedTeamDoc['last_updt_dt'] = util.getServerTime();
                    updatedTeamDoc['_rev'] = oldTeamDocu['_rev'];
                    var finalTeamDoc = {};
                    _.each(oldTeamDocu, function(v, i, l) {
                      if (_.isUndefined(updatedTeamDoc[i]))
                        finalTeamDoc[i] = oldTeamDocu[i];
                      else
                        finalTeamDoc[i] = updatedTeamDoc[i];
                    });
                    common.updateRecord(finalTeamDoc)
                    .then(function(body) {
                      teamIndex.getIndexDocument()
                      .then(function(indexDocument) {
                        var lookupObj = teamIndex.createLookupObj(finalTeamDoc._id, finalTeamDoc.name, finalTeamDoc.squadteam, '', finalTeamDoc.parent_team_id, '');
                        return teamIndex.updateLookup(indexDocument, [lookupObj]);
                      })
                      .then(function(lookupIndex) {
                        return teamIndex.updateIndexDocument(lookupIndex);
                      })
                      .then(function(result) {
                        loggers.get('models').verbose('Success: Team document ' + finalTeamDoc['_id'] + ' successfully updated');
                        return resolve(finalTeamDoc);
                      })
                      .catch( /* istanbul ignore next */ function(err) {
                        loggers.get('models').error('Something went wrong with the lookup index update.  Index will be recreated. ' + err.error);
                        return resolve(finalTeamDoc);
                      }); //updateIndexDocument
                    })
                    .catch( /* istanbul ignore next */ function(err) {
                      // cannot simulate Cloudant error during testing
                      return reject(formatErrMsg(err.error));
                    }); // updateRecord
                  } else {
                    infoLogs('Error updating ' + oldTeamDocu['_id']);
                    return reject(formatErrMsg(errorLists));
                  }
                }
              })
              .catch(function(err) {
                msg = 'User not authorized to do action';
                return reject(formatErrMsg(msg));
              });
          })
          .catch(function(err) {
            reject(err);
          });
      }
    });
  },
  getTeam: function(teamId) {
    return new Promise(function(resolve, reject) {
      if (_.isEmpty(teamId)) {
        infoLogs('Getting all team records.');
        common.getByView('teams', 'teams')
          .then(function(body) {
            loggers.get('models').verbose('Success: eam records obtained');
            resolve(body.rows);
          })
          .catch( /* istanbul ignore next */ function(err) {
            // cannot simulate Cloudant error during testing
            msg = err.error;
            return reject(formatErrMsg(msg));
          });
      } else {
        infoLogs('Getting team records for ' + teamId + '.');
        common.getRecord(teamId)
          .then(function(body) {
            loggers.get('models').verbose('Success: Team record obtained for ' + teamId);
            resolve(body);
          })
          .catch( /* istanbul ignore next */ function(err) {
            // cannot simulate Cloudant error during testing
            msg = err.error;
            return reject(formatErrMsg(msg));
          });
      }
    });
  },
  getRole: function() {
    infoLogs('Getting all team role records from Cloudant');
    return new Promise(function(resolve, reject) {
      common.getByView('utility', 'teamMemberRoles')
        .then(function(body) {
          loggers.get('models').verbose('Success: Team roles obtained');
          resolve(body);
        })
        .catch( /* istanbul ignore next */ function(err) {
          // cannot simulate Cloudant error during testing
          msg = err.error;
          return reject(formatErrMsg(msg));
        });
    });
  },
  getName: function(teamName) {
    if (_.isEmpty(teamName)) {
      infoLogs('Getting all team name records from Cloudant');
      return new Promise(function(resolve, reject) {
        common.getByView('teams', 'teamNames')
          .then(function(body) {
            loggers.get('models').verbose('Success: Team names obtained');
            resolve(body);
          })
          .catch( /* istanbul ignore next */ function(err) {
            // cannot simulate Cloudant error during testing
            msg = err.error;
            return reject(formatErrMsg(msg));
          });
      });
    } else {
      infoLogs('Getting team document with name: ' + teamName);
      return new Promise(function(resolve, reject) {
        common.getByViewKey('teams', 'teamNames', teamName)
          .then(function(body) {
            if (_.isEmpty(body.rows))
              loggers.get('models').verbose('Success: No team document with name ' + teamName);
            else
              loggers.get('models').verbose('Success: Team with name ' + teamName + ' obtained');
            resolve(body.rows);
          })
          .catch( /* istanbul ignore next */ function(err) {
            // cannot simulate Cloudant error during testing
            return reject(formatErrMsg(err));
          });
      });
    }
  },
  getTeamByEmail: function(email) {
    return new Promise(function(resolve, reject) {
      var err = validate({
        email: email
      }, {
        email: {
          email: true
        }
      });
      if (err) {
        return reject(formatErrMsg(err));
      } else {
        common.getByViewKey('teams', 'teamsWithMember', email)
          .then(function(body) {
            if (_.isEmpty(body.rows))
              loggers.get('models').verbose('No team for email ' + email);
            else
              loggers.get('models').verbose('Team lists for email ' + email + ' obtained');
            resolve(body.rows);
          })
          .catch( /* istanbul ignore next */ function(err) {
            // cannot simulate Cloudant error during testing
            return reject(formatErrMsg(err));
          });
      }
    });
  },
  getTeamByUid: function(uid) {
    return new Promise(function(resolve, reject) {
      if (_.isEmpty(uid)) {
        var err = {
          uid: ['Employee serial number/uid is required.']
        };
        return reject(formatErrMsg(err));
      } else {
        common.getByViewKey('teams', 'teamsByUid', uid)
          .then(function(body) {
            if (_.isEmpty(body.rows))
              loggers.get('models').verbose('No team for serial number ' + uid);
            else
              loggers.get('models').verbose('Team lists for serial number  ' + uid + ' obtained');
            resolve(body.rows);
          })
          .catch( /* istanbul ignore next */ function(err) {
            // cannot simulate Cloudant error during testing
            return reject(formatErrMsg(err));
          });
      }
    });
  },
  associateActions: function(action) {
    var validActions = ['associateParent', 'associateChild', 'removeParent', 'removeChild'];
    if (_.isEmpty(action))
      return validActions;
    else {
      if (validActions.indexOf(action) > -1) {
        return true;
      } else {
        return false;
      }
    }
  },
  associateTeams: function(associateObj, action, user) {
    var userEmail = user['shortEmail'];
    var errorLists = {};
    errorLists['error'] = {};
    return new Promise(function(resolve, reject) {
      if (!(team.associateActions(action))) {
        errorLists['error']['action'] = ['Invalid action'];
        infoLogs(errorLists);
        reject(errorLists);
      } else if (_.isEmpty(associateObj['teamId'])) {
        errorLists['error']['teamId'] = ['Invalid team document ID'];
        infoLogs(errorLists);
        reject(errorLists);
      } else {
        // check if user is authorized to do action
        util.isUserAllowed(userEmail, associateObj['teamId'])
          .then(function(body) {
            infoLogs('Validating for ' + action);
            team.getTeam(associateObj['teamId'])
              .then(function(currentTeam) {
                switch (action) {
                  case 'associateParent':
                    // parent_id
                    if (_.isEmpty(associateObj['targetParent'])) {
                      errorLists['error']['targetParent'] = ['Unable to associate selected team as a parent. Parent team may have been updated as a descendant of this team.'];
                      infoLogs(errorLists);
                      reject(errorLists);
                    }
                    if (associateObj['teamId'] === associateObj['targetParent']) {
                      // not allowed to be a parent of self
                      errorLists['error']['targetParent'] = ['Unable to associate selected team as a parent. Parent team may have been updated as a descendant of this team.'];
                      infoLogs(errorLists);
                      reject(errorLists);
                    } else {
                      team.getTeam(associateObj['targetParent'])
                        .then(function(body) {
                          if (body['squadteam'] === 'Yes') {
                            // selected parent team should not be a squad team
                            errorLists['error']['targetParent'] = ['Unable to associate selected team as a parent. Parent team may have been updated as a descendant of this team.'];
                            infoLogs(errorLists);
                            reject(errorLists);
                          } else {
                            // ** selected parent team should not be from a team under  it
                            team.getLookupIndex(associateObj['teamId'])
                              .then(function(body) {
                                var teamChildren = !_.isEmpty(body) && !_.isEmpty(body.children) ? body.children : []; //getChildrenOfParent(associateObj['teamId'], body);
                                if (teamChildren.indexOf(associateObj['targetParent']) > -1) {
                                  errorLists['error']['targetParent'] = ['Unable to associate selected team as a parent. Parent team may have been updated as a descendant of this team.'];
                                  infoLogs(errorLists);
                                  reject(errorLists);
                                } else {
                                  infoLogs('Data valid for savings in ' + action);
                                  // merge documents for update
                                  var associateParent = [];
                                  associateParent.push(team.getTeam(associateObj['teamId']));
                                  associateParent.push(team.getTeam(associateObj['targetParent']));
                                  Promise.all(associateParent)
                                    .then(function(result) {
                                      var lookupObj = new Object();
                                      _.each(result, function(team) {
                                        if (_.isEqual(associateObj['teamId'], team._id))
                                          lookupObj = teamIndex.createLookupObj(team._id, team.name, team.squadteam, '', associateObj['targetParent'], team.parent_team_id);
                                      });

                                      formattedDocuments(result, action)
                                        .then(function(res) {
                                          var bulkDocu = util.formatForBulkTransaction(res, userEmail, 'update');
                                          common.bulkUpdate(bulkDocu)
                                            .then(function(body) {
                                              teamIndex.getIndexDocument()
                                              .then(function(indexDocument) {
                                                return teamIndex.updateLookup(indexDocument, [lookupObj]);
                                              })
                                              .then(function(lookupIndex) {
                                                return teamIndex.updateIndexDocument(lookupIndex);
                                              })
                                              .then(function(result) {
                                                loggers.get('models').verbose('Success: Team ' + associateObj['teamId'] + ' successfully associated to parent ' + associateObj['targetParent']);
                                                return resolve(bulkDocu['docs']);
                                              })
                                              .catch( /* istanbul ignore next */ function(err) {
                                                loggers.get('models').error('Something went wrong with the lookup index update.  Index will be recreated. ' + err.error);
                                                return resolve(bulkDocu['docs']);
                                              }); // updateIndexDocument
                                            })
                                            .catch( /* istanbul ignore next */ function(err) {
                                              // cannot simulate Cloudant error during testing
                                              loggers.get('models').error('Unable to associate selected team as a parent. Parent team may have been updated as a descendant of this team.');
                                              return reject(formatErrMsg(err.error));
                                            });
                                        })
                                        .catch( /* istanbul ignore next */ function(err) {
                                          // cannot simulate Cloudant error during testing
                                          reject(err);
                                        });
                                    });
                                }
                              });
                          }
                        })
                        .catch( /* istanbul ignore next */ function(err) {
                          // cannot simulate Cloudant error during testing
                          errorLists['error']['targetParent'] = ['Unable to associate selected team as a parent. Parent team may have been updated as a descendant of this team.'];
                          infoLogs(errorLists);
                          reject(errorLists);
                        });
                    }
                    break;
                  case 'associateChild':
                    if (_.isEmpty(associateObj['targetChild'])) {
                      errorLists['error']['targetChild'] = ['No team selected to associate as a Child team.'];
                      infoLogs(errorLists);
                      reject(errorLists);
                    }
                    // we actually need to get the latest team docs to see if it has been associated already with another parent
                    if (associateObj['targetChild'].indexOf(associateObj['teamId']) > -1) {
                      // not allowed to add self as a child
                      errorLists['error']['targetChild'] = ['Unable to add selected team as a child. Team may have been updated with another parent.'];
                      infoLogs(errorLists);
                      reject(errorLists);
                    } else {
                      var childLists = [];
                      _.each(associateObj['targetChild'], function(id) {
                        childLists.push(team.getTeam(id));
                      });
                      Promise.all(childLists)
                        .then(function(result) {
                          //squad teams cannot have child teams
                          //only allowed to add teams that has no parent
                          _.each(result, function(team) {
                            if (currentTeam['child_team_id'].indexOf(team['_id']) == -1) {
                              if (!_.isEmpty(team['parent_team_id'])) {
                                errorLists['error']['targetChild'] = ['Unable to add selected team as a child. Team may have been updated with another parent.'];
                                infoLogs(errorLists);
                                reject(errorLists);
                              }
                            }
                          });
                          var associateChild = [];
                          associateChild.push(team.getTeam(associateObj['teamId']));
                          _.each(associateObj['targetChild'], function(v, i, l) {
                            associateChild.push(team.getTeam(v));
                          });
                          Promise.all(associateChild)
                            .then(function(result) {
                              var lookupObjArr = [];
                              _.each(result, function(team) {
                                if (associateObj['targetChild'].indexOf(team._id) > -1 && !_.isEqual(associateObj['teamId'], team._id)) {
                                  var lookupObj = teamIndex.createLookupObj(team._id, team.name, team.squadteam, '', associateObj['teamId'], team.parent_team_id);
                                  lookupObjArr.push(lookupObj);
                                }
                              });

                              formattedDocuments(result, action)
                                .then(function(res) {
                                  var bulkDocu = util.formatForBulkTransaction(res, userEmail, 'update');

                                  common.bulkUpdate(bulkDocu)
                                    .then(function(body) {
                                      teamIndex.getIndexDocument()
                                      .then(function(indexDocument) {
                                        return teamIndex.updateLookup(indexDocument, lookupObjArr);
                                      })
                                      .then(function(lookupIndex) {
                                        return teamIndex.updateIndexDocument(lookupIndex);
                                      })
                                      .then(function(result) {
                                        loggers.get('models').verbose('Success: Team ' + associateObj['teamId'] + ' successfully associated to child ' + JSON.stringify(associateObj['targetChild']));
                                        return resolve(bulkDocu['docs']);
                                      })
                                      .catch( /* istanbul ignore next */ function(err) {
                                        return resolve(bulkDocu['docs']);
                                      }); // updateIndexDocument
                                    });
                                });
                            })
                            .catch( /* istanbul ignore next */ function(err) {
                              // cannot simulate Cloudant error during testing
                              loggers.get('models').error('Unable to add selected team as a child. Team may have been updated with another parent.');
                              reject(err);
                            });
                        })
                        .catch( /* istanbul ignore next */ function(err) {
                          // cannot simulate Cloudant error during testing
                          loggers.get('models').error('Unable to add selected team as a child. Team may have been updated with another parent.');
                          reject(err);
                        });
                    }
                    break;
                  case 'removeParent':
                    if (_.isEmpty(associateObj['targetParent'])) {
                      // not allowed to be a parent of self
                      errorLists['error']['targetParent'] = ['Target parent cannot be blank'];
                      infoLogs(errorLists);
                      reject(errorLists);
                    } else if (associateObj['teamId'] === associateObj['targetParent']) {
                      // not allowed to be a parent of self
                      errorLists['error']['targetParent'] = ['Target parent cannot be equal to self'];
                      infoLogs(errorLists);
                      reject(errorLists);
                    } else {
                      var removeParent = [];
                      removeParent.push(team.getTeam(associateObj['teamId']));
                      removeParent.push(team.getTeam(associateObj['targetParent']));
                      Promise.all(removeParent)
                        .then(function(result) {
                          var lookupObj = new Object();
                          _.each(result, function(team) {
                            if (_.isEqual(associateObj['teamId'], team._id))
                              lookupObj = teamIndex.createLookupObj(team._id, team.name, team.squadteam, '', '', team.parent_team_id);
                          });

                          // target parent must be equal to current team parent team id
                          if (result[0]['parent_team_id'] != result[1]['_id']) {
                            errorLists['error']['targetParent'] = ['Target parent is not parent of current team'];
                            infoLogs(errorLists);
                            reject(errorLists);
                          } else {
                            formattedDocuments(result, action)
                              .then(function(res) {
                                var bulkDocu = util.formatForBulkTransaction(res, userEmail, 'update');
                                common.bulkUpdate(bulkDocu)
                                  .then(function(body) {
                                    teamIndex.getIndexDocument()
                                    .then(function(indexDocument) {
                                      return teamIndex.updateLookup(indexDocument, [lookupObj]);
                                    })
                                    .then(function(lookupIndex) {
                                      return teamIndex.updateIndexDocument(lookupIndex);
                                    })
                                    .then(function(result) {
                                      loggers.get('models').verbose('Success: Team ' + associateObj['teamId'] + ' successfully removed parent team ' + associateObj['targetParent']);
                                      return resolve(bulkDocu['docs']);
                                    })
                                    .catch( /* istanbul ignore next */ function(err) {
                                      loggers.get('models').error('Something went wrong with the lookup index update.  Index will be recreated. ' + err.error);
                                      return resolve(bulkDocu['docs']);
                                    }); // updateIndexDocument
                                  })
                                  .catch( /* istanbul ignore next */ function(err) {
                                    // cannot simulate Cloudant error during testing
                                    loggers.get('models').error('Error removing team parent');
                                    reject(err);
                                  });
                              })
                              .catch( /* istanbul ignore next */ function(err) {
                                // cannot simulate Cloudant error during testing
                                loggers.get('models').error('Error removing team parent');
                                reject(err);
                              });
                          } // else
                        })
                        .catch( /* istanbul ignore next */ function(err) {
                          // cannot simulate Cloudant error during testing
                          loggers.get('models').error('Error removing team parent');
                          reject(err);
                        });
                    }
                    break;
                  case 'removeChild':
                    if (typeof associateObj['targetChild'] != 'object') {
                      // target child must be array of team id
                      errorLists['error']['targetChild'] = ['Invalid target child'];
                      infoLogs(errorLists);
                      reject(errorLists);
                    } else if (associateObj['targetChild'].indexOf(associateObj['teamId']) > -1) {
                      // not allowed to add self as a child
                      errorLists['error']['targetChild'] = ['Invalid target child'];
                      infoLogs(errorLists);
                      reject(errorLists);
                    } else {
                      var removeChild = [];
                      removeChild.push(team.getTeam(associateObj['teamId']));
                      _.each(associateObj['targetChild'], function(v, i, l) {
                        removeChild.push(team.getTeam(v));
                      });
                      Promise.all(removeChild)
                        .then(function(result) {
                          var lookupObjArr = [];
                          _.each(result, function(team) {
                            if (associateObj['targetChild'].indexOf(team._id) > -1 && !_.isEqual(associateObj['teamId'], team._id)) {
                              var lookupObj = teamIndex.createLookupObj(team._id, team.name, team.squadteam, '', '', associateObj['teamId']);
                              lookupObjArr.push(lookupObj);
                            }
                          });
                          formattedDocuments(result, action)
                            .then(function(res) {
                              var bulkDocu = util.formatForBulkTransaction(res, userEmail, 'update');
                              common.bulkUpdate(bulkDocu)
                                .then(function(body) {
                                  teamIndex.getIndexDocument()
                                  .then(function(indexDocument) {
                                    return teamIndex.updateLookup(indexDocument, lookupObjArr);
                                  })
                                  .then(function(lookupIndex) {
                                    return teamIndex.updateIndexDocument(lookupIndex);
                                  })
                                  .then(function(result) {
                                    loggers.get('models').verbose('Success: Team ' + associateObj['teamId'] + ' successfully removed child team ' + JSON.stringify(associateObj['targetChild']));
                                    return resolve(bulkDocu['docs']);
                                  })
                                  .catch( /* istanbul ignore next */ function(err) {
                                    loggers.get('models').error('Something went wrong with the lookup index update.  Index will be recreated. ' + err.error);
                                    return resolve(bulkDocu['docs']);
                                  }); // updateIndexDocument
                                });
                            });
                        })
                        .catch( /* istanbul ignore next */ function(err) {
                          // cannot simulate Cloudant error during testing
                          reject(err);
                        });
                    }
                    break;
                }
              });

          })
          .catch( /* istanbul ignore next */ function(err) {
            // cannot simulate Cloudant error during testing
            errorLists['error']['user'] = ['User not authorized to do action'];
            infoLogs(errorLists);
            reject(errorLists);
          });
      }
    });
  },

  getUserTeams: function(userEmail) {
    return new Promise(function(resolve, reject) {
      var userTeamsList = [];
      if (_.isEmpty(userEmail)) {
        infoLogs('No user teams found!');
        resolve(userTeamsList);
      } else {
        team.getTeamByEmail(userEmail)
          .then(function(body) {
            var userTeams = util.returnObject(body);
            loggers.get('models').verbose('Found ' + userTeams.length + ' team(s) for ' + userEmail);
            var requestKeys = _.pluck(userTeams, '_id');
            common.getByViewKeys('teams', 'lookup', requestKeys)
              .then(function(docs){
                var strTeams = _.pluck(docs.rows, 'value');
                _.each(userTeams, function(team){
                  var lookupObj = _.findWhere(strTeams, {
                    _id: team._id
                  });
                  if (!_.isEmpty(lookupObj)) {
                    userTeamsList = _.union([team._id], lookupObj.children, userTeamsList);
                  } else {
                    userTeamsList = _.union([team._id], team.child_team_id, userTeamsList);
                  }
                });
                userTeamsList = _.uniq(userTeamsList);
                loggers.get('models').info('Success: ' + userEmail + ' has ' + userTeamsList.length + ' accessible team(s) by relationship.');
                resolve(userTeamsList);
              })
              .catch( /* istanbul ignore next */ function(err){
                reject(formatErrMsg(err.error));
              });
          })
          .catch( /* istanbul ignore next */ function(err) {
            // cannot simulate Cloudant error during testing
            reject(formatErrMsg(err.error));
          });
      }
    });
  },

  modifyTeamMembers: function(teamId, userId, members) {
    return new Promise(function(resolve, reject){
      /**
       * Reformat document to update/delete document structure for BULK operation
       *
       * @param teamId - team id to modify
       * @param userId - user id of the one who is doing the action
       * @param members - array of member user
       * @returns - modified tem document
       */
      var errorLists = {};
      errorLists['error'] = {};
      if (_.isEmpty(teamId)){
        errorLists['error']['teamId'] = ['Team ID is required'];
        infoLogs(errorLists);
        return reject(errorLists);
      }
      if (_.isEmpty(userId)){
        errorLists['error']['userId'] = ['User ID is required'];
        infoLogs(errorLists);
        return reject(errorLists);
      }
      if (_.isEmpty(members)){
        errorLists['error']['members'] = ['Member lists is required'];
        infoLogs(errorLists);
        return reject(errorLists);
      } else {
        if (!_.isArray(members)){
          errorLists['error']['members'] = ['Invalid member lists'];
          infoLogs(errorLists);
          return reject(errorLists);
        } else {
          _.each(members, function(v,i,l){
            var mLists = validate(v, teamMemberRules);
            if (mLists){
              errorLists['error'] = mLists;
              infoLogs(errorLists);
              return reject(errorLists);
            }
          });
        }
      }
      //check if user is allowed to edit team
      util.isUserAllowed(userId, teamId)
      .then(function(allowed){
        infoLogs('User ' + userId + ' is allowed to edit team ' + teamId + '. Proceed with member modification');
        return allowed;
      })
      .then(function(){
        return team.getTeam(teamId);
      })
      .then(function(teamDetails){
        teamDetails = teamDetails;
        teamDetails['members'] = members;
        teamDetails['last_updt_user'] = userId;
        teamDetails['last_updt_dt'] = util.getServerTime();
        return common.updateRecord(teamDetails);
      })
      .then(function(savingResult){
        return team.getUserTeams(userId);
      })
      .then(function(userTeams){
        return team.getTeam(teamId)
        .then(function(result){
          return resolve(
            {
              userTeams : userTeams,
              teamDetails : result
            }
          );
        });
      })
      .catch(function(err){
        return reject(err);
      });
    });
  },

  modifyImportantLinks: function(teamId, userId, links) {
    return new Promise(function(resolve, reject){
      /**
       *
       * @param teamId - team id to modify
       * @param userId - user id of the one who is doing the action
       * @param links - array of links
       * @returns - modified team document
       */
      var errorLists = {};
      errorLists['error'] = {};
      if (_.isEmpty(teamId)){
        errorLists['error']['teamId'] = ['Team ID is required'];
        infoLogs(errorLists);
        return reject(errorLists);
      }
      if (_.isEmpty(userId)){
        errorLists['error']['userId'] = ['User ID is required'];
        infoLogs(errorLists);
        return reject(errorLists);
      }
      if (_.isEmpty(links)){
        errorLists['error']['links'] = ['Link url is required'];
        infoLogs(errorLists);
        return reject(errorLists);
      } else {
        if (!_.isArray(links)){
          errorLists['error']['links'] = ['Invalid links'];
          infoLogs(errorLists);
          return reject(errorLists);
        } else {
          var err = [];
          _.each(links, function(v,i,l) {
            var mLists = validate(v, teamLinkRules);
            if (mLists) {
              if (mLists['linkUrl']){
                err.push({linkUrl: mLists['linkUrl'][0]});
              }
              if (mLists['linkLabel']){
                err.push({linkLabel: mLists['linkLabel'][0]});
              }
            }
          });
          if (!_.isEmpty(err)){
            errorLists['error'] = {'links': err};
            infoLogs(errorLists);
            return reject(errorLists);
          }
        }
      }

      //check if user is allowed to edit team
      util.isUserAllowed(userId, teamId)
      .then(function(allowed){
        infoLogs('User ' + userId + ' is allowed to edit team ' + teamId + '. Proceed with modification');
        return allowed;
      })
      .then(function(){
        return team.getTeam(teamId);
      })
      .then(function(teamDetails){
        teamDetails = teamDetails;
        var tmpLinks = [];
        _.each(links, function(data,idx,ls) {
          var str = data.linkUrl + process.hrtime().toString();
          var hashId = crypto.createHash('md5').update(str).digest('hex');
          var obj = {};
          obj.id = (data.id !== undefined) ? data.id : hashId;
          obj.linkLabel = data.linkLabel;
          obj.linkUrl = data.linkUrl;
          tmpLinks.push(obj);
        });
        teamDetails['links'] = tmpLinks;
        teamDetails['last_updt_user'] = userId;
        teamDetails['last_updt_dt'] = util.getServerTime();
        return common.updateRecord(teamDetails);
      })
      .then(function(savingResult){
        return team.getUserTeams(userId);
      })
      .then(function(userTeams){
        return team.getTeam(teamId)
        .then(function(result){
          return resolve(
            {
              userTeams : userTeams,
              teamDetails : result
            }
          );
        });
      })
      .catch(function(err){
        return reject(err);
      });
    });
  },

  deleteImportantLinks: function(teamId, userId, links){
    return new Promise(function(resolve, reject){
      /**
       *
       * @param teamId - team id to modify
       * @param userId - user id of the one who is doing the action
       * @param links - array of link IDs
       * @returns - modified team document
       */
      var errorLists = {};
      errorLists['error'] = {};
      if (_.isEmpty(teamId)){
        errorLists['error']['teamId'] = ['Team ID is required'];
        infoLogs(errorLists);
        return reject(errorLists);
      }
      if (_.isEmpty(userId)){
        errorLists['error']['userId'] = ['User ID is required'];
        infoLogs(errorLists);
        return reject(errorLists);
      }
      if (_.isEmpty(links)){
        errorLists['error']['links'] = ['Link ID is required'];
        infoLogs(errorLists);
        return reject(errorLists);
      } else {
        if (!_.isArray(links)){
          errorLists['error']['links'] = ['Invalid links'];
          infoLogs(errorLists);
          return reject(errorLists);
        }
      }

      //check if user is allowed to edit team
      util.isUserAllowed(userId, teamId)
      .then(function(allowed){
        infoLogs('User ' + userId + ' is allowed to edit team ' + teamId + '. Proceed with modification');
        return allowed;
      })
      .then(function(){
        return team.getTeam(teamId);
      })
      .then(function(teamDetails){
        if (!_.isEmpty(teamDetails.links)){
          var curlinkData = teamDetails.links;
          var tmpLinks = [];
          var deletedIds = _.pluck(links, 'id');
          _.each(curlinkData, function(value, key, list){
            if (_.contains(deletedIds, value.id)){
              delete curlinkData[key];
            }
          });
          _.each(curlinkData, function(value, key, list){
            if (value !== undefined){
              tmpLinks.push(value);
            }
          });
        }
        teamDetails = teamDetails;
        teamDetails['links'] = tmpLinks;
        teamDetails['last_updt_user'] = userId;
        teamDetails['last_updt_dt'] = util.getServerTime();
        return common.updateRecord(teamDetails);
      })
      .then(function(savingResult){
        return team.getUserTeams(userId);
      })
      .then(function(userTeams){
        return team.getTeam(teamId)
        .then(function(result){
          return resolve(
            {
              userTeams : userTeams,
              teamDetails : result
            }
          );
        });
      })
      .catch(function(err){
        return reject(err);
      });
    });
  }
};

var formattedDocuments = function(doc, action) {
  return new Promise(function(resolve, reject) {
    var tempDocHolder = [];
    switch (action) {
      case 'associateParent':
        var currentTeam = doc[0];
        var teamToBeParent = doc[1];
        tempDocHolder[0] = currentTeam;
        tempDocHolder[1] = teamToBeParent;
        tempDocHolder[1]['child_team_id'].push(currentTeam['_id']);
        if (!(_.isEmpty(currentTeam['parent_team_id']))) {
          infoLogs('Current team has existing parent, clear the parent child association');
          team.getTeam(currentTeam['parent_team_id'])
            .then(function(body) {
              tempDocHolder[2] = body;
              var newChildTeamId = _.without(tempDocHolder[2]['child_team_id'], currentTeam['_id']);
              tempDocHolder[0]['parent_team_id'] = teamToBeParent['_id'];
              tempDocHolder[2]['child_team_id'] = newChildTeamId;
              _.each(tempDocHolder, function(v, i, l) {
                tempDocHolder[i]['child_team_id'] = _.uniq(tempDocHolder[i]['child_team_id']);

              });
              resolve(tempDocHolder);
            });
        } else {
          infoLogs('Current team has no parent, reformat document and do save');
          _.each(tempDocHolder, function(v, i, l) {
            tempDocHolder[i]['child_team_id'] = _.uniq(tempDocHolder[i]['child_team_id']);

          });
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
        _.each(doc, function(v, i, l) {
          if (i > 0)
            childToBe.push(v['_id']);
        });
        tempDocHolder[0] = doc[0];
        if (_.isEmpty(tempDocHolder[0]['child_team_id']))
          tempDocHolder[0]['child_team_id'] = childToBe;
        else {
          var newChildArr = tempDocHolder[0]['child_team_id'].concat(childToBe);
          tempDocHolder[0]['child_team_id'] = newChildArr;
        }
        var currentTeamId = tempDocHolder[0]['_id'];
        _.each(doc, function(v, i, l) {
          if (i > 0) {
            tempDocHolder[i] = v;
            tempDocHolder[i]['parent_team_id'] = currentTeamId;
          }
        });
        _.each(tempDocHolder, function(v, i, l) {
          tempDocHolder[i]['child_team_id'] = _.uniq(tempDocHolder[i]['child_team_id']);

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
        _.each(doc, function(v, i, l) {
          if (i > 0) {
            childToRemove.push(v['_id']);
          }
        });
        // remove child
        _.each(childToRemove, function(v, i, l) {
          currentChild = _.without(currentChild, v);
        });
        doc[0]['child_team_id'] = currentChild;
        tempDocHolder[0] = doc[0];
        _.each(doc, function(v, i, l) {
          if (i > 0) {
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
};

module.exports = team;
