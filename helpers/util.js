'use strict';
var Promise = require('bluebird');
var settings = require('../settings');
var _ = require('underscore');
var request = require('request');

var util = {
  queryLDAP: function(id) {
    return new Promise(function(resolve, reject) {
      var opts = {
        url: settings['ldapAuthURL'] + '/id/' + id + '/email'
      };

      request.get(opts, function(err, res, body) {
        if (err) {
          reject(body);
        } else {
          resolve(body);
        }
      });
    });
  },

  specialCharsHandler: function(id) {
    return id.replace( /(:|\.|\[|\]|,|\/| )/g, '\\$1' );
  },

  getIntegerValue: function(fieldValue) {
    var value = 0;
    if (!_.isUndefined(fieldValue) && !isNaN(parseInt(fieldValue)))
      value = parseInt(fieldValue);
    return value;
  },

  getFloatValue: function(fieldValue) {
    var value = 0;
    if (!_.isUndefined(fieldValue) && !isNaN(parseFloat(fieldValue)))
      value = parseFloat(fieldValue);
    return value;
  },

  getBPFullname: function(bpInfo) {
    var bpFullname = '';
    if (bpInfo.ldap.notesEmail)
      bpFullname = bpInfo.ldap.notesEmail.split('/')[0].split('=')[1];
    else if (bpInfo.ldap.notesemail)
      bpFullname = bpInfo.ldap.notesemail.split('/')[0].split('=')[1];
    else if (bpInfo.ldap.preferredFirstName && bpInfo.ldap.preferredLastName)
      bpFullname = bpInfo.ldap.preferredFirstName +  ' ' + bpInfo.ldap.preferredLastName;
    else if (bpInfo.ldap.preferredfirstname && bpInfo.ldap.preferredlastname)
      bpFullname = bpInfo.ldap.preferredfirstname +  ' ' + bpInfo.ldap.preferredlastname;

    return bpFullname.trim();
  },

  hasDuplicateRole: function(memberAry) {
    var uuid = require('node-uuid');
    var duplicate = [];
    var ch = '|'+uuid.v4()+'|';
    var result = _.map(memberAry, function(value){
      if ((value.userId !== undefined) && (value.role !== undefined)){
        return value.userId.toUpperCase().trim() + ch + value.role.toLowerCase().trim();
      }
    });
    _.some(result, function(value, index, ary) {
      if (ary.indexOf(value) !== ary.lastIndexOf(value) === true){
        duplicate.push(value);
      }
    });
    var duplicated = _.uniq(duplicate);
    var userIdx = [];
    _.each(memberAry, function(m){
      if (!_.isEmpty(m.name) && !_.isEmpty(m.role)){
        userIdx[m.userId] = {name: m.name, role: m.role.replace(/\b\w/g, function(r){return r.toUpperCase();})};
      }
    });
    var str = '';
    if (!_.isEmpty(duplicated)){
      duplicated.forEach(function(i){
        if (i){
          var strErr = i.split(ch);
          str = str + userIdx[strErr[0]].name + ' is already assigned to a ' + userIdx[strErr[0]].role + ' role. ';
        }
      });
      if (str){
        return {'error': str};
      }
    }
    return false;
  }
};

module.exports = util;
