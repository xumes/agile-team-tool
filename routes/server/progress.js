var settings = require('../../settings');

module.exports = function(app, includes) {
  var middleware = includes.middleware;
  var render = includes.render;
  var json = {
    'pageTitle': 'Maturity Assessment',
    'googleAnalyticsKey': settings.googleAnalyticsKey,
    'ibmNPSKey': settings.ibmNPSKey,
    'environment': settings.environment
  };

  showAssessmentProgress = function(req, res) {
    render(req, res, 'progress', json);
  };

  showAssessmentProgressReact = function(req, res) {
    render(req, res, 'v2_progress', json);
  };

  app.get('/progress', includes.middleware.auth.requireLoginWithRedirect, function(req, res) {
    if (settings.mongoURL == undefined || _.isEmpty(settings.mongoURL))
      showAssessmentProgress(req, res);
    else
      showAssessmentProgressReact(req, res);
  });
};
