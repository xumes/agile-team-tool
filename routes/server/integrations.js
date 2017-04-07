var settings = require('../../settings');
var apiKeysModel = require('../../models/apiKeys');

module.exports = function(app, includes) {
  app.get('/integrations/trello', includes.middleware.auth.requireLoginWithRedirect, function(req, res) {
    apiKeysModel.createApikey(req.session['user'])
      .then(function(result) {
        res.render('integrations/trello', {
          apiKey: result.key
        });
      })
      .catch(function(err) {
        res.status(500).send(err);
      });
  });
};
