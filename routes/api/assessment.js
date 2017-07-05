var assessmentModel = require('../../models/assessments');
var assessmentTemplateModel = require('../../models/assessmentTemplates');
var teamModel = require('../../models/teams');

var _ = require('underscore');

module.exports = function(app, includes) {
  var middleware = includes.middleware;

  getAssessment = function(req, res) {
    var teamId = req.query.teamId; // this will be document id
    var assessmentId = req.query.assessId;
    if (!_.isUndefined(teamId)) {
      assessmentModel.getTeamAssessments(teamId)
        .then(function(result) {
          res.send(result);
        })
        .catch( /* istanbul ignore next */ function(err) {
          /* cannot simulate Cloudant error during testing */
          res.status(400).send(err);
        });
    } else {
      assessmentModel.getAssessment(assessmentId)
        .then(function(result) {
          res.send(result);
        })
        .catch(function(err) {
          res.status(400).send(err);
        });
    }
  };

  getAssessmentTemplate = function(req, res) {
    var templateId = req.query.templateId;
    var status = req.query.status;
    assessmentTemplateModel.get(templateId, status)
      .then(function(result) {
        res.send(result);
      })
      .catch( /* istanbul ignore next */ function(err) {
        /* cannot simulate Cloudant error during testing */
        res.status(400).send(err);
      });
  };

  getTemplateByVersion = function(req, res) {
    var version = req.params.version;
    assessmentTemplateModel.getTemplateByVersion(version)
      .then(function(result) {
        res.status(200).send(result);
      })
      .catch( /* istanbul ignore next */ function(err) {
        /* cannot simulate Cloudant error during testing */
        res.status(400).send(err);
      });
  };

  addAssessment = function(req, res) {
    assessmentModel.addTeamAssessment(req.session['user'], req.body)
      .then(function(result) {
        res.send(result);
      })
      .catch(function(err) {
        res.status(400).send(err);
      });
  };

  updateAssessment = function(req, res) {
    assessmentModel.updateTeamAssessment(req.session['user'], req.body)
      .then(function(result) {
        res.send(result);
      })
      .catch(function(err) {
        console.log(err);
        res.status(400).send(err);
      });
  };

  deleteAssessment = function(req, res) {
    var docId = req.body.docId;
    var userId = req.session['user']['ldap']['uid'].toUpperCase();
    assessmentModel.deleteAssessment(userId, docId)
      .then(function(result) {
        res.send(result);
      })
      .catch(function(err) {
        res.status(400).send(err);
      });
  };
  app.get('/api/assessment/view', [includes.middleware.auth.requireLogin], getAssessment);
  app.get('/api/assessment/trend', getAssessment);
  app.get('/api/assessment/template', [includes.middleware.auth.requireLogin], getAssessmentTemplate);
  app.get('/api/assessment/template/version/:version', [includes.middleware.auth.requireLogin], getTemplateByVersion);
  app.put('/api/assessment', [includes.middleware.auth.requireLogin], updateAssessment);
  app.delete('/api/assessment', [includes.middleware.auth.requireLogin], deleteAssessment);
  app.post('/api/assessment', [includes.middleware.auth.requireLogin], addAssessment);
};
