'use strict';
var settings = require('../../settings');

module.exports = function(app, includes) {
  var render = includes.render;
  var json = {
    'pageTitle': 'Home',
    'googleAnalyticsKey': settings.googleAnalyticsKey,
    'ibmNPSKey': settings.ibmNPSKey,
    'environment': settings.environment,
    'sentryPublicDSN': settings.sentry.publicDSN
  };

  app.get(['/', '/home'], includes.middleware.auth.requireLoginWithRedirect, function(req, res) {
    json['user'] = req.session.user;
    render(req, res, 'v2_home', json);
  });
  app.get('/_v3_home', includes.middleware.auth.requireLoginWithRedirect, function(req, res) {
    json['user'] = req.session.user;
    render(req, res, 'v3_home', json);
  });
};
