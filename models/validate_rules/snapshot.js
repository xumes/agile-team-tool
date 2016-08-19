var validate = require('validate.js');
var moment = require('moment');
var _ = require('underscore');

var snapshotValidationRules = {
  nonSquadTeamRule : {
    '_id': {
      presence: true
    },
    'name': {
      presence: true
    }
  },
  squadTeamRule: {
    '_id': {
      presence: true
    },
    'name': {
      presence: true
    }
  }
};
module.exports = snapshotValidationRules;
