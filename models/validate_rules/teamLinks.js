var validate = require('validate.js');

validate.validators.checkUrl = function(value, options, key, attrib) {
  var dt = validate({'linkVal': value}, {'linkVal': {url: true}});
  if (dt != undefined) {
    return '^' + value + ' is not a valid url';
  } else {
    return;
  }
};

validate.validators.checklinkId = function(value, options, key, attrib) {
  if ((value === '') || (value == 'Select label')){
    return '^Link label is required';
  }
};

exports.teamlinkRules = {
  'id': true,
  'linkLabel': {
    presence: {
      presence: true,
      message: '^Link label is required'
    },
    checklinkId: true
  },
  'linkUrl': {
    presence: {
      presence: true,
      message: '^URL is required'
    },
    checkUrl: true
  }
};
