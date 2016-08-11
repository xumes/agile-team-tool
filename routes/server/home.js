var settings  = require('../../settings');
var _         = require('underscore');

module.exports = function(app, includes) {
  var render = includes.render;

  showHome = function(req, res) {
    var json = 
      {
        'pageTitle'       : 'Home',
        'user'            : req.session['user'],
        'allTeams'        : req.session['allTeams'],
        'allTeamsLookup'  : req.session['allTeamsLookup'],
        'myTeams'         : req.session['myTeams'],
        'systemAdmin'     : req.session['systemAdmin'],
        'systemStatus'    : req.session['systemStatus'],
        'environment'     : settings.environment
      };
    render(req, res, 'home', json);
  };
  
  app.get('/', 
    [
      includes.middleware.auth.requireLoginWithRedirect,
      includes.middleware.cache.setHomeCache
    ], showHome);
};