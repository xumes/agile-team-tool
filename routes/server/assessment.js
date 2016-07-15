 		
module.exports = function(app, includes) {
  var middleware  = includes.middleware;
  var render = includes.render;

  showAssessment = function(req, res) {
    json= {"pageTitle":"Maturity Assessment"}
    render(req, res, 'assessment', json);
  };
  
  app.get("/assessment", [includes.middleware.auth.requireLogin], showAssessment);
};