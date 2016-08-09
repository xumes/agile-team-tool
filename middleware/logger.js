var winston = require('winston');

if (process.env.NODE_ENV == 'test')
  var logLevel = 'NONE';
else
  var logLevel = process.env.logLevel || 'info';

var logColors = process.env.logColors == 'true';

// Add additional transports here if needed
var logger = new (winston.Logger)({
  level: process.env.logLevel || 'info',
  transports: [
    new winston.transports.Console({
      level: logLevel,
      colorize: logColors 
    })
  ]
});

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