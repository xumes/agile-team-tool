var settings = require('../../settings');

module.exports = function(app, includes) {
  var middleware = includes.middleware;
  var render = includes.render;
  var json = {
    'pageTitle': 'Maturity Assessment Trends'
  };

  showTrends = function(req, res) {
    render(req, res, 'maturityTrends', json);
  };

  showTrendsMongo = function(req, res) {
    render(req, res, 'v2_maturityTrends', json);
  };

  app.get('/maturityTrends', function(req, res) {
    json['user'] = req.session['user'];
    if (settings.mongoURL == undefined || _.isEmpty(settings.mongoURL))
      showTrends(req, res);
    else
      showTrendsMongo(req, res);
  });
};
