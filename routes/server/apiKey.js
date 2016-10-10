var settings = require('../../settings');

module.exports = function(app, includes) {
  var middleware = includes.middleware;
  var render = includes.render;

  /* instabul ingore next */
  showApiKey = function(req, res) {
    var json = {
      'pageTitle': 'API Key',
      'googleAnalyticsKey': settings.googleAnalyticsKey
    };
    render(req, res, 'apiKey', json);
  };

  /* instabul ingore next */
  app.get('/apiKey', includes.middleware.auth.requireLoginWithRedirect, showApiKey);
};
