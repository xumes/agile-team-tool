
module.exports = function(app, includes) {

  render = includes.render;

  showLogin = function(req, res) {
    
    res.render('login', {title: 'Agile Team Tool', action: "/auth"});
 
  };
  app.get("/login", showLogin);
};