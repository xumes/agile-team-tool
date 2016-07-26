var LocalStrategy = require('passport-local').Strategy;
var settings      = require('../settings');
var request       = require('request');
var Promise       = require('bluebird');
var _             = require('underscore');
var loggers       = require('../middleware/logger');
var SamlStrategy  = require('passport-saml').Strategy;

module.exports = function(passport) {

  // Needed for the validation fix
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

  ldapAuth = function(username, password) {
    return new Promise(function(resolve, reject) {
      var opts = {
        url: settings['ldapAuthURL'],
        form: {
          intranetId: username,
          password: password
        }
      };

      request.post(opts, function(err, res, body) {
        if (err || res.statusCode == 401) {
          reject(body);
        }
        else
          resolve(body);
      })

    });
  };

  passport.serializeUser(function(user, done) {
    if(typeof user === 'string')
      done(null, JSON.parse(user).shortEmail);
    else
      done(null, user['shortEmail']);
  });
  
  passport.deserializeUser(function(user, done) {
    done(null, user);
  });

  var samlStrategy = new SamlStrategy({
    path: settings.saml.path,
    protocol: 'https',
    entryPoint: settings.saml.entryPoint,
    identifierFormat: settings.saml.identifierFormat,
    issuer: settings.saml.issuer,
    cert: settings.saml.cert
  }, function(profile, done) {
    loggers.get('auth').info('Successfully authenticated %s', profile);
    return done(null, profile);
  });


  passport.use('saml', samlStrategy);

  passport.use('ldap-login', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
  }, function(req, email, password, done) {
    loggers.get('auth').info('Attempting to do LDAP authentication email=%s', email);
    ldapAuth(email, password)
      .then(function(ldapObject) {
        ldapObject = typeof ldapObject === 'string' ? JSON.parse(ldapObject) : ldapObject;
        if (!(_.isEmpty(ldapObject['ldap']))) {
          req.session['email'] = ldapObject['shortEmail'];
          req.session['user'] = ldapObject;
          req.session['environment'] = settings.environment;
          loggers.get('auth').info('Successfully authenticated %s', email);
          return done(null, ldapObject);
        }
        else {
          loggers.get('auth').error('Unable to authenticate email=%s, ldapObject=%s', email, ldapObject);
          return done(null, false);
        }
          
      })
      .catch(function(err) {
        loggers.get('auth').error('Unable to authenticate email=%s, err=%s', email, err);
        return done(null, false);
      })
  }));


};