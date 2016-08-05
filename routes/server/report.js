 		
module.exports = function(app, includes) {
  var middleware  = includes.middleware;
  var render = includes.render;

  showReport = function(req, res) {
    json= {"pageTitle":"Reporting", "user": req.session["user"], "environment": req.session["environment"]};
    render(req, res, 'report', json);
  };
  
  app.get("/report",  
    [
      includes.middleware.auth.requireLoginWithRedirect,
      includes.middleware.cache.setSystemInfoCache
    ], showReport);
};