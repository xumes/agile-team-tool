var lodash = require('lodash');
var Promise = require('bluebird');
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var config = require('../settings');
mongoose.createConnection(config.mongoURL);
var loggers = require('../middleware/logger');
var Schema   = mongoose.Schema;
var lodash = require('lodash');

var componentsPrinciplesPracticesLevelsSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Level name is required']
  },
  score: {
    type: Number,
    required: [true, 'Level score is required']
  },
  criteria: {
    type: Array,
    required: [true, 'Level criteria is required']
  }
});

var  componentsPrinciplesPracticesSchema = new Schema({
  id: {
    type: Number,
    required: [true, 'Practices ID is required']
  },
  name: {
    type: String,
    required: [true, 'Practices name is required']
  },
  description: {},
  levels: {
    type: [componentsPrinciplesPracticesLevelsSchema],
    required: true
  }
});

var componentsPrinciplesSchema = new Schema({
  id: {
    type: Number,
    required: [true, 'Principle ID is required']
  },
  name: {
    type: String,
    required: [true, 'Component name is required']
  },
  practices: {
    type: [componentsPrinciplesPracticesSchema],
    required: true
  }
});

var componentsSchema = new Schema({
  name : {
    type: String,
    required: [true, 'Component name is required']
  },
  principles : {
    type: [componentsPrinciplesSchema],
    required: true
  }
});

var AssessmentTemplatesSchema = new Schema({
  cloudantId: {
    type: String,
  },
  version: {
    type: String
  },
  effectiveDate: {
    type: Date
    //required: [true, 'effectiveDate is required.']
  },
  status: {
    type: String,
    enum: ['inactive','active'],
    default: 'inactive',
    required: [true, 'status is required.']
  },
  components: {
    type: [componentsSchema],
    required: true
  }
}, {collection: 'assessmentTemplates'});

var AssessmentTemplates = mongoose.model('assessmentTemplates', AssessmentTemplatesSchema);

module.exports.create = function(templateData){
  return new Promise(function(resolve, reject) {
    if (lodash.isEmpty(templateData)) {
      var msg = 'Assessment template data is required';
      msg = {'error':msg};
      loggers.get('models').error('Error: ' + msg);
      return reject(msg);
    } else {
      var newTemplateData = new AssessmentTemplates(templateData);
      newTemplateData.save()
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

module.exports.get = function(templateId, status) {
  return new Promise(function(resolve, reject) {
    if (!lodash.isEmpty(templateId)) {
      AssessmentTemplates.findOne({'_id': templateId})
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
        var q = {'status':status};
      AssessmentTemplates.find(q)
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

module.exports.getTemplateByVersion = function(version) {
  return new Promise(function(resolve, reject) {
    if (!lodash.isEmpty(version)) {
      AssessmentTemplates.findOne({'cloudantId': version})
      .then(function(result) {
        return resolve(result);
      })
      .catch( /* istanbul ignore next */ function(err) {
        /* cannot simulate MongoDB error during testing */
        loggers.get('models').error('Error: ' + err.error);
        return reject(err);
      });
    } else {
      return reject({'error': 'Version number cannot be empty.'});
    }
  });
};

module.exports.update = function(templateId, templateData) {
  return new Promise(function(resolve, reject) {
    if (lodash.isEmpty(templateId)) {
      var msg = 'Assessment template id is required';
      msg={'error':msg};
      loggers.get('models').error('Error: ' + msg);
      return reject(msg);
    } else {
      AssessmentTemplates.findOneAndUpdate({'_id' :  templateId}, templateData, {'new':true})
        .then(function(result) {
          resolve(result);
        })
        .catch( /* istanbul ignore next */ function(err) {
          /* cannot simulate MongoDB error during testing */
          return reject(err);
        });
    }
  });
};

module.exports.delete = function(templateId) {
  return new Promise(function(resolve, reject) {
    if (lodash.isEmpty(templateId)) {
      var msg = 'Assessment template id is required';
      msg={'error':msg};
      loggers.get('models').error('Error: ' + msg);
      return reject(msg);
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

module.exports.deleteByCloudantId = /* istanbul ignore next */ function(cloudantId) {
  return new Promise(function(resolve, reject) {
    if (lodash.isEmpty(cloudantId)) {
      var msg = 'Assessment template cloudantId is required';
      msg={'error':msg};
      loggers.get('models').error('Error: ' + msg);
      return reject(msg);
    } else {
      AssessmentTemplates.remove({'cloudantId': cloudantId})
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
