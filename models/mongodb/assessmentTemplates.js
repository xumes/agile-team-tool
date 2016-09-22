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

validateComponents = function(components, componentsConstraint){
  return null;
};

validateComponentsPrinciples = function(principles, componentsPrincipleConstraint){
  return null;
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
