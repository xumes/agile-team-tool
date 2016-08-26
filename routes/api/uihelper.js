var settings  = require('../../settings');

module.exports = function(app, includes) {
  var render = includes.render;

  getSessionVars = function(req, res) {
    var json = 
      {
        'user'            : req.session['user'],
        'allTeams'        : req.session['allTeams'],
        'allTeamsLookup'  : req.session['allTeamsLookup'],
        'myTeams'         : req.session['myTeams'],
        'memberRoles'     : req.session['memberRoles'],
        'systemAdmin'     : req.session['systemAdmin'],
        'systemStatus'    : req.session['systemStatus'],
        'environment'     : settings.environment
      };
    res.status(200).send(json);
  };

 app.get('/api/sessionvars', [includes.middleware.auth.requireLogin], getSessionVars);

};