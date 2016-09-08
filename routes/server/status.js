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

  showSSOLogoutPage = function(req, res) {
    var json = {
      'pageTitle': 'Logout',
      'googleAnalyticsKey': settings.googleAnalyticsKey,
      'message': 'You have succesfully logged out, please close this browser window.'
    };
    render(req, res, 'status', json);
  };

  app.get('/ssologout', showSSOLogoutPage);
};