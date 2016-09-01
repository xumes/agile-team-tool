var settings = require('../../settings');

module.exports = function(app, includes) {
  var middleware  = includes.middleware;
  var render = includes.render;

  showAssessment = function(req, res) {
    var json = 
      {
        'pageTitle'       : 'Maturity Assessment',
        'prefix'          : settings.prefixes.assessment,
        'user'            : req.session['user'],
        'allTeams'        : [],
        'allTeamsLookup'  : [],
        'myTeams'         : [],
        'systemAdmin'     : req.session['systemAdmin'],
        'systemStatus'    : req.session['systemStatus'],
        'environment'     : settings.environment,
        'prefix'          : settings.prefixes.assessment,
        'squadTeams'      : req.squadTeams,
        'userTeamList'    : req.userTeamList,
        'googleAnalyticsKey' : settings.googleAnalyticsKey
      };
    render(req, res, 'assessment', json);
  };
  
  app.get('/assessment', includes.middleware.auth.requireLoginWithRedirect, showAssessment);
};