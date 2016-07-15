
module.exports = function(app, includes) {
  var render = includes.render;

  showLogin = function(req, res) {
    json= {
      "pageTitle": "Login",
      "action": "/auth"
    }
    render(req, res, 'login', json);
  };

  app.get("/login", [includes.middleware.auth.requireLoggedOut], showLogin);
};