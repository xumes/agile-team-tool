module.exports = {
  ldapAuthURL: process.env.ldapAuthURL || 'http://ifundit-dp.tap.ibm.com:3004',
  bluepagesURL: process.env.bluepagesURL || 'http://ifundit-dp.tap.ibm.com:3004',
  redisDb: {
    url: process.env.redisURL || 'redis://localhost:6379',
    prefix: process.env.redisPrefix || 'agileteamtool:'
  },
  secret: process.env.secret || 'thisshouldberandom',
  authType: process.env.authType || 'ldap-login',
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
  environment: process.env.NODE_ENV || 'development',
  googleAnalyticsKey: process.env.googleAnalyticsKey || '',
  facesURL: 'https://faces.w3ibm.mybluemix.net/api',
  ibmNPSKey: process.env.ibmNPSKey || '',
  ibmNPS: {
    key: process.env.ibmNPSKey || '',
    attributes: process.env.ibmNPSAttributes ? JSON.parse(process.env.ibmNPSAttributes) : {}
  },
  sentry: {
    dsn: process.env.sentryDSN || '',
    publicDSN: process.env.sentryPublicDSN || ''
  },
  uiReleaseDate: process.env.uiReleaseDate || '2017-05-31T00:00:00.000Z' // we will use this date to trigger the walkthrough for new ui.
};

var loggers = require('./middleware/logger');
var mongoose = require('mongoose');

mongoose.Promise = require('bluebird');

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
  mongoose.connect(module.exports.mongoURL, mongoOptions);
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
