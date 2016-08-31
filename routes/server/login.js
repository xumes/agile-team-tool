var settings = require('../../settings');
var action, authType;

module.exports = function(app, includes) {
  var render = includes.render;

  showLogin = function(req, res) {
    authType = settings.authType;
    if(authType === 'ldap-login') {
      action = '/auth';
    }
    /* istanbul ignore next */
    else if (authType === 'saml') {
      return res.redirect('/auth/sso');
    }
    json = {
      "pageTitle": "Login",
      "action": action,
      "authType": authType
    };
    render(req, res, 'login', json);
  };

  //TODO
  /* istanbul ignore next */
  authSaml = function(req, res, next) {
    // console.log('authSaml executed');
    passportAuth = includes.passport.authenticate('saml', function(err, user, info) {
      // console.log("err=", err);
      req.session['email'] = user.nameID;
      req.session['user'] = user;
      loggers.get('auth').verbose('Successfully authenticated %s', user);
      return res.redirect('/')
    });
    return passportAuth(req, res, next);
  };

  app.get("/login", [includes.middleware.auth.requireLoggedOutWithRedirect], showLogin);
  app.get("/auth/sso", includes.passport.authenticate('saml', {}));
  app.get("/auth/sso/callback", authSaml);
};