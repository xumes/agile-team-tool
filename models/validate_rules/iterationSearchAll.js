var validate = require('validate.js');
var moment = require('moment');
var _ = require('underscore');
var dateFormat = "YYYYMMDD";

validate.validators.checkDate = function(value, options, key, attrib) {
  if (value) {
    var dt = moment(value, dateFormat, true).isValid();
    if (!dt)
      return "^" + options['message'];
  }
};

validate.validators.compareDate = function(value, options, key, attrib) {
  var startdate = attrib['startdate'];
  var enddate = attrib['enddate'];
  if (options['field'] == 'startdate') {
    var d1 = moment(startdate, dateFormat);
    var d2 = moment(enddate, dateFormat);
    var diff = d1.diff(d2, 'days');
    if (diff >= 1) {
      return '^Start date must be <= end date';
    }
  }

  if (options['field'] == 'enddate') {
    var d1 = moment(startdate, dateFormat);
    var d2 = moment(enddate, dateFormat);
    var diff = d1.diff(d2, 'days');
    if (diff >= 1) {
      return '^End date must be >= start date';
    }
  }
};

var iterationSearchAllDocRules = {
  "id": {
    presence: {
      presence: true,
      message: "^TeamId is required"
    }
  },
  "startdate": {
    presence: false,
    checkDate: {
      message: "Start date must be in format YYYYMMDD"
    },
    compareDate: {
      field: "startdate",
    }
  },
  "enddate": {
    presence: false,
    checkDate: {
      message: "End date must be in format YYYYMMDD"
    },
    compareDate: {
      field: "enddate",
    }
  },
  "status": {
    presence: false,
    inclusion : {
      within: {'Y':'Y', 'N':'N'},
      message: "^Invalid status please choose either Y or N"
    }
  },
  "includeDocs": {
    presence: false,
    inclusion : {
      within: {'true':'true', 'false':'false'},
      message: "^Invalid includeDocs please choose either true or false"
    }
  },
  "limit": {
    presence: false,
    format: {
      pattern: /^\d+$/,
      message: "^Limit must be a number"
    }
  }
};

module.exports = iterationSearchAllDocRules;