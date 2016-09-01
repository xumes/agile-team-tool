module.exports = function(app, includes) {
  var middleware  = includes.middleware;
  var render = includes.render;

  showHelp = function(req, res) {
    var json = 
      {
        'pageTitle'       : 'Help',
        'user'            : req.session['user'],
        'allTeams'        : req.session['allTeams'],
        'allTeamsLookup'  : req.session['allTeamsLookup'],
        'myTeams'         : req.session['myTeams'],
        'systemAdmin'     : req.session['systemAdmin'],
        'systemStatus'    : req.session['systemStatus'],
        'environment'     : settings.environment,
        'googleAnalyticsKey' : settings.googleAnalyticsKey
      };
    render(req, res, 'help', json);
  };
  
  app.get('/help', includes.middleware.auth.requireLoginWithRedirect, showHelp);
};