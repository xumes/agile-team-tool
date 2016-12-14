var settings = require('../../settings');

module.exports = function(app, includes) {
  var middleware = includes.middleware;
  var render = includes.render;
  var json = {
    'pageTitle': 'Report',
    'googleAnalyticsKey': settings.googleAnalyticsKey,
    'ibmNPSKey': settings.ibmNPSKey,
    'environment': settings.environment
  };

  showReport = function(req, res) {
    render(req, res, 'report', json);
  };

  app.get('/report', includes.middleware.auth.requireLoginWithRedirect, showReport);
};
