var settings = require('../../settings');

module.exports = function(app, includes) {
  var render = includes.render;

  var showIteration = function(req, res) {
    var json = 
      {
        'pageTitle'       : 'Iteration Management',
        'prefix'          : settings.prefixes.iteration
        'user'            : req.session['user'],
        'allTeams'        : req.session['allTeams'],
        'allTeamsLookup'  : req.session['allTeamsLookup'],
        'myTeams'         : req.session['myTeams'],
        'systemAdmin'     : req.session['systemAdmin'],
        'systemStatus'    : req.session['systemStatus'],
        'environment'     : settings.environment,
        'prefix'          : settings.prefixes.iteration,
        'squadTeams'      : req.squadTeams,
        'userTeamList'    : req.userTeamList,
        'googleAnalyticsKey' : settings.googleAnalyticsKey
      };
    render(req, res, 'iteration', json);
  };

  app.get('/iteration', includes.middleware.auth.requireLoginWithRedirect, showIteration);
};