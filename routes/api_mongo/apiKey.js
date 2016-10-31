var util = require('../../helpers/util');
var apiKeysModel = require('../../models/mongodb/apiKeys.js');

module.exports = function(app, includes) {
  var middleware = includes.middleware;

  getApiKey = /* instabul ingore next */ function(req, res) {
    apiKeysModel.createApikey(req.session['user'])
      .then(function(result){
        console.log(result);
        res.status(200).json({
          'apiKey': result.key,
          'shortEmail': result.email
        });
      })
      .catch( /* instabul ingore next */ function(err){
        res.status(404).send(err);
      });
  };

  getApiKeyByUser = /* instabul ingore next */ function(req, res) {
    apiKeysModel.getUserApikeyByUser(req.session['user'])
      .then(function(result){
        if (!_.isEmpty(result)) {
         console.log(result);
         res.status(200).json({
           'apiKey': result.key,
           'shortEmail': result.email
         });
       } else {
         console.log('No result is avilable');
         res.status(200).json({
           'apiKey': '',
           'shortEmail': ''
         });
       }
      })
      .catch( /* instabul ingore next */ function(err){
        res.status(404).send(err);
      });
  };

  deleteApiKey = function(req, res) {
    console.log('in Delete Api Key call');
    apiKeysModel.deleteApikey(req.session['user'])
      .then(function(result) {
        console.log('in Delete Api Key call -after call');
        res.status(200).send(result);
      })
      .catch(function(err) {
        res.status(404).send(err);
      });
  };


  // try to get data from here
  /* instabul ingore next */
  app.get('/api/apiKey/apiKey', [includes.middleware.auth.requireLogin], getApiKey);
  /* instabul ingore next */
  app.get('/api/apiKey/apiKeyByUser', [includes.middleware.auth.requireLogin], getApiKeyByUser);
  /* instabul ingore next */
  app.delete('/api/apiKey/apikey',  deleteApiKey);

};
