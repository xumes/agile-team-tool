var winston = require('winston');
var settings = require('../settings');

var logLevel = process.env.logLevel || 'verbose';
var logColors = process.env.logColors == 'true';


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

// Refactor this
winston.loggers.add('init', {
  console: {
    level: logLevel,
    colorize: true,
    label: 'init'
  },
  sentry: {
    'level': logLevel,
    'class': 'raven.handlers.logging.SentryHandler',
    'dsn': settings.sentry.dsn
  }
});

winston.loggers.add('auth', {
  console: {
    level: logLevel,
    colorize: logColors,
    label: 'auth'
  },
  sentry: {
    'level': logLevel,
    'class': 'raven.handlers.logging.SentryHandler',
    'dsn': settings.sentry.dsn
  }
});

winston.loggers.add('api', {
  console: {
    level: logLevel,
    colorize: logColors,
    label: 'api'
  },
  sentry: {
    'level': logLevel,
    'class': 'raven.handlers.logging.SentryHandler',
    'dsn': settings.sentry.dsn
  }
});

winston.loggers.add('models', {
  console: {
    level: logLevel,
    colorize: logColors,
    label: 'models'
  },
  sentry: {
    'level': logLevel,
    'class': 'raven.handlers.logging.SentryHandler',
    'dsn': settings.sentry.dsn
  }
});

winston.loggers.add('model-teams', {
  console: {
    level: logLevel,
    colorize: logColors,
    label: 'model-teams'
  },
  sentry: {
    'level': logLevel,
    'class': 'raven.handlers.logging.SentryHandler',
    'dsn': settings.sentry.dsn
  }
});

winston.loggers.add('model-users', {
  console: {
    level: logLevel,
    colorize: logColors,
    label: 'model-users'
  },
  sentry: {
    'level': logLevel,
    'class': 'raven.handlers.logging.SentryHandler',
    'dsn': settings.sentry.dsn
  }
});

winston.loggers.add('model-iteration', {
  console: {
    level: logLevel,
    colorize: logColors,
    label: 'model-iteration'
  },
  sentry: {
    'level': logLevel,
    'class': 'raven.handlers.logging.SentryHandler',
    'dsn': settings.sentry.dsn
  }
});

winston.loggers.add('model-apiKeys', {
  console: {
    level: logLevel,
    colorize: logColors,
    label: 'model-apiKeys'
  },
  sentry: {
    'level': logLevel,
    'class': 'raven.handlers.logging.SentryHandler',
    'dsn': settings.sentry.dsn
  }
});

winston.loggers.add('model-sanpshot', {
  console: {
    level: logLevel,
    colorize: logColors,
    label: 'model-sanpshot'
  },
  sentry: {
    'level': logLevel,
    'class': 'raven.handlers.logging.SentryHandler',
    'dsn': settings.sentry.dsn
  }
});

winston.loggers.add('model-apikeys', {
  console: {
    level: logLevel,
    colorize: logColors,
    label: 'model-apikeys'
  },
  sentry: {
    'level': logLevel,
    'class': 'raven.handlers.logging.SentryHandler',
    'dsn': settings.sentry.dsn
  }
});

winston.loggers.add('cache', {
  console: {
    level: logLevel,
    colorize: logColors,
    label: 'cache'
  },
  sentry: {
    'level': logLevel,
    'class': 'raven.handlers.logging.SentryHandler',
    'dsn': settings.sentry.dsn
  }
});

module.exports = winston.loggers;
