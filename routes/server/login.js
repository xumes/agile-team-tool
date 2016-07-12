
module.exports = function(app, includes) {

  render = includes.render;

  showLogin = function(req, res) {
    
    res.render('login', {title: 'Agile Team Tool', action: ""});
 
  };
  //git please work
  app.get("/login", showLogin);
};