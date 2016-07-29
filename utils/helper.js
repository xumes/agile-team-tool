"use strict";
var _ = require('underscore');

var helper = {
  trimData: function(postData) {
    var cleanData = {};
    _.each(postData, function(element, index, list) {
      if (typeof element === 'string') {
        element = element.trim();
      }
      cleanData[index] = element;
    });

    return cleanData;
  }
};

module.exports = helper;