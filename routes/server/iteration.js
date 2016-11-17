var settings = require('../../settings');

module.exports = function(app, includes) {
  var render = includes.render;

  var showIteration = function(req, res) {
    var json = {
      'pageTitle': 'Iteration Management',
      'googleAnalyticsKey': settings.googleAnalyticsKey,
      'ibmNPSKey': settings.ibmNPSKey,
      'environment': settings.environment
    };
    render(req, res, 'iteration', json);
  };

  app.get('/iteration', includes.middleware.auth.requireLoginWithRedirect, showIteration);

  app.get('/_v2_iteration', includes.middleware.auth.requireLoginWithRedirect, function(req, res) {
    var json = {
      'pageTitle': 'Iteration Management',
      'googleAnalyticsKey': settings.googleAnalyticsKey,
      'ibmNPSKey': settings.ibmNPSKey,
      'environment': settings.environment
    };
    render(req, res, 'v2_iteration', json);
  });
};
