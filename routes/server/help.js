var settings = require('../../settings');

module.exports = function(app, includes) {
  var middleware = includes.middleware;
  var render = includes.render;

  showHelp = function(req, res) {
    var json = {
      'pageTitle': 'Help',
      'googleAnalyticsKey': settings.googleAnalyticsKey,
      'ibmNPSKey': settings.ibmNPSKey,
      'environment': settings.environment
    };
    render(req, res, 'help', json);
  };

  app.get('/help', includes.middleware.auth.requireLoginWithRedirect, showHelp);
};
