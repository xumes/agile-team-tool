    
module.exports = function(app, includes) {
  var middleware  = includes.middleware;
  var render = includes.render;

  showTrends = function(req, res) {
    json= {"pageTitle":"Maturity Assessment Trends", "user": req.session["user"]};
    render(req, res, 'maturityTrends', json);
  };
  
  app.get("/maturityTrends", [includes.middleware.auth.requireLoginWithRedirect], showTrends);
};