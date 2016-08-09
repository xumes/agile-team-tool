var express      = require('express');
var session      = require('express-session');
var path         = require('path');
var favicon      = require('serve-favicon');
var logger       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var passport     = require('passport');
var settings     = require('./settings');
var RedisStore   = require('connect-redis')(session);
var favicon      = require('serve-favicon');
var helmet       = require('helmet');
var initCloudant = require('./cloudant/init');
var loggers      = require('./middleware/logger')

/* istanbul ignore if */
require('fs').readFile('./art', 'utf8', function (err,data) {
  console.log(data);
  loggers.get('init').info("Configuration Settings:");
  console.log(settings);
  console.log("\n\n");
  initCloudant.init();
});

var app = express();
app.use(favicon(__dirname + '/public/img/favicon.ico'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

/* istanbul ignore if */
if (process.env.NODE_ENV !== 'test')
  app.use(logger('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//security (mostly header stuff)
app.use(helmet());

// Force SSL
/* istanbul ignore if */
if (process.env.forceSSL == "true") {
  app.use (function(req, res, next) {
    if (req.headers['x-forwarded-proto'] != 'https')
      return res.redirect(['https://', req.get('Host'), req.url].join(''));
    return next()      
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
require('./middleware/login')(passport);

//Routes/Controllers for the views
require('./routes')(app, passport);

/**
* Error Handlers
*/
/* istanbul ignore next */
process.on('uncaughtException', function (err) {
  console.error((new Date).toUTCString() + ' uncaughtException:', err.message)
  console.error(err.stack)
  process.exit(1)
})


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
