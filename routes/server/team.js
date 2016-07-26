 		
module.exports = function(app, includes) {
  var middleware  = includes.middleware;
  var render = includes.render;

  showTeamManagement = function(req, res) {
    var json = {"pageTitle":"Team Management", "user": req.session["user"], "environment": req.session["environment"]};
    render(req, res, 'team', json);
  };
  
  app.get("/team", [includes.middleware.auth.requireLoginWithRedirect], showTeamManagement);
};