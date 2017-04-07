'use strict';
var settings = require('../../settings');

module.exports = function(app, includes) {
  var render = includes.render;
  var json = {
    'pageTitle': 'Home',
    'googleAnalyticsKey': settings.googleAnalyticsKey,
    'ibmNPS': settings.ibmNPS,
    'environment': settings.environment,
    'sentryPublicDSN': settings.sentry.publicDSN,
    'uiReleaseDate': settings.uiReleaseDate
  };

  app.get(['/', '/home'], includes.middleware.auth.requireLoginWithRedirect, function(req, res) {
    render(req, res, 'app', json);
  });
};
