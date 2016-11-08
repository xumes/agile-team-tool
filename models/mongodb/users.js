var mongoose = require('mongoose');
var Promise = require('bluebird');
var loggers = require('../../middleware/logger');
var moment = require('moment');
var _ = require('underscore');
var Schema = mongoose.Schema;
var Team = require('./teams');
var https = require('https');
var request = require('request');
var settings = require('../../settings');
var System = require('./system');

// Just needed so that corresponding test could run
require('../../settings');

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

var getUserFromFaces = function(email) {
  return new Promise(function(resolve, reject){
    if (email != null && email != '') {
      var json;
      var facesURL = settings.facesURL;
      var facesFun = 'find/?limit=100&q=email:' + encodeURIComponent('"' + escape(email) + '"');
      var url = facesURL + facesFun;
      request.get(url, function(err, res, body){
        /* istanbul ignore next */ if (res.statusCode != 200) {
          var msg = {'error': 'can not get response'};
          resolve(msg);
        } else {
          try {
            json = JSON.parse(body);
          } /* istanbul ignore next */ catch (err) {
            var msg = {'error': 'json error'};
            resolve(msg);
          }
          if (json.length > 0) {
            resolve(json[0]);
          } /* istanbul ignore next */ else {
            var msg = {'error': 'can not find match result'};
            resolve(msg);
          }
        }
      });
    }
  });
};

var UserSchema = new Schema(userSchema);
var User = mongoose.model('users', UserSchema);

var users = {
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
      Team.getUserTeamsByUserId(userId)
        .then(function(teams) {
          // console.log(teamId, teams);
          var isMember = false;
          _.each(teams, function(team){
            if (_.isEqual((team).toString(), teamId.toString()))
              isMember = true;
          });
          // console.log(isMember);
          return resolve(isMember);
        })
        .catch( /* istanbul ignore next */ function(err) {
          return reject({'error':err});
        });
    });
  },

  isUserAllowed: function(userId, teamId) {
    var hasAccess = false;
    return new Promise(function(resolve, reject) {
      var promiseArray = [];
      promiseArray.push(System.getSystemStatus());
      promiseArray.push(users.findUserByUserId(userId.toUpperCase()));
      promiseArray.push(users.isTeamMember(userId, teamId));
      Promise.all(promiseArray)
        .then(function(results){
          var systemAccess = 'none';
          var userAccess = 'none';
          var teamAccess = false;
          if (results[0] != null && results[0].adminAccess != undefined) {
            systemAccess = results[0].adminAccess;
          }
          if (results[1] != null && results[1].adminAccess != undefined) {
            userAccess = results[1].adminAccess;
          }
          if (results[2] != undefined) {
            teamAccess = results[2];
          }
          if (userAccess == 'full') {
            return resolve(true);
          } else if (systemAccess == 'none' && teamAccess) {
            return resolve(true);
          } else {
            return resolve(false);
          }
        })
        .catch( /* istanbul ignore next */ function(err){
          console.log(err);
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
    return new Promise(function(resolve, reject) {
      var newUser = {
        'userId': user.userId.toUpperCase(),
        'email': user.email.toLowerCase(),
        'name': user.name,
        'adminAccess': user.adminAccess,
        'location': {
          'site': null,
          'timezone': null
        }
      };
      getUserFromFaces(newUser.email)
        .then(function(facesInfo){
          if (!facesInfo.error) {
            if (facesInfo.location) {
              newUser.location.site = facesInfo.location;
            }
          }
          return User.create(newUser);
        })
        .then(function(result){
          resolve(result);
        })
        .catch( /* istanbul ignore next */ function(err){
          reject({'error':err});
        });
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
  }
};

module.exports = users;
