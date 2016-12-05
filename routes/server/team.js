var settings = require('../../settings');

module.exports = function(app, includes) {
  var middleware = includes.middleware;
  var render = includes.render;
  var json = {
    'pageTitle': 'Team Management',
    'googleAnalyticsKey': settings.googleAnalyticsKey,
    'ibmNPSKey': settings.ibmNPSKey,
    'environment': settings.environment
  };

  showTeamManagement = function(req, res) {
    render(req, res, 'team', json);
  };

  showTeamManagementReact = function(req, res) {
    render(req, res, 'v2_team', json);
  };

  app.get('/team', includes.middleware.auth.requireLoginWithRedirect, function(req, res) {
    if (settings.mongoURL == undefined || _.isEmpty(settings.mongoURL))
      showTeamManagement(req, res);
    else
      showTeamManagementReact(req, res);
  });

  app.get('/_v2_team', includes.middleware.auth.requireLoginWithRedirect, function(req, res) {
    render(req, res, 'v2_team', json);
  });

};
