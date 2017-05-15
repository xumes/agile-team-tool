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
  }
};

module.exports = util;
