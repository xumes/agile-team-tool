var validate = require('validate.js');
var moment = require('moment');
var _ = require('underscore');
var dateFormat = 'YYYYMMDD';

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
  'id': {
    presence: {
      presence: true,
      message: '^TeamId is required'
    }
  },
  'startdate': {
    presence: false,
    format: {
      pattern: /^\d+$/,
      message: '^End date must be a number.  A valid date maybe formatted as YYYYMMDD'
    },
    compareDate: {
      field: 'startdate',
    }
  },
  'enddate': {
    presence: false,
    format: {
      pattern: /^\d+$/,
      message: '^End date must be a number.  A valid date maybe formatted as YYYYMMDD'
    },
    compareDate: {
      field: 'enddate',
    }
  },
  'status': {
    presence: false,
    inclusion: {
      within: {
        'Y': 'Y',
        'N': 'N'
      },
      message: '^The value of status is not valid. It must be either Y or N'
    }
  },
  'includeDocs': {
    presence: false,
    inclusion: {
      within: {
        'true': 'true',
        'false': 'false'
      },
      message: '^The value of includeDocs is not valid. It must be either true or false'
    }
  },
  'limit': {
    presence: false,
    format: {
      pattern: /^\d+$/,
      message: '^Limit must be a number'
    }
  }
};

module.exports = iterationSearchAllDocRules;
