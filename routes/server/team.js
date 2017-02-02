'use strict';
var settings = require('../../settings');

module.exports = function(app, includes) {
  var middleware = includes.middleware;
  var render = includes.render;
  var json = {
    'pageTitle': 'Team Management',
    'googleAnalyticsKey': settings.googleAnalyticsKey,
    'ibmNPSKey': settings.ibmNPSKey,
    'environment': settings.environment,
    'sentryPublicDSN': settings.sentry.publicDSN
  };

  app.get(['/team'], includes.middleware.auth.requireLoginWithRedirect, function(req, res) {
    render(req, res, 'v2_team', json);
  });
};
