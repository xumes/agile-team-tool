'use strict';
var fs = require('fs');
var settings = require('../settings');
var _ = require('underscore');
var middleware = {
  auth: require('../middleware/auth')
};

var render = function(req, res, file, json) {
  //can add stuff to json here if needed
  json['siteTitle'] = 'Agile Team Tool';
  json['userEmail'] = req.user;
  json['link'] = {};
  json['link']['home'] = '/home';
  json['link']['team'] = '/team';
  json['link']['iteration'] = '/iteration';
  json['link']['assessment'] = '/assessment';
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
  fs.readdirSync('./routes/api_mongo').forEach(function(file) {
    require('./api_mongo/' + file)(app, includes);
  });
  fs.readdirSync('./routes/v1_mongo').forEach(function(file) {
    require('./v1_mongo/' + file)(app, includes);
  });
};
