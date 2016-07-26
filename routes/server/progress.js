 		
module.exports = function(app, includes) {
  var middleware  = includes.middleware;
  var render = includes.render;

  showAssessmentProgress = function(req, res) {
    json= {"pageTitle":"Maturity Assessment", "user": req.session["user"], "environment": req.session["environment"]};
    render(req, res, 'progress', json);
  };
  
  app.get("/progress", [includes.middleware.auth.requireLoginWithRedirect], showAssessmentProgress);
};