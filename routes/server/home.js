var settings = require('../../settings');

module.exports = function(app, includes) {
  var render = includes.render;

  showHome = function(req, res) {
    var json = {
      'pageTitle': 'Home',
      'googleAnalyticsKey': settings.googleAnalyticsKey,
      'ibmNPSKey': settings.ibmNPSKey,
      'environment': settings.environment
    };
    render(req, res, 'home', json);
  };

  app.get('/cio/dashboard', function(req, res) {
    res.redirect('/');
  });
  app.get('/', includes.middleware.auth.requireLoginWithRedirect, showHome);
};
