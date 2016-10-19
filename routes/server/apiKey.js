var settings = require('../../settings');

module.exports = function(app, includes) {
  var middleware = includes.middleware;
  var render = includes.render;

  showApiKey = function(req, res) {
    var json = {
      'pageTitle': 'API Key',
      'googleAnalyticsKey': settings.googleAnalyticsKey
    };
    render(req, res, 'apiKey', json);
  };

  app.get('/apiKey', includes.middleware.auth.requireLoginWithRedirect, showApiKey);
};
