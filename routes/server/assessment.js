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

  showAssessment = function(req, res) {
    render(req, res, 'assessment', json);
  };

  showAssessmentReact = function(req, res) {
    render(req, res, 'v2_assessment', json);
  };

  app.get('/assessment', includes.middleware.auth.requireLoginWithRedirect, function(req, res) {
    if (settings.mongoURL == undefined || _.isEmpty(settings.mongoURL))
      showAssessment(req, res);
    else
      showAssessmentReact(req, res);
  });

  app.get('/_v2_assessment', includes.middleware.auth.requireLoginWithRedirect, function(req, res) {
    render(req, res, 'v2_assessment', json);
  });
};
