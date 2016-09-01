module.exports = function(app, includes) {
  var middleware  = includes.middleware;
  var render = includes.render;

  showTeamManagement = function(req, res) {
    var json = 
      {
        'pageTitle'       : 'Team Management'
      };
    render(req, res, 'team', json);
  };
  
  app.get('/team', includes.middleware.auth.requireLoginWithRedirect, showTeamManagement);
};