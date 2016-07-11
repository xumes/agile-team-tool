
module.exports = function(app, includes) {

  render = includes.render;

  showHome = function(req, res) {
    
    res.render('index', {title: 'Agile Team Tool'});
 
  };
  
  app.get("/", showHome);
};