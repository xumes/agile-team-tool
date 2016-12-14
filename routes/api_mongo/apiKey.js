var util = require('../../helpers/util');
var apiKeysModel = require('../../models/mongodb/apiKeys');

module.exports = function(app, includes) {
  var middleware = includes.middleware;

  getApiKey = /* instabul ingore next */ function(req, res) {
    apiKeysModel.createApikey(req.session['user'])
      .then(function(result){
        res.status(200).json({
          'apiKey': result.key,
          'shortEmail': result.email
        });
      })
      .catch( /* instabul ingore next */ function(err){
        res.status(400).send(err);
      });
  };

  getApiKeyByUser = /* instabul ingore next */ function(req, res) {
    apiKeysModel.getUserApikeyByUser(req.session['user'])
      .then(function(result){
        if (!_.isEmpty(result)) {
          res.status(200).json({
            'apiKey': result.key,
            'shortEmail': result.email
          });
        } else {
          res.status(404).send('This user: ' + req.session['user']['ldap']['uid'] + ' does not have an api key.');
        }
      })
      .catch( /* instabul ingore next */ function(err){
        res.status(400).send(err);
      });
  };

  deleteApiKey = function(req, res) {
    apiKeysModel.deleteApikey(req.session['user'])
    .then(function(result) {
      if (result == 'user not exist') {
        res.status(404).send(result);
      } else {
        res.status(200).send(result);
      }
    })
    .catch(function(err) {
      res.status(400).send(err);
    });
  };


  // try to get data from here
  /* instabul ingore next */
  app.get('/api/developer/apiKey', [includes.middleware.auth.requireLogin], getApiKey); //old path
  /* instabul ingore next */
  app.get('/api/apiKey/apiKey', [includes.middleware.auth.requireLogin], getApiKey);
  /* instabul ingore next */
  app.get('/api/apiKey/apiKeyByUser', [includes.middleware.auth.requireLogin], getApiKeyByUser);
  /* instabul ingore next */
  app.delete('/api/apiKey/apikey', [includes.middleware.auth.requireLogin], deleteApiKey);
};
