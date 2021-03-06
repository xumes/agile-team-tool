var mongoose = require('mongoose');
var Promise = require('bluebird');
var loggers = require('../middleware/logger');
var moment = require('moment');
var _ = require('underscore');
var Schema = mongoose.Schema;
var request = require('request');
var settings = require('../settings');
var System = require('./system');
var util = require('../helpers/util');

// Just needed so that corresponding test could run
require('../settings');

var userSchema = {
  userId: {
    type: String,
    required: [true, 'UserId is required.'],
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Name is required.']
  },
  email: {
    type: String,
    default: null
  },
  adminAccess: {
    type: String,
    default: 'none'
  },
  lastLogin: {
    type: Date,
    default: null
  },
  location: {
    site: {
      type: String,
      default: null
    },
    timezone: {
      type: String,
      default: null
    }
  }
};

// var getUserFromFaces = function(email) {
//   return new Promise(function(resolve, reject){
//     if (email != null && email != '') {
//       var json;
//       var facesURL = settings.facesURL;
//       var facesFun = 'find/?limit=100&q=email:' + encodeURIComponent('"' + escape(email) + '"');
//       var url = facesURL + facesFun;
//       request.get(url, function(err, res, body){
//         /* istanbul ignore next */ if (res.statusCode != 200) {
//           var msg = {'error': 'can not get response'};
//           resolve(msg);
//         } else {
//           try {
//             json = JSON.parse(body);
//           } /* istanbul ignore next */ catch (err) {
//             var msg = {'error': 'json error'};
//             resolve(msg);
//           }
//           if (json.length > 0) {
//             resolve(json[0]);
//           } /* istanbul ignore next */ else {
//             var msg = {'error': 'can not find match result'};
//             resolve(msg);
//           }
//         }
//       });
//     }
//   });
// };

var UserSchema = new Schema(userSchema);
var User = mongoose.model('users', UserSchema);

