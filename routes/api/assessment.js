const assessmentModel = require('../../models/assessments');
const assessmentTemplateModel = require('../../models/assessmentTemplates');
const _ = require('underscore');

module.exports = (app, includes) => {
  const getAssessment = (req, res) => {
    const teamId = req.query.teamId; // this will be document id
    const assessmentId = req.query.assessId;
    if (!_.isUndefined(teamId)) {
      assessmentModel.getTeamAssessments(teamId)
        .then((result) => {
          res.send(result);
        })
        .catch(/* istanbul ignore next */ (err) => {
          /* cannot simulate Mongo error during testing */
          res.status(400).send(err);
        });
    } else {
      assessmentModel.getAssessment(assessmentId)
        .then((result) => {
          res.send(result);
        })
        .catch((err) => {
          res.status(400).send(err);
        });
    }
  };

  const getAssessmentTemplate = (req, res) => {
    const templateId = req.query.templateId;
    const status = req.query.status;
    assessmentTemplateModel.get(templateId, status)
      .then((result) => {
        res.send(result);
      })
      .catch(/* istanbul ignore next */ (err) => {
        /* cannot simulate Mongo error during testing */
        res.status(400).send(err);
      });
  };

  const getTemplateByVersion = (req, res) => {
    const version = req.params.version;
    assessmentTemplateModel.getTemplateByVersion(version)
      .then((result) => {
        res.status(200).send(result);
      })
      .catch(/* istanbul ignore next */ (err) => {
        /* cannot simulate Mongo error during testing */
        res.status(400).send(err);
      });
  };

  const addAssessment = (req, res) => {
    assessmentModel.addTeamAssessment(req.session.user, req.body)
      .then((result) => {
        res.send(result);
      })
      .catch((err) => {
        res.status(400).send(err);
      });
  };

  const updateAssessment = (req, res) => {
    assessmentModel.updateTeamAssessment(req.session.user, req.body)
      .then((result) => {
        res.send(result);
      })
      .catch((err) => {
        console.log(err);
        res.status(400).send(err);
      });
  };

  const deleteAssessment = (req, res) => {
    const docId = req.body.docId;
    const userId = req.session.user.ldap.uid.toUpperCase();
    assessmentModel.deleteAssessment(userId, docId)
      .then((result) => {
        res.send(result);
      })
      .catch((err) => {
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
