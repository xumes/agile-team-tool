
module.exports = function(app, includes) {
  var render = includes.render;

  showHome = function(req, res) {
    json= {"pageTitle":"Home", "user": req.session["user"], "environment": req.session["environment"]};
    render(req, res, 'index', json);
  };
  
  app.get("/", [includes.middleware.auth.requireLoginWithRedirect], showHome);
};