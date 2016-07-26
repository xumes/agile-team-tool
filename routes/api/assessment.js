var assessmentModel = require('../../models/assessment');
var _ = require('underscore');

module.exports = function(app, includes) {
  var middleware  = includes.middleware;

  getAssessment = function(req, res) {
    var teamId = req.query.teamId;
    var assessId = req.query.assessId;
    if (!_.isUndefined(teamId)){
      assessmentModel.getTeamAssessments(teamId)
      .then(function(result){
        res.send(result);
      })
      .catch(function(err){
        res.status(400).send(err);
      });
    }
    else{
      assessmentModel.getAssessment(assessId)
        .then(function(result){
          res.send(result);
        })
        .catch(function(err){
          res.status(400).send(err);
        });
    }
  };
  
  getAssessmentTemplate = function(req, res) {
    assessmentModel.getAssessmentTemplate()
      .then(function(result){
        res.send(result);
      })
      .catch(function(err){
        res.status(400).send(err);
      });
  };
  
  addAssessment = function(req, res) {
    assessmentModel.addTeamAssessment(req.body)
      .then(function(result){
        res.send(result);
      })
      .catch(function(err){
        res.status(400).send(err);
      });
  };
  
  updateAssessment = function(req, res) {
    assessmentModel.updateTeamAssessment(req.body)
      .then(function(result){
        res.send(result);
      })
      .catch(function(err){
        res.status(400).send(err);
      });
  };
  
  deleteAssessment = function(req, res) {
    var docId = req.query.docId;
    var revId = req.query.revId;
    assessmentModel.deleteAssessment(docId, revId)
      .then(function(result){
        res.send(result);
      })
      .catch(function(err){
        res.status(400).send(err);
      });
  };
  app.get('/api/assessment/view', [includes.middleware.auth.requireLogin], getAssessment);
  app.get('/api/assessment/template', [includes.middleware.auth.requireLogin], getAssessmentTemplate);
  app.put('/api/assessment', [includes.middleware.auth.requireLogin], updateAssessment);
  app.delete('/api/assessment', [includes.middleware.auth.requireLogin], deleteAssessment);
  app.post('/api/assessment', [includes.middleware.auth.requireLogin], addAssessment);  
};