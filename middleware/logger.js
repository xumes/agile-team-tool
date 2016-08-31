var winston = require('winston');

var logLevel = process.env.logLevel || 'verbose';
var logColors = process.env.logColors == 'true';

if (process.env.isGulpTest){
  var logLevel = rocess.env.logLevel || 'info';
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

winston.loggers.add('model-users', {
  console: {
    level: logLevel,
    colorize: logColors,
    label: 'model-users'
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