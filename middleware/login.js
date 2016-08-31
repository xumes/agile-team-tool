var LocalStrategy = require('passport-local').Strategy;
var settings      = require('../settings');
var request       = require('request');
var Promise       = require('bluebird');
var _             = require('underscore');
var loggers       = require('../middleware/logger');
var SamlStrategy  = require('passport-saml').Strategy;

module.exports = function(passport) {

  ldapAuth = function(username, password) {
    return new Promise(function(resolve, reject) {
      var opts = {
        url: settings['ldapAuthURL'] + '/auth',
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

  passport.use('w3-saml', new SamlStrategy({
    path: settings.saml.path,
    protocol: 'https',
    entryPoint: settings.saml.entryPoint,
    identifierFormat: settings.saml.identifierFormat,
    issuer: settings.saml.issuer,
    cert: settings.saml.cert
  }, function(profile, done) {
    return done(null, profile);
  }));

  passport.use('ldap-login', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
  }, function(req, email, password, done) {
    loggers.get('auth').verbose('Attempting to do LDAP authentication email=%s', email);
    ldapAuth(email, password)
      .then(function(ldapObject) {
        ldapObject = typeof ldapObject === 'string' ? JSON.parse(ldapObject) : ldapObject;
        if (!(_.isEmpty(ldapObject['ldap']))) {
          req.session['email'] = ldapObject['ldap']['preferredIdentity']; //ldapObject['shortEmail'];
          req.session['user'] = ldapObject;
          req.session['environment'] = settings.environment;
          loggers.get('auth').verbose('Successfully authenticated %s', email);
          loggers.get('auth').verbose('ldapObject: ', ldapObject);
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