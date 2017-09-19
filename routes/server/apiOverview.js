
module.exports = (app) => {
  app.get('/api-docs', (req, res) => {
    res.render('api_overview/redoc_api');
  });
};
