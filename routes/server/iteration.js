'use strict';
var settings = require('../../settings');

module.exports = function(app, includes) {
  var render = includes.render;
  var json = {
    'pageTitle': 'Iteration Management',
    'googleAnalyticsKey': settings.googleAnalyticsKey,
    'ibmNPSKey': settings.ibmNPSKey,
    'environment': settings.environment,
    'sentryPublicDSN': settings.sentry.publicDSN
  };

  app.get(['/iteration'], includes.middleware.auth.requireLoginWithRedirect, function(req, res) {
    render(req, res, 'v2_iteration', json);
  });
};
