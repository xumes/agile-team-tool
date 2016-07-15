var winston = require('winston');

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

winston.loggers.add('auth', {
  console: {
    level: logLevel,
    colorize: logColors,
    label: 'auth'
  }
});

module.exports = winston.loggers;