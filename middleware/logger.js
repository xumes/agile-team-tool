var winston = require('winston');
var settings = require('../settings');
var _ = require('underscore');

var logLevel = process.env.logLevel || 'verbose';
var logColors = process.env.logColors == 'true';

var loggers = ['init', 'auth', 'api', 'models', 'model-teams', 'model-users', 'model-iteration',
  'model-snapshot', 'model-apikeys', 'cache'];

if (process.env.isGulpTest) {
  logLevel = process.env.logLevel || 'NONE';
  logColors = true;
}

winston.logLevel = logLevel;

if (settings.sentry.dsn) {
  //Setting up Sentry
  var sentryOptions = {
    dsn: settings.sentry.dsn
  };
  winston.transports.Sentry = require('winston-sentry');
  winston.add(winston.transports.Sentry, sentryOptions);
  winston.info('Sentry logging enabled');
}

_.map(loggers, function(logger) {
  var transports = {
    console: {
      level: logLevel,
      colorize: true,
      label: 'init'
    }
  };

  if (!process.env.isGulpTest && settings.sentry.dsn) {
    transports['sentry'] = {
      'level': logLevel,
      'class': 'raven.handlers.logging.SentryHandler',
      'dsn': settings.sentry.dsn
    }
  }

  winston.loggers.add(logger, transports);

});

module.exports = winston.loggers;
