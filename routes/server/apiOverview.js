
module.exports = function(app, includes) {
  app.get('/apiOverview/redoc', function(req, res) {
    res.render('api_overview/redoc_api');
  });
};
