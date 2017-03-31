
module.exports = function(app, includes) {
  app.get('/api-docs', function(req, res) {
    res.render('api_overview/redoc_api');
  });
};
