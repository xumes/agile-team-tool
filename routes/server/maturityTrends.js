module.exports = (app, includes) => {
  const render = includes.render;
  const json = {
    pageTitle: 'Maturity Assessment Trends',
  };

  app.get('/maturityTrends', (req, res) => {
    render(req, res, 'maturityTrends', json);
  });
};
