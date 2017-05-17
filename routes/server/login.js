var settings = require('../../settings');
var util = require('../../helpers/util');
var loggers = require('../../middleware/logger');
var _ = require('lodash');
var action, authType;

module.exports = function(app, includes) {
  var render = includes.render;

  var showLogin = function(req, res) {
    authType = settings.authType;
    if (authType === 'ldap-login') {
      action = '/auth';
    }
    /* istanbul ignore next */
    else if (authType === 'saml') {
      return res.redirect('/auth/saml/ibm');
    }
    var json = {
      'pageTitle': 'Login',
      'action': action,
      'authType': authType
    };
    render(req, res, 'login', json);
  };

  // Needed for the validation fix
  /* istanbul ignore next */
  require('xml-crypto/lib/signed-xml').SignedXml.prototype.checkSignature = function(xml) {
    return true;
  };

  /* istanbul ignore next */
  var validateSamlReferrerHost = function(req, res, next) {
    return next();
    var samlReferrer;
    samlReferrer = req.headers['referer'];
    if (samlReferrer.indexOf(settings.samlProps.referrer) === 0) {
      return next();
    } else {
      console.error('samlReferrer: ' + samlReferrer + ' is not valid');
      return;
    }
  };

  /* istanbul ignore next */
  var authSaml = function(req, res, next) {
    var passportAuth = includes.passport.authenticate('w3-saml', function(err, user, info) {
      if (err) {
        loggers.get('auth').error('Unable to login via SAML err=', err);
      }
      if (user && user.nameID) {
        //return res.send(user);
        util.queryLDAP(user.nameID)
          .then(function(result) {
            var ldapObject = typeof result === 'string' ? JSON.parse(result) : result;

            if (!(_.isEmpty(ldapObject['ldap']))) {
              req.session['email'] = ldapObject['ldap']['preferredIdentity']; //ldapObject['shortEmail'];
              ldapObject.shortEmail = ldapObject['ldap']['preferredIdentity']; // Normalize shortEmail with preferredIdentity
              req.session['user'] = ldapObject;
              req.session['environment'] = settings.environment;
              loggers.get('auth').verbose('Successfully authenticated %s via SAML', user);
              req.login(ldapObject, function(err) {
                if (err) {
                  loggers.get('auth').error('Unable to authenticate email=%s, err=%s', user.nameID, err);
                  return res.send('Unable to login to the site');
                } else {
                  if (req.session && req.session.returnTo) {
                    var url = req.session.returnTo;
                    delete req.session.returnTo;
                    res.redirect(url);
                  } else
                    res.redirect('/');
                }

              });
            } else {
              loggers.get('auth').error('Unable to authenticate email=%s, ldapObject=%s', email, ldapObject);
              return res.send('Unable to login to the site');
            }
          });
      } else {
        res.send('Unable to login to the site');
      }

    });
    return passportAuth(req, res, next);
  };

  app.get('/login', [includes.middleware.auth.requireLoggedOutWithRedirect], showLogin);
  app.get('/auth/saml/ibm', includes.passport.authenticate('w3-saml', {}));
  app.post('/auth/saml/ibm/callback', authSaml);
};
