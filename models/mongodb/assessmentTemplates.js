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
  return lodash.isEmpty(err) ? null : true;
};

validateComponentsPrinciples = function(components){
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
  lodash.each(components, function(v){
    lodash.each(v, function(p){
      console.log('p: ', validate(p, constraint));
      if (validate(p, constraint)) {
        err.push(p);
      }
    });
  });
  return lodash.isEmpty(err) ? null : true;
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
  return lodash.isEmpty(err) ? null : true;
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
  return lodash.isEmpty(err) ? null : true;
};

checkComponents = function(templateData) {
  return new Promise(function(resolve, reject) {
    var components = typeof templateData['components'] != 'undefined' ? templateData['components'] : null;
    if (lodash.isEmpty(components)) {
      var msg = 'Assessment template components is required';
      loggers.get('models').error('Error: ' + msg);
      return reject(msg);
    } else {
      //console.log(JSON.stringify(components, null, 4));
      if (validateComponents(components)) {
        console.log('line 172');
        var msg = 'Assessment template components is invalid';
        loggers.get('models').error('Error: ' + msg);
        return reject(msg);
      } else if (validateComponentsPrinciples(components['components'])) {
        console.log('line 177');
        var msg = 'Assessment template components principles is invalid';
        loggers.get('models').error('Error: ' + msg);
        return reject(msg);
      } else if (validatePrinciplesPractices(components['components'])) {
        console.log('line 182');
        var msg = 'Assessment template components principles practices is invalid';
        loggers.get('models').error('Error: ' + msg);
        return reject(msg);
      } else if (validatePracticesLevels(components['components'])) {
        console.log('line 187');
        var msg = 'Assessment template components principles practices levels is invalid';
        loggers.get('models').error('Error: ' + msg);
        return reject(msg);
      } else {
        return resolve(true);
      }
    }
  });
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
    if (lodash.isEmpty(templateData)) {
      var msg = 'Assessment template data is required';
      loggers.get('models').error('Error: ' + msg);
      return reject(msg);
    } else {
      var components = typeof templateData['components'] != 'undefined' ? templateData['components'] : null;
      return checkComponents(templateData)
      .then(function(){
        var templateData = new AssesmentTemplates(templateData);
        return resolve(templateData.save());
      })
      .catch(function(err) {
        return reject(err);
      });
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
      var components = typeof templateData['components'] != 'undefined' ? templateData['components'] : null;
      checkComponents(templateData)
      .then(function(){
        return AssessmentTemplates.findOneAndUpdate({'_id' :  templateId}, templateData);
      })
      .catch(function(err) {
        return reject(err);
      });
    }
  });
};

module.exports.delete = function(templateId) {
  return new Promise(function(resolve, reject) {
    if (lodash.isEmpty(templateId)) {
      var msg = 'Template ID is required';
      return reject(formatErrMsg(msg));
    } else {
      AssessmentTemplates.remove({'_id': templateId})
        .then(function(body) {
          return resolve(body);
        })
        .catch( /* istanbul ignore next */ function(err) {
          /* cannot simulate MongoDB error during testing */
          var msg = err.message;
          return reject(formatErrMsg(msg));
        });
    }
  });
};
