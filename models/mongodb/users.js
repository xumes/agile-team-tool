var mongoose = require('mongoose');
var Promise = require('bluebird');
var loggers = require('../../middleware/logger');
var moment = require('moment');
var _ = require('underscore');
var Schema = mongoose.Schema;
var Team = require('./teams');

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
  }
};

var UserSchema = new Schema(userSchema);
var User = mongoose.model('users', UserSchema);

var users = {
  findUserByEmail: function(email) {
    return new Promise(function(resolve, reject) {
      User.findOne({email: email})
        .then(function(useInfo){
          resolve(useInfo);
        })
        .catch(function(err){
          reject(err);
        });
    });
  },


  isTeamMember: function(userEmail, teamId) {
    return new Promise(function(resolve, reject) {
      Team.getTeamsByEmail(userEmail)
        .then(function(teams) {
          var hasAccess = false;
          _.each(teams, function(team){
            if ((team._id).equals(teamId)) {
              hasAccess = true;
            }
          });
          resolve(hasAccess);
        })
        .catch(function(err) {
          reject(err);
        });
    });
  },

  isUserAllowed: function(userId, teamId) {
    var hasAccess = false;
    return new Promise(function(resolve, reject) {
      var promiseArray = [];
      promiseArray.push(users.findUserByEmail(userId.toLowerCase()));
      promiseArray.push(users.isTeamMember(userId, teamId));
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
        .catch(function(err){
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
        'adminAccess': user.adminAccess
      };

      User.create(newUser)
        .then(function(result){
          resolve(result);
        })
        .catch(function(err){
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
        .catch(function(err){
          reject(err);
        });
    });
  }
};

module.exports = users;
