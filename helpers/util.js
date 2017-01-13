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
  }
};

module.exports = util;
