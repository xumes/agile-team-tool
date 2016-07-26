
module.exports = function(app, includes) {
  var render = includes.render;

  var showIteration = function(req, res) {
    var json = {"pageTitle":"Iteration Management", "user": req.session["user"], "environment": req.session["environment"]};
    render(req, res, 'iteration', json);
  };

  app.get("/iteration", [includes.middleware.auth.requireLoginWithRedirect], showIteration);
};