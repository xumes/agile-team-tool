var settings = require('../../settings');

module.exports = function(app, includes) {
  var middleware = includes.middleware;
  var render = includes.render;

  showTeamManagement = function(req, res) {
    var json = {
      'pageTitle': 'Team Management',
      'googleAnalyticsKey': settings.googleAnalyticsKey,
      'ibmNPSKey': settings.ibmNPSKey,
      'environment': settings.environment
    };
    render(req, res, 'team', json);
  };

  app.get('/team', includes.middleware.auth.requireLoginWithRedirect, showTeamManagement);
};