var users = {
  getAllUsers: function() {
    return new Promise(function(resolve, reject) {
      User.find({}).exec()
        .then(function(users) {
          resolve(users);
        })
        .catch(/*istanbul ignore next */ function(err) {
          reject({'error': err});
        });
    });
  },
  getAdmins: function() {
    return new Promise(function(resolve, reject) {
      var query = {
        'adminAccess': {
          '$ne': 'none'
        }
      };
      User.find(query).exec()
        .then(function(users){
          resolve(users);
        })
        .catch( /* istanbul ignore next */ function(err){
          reject({'error':err});
        });
    });
  },

  findUserByUserId: function(uid) {
    return new Promise(function(resolve, reject){
      if (_.isEmpty(uid)) {
        User.find().exec()
          .then(function(users){
            resolve(users);
          })
          .catch( /* istanbul ignore next */ function(err){
            reject({'error':err});
          });
      } else {
        return User.findOne({userId: uid}).exec()
          .then(function(user){
            resolve(user);
          })
          .catch( /* istanbul ignore next */ function(err){
            reject({'error':err});
          });
      }
    });
  },

  findUserByEmail: function(email) {
    return new Promise(function(resolve, reject){
      if (_.isEmpty(email)) {
        User.find().exec()
          .then(function(users){
            resolve(users);
          })
          .catch( /* istanbul ignore next */ function(err){
            reject({'error':err});
          });
      } else {
        return User.findOne({email: email.toLowerCase()}).exec()
          .then(function(user){
            resolve(user);
          })
          .catch( /* istanbul ignore next */ function(err){
            reject({'error':err});
          });
      }
    });
  },

  isTeamMember: function(userId, teamId) {
    return new Promise(function(resolve, reject) {
      var team = require('./teams'); // declaring locally to avoid cyclic issues causing method not found
      team.getUserTeamsByUserId(userId)
        .then(function(teams) {
          var isMember = false;
          _.each(teams, function(team){
            if (_.isEqual((team).toString(), teamId.toString()))
              isMember = true;
          });
          return resolve(isMember);
        })
        .catch( /* istanbul ignore next */ function(err) {
          return reject({'error':err});
        });
    });
  },

  isUserAdmin: function(userId) {
    return new Promise(function(resolve, reject) {
      users.findUserByUserId(userId.toUpperCase())
        .then(function(result) {
          if (result != null && result.adminAccess != undefined) {
            if (result.adminAccess == 'full')
              resolve(true);
            else
              resolve(false);
          } else
            resolve(false);
        })
        .catch( /* istanbul ignore next */ function(err){
          reject({'error':err});
        });
    });
  },

  isUserAllowed: function(userId, teamId) {
    return new Promise(function(resolve, reject) {
      var promiseArray = [];
      promiseArray.push(System.getSystemStatus());
      promiseArray.push(users.isUserAdmin(userId));
      promiseArray.push(users.isTeamMember(userId, teamId));
      Promise.all(promiseArray)
        .then(function(results){
          var systemAccess = 'none'; // when system adminAccess is 'full', only admins are allowed to make edits.
          if (results[0] != null && results[0].adminAccess != undefined) {
            systemAccess = results[0].adminAccess;
          }
          var userAdmin = results[1];
          var teamAccess = results[2];

          if (userAdmin) {
            resolve(true);
          } else if (systemAccess == 'none' && teamAccess) {
            resolve(true);
          } else {
            resolve(false);
          }
        })
        .catch( /* istanbul ignore next */ function(err){
          reject({'error':err});
        });
    });
  },

  getUsersInfo: function(ids) {
    return new Promise(function(resolve, reject) {
      User.find({'userId': {'$in': ids}}).exec()
        .then(function(users){
          resolve(users);
        })
        .catch( /* istanbul ignore next */ function(err){
          reject({'error':err});
        });
    });
  },

  create: function(user) {
    var teamModel = require('./teams');
    var bpEmail = '';
    var bpUserId = 0;
    var userId = 0;
    var bluepagesURL = '';
    var requestURL = '';
    var bpldapResult = {};
    var bpInfo;
    var promiseArray = [];
    return new Promise(function(resolve, reject) {
      var newUser = {
        'userId': user.userId.toUpperCase(),
        'email': user.email.toLowerCase(),
        'name': user.name,
        'adminAccess': user.adminAccess || 'none',
        'location': {
          'site': null,
          'timezone': null
        }
      };
      if (user.location != undefined && !_.isEmpty(user.location)) {
        newUser.location.site = user.location.site || null;
        newUser.location.timezone = user.location.timezone || null;
      }
      userId = user.userId.toUpperCase();
      bluepagesURL = settings.bluepagesURL;
      requestURL = bluepagesURL + '/' + userId;
      // First, Search the user (by userId) using ldap query
      module.exports.ldapUserQuery(requestURL)
        .then(function(bpInfo) { /* istanbul ignore next */
          if (bpInfo && !_.isEmpty(bpInfo.ldap) && (bpInfo.ldap.uid === newUser.userId)) {
            bpUserId = bpInfo.ldap.uid.toUpperCase();
            bpEmail = bpInfo.ldap.preferredIdentity || bpInfo.shortEmail || '';
            bpEmail = bpEmail.toLowerCase();
            bpFullname = util.getBPFullname(bpInfo);
            // If userInfo.email don't match from the bluepages data then lets update it
            if (bpEmail !== newUser.email || bpFullname !== newUser.name) {
              newUser.userId = bpUserId;
              newUser.email = bpEmail;
              newUser.name = bpFullname;
            }
            return User.create(newUser);
          } else {
            return User.create(newUser);
          }
        })
        .then(function(createdUser) {
          return teamModel.getTeamsByUserId(userId);
        })
        .then(function(teamResult) {
          teamResult.map(function(row){
            var obj = {};
            var teamId = row['_id'];
            var teamName = row['name'];
            var tmpMembers = row['members'];
            var updatedMembers = [];
            for (i=0; i < tmpMembers.length; i++) {
              if (bpUserId === tmpMembers[i]['userId']) {
                obj = {
                  name: bpFullname,
                  userId: bpUserId,
                  email: bpEmail,
                  role: tmpMembers[i]['role'],
                  allocation: tmpMembers[i]['allocation'],
                  workTime: tmpMembers[i]['workTime'],
                  location: tmpMembers[i]['location']
                };
              } else {
                obj = {
                  name: tmpMembers[i]['name'],
                  userId: tmpMembers[i]['userId'],
                  email: tmpMembers[i]['email'],
                  role: tmpMembers[i]['role'],
                  allocation: tmpMembers[i]['allocation'],
                  workTime: tmpMembers[i]['workTime'],
                  location: tmpMembers[i]['location']
                };
              }
              updatedMembers.push(obj);
            }
            return promiseArray.push(teamModel.updateTeamMemberDataByTeamId(teamId, updatedMembers));
          });
          return Promise.all(promiseArray);
        })
        .then(function(updateTeamMemberData) {
          return module.exports.findUserByUserId(userId);
        })
        .then(function(foundUser) {
          return resolve(foundUser);
        })
        .catch( /* istanbul ignore next */ function(err) {
          reject({'error':err});
        });
    });
  },

  updateUser: function(userInfo) {
    var teamModel = require('./teams');
    var bpFullname = '';
    var bpEmail = '';
    var bpUserId;
    var userId;
    var bluepagesURL = '';
    var requestURL = '';
    return new Promise(function(resolve, reject){
      if (_.isEmpty(userInfo.userId)) {
        reject({'error':'missing user ID.'});
      }
      else {
        userId = userInfo.userId.toUpperCase();
        bluepagesURL = settings.bluepagesURL;
        requestURL = bluepagesURL + '/' + userId;
        // First, Search this user (by userId) using ldap query
        module.exports.ldapUserQuery(requestURL)
          .then(function(bpInfo) { /* istanbul ignore next */
            if (bpInfo && !_.isEmpty(bpInfo.ldap) && (bpInfo.ldap.uid === userId)) {
              bpUserId = bpInfo.ldap.uid.toUpperCase();
              bpEmail = bpInfo.ldap.preferredIdentity || bpInfo.shortEmail || '';
              bpEmail = bpEmail.toLowerCase();
              bpFullname = util.getBPFullname(bpInfo);
              // If userInfo.email don't match from the bluepages data then lets update it
              if (bpEmail && (bpEmail !== userInfo.email || bpFullname !== userInfo.name)) {
                userInfo.userId = bpUserId;
                userInfo.email = bpEmail;
                userInfo.name = bpFullname;
              }
              return User.findOneAndUpdate({'userId': userId}, {'$set': userInfo}).exec();
            } else {
              loggers.get('model-users').verbose('Unable to retrieve Bluepages information!! Requested URL:',requestURL);
              return User.findOneAndUpdate({'userId': userId}, {'$set': userInfo}).exec();
            }
          })
          .then(function(updatedUser) {
            // Get all teams that this user belongs to and then update the team.members info
            return teamModel.getTeamsByUserId(userId);
          })
          .then(function(teamResult) {
            teamResult.map(function(row) {
              var obj = {};
              var teamId = row['_id'];
              var teamName = row['name'];
              var tmpMembers = row['members'];
              var updatedMembers = [];
              for (i=0; i < tmpMembers.length; i++) {
                if (bpUserId === tmpMembers[i]['userId']) {
                  obj = {
                    name: bpFullname,
                    userId: bpUserId,
                    email: bpEmail,
                    role: tmpMembers[i]['role'],
                    allocation: tmpMembers[i]['allocation'],
                    workTime: tmpMembers[i]['workTime'],
                    location: tmpMembers[i]['location']
                  };
                } else {
                  obj = {
                    name: tmpMembers[i]['name'],
                    userId: tmpMembers[i]['userId'],
                    email: tmpMembers[i]['email'],
                    role: tmpMembers[i]['role'],
                    allocation: tmpMembers[i]['allocation'],
                    workTime: tmpMembers[i]['workTime'],
                    location: tmpMembers[i]['location']
                  };
                }
                updatedMembers.push(obj);
              }
              // Lets update the team.members data
              return teamModel.updateTeamMemberDataByTeamId(teamId, updatedMembers);
            });
          })
          .then(function(updateMember) {
            return module.exports.findUserByUserId(userId);
          })
          .then(function(foundUser){
            return resolve(foundUser);
          })
          .catch( /* istanbul ignore next */ function(err){
            reject({'error':err});
          });
      }
    });
  },

  //
  // bulkUpdateUsers: function(updateUsers) {
  //   return new Promise(function(resolve, reject) {
  //     var bulk = User.collection.initializeUnorderedBulkOp();
  //     if (_.isEmpty(updateUsers)) {
  //       resolve([]);
  //     } else {
  //       _.each(updateUsers, function(updateUser){
  //         bulk.find({'email':updateUser.email}).update({'$set':updateUser.set});
  //       });
  //       bulk.execute(function(error, result){
  //         if (error) {
  //           /* istanbul ignore next */
  //           reject(error);
  //         } else {
  //           resolve(result);
  //         }
  //       });
  //     }
  //   });
  // },

  deleteUser: function(userId) {
    return new Promise(function(resolve, reject) {
      var deleteUser = {
        'userId': userId
      };

      User.remove(deleteUser)
        .then(function(result){
          resolve(result);
        })
        .catch( /* istanbul ignore next */ function(err){
          reject({'error':err});
        });
    });
  },

  isUserImageBroken: /* istanbul ignore next */ function(uid) {
    return new Promise(function(resolve, reject) {
      var queryUrl = 'http://faces-cache.mybluemix.net/image/' + uid;
      request(queryUrl, function(err, response, body) {
        if (err) {
          reject(err);
        }
        else if (_.isEmpty(body)) {
          reject('empty');
        }
        else {
          resolve(body);
        }
      });
    });
  },

  ldapUserQuery: /* istanbul ignore next */ function(ldapUrl) {
    return new Promise(function(resolve) {
      request(ldapUrl, {timeout: 5000}, function(err, response, body) {
        var json;
        try {
          json = JSON.parse(body) ; // if the body is STRING, try to parse it
        }
        catch (err) {
          var msg = {};
          if (err.statusCode) {
            msg.statusCode = err.statusCode;
          } else {
            msg.statusCode = 400;
          }
          msg.message = err;
          loggers.get('model-users').verbose('Error getting Bluepages record', ldapUrl, msg);
        }

        if (response && response.statusCode == 404 && json.message == 'Unable to find record') {
          loggers.get('model-users').verbose('Unable to get Bluepages record', ldapUrl);
          resolve();
        }
        else {
          resolve(json);
        }
      });
    });
  },

  facesUserQuery: /* istanbul ignore next */ function(facesUrl) {
    return new Promise(function(resolve) {
      request(facesUrl, function(err, response, body) {
        var json;
        try {
          json = JSON.parse(body) ; // if the body is STRING, try to parse it
        }
        catch (err) {
          var msg = {};
          if (err.statusCode) {
            msg.statusCode = err.statusCode;
          } else {
            msg.statusCode = 400;
          }
          msg.message = err;
          loggers.get('model-users').verbose('Error getting Faces record', facesUrl, msg);
        }

        if (_.isEmpty(json)) {
          loggers.get('model-users').verbose('Unable to get Faces record', facesUrl);
          resolve();
        }
        else {
          resolve(json);
        }
      });
    });
  }
};

module.exports = users;
