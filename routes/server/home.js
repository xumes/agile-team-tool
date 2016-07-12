
module.exports = function(app, includes) {
  var middleware  = includes.middleware;

  render = includes.render;

  showHome = function(req, res) {
    
    res.render('index', {title: 'Agile Team Tool'});
 
  };
  
  app.get("/", [includes.middleware.auth.requireLogin], showHome);
};