var Promise = require('bluebird');
var loggers = require('../../middleware/logger');
var config = require('../../settings');
var mongoose = config.mongoose;
var Schema   = require('mongoose').Schema;

var sysCollOptionsSchema = new Schema({
  collTag: {
    type: String,
    default: ''
  },
  collField: {
    type: String,
    default: ''
  },
  validOptions: [{
    type: String,
    default: null
  }]
}, {collection : 'sysCollOptions'});

var sysStatusSchema = new Schema({
  flag: {
    type: String,
    required: [true, 'System flag is required.'],
    unique: true
  },
  desc: {
    type: String,
    default: ''
  },
  active: {
    type: Boolean,
    default: false
  },
  display: {
    type: String,
    default: ''
  },
  adminAccess: {
    type: String,
    default: 'none'
  }
}, {collection : 'sysStatus'});

var SysCollOptions = mongoose.model('sysCollOptions', sysCollOptionsSchema);
var SysStatus = mongoose.model('sysStatus', sysStatusSchema);

var system = {
  getTeamMemberRoles: function() {
    console.log('getTeamMemberRoles');
    return new Promise(function(resolve, reject) {
      SysCollOptions.findOne({'collTag': 'team', 'collField': 'members.role'}).exec()
      .then(function(options){
        console.log(options);
        resolve(options.validOptions);
      })
      .catch( /* istanbul ignore next */ function(err){
        console.log(err);
        reject({'error':err});
      });
    });
  },

  getTeamLinkLabels: function() {
    return new Promise(function(resolve, reject) {
      SysCollOptions.findOne({'collTag': 'team', 'collField': 'links.linkLabel'}).exec()
      .then(function(options){
        console.log(options);
        resolve(options.validOptions);
      })
      .catch( /* istanbul ignore next */ function(err){
        console.log(err);
        reject({'error':err});
      });
    });
  },

  getSystemStatus: function() {
    return new Promise(function(resolve, reject) {
      SysStatus.findOne({'active': true}).exec()
      .then(function(status){
        console.log(status);
        resolve(status);
      })
      .catch( /* istanbul ignore next */ function(err){
        console.log(err);
        reject({'error':err});
      });
    });
  },
}

module.exports = system;
