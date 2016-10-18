var settings = require('../../settings');

module.exports = function(app, includes) {
  var render = includes.render;

  showHome = function(req, res) {
    var json = {
      'pageTitle': 'Home',
      'googleAnalyticsKey': settings.googleAnalyticsKey
    };
    render(req, res, 'home', json);
  };

  app.get('/cio/dashboard', function(req, res) {
    res.redirect('/');
  });
  app.get('/', includes.middleware.auth.requireLoginWithRedirect, showHome);
  app.get('/_v2_home', includes.middleware.auth.requireLoginWithRedirect, function(req, res) {
    var json = {
      'pageTitle': 'Home',
      'googleAnalyticsKey': settings.googleAnalyticsKey,
      'user': req.session.user
    };
    render(req, res, 'v2_home', json);
  });
};
