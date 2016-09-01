module.exports = function(app, includes) {
  var render = includes.render;

  showHome = function(req, res) {
    var json = 
      {
        'pageTitle'       : 'Home'
      };
    render(req, res, 'home', json);
  };
  
  app.get('/', includes.middleware.auth.requireLoginWithRedirect, showHome);
};