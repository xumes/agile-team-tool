var validate = require('validate.js');
var moment = require('moment');
var _ = require('underscore');
var dateFormat = "MM/DD/YYYY";

validate.validators.checkDate = function(value, options, key, attrib) {
  var dt = moment(value, dateFormat, true).isValid();
  if (!dt)
    return '^Date must be in format MM/DD/YYYY';
};

validate.validators.compareDate = function(value, options, key, attrib) {
  var startdate = attrib['iteration_start_dt'];
  var enddate = attrib['iteration_end_dt'];
  var d1 = moment(startdate, dateFormat);
  var d2 = moment(enddate, dateFormat);
  var diff = d1.diff(d2, 'days');
  if (diff >= 1)
    return '^End date must be >= start date';
};

var iterationDocRules = {
      "_id": {
        presence: true
      },
      "type": {
        presence: true
      },
      "team_id": {
        presence: {
          presence: true,
          message: "^TeamId is required"
        }
      },
      "iteration_name": {
        presence: {
          presence: true,
          message: "^Iteration no. is required"
        }
      },
      "iteration_start_dt": {
        checkDate: true,
        compareDate: true,
        presence: {
          presence: true,
          message: "^Please enter iteration start date"
        }
      },
      "iteration_end_dt": {
        checkDate: true,
        presence: {
          presence: true,
          message: "^Please enter iteration end date"
        }
      },
      "iterationinfo_status": {
        presence: false
      },
      "team_mbr_cnt": {
        presence: false
      },
      "nbr_committed_stories": {
        presence: false
      },
      "nbr_stories_dlvrd": {
        presence: false
      },
      "nbr_committed_story_pts": {
        presence: false
      },
      "nbr_story_pts_dlvrd": {
        presence: false
      },
      "iteration_comments": {
        presence: false
      },
      "team_mbr_change": {
        presence: true,
        inclusion : {
          within: {'Yes':'Yes', 'No':'No'},
          message: "^Please choose either Yes or No"
        }
      },
      "last_updt_user": {
        presence: {
          presence: true,
          message: "^Last update user is required"
        }
      },
      "fte_cnt": {
        presence: false
      },
      "nbr_dplymnts": {
        presence: false
      },
      "nbr_defects": {
        presence: false
      },
      "client_sat": {
        presence: false,
        numericality: {
          lessThanOrEqualTo: 4,
          greaterThan: 0,
          message: "^Client satisfaction should be between <br> 1.0 - 4.0"
        }
      },
      "team_sat": {
        presence: false,
        numericality: {
          lessThanOrEqualTo: 4,
          greaterThan: 0,
          message: "^Team satisfaction should be between <br> 1.0 - 4.0"
        }
      },
      "last_updt_dt": {
        presence: {
          presence: true,
          message: "^Last update date is required"
        }
      },
      "created_user": {
        presence: {
          presence: true,
          message: "^Created user is required"
        }
      },
      "created_dt": {
        presence: {
          presence: true,
          message: "^Created date is required"
        }
      },
      "doc_status": {
        presence: false
      }
};

module.exports = iterationDocRules;