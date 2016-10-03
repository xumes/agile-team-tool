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
    required: [true, 'Email is required.']
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

function validObjectId(docId) {
  var objId = mongoose.Types.ObjectId;
  if (docId) {
    if (mongoose.Types.ObjectId.isValid(docId)) {
      return docId;
    } else {
      try {
        objId = mongoose.Types.ObjectId(docId);
      } catch (e) {
        if (e) {
          return {'error': e.message};
        }
      }
      return objId;
    }
  } else {
    return {'error': 'missing doc id'};
  }
}

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
          reject(err);
        });
    });
  },

  findUserByUserId: function(uid) {
    return User.findOne({userId: uid}).exec();
  },

  findUserByEmail: function(email) {
    return User.findOne({email: email}).exec();
  },

  isTeamMember: function(userEmail, teamId) {
    return new Promise(function(resolve, reject) {
      Team.getTeamsByEmail(userEmail)
        .then(function(teams) {
          var hasAccess = false;
          _.each(teams, function(team){
            if ((team._id).toString() == teamId.toString()) {
              hasAccess = true;
            }
          });
          resolve(hasAccess);
        })
        .catch( /* istanbul ignore next */ function(err) {
          reject(err);
        });
    });
  },

  isUserAllowed: function(userEmail, teamId) {
    var hasAccess = false;
    return new Promise(function(resolve, reject) {
      var promiseArray = [];
      promiseArray.push(users.findUserByEmail(userEmail.toLowerCase()));
      promiseArray.push(users.isTeamMember(userEmail, teamId));
      Promise.all(promiseArray)
        .then(function(results){
          if (results[0] && results[0] != undefined) {
            if (results[0].adminAccess && results[0].adminAccess != undefined && results[0].adminAccess != 'none') {
              hasAccess = true;
              return resolve(hasAccess);
            }
          }
          if (results[1] && results[1] != undefined) {
            hasAccess = results[1];
            return resolve(hasAccess);
          }
          return resolve(hasAccess);
        })
        .catch( /* istanbul ignore next */ function(err){
          console.log(err);
          reject(err);
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
          reject(err);
        });
    });
  },

  delete: function(email) {
    return new Promise(function(resolve, reject) {
      var deleteUser = {
        'email': email
      };

      User.remove(deleteUser)
        .then(function(result){
          resolve(result);
        })
        .catch( /* istanbul ignore next */ function(err){
          reject(err);
        });
    });
  }
};

module.exports = users;
