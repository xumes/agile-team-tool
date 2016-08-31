var settings = require('../../settings');
var util = require('../../helpers/util');
var loggers = require('../../middleware/logger');
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
      return res.redirect('/auth/saml/ibm');
    }
    json = {
      "pageTitle": "Login",
      "action": action,
      "authType": authType
    };
    render(req, res, 'login', json);
  };

  // Needed for the validation fix
  /* istanbul ignore next */
  require('passport-saml/node_modules/xml-crypto/lib/signed-xml').SignedXml.prototype.checkSignature = function(xml) {
    var Dom, doc;
    Dom = require('passport-saml/node_modules/xmldom').DOMParser;
    this.validationErrors = [];
    this.signedXml = xml;
    if (!this.keyInfoProvider) {
      throw new Error('cannot validate signature since no key info resolver was provided');
    }
    this.signingKey = this.keyInfoProvider.getKey(this.keyInfo);
    if (!this.signingKey) {
      throw new Error('key info provider could not resolve key info ' + this.keyInfo);
    }
    doc = (new Dom).parseFromString(xml);
    if (!this.validateReferences(doc)) {
      console.error("Reference validation fails! (Continuing to Signature Validation...)");
    }
    if (!this.validateSignatureValue()) {
      return false;
    }
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
  authSaml = function(req, res, next) {
    passportAuth = includes.passport.authenticate('w3-saml', function(err, user, info) {
      if (err) {
        loggers.get('auth').error('Unable to login via SAML err=', err);
      }
      if (user && user.nameID) {
        //return res.send(user);
        util.queryLDAP(user.nameID)
          .then(function(result) {
            ldapObject = typeof result === 'string' ? JSON.parse(result) : result;

            if (!(_.isEmpty(ldapObject['ldap']))) {
              req.session['email'] = ldapObject['ldap']['preferredIdentity']; //ldapObject['shortEmail'];
              req.session['user'] = ldapObject;
              req.session['environment'] = settings.environment;
              loggers.get('auth').verbose('Successfully authenticated %s via SAML', user);
              req.login(ldapObject, function(err) {
                if (err) {
                  loggers.get('auth').error('Unable to authenticate email=%s, err=%s', user.nameID, err);
                  return res.send('Unable to login to the site');
                }
                else {
                  res.redirect('/');
                }

              });
            }
            else {
              loggers.get('auth').error('Unable to authenticate email=%s, ldapObject=%s', email, ldapObject);
              return res.send('Unable to login to the site');
            }
          });
      }
      else {
        res.send('Unable to login to the site');
      }

    });
    return passportAuth(req, res, next);
  };

  app.get("/login", [includes.middleware.auth.requireLoggedOutWithRedirect], showLogin);
  app.get("/auth/saml/ibm", includes.passport.authenticate('w3-saml', {}));
  app.post("/auth/saml/ibm/callback", authSaml);
};