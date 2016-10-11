var util = require('../../helpers/util');
var usersModel = require('../../models/users');

module.exports = function(app, includes) {
  var middleware = includes.middleware;

  getApiKey = /* instabul ingore next */ function(req, res) {
    usersModel.createApikey(req.session['user'])
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

  // try to get data from here
  /* instabul ingore next */
  app.get('/api/developer/apiKey', [includes.middleware.auth.requireLogin], getApiKey);
};
