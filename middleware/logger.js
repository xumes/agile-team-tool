var winston = require('winston');

var logLevel = process.env.logLevel || 'verbose';
var logColors = process.env.logColors == 'true';

if (process.env.isGulpTest) {
  var logLevel = process.env.logLevel || 'NONE';
  var logColors = true;
}

winston.loggers.add('init', {
  console: {
    level: logLevel,
    colorize: true,
    label: 'init'
  }
});

winston.loggers.add('auth', {
  console: {
    level: logLevel,
    colorize: logColors,
    label: 'auth'
  }
});

winston.loggers.add('api', {
  console: {
    level: logLevel,
    colorize: logColors,
    label: 'api'
  }
});

winston.loggers.add('models', {
  console: {
    level: logLevel,
    colorize: logColors,
    label: 'models'
  }
});

winston.loggers.add('model-teams', {
  console: {
    level: logLevel,
    colorize: logColors,
    label: 'model-teams'
  }
});

winston.loggers.add('model-users', {
  console: {
    level: logLevel,
    colorize: logColors,
    label: 'model-users'
  }
});

winston.loggers.add('model-iteration', {
  console: {
    level: logLevel,
    colorize: logColors,
    label: 'model-iteration'
  }
});

winston.loggers.add('model-apiKeys', {
  console: {
    level: logLevel,
    colorize: logColors,
    label: 'model-apiKeys'
  }
});

winston.loggers.add('model-sanpshot', {
  console: {
    level: logLevel,
    colorize: logColors,
    label: 'model-sanpshot'
  }
});

winston.loggers.add('model-apikeys', {
  console: {
    level: logLevel,
    colorize: logColors,
    label: 'model-apikeys'
  }
});

winston.loggers.add('cache', {
  console: {
    level: logLevel,
    colorize: logColors,
    label: 'cache'
  }
});

module.exports = winston.loggers;
