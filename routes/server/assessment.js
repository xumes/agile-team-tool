var settings = require('../../settings');

module.exports = function(app, includes) {
  var middleware = includes.middleware;
  var render = includes.render;

  showAssessment = function(req, res) {
    var json = {
      'pageTitle': 'Maturity Assessment',
      'googleAnalyticsKey': settings.googleAnalyticsKey,
      'ibmNPSKey': settings.ibmNPSKey,
      'environment': settings.environment
    };
    render(req, res, 'assessment', json);
  };

  app.get('/assessment', includes.middleware.auth.requireLoginWithRedirect, showAssessment);

  // reactjs
  app.get('/_v2_assessment', includes.middleware.auth.requireLoginWithRedirect, function(req, res) {
    var json = {
      'pageTitle': 'Maturity Assessment',
      'googleAnalyticsKey': settings.googleAnalyticsKey,
      'ibmNPSKey': settings.ibmNPSKey,
      'environment': settings.environment
    };
    render(req, res, 'v2_assessment', json);
  });
};
