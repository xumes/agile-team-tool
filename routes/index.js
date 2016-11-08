var fs = require('fs');
var settings = require('../settings');
var middleware = {
  //auth: require('../middleware/auth')
  auth: require('../middleware/mongodb/auth')
};
var _ = require('underscore');

render = function(req, res, file, json) {
  //can add stuff to json here if needed
  json['siteTitle'] = 'Agile Team Tool';
  json['userEmail'] = req.user;
  return res.render(file, json);
};

module.exports = function(app, passport) {
  var includes = {
    passport: passport,
    render: render,
    middleware: middleware
  };
  fs.readdirSync('./routes/server').forEach(function(file) {
    require('./server/' + file)(app, includes);
  });
  if (settings.mongoURL == undefined || _.isEmpty(settings.mongoURL)) {
    fs.readdirSync('./routes/api').forEach(function(file) {
      require('./api/' + file)(app, includes);
    });
    fs.readdirSync('./routes/v1').forEach(function(file) {
      require('./v1/' + file)(app, includes);
    });
  }
  else {
    fs.readdirSync('./routes/api_mongo').forEach(function(file) {
      require('./api_mongo/' + file)(app, includes);
    });
    fs.readdirSync('./routes/v1_mongo').forEach(function(file) {
      require('./v1_mongo/' + file)(app, includes);
    });
  }

};
