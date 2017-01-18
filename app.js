var settings     = require('./settings');
var loggers      = require('./middleware/logger');

// Make sure New Relic is loaded first
if (process.env.newRelicKey && process.env.newRelicKey != '') {
  require('newrelic');
  loggers.get('init').info('New Relic loaded');
}

var express = require('express');
var session = require('express-session');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var RedisStore = require('connect-redis')(session);
var favicon = require('serve-favicon');
var helmet = require('helmet');
var httpProxy = require('http-proxy');
var bundle = require('./bundle');
var cors = require('cors');

/* istanbul ignore if */
/*require('fs').readFile('./art', 'utf8', function(err, art) {
  console.log(art);
  loggers.get('init').info('Configuration Settings:');
  if (process.env.TRAVIS != 'true') {
    console.log(settings);
  }
  console.log('\n');
});
*/

var app = express();
app.use(favicon(__dirname + '/public/img/favicon.ico'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

/* istanbul ignore if */
if (!process.env.isGulpTest)
  app.use(logger('dev'));

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({
  limit: '50mb',
  extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//security (mostly header stuff)
app.use(helmet({
  frameguard: false
}));


// Force SSL
/* istanbul ignore if */
if (process.env.forceSSL == 'true') {
  app.use(function(req, res, next) {
    if (req.headers['x-forwarded-proto'] != 'https')
      return res.redirect(['https://', req.get('Host'), req.url].join(''));
    return next();
  });
}

//Authentication
app.use(session({
  store: new RedisStore(settings.redisDb),
  secret: settings.secret,
  resave: false,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.options('*', cors());
require('./middleware/login')(passport);

//Routes/Controllers for the views
require('./routes')(app, passport);

// Webpack for React

/* istanbul ignore next */
if (process.env.NODE_ENV !== 'production') {
  var proxy = httpProxy.createProxyServer();
  bundle();

  app.all('/dist/*', function(req, res) {
    proxy.web(req, res, {
      target: 'http://localhost:3001'
    });
  });
}

/**
 * Error Handlers
 */
/* istanbul ignore next */
process.on('uncaughtException', function(err) {
  console.error((new Date).toUTCString() + ' uncaughtException:', err.message);
  console.error(err.stack);
  process.exit(1);
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// development error handler
// will print stacktrace
/* istanbul ignore if */
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
