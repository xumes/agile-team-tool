const apiKeysModel = require('../../models/apiKeys');

module.exports = (app, includes) => {
  app.get('/integrations/trello', includes.middleware.auth.requireLoginWithRedirect, (req, res) => {
    apiKeysModel.createApikey(req.session.user)
      .then((result) => {
        res.render('integrations/trello', {
          apiKey: result.key,
        });
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  });
};
