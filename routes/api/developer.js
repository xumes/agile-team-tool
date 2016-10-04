var util = require('../../helpers/util');
var usersModel = require('../../models/users');

module.exports = function(app, includes) {
  var middleware = includes.middleware;

  getApiKey = function(req, res) {
    usersModel.createApikey(req.session['user'])
      .then(function(result){
        console.log(result);
        res.status(200).json({
          'apiKey': result.key,
          'shortEmail': result.email
        });
      })
      .catch(function(err){
        res.status(404).send(err);
      });
  };

  // try to get data from here
  app.get('/api/developer/apiKey', [includes.middleware.auth.requireLogin], getApiKey);
};
