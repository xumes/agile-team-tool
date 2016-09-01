var settings = require('../../settings');

module.exports = function(app, includes) {
  var middleware  = includes.middleware;
  var render = includes.render;

  showReport = function(req, res) {
    var json = 
      {
        'pageTitle'       : 'Report',
        'user'            : req.session['user'],
        'allTeams'        : req.session['allTeams'],
        'allTeamsLookup'  : req.session['allTeamsLookup'],
        'myTeams'         : req.session['myTeams'],
        'systemAdmin'     : req.session['systemAdmin'],
        'systemStatus'    : req.session['systemStatus'],
        'environment'     : settings.environment,
        'prefix'          : settings.prefixes.assessment,
        'userTeams'       : req.userTeams,
        'googleAnalyticsKey' : settings.googleAnalyticsKey
      };
    render(req, res, 'report', json);
  };
  
  app.get("/report", includes.middleware.auth.requireLoginWithRedirect, showReport);
};