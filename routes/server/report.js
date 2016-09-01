module.exports = function(app, includes) {
  var middleware  = includes.middleware;
  var render = includes.render;

  showReport = function(req, res) {
    var json = 
      {
        'pageTitle'       : 'Report'
      };
    render(req, res, 'report', json);
  };
  
  app.get("/report", includes.middleware.auth.requireLoginWithRedirect, showReport);
};