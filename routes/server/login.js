var settings = require('../../settings');
var action, authType;

module.exports = function(app, includes) {
  var render = includes.render;

  showLogin = function(req, res) {
    authType = settings.authType;
    if(authType === 'ldap-login'){
      action = '/auth';
    }else{
      action = '';
    }


    json= {
      "pageTitle": "Login",
      "action": action,
      "authType": authType
    }
    render(req, res, 'login', json);
  };

  app.get("/login", [includes.middleware.auth.requireLoggedOut], showLogin);
};