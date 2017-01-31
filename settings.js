var mongoose = require('mongoose');
var loggers = require('./middleware/logger');

mongoose.Promise = require('bluebird');

module.exports = {
  dbUrl: process.env.dbUrl || 'test.cloudant.com',
  ldapAuthURL: process.env.ldapAuthURL || 'http://ifundit-dp.tap.ibm.com:3004',
  redisDb: {
    url: process.env.redisURL || 'redis://localhost:6379',
    prefix: process.env.redisPrefix || 'agileteamtool:'
  },
  secret: process.env.secret || 'thisshouldberandom',
  authType: process.env.authType || 'ldap-login',
  cloudant: {
    url: process.env.cloudantURL || 'https://user:pass@user.cloudant.com',
    dbName: process.env.cloudantDb || 'localDb'
  },
  mongoURL: process.env.mongoURL || 'mongodb://localhost/agiletool_stage',
  saml: {
    path: '/auth/saml/ibm/callback',
    identifierFormat: 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
    issuer: 'https://w3id.sso.ibm.com/auth/sps/samlidp/saml20',
    entryPoint: process.env['samlEntrypoint'],
    cert: process.env['samlCert']
  },
  email: {
    smtpHost: process.env.smtpHost || 'https://localhost:8080/mail',
    smtpApplicationKey: process.env.smtpApplicationKey || 'key123'
  },
  prefixes: {
    team: 'ag_team_',
    iteration: 'ag_iterationinfo_',
    assessment: 'ag_mar_'
  },
  environment: process.env.NODE_ENV || 'development',
  googleAnalyticsKey: process.env.googleAnalyticsKey || '',
  googleHost: 'maps.googleapis.com',
  googleApiKey: process.env.googleAPIKey || 'AIzaSyAF2vwg6z-pH4xC7Ac1eMcpR9mVG-A2u7Y',
  facesURL: 'https://faces.tap.ibm.com/api/',
  ibmNPSKey: process.env.ibmNPSKey || ''
};

if (module.exports.mongoURL && module.exports.mongoURL != '') {
  var mongoOptions = {
    'server': {
      'socketOptions': {
        'keepAlive': 300000,
        'connectTimeoutMS': 60000
      }
    },
    'replset': {
      'socketOptions': {
        'keepAlive': 300000,
        'connectTimeoutMS' : 60000
      }
    }
  };
  mongoose.connect(mongo.exports.mongoURL, mongoOptions);
  loggers.get('init').info('Connecting to mongoDB');
  module.exports.mongoose = mongoose;
}
else {
  // Stub-out so we don't get errors
  module.exports.mongoose = {
    model: function() {},
    schema: ''
  };
}
