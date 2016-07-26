 		
module.exports = function(app, includes) {
  var middleware  = includes.middleware;
  var render = includes.render;

  showHelp = function(req, res) {
    json= {"pageTitle":"Help", "user": req.session["user"], "environment": req.session["environment"]};
    render(req, res, 'help', json);
  };
  
  app.get("/help", [includes.middleware.auth.requireLoginWithRedirect], showHelp);
};