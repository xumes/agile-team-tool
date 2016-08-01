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

var app = express();
app.use(favicon(__dirname + '/public/img/favicon.ico'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

if (process.env.NODE_ENV !== 'test')
  app.use(logger('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Force SSL
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

if (process.env.NODE_ENV !== 'test')
  console.log(settings)

module.exports = app;
