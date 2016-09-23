var lodash = require('lodash');
var Promise = require('bluebird');
var mongoose = require('mongoose');
var loggers = require('../../middleware/logger');
var Schema   = mongoose.Schema;
var lodash = require('lodash');

// assessmentTemplates helper
// components is following a standard object structure, and not sure if we can validate object properties individually via MongoDB Schema
// will validate via validate.js, same approach to assement document `componentResults` and `actionPlans`
var validate = require('validate.js');

validate.validators.isValidArray = function(value, options, key, attributes){
  return validate.isArray(value) ? null : true;
};

validateComponents = function(components){
  var constraint = {
    name: {
      presence: {
        presence: true,
        message: '^Component name is required.'
      },
      length: {
        min: 2
      }
    },
    principles: {
      presence: {
        presence: true,
        message: '^Component principle is required.'
      },
      isValidArray: 'Check if array'
    }
  };
  var err = [];
  lodash.each(components, function(v){
    if (validate(v, constraint)) {
      err.push(v);
    }
  });
  return lodash.isEmpty(err) ? true : false;
};

validateComponentsPrinciples = function(principles){
  var constraint = {
    id: {
      presence: {
        presence: true,
        message: '^Principle ID is required.'
      },
      numericality: true
    },
    name: {
      presence: {
        presence: true,
        message: '^Principle name is required.'
      },
      length: {
        min: 2
      }
    },
    practices: {
      presence: {
        presence: true,
        message: '^Principle practices is required.'
      },
      isValidArray: 'Check if array'
    }
  };
  var err = [];
  lodash.each(principles, function(v){
    if (validate(v, constraint)) {
      err.push(v);
    }
  });
  return lodash.isEmpty(err) ? true : false;
};

validatePrinciplesPractices = function(practices) {
  var constraint = {
    id: {
      presence: {
        presence: true,
        message: '^Practices ID is required.'
      },
      numericality: true
    },
    name: {
      presence: {
        presence: true,
        message: '^Practices name is required.'
      },
      length: {
        min: 2
      }
    },
    description: {
      presence: {
        presence: true,
        message: '^Practices description is required.'
      },
      length: {
        min: 2
      }
    },
    levels: {
      presence: {
        presence: true,
        message: '^Practices levels is required.'
      },
      isValidArray: 'Check if array'
    }
  };
  var err = [];
  lodash.each(practices, function(v){
    if (validate(v, constraint)) {
      err.push(v);
    }
  });
  return lodash.isEmpty(err) ? true : false;
};

validatePracticesLevels = function(levels) {
  var constraint = {
    name: {
      presence: {
        presence: true,
        message: '^Levels name is required.'
      },
      length: {
        min: 2
      }
    },
    score: {
      presence: {
        presence: true,
        message: '^Levels score is required.'
      },
      numericality: true
    },
    criteria: {
      presence: {
        presence: true,
        message: '^Levels criteria is required.'
      },
      isValidArray: 'Check if array'
    }
  };
  var err = [];
  lodash.each(levels, function(v){
    if (validate(v, constraint)) {
      err.push(v);
    }
  });
  return lodash.isEmpty(err) ? true : false;
};

// end assessmentTemplates helper

var assesmentTemplatesSchema = new Schema({
  cloudantId: {
    type: String
  },
  version: {
    type: String
  },
  effectiveDate: {
    type: Date,
    required: [true, 'effectiveDate is required.']
  },
  status: {
    type: String,
    enum: ['inactive','active'],
    required: [true, 'status is required.']
  },
  components: {
    type: Array,
    required: [true, 'components is required.']
  }
});

var AssesmentTemplates = mongoose.model('assesmentTemplates', assesmentTemplatesSchema);

module.exports.create = function(templateData){
  return new Promise(function(resolve, reject) {
    var components = templateData['components'];
    if (lodash.isEmpty(components)) {
      var msg = 'Assessment template components is required';
      loggers.get('models').error('Error: ' + msg);
      return reject(msg);
    } else {
      if (validateComponents(components)) {
        var msg = 'Assessment template components is invalid';
        loggers.get('models').error('Error: ' + msg);
        return reject(msg);
      } else if (validateComponentsPrinciples(components['principles'])) {
        var msg = 'Assessment template components principles is invalid';
        loggers.get('models').error('Error: ' + msg);
        return reject(msg);
      } else if (validatePrinciplesPractices(components['principles']['practices'])) {
        var msg = 'Assessment template components principles practices is invalid';
        loggers.get('models').error('Error: ' + msg);
        return reject(msg);
      } else if (validatePracticesLevels(components['principles']['practices']['levels'])) {
        var msg = 'Assessment template components principles practices levels is invalid';
        loggers.get('models').error('Error: ' + msg);
        return reject(msg);
      } else {
        var templateData = new AssesmentTemplates(templateData);
        return resolve(templateData.save());
      }
    }
  });
};

module.exports.get = function(templateId, status) {
  return new Promise(function(resolve, reject) {
    if (!lodash.isEmpty(templateId)) {
      AssesmentTemplates.find({'_id': templateId})
      .then(function(result) {
        return resolve(result);
      })
      .catch( /* istanbul ignore next */ function(err) {
        /* cannot simulate MongoDB error during testing */
        loggers.get('models').error('Error: ' + err.error);
        return reject(err);
      });
    } else {
      if (lodash.isEmpty(status))
        var q = {};
      else
        var q = {status:status};

      AssesmentTemplates.find(q)
      .then(function(result) {
        return resolve(result);
      })
      .catch( /* istanbul ignore next */ function(err) {
        /* cannot simulate MongoDB error during testing */
        loggers.get('models').error('Error: ' + err.error);
        return reject(err);
      });
    }
  });
};

module.exports.update = function(templateId, templateData) {
  return new Promise(function(resolve, reject) {
    if (lodash.isEmpty(templateId)) {
      var msg = 'Assessment template id is required';
      loggers.get('models').error('Error: ' + msg);
      return reject(msg);
    } else {
      var components = templateData['components'];
      if (lodash.isEmpty(components)) {
        var msg = 'Assessment template components is required';
        loggers.get('models').error('Error: ' + msg);
        return reject(msg);
      } else {
        if (validateComponents(components)) {
          var msg = 'Assessment template components is invalid';
          loggers.get('models').error('Error: ' + msg);
          return reject(msg);
        } else if (validateComponentsPrinciples(components['principles'])) {
          var msg = 'Assessment template components principles is invalid';
          loggers.get('models').error('Error: ' + msg);
          return reject(msg);
        } else {
          Assessment.findOneAndUpdate({'_id' :  templateId}, templateData)
          .then(function(result) {
            return resolve(result);
          })
          .catch( /* istanbul ignore next */ function(err) {
            /* cannot simulate MongoDB error during testing */
            loggers.get('models').error('Error: ' + err.error);
            return reject(err);
          });
        }
      }
    }
  });
};
