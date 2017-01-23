'use strict';
var settings = require('../../settings');

module.exports = function(app, includes) {
  var middleware = includes.middleware;
  var render = includes.render;
  var json = {
    'pageTitle': 'Maturity Assessment Trends'
  };

  app.get('/maturityTrends', function(req, res) {
    json['user'] = req.session['user'];
    render(req, res, 'v2_maturityTrends', json);
  });
};
