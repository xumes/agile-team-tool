
module.exports = function(app, includes) {
  var render = includes.render;

  showHome = function(req, res) {
    json= {"pageTitle": "Home"}
    render(req, res, 'index', json);
  };
  
  app.get("/", [includes.middleware.auth.requireLoginWithRedirect], showHome);
};