var validate = require('validate.js');
var moment = require('moment');
var _ = require('underscore');
var dateFormat = 'MM/DD/YYYY';

validate.validators.checkDate = function(value, options, key, attrib) {
  var dt = moment(value, dateFormat, true).isValid();
  if (!dt)
    return '^' + options['message'];
};

validate.validators.compareDate = function(value, options, key, attrib) {
  var startdate = attrib['iteration_start_dt'];
  var enddate = attrib['iteration_end_dt'];
  if (options['field'] == 'iteration_start_dt') {
    var d1 = moment(startdate, dateFormat);
    var d2 = moment(enddate, dateFormat);
    var diff = d1.diff(d2, 'days');
    if (diff >= 1) {
      return '^Start date must be <= end date';
    }
  }

  if (options['field'] == 'iteration_end_dt') {
    var d1 = moment(startdate, dateFormat);
    var d2 = moment(enddate, dateFormat);
    var diff = d1.diff(d2, 'days');
    if (diff >= 1) {
      return '^End date must be >= start date';
    }
  }
};

validate.validators.checkSatisfaction = function(value, options, key, attrib) {
  var invalid = false;
  value = parseFloat(value);
  if (value === 0) {
    invalid = true;
  } else {
    if ((value != 0 && value < 1) || value > 4) {
      invalid = true;
    }
  }
  if (invalid) {
    return '^' + options['message'];
  }
};

var iterationDocRules = {
  '_id': {
    presence: true
  },
  'type': {
    presence: true
  },
  'team_id': {
    presence: {
      presence: true,
      message: '^Team is required'
    }
  },
  'iteration_name': {
    presence: {
      presence: true,
      message: '^Iteration number/identifier is required'
    }
  },
  'iteration_start_dt': {
    presence: {
      presence: true,
      message: '^Please enter iteration start date'
    },
    checkDate: {
      message: 'Start date must be in format MM/DD/YYYY'
    },
    compareDate: {
      field: 'iteration_start_dt',
    }
  },
  'iteration_end_dt': {
    presence: {
      presence: true,
      message: '^Please enter iteration end date'
    },
    checkDate: {
      message: 'End date must be in format MM/DD/YYYY'
    },
    compareDate: {
      field: 'iteration_end_dt',
    }
  },
  'iterationinfo_status': {
    presence: false
  },
  'team_mbr_cnt': {
    presence: false,
    format: {
      pattern: /^\d+$/,
      message: '^Number of Team members must be a number'
    }
  },
  'nbr_committed_stories': {
    presence: false,
    format: {
      pattern: /^\d+$/,
      message: '^Committed stories must be a number'
    }
  },
  'nbr_stories_dlvrd': {
    presence: false,
    format: {
      pattern: /^\d+$/,
      message: '^Throughput must be a number'
    }
  },
  'nbr_committed_story_pts': {
    presence: false,
    format: {
      pattern: /^\d+$/,
      message: '^Committed story points must be a number'
    }
  },
  'nbr_story_pts_dlvrd': {
    presence: false,
    format: {
      pattern: /^\d+$/,
      message: '^Velocity must be a number'
    }
  },
  'iteration_comments': {
    presence: false
  },
  'team_mbr_change': {
    presence: false,
    inclusion: {
      within: {
        'Yes': 'Yes',
        'No': 'No'
      },
      message: "^In 'Was there a team change?' please choose either Yes or No"
    }
  },
  'last_updt_user': {
    presence: {
      presence: true,
      message: '^Last update user is required'
    }
  },
  'fte_cnt': {
    presence: false,
    format: {
      pattern: /^\d{0,2}(\.\d{0,2}){0,1}$/,
      message: '^FTE must be a number'
    }
  },
  'nbr_dplymnts': {
    presence: false,
    format: {
      pattern: /^\d+$/,
      message: '^Deployments must be a number'
    }
  },
  'nbr_defects': {
    presence: false,
    format: {
      pattern: /^\d+$/,
      message: '^Defects must be a number'
    }
  },
  'nbr_cycletime_WIP': {
    presence: false,
    format: {
      pattern: /^\d{0,2}(\.\d{0,2}){0,1}$/,
      message: 'Cycletime WIP must be a number'
    }
  },
  'nbr_cycletime_in_backlog': {
    presence: false,
    format: {
      pattern: /^\d{0,2}(\.\d{0,2}){0,1}$/,
      message: 'Cycletime in backlog must be a number'
    }
  },
  'client_sat': {
    presence: false,
    checkSatisfaction: {
      message: 'Client satisfaction should be between 1.0 - 4.0'
    },
    format: {
      pattern: /^\d{0,2}(\.\d{0,2}){0,1}$/,
      message: '^Client satisfaction must be a number'
    }
  },
  'team_sat': {
    presence: false,
    checkSatisfaction: {
      message: 'Team satisfaction should be between 1.0 - 4.0'
    },
    format: {
      pattern: /^\d{0,2}(\.\d{0,2}){0,1}$/,
      message: '^Team satisfaction must be a number'
    }
  },
  'last_updt_dt': {
    presence: {
      presence: true,
      message: '^Last update date is required'
    }
  },
  'created_user': {
    presence: {
      presence: true,
      message: '^Created user is required'
    }
  },
  'created_dt': {
    presence: {
      presence: true,
      message: '^Created date is required'
    }
  },
  'doc_status': {
    presence: false
  }
};

module.exports = iterationDocRules;
