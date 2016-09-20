var mongoose = require('mongoose');
var Promise = require('bluebird');
var loggers = require('../../middleware/logger');
var moment = require('moment');
var _ = require('underscore');
var Schema = mongoose.Schema;

// Just needed so that corresponding test could run
require('../../settings');

var userSchema = {
  userId: {
    type: String,
    required: [true, 'UserId is required.']
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

var memberSchema = {
  name: {
    type: String,
    required: [true, 'Member name is required.']
  },
  allocation: {
    type: Number,
    default: 0,
    min: [0, 'Allocation must be between 0 and 100.'],
    max: [100, 'Allocation must be between 0 and 100.']
  },
  userId: {
    type: String,
    required: [true, 'Member userId is required.']
  },
  email: {
    type: String,
    required: [true, 'Member email is required.']
  }
};

var teamSchema = {
  cloudantId: {
    type: String
  },
  name: {
    type: String,
    required: [true, 'Name is required.']
  },
  pathId: {
    type: String,
    unique: true, //declares unique index
    required: [true, 'Email is required.']
  },
  path: {
    type: String,
    default: null
  },
  members: [memberSchema],
  type: {
    type: String,
    default: null
  },
  description: {
    type: String,
    default: null
  },
  createdDate: {
    type: Date,
    default: new Date()
  },
  createdByUserId: {
    type: String,
    required: [true, 'UserId of creator required.']
  },
  createdBy: {
    type: String,
    required: [true, 'Name of creator required.']
  },
  updateDate: {
    type: Date,
    default: new Date()
  },
  updateByUserId: {
    type: String,
    default: null
  },
  updateBy: {
    type: String,
    default: null
  },
  docStatus: {
    type: String,
    default:null
  }
};

var formatErrMsg = function(msg) {
  loggers.get('models').error('Error: ', msg);
  return {
    error: msg
  };
};

var successLogs = function(msg) {
  loggers.get('models').verbose('Success: ' + msg);
  return;
};

var infoLogs = function(msg) {
  loggers.get('models').verbose(msg);
  return;
};

var UserSchema = new Schema(userSchema);
var TeamSchema = new Schema(teamSchema);

var userModel = mongoose.model('users', UserSchema);
var teamModel = mongoose.model('teams', TeamSchema);

var users = {
  findUserByEmail: function(email) {
    return new Promise(function(resolve, reject) {
      userModel.findOne({email: email})
        .then(function(useInfo){
          resolve(useInfo);
        })
        .catch(function(err){
          reject(formatErrMsg(err.message));
        });
    });
  },

  isTeamMember: function(userId, teamId) {
    return new Promise(function(resolve, reject) {
      var request = {
        'members': {
          '$elemMatch': {
            'email': userId
          }
        }
      };
      teamModel.find(request)
        .then(function(teams) {
          var hasAccess = false;
          _.each(teams, function(team){
            if (team._id == teamId) {
              hasAccess = true;
            }
          });
          resolve(hasAccess);
        })
        .catch(function(err) {
          console.log(err);
          reject(formatErrMsg(err.error));
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
          reject(formatErrMsg(err));
        });
    });
  },

  add: function(user) {
    return new Promise(function(resolve, reject) {
      var newUser = {
        'userId': (user.ldap.ibmSerialNumber + user.ldap.employeeCountryCode).toUpperCase(),
        'email': (user.shortEmail).toLowerCase(),
        'name': user.ldap.hrFirstName + ' ' + user.ldap.hrLastName,
        'adminAccess': 'none'
      };
      userModel.create(newUser)
        .then(function(result){
          resolve(result);
        })
        .catch(function(err){
          reject(formatErrMsg(err.message));
        });
    });
  }
};

module.exports = users;
