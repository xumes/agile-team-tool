var settings = require('../../settings');
 		
module.exports = function(app, includes) {
  var middleware  = includes.middleware;
  var render = includes.render;

  showTeamManagement = function(req, res) {
    var json = 
      {
        'pageTitle'       : 'Team Management',
        'user'            : req.session['user'],
        'allTeams'        : req.session['allTeams'],
        'allTeamsLookup'  : req.session['allTeamsLookup'],
        'myTeams'         : req.session['myTeams'],
        'systemAdmin'     : req.session['systemAdmin'],
        'systemStatus'    : req.session['systemStatus'],
        'memberRoles'     : req.session['memberRoles'],
        'environment'     : settings.environment,
        'prefix'          : settings.prefixes.team,
        'userTeamList'    : req.userTeamList
      };
    render(req, res, 'team', json);
  };
  
  app.get('/team', 
    [
      includes.middleware.auth.requireLoginWithRedirect,
      includes.middleware.cache.setTeamCache,
      includes.middleware.cache.setUserTeams
    ], showTeamManagement);
};