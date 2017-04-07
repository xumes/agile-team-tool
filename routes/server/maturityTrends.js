'use strict';
var settings = require('../../settings');

module.exports = function(app, includes) {
  var render = includes.render;
  var json = {
    'pageTitle': 'Maturity Assessment Trends'
  };

  app.get('/maturityTrends', function(req, res) {
    render(req, res, 'maturityTrends', json);
  });
};
