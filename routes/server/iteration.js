var settings = require('../../settings');

module.exports = function(app, includes) {
  var render = includes.render;
  var json = {
    'pageTitle': 'Iteration Management',
    'googleAnalyticsKey': settings.googleAnalyticsKey,
    'ibmNPSKey': settings.ibmNPSKey,
    'environment': settings.environment
  };

  var showIteration = function(req, res) {
    render(req, res, 'iteration', json);
  };

  var showIterationReact = function(req, res) {
    render(req, res, 'v2_iteration', json);
  };

  app.get('/iteration', includes.middleware.auth.requireLoginWithRedirect, function(req, res) {
    if (settings.mongoURL == undefined || _.isEmpty(settings.mongoURL))
      showIteration(req, res);
    else
      showIterationReact(req, res);
  });

  app.get('/_v2_iteration', includes.middleware.auth.requireLoginWithRedirect, function(req, res) {
    render(req, res, 'v2_iteration', json);
  });
};
