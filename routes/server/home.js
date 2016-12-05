var settings = require('../../settings');

module.exports = function(app, includes) {
  var render = includes.render;
  var json = {
    'pageTitle': 'Home',
    'googleAnalyticsKey': settings.googleAnalyticsKey,
    'ibmNPSKey': settings.ibmNPSKey,
    'environment': settings.environment
  };

  showHome = function(req, res) {
    render(req, res, 'home', json);
  };

  showMongoHome = function(req, res) {
    render(req, res, 'v2_home', json);
  };

  app.get('/', includes.middleware.auth.requireLoginWithRedirect, function(req, res) {
    json['user'] = req.session.user;
    if (settings.mongoURL == undefined || _.isEmpty(settings.mongoURL))
      showHome(req, res);
    else
      showMongoHome(req, res);
  });

  app.get('/cio/dashboard', function(req, res) {
    res.redirect('/');
  });

  app.get('/home', function(req, res) {
    res.redirect('/');
  });

  app.get('/_v2_home', includes.middleware.auth.requireLoginWithRedirect, showMongoHome);
};
