var users = require('../../models/users');
// Get admins and supports api call
module.exports = function(app, includes) {
  var middleware = includes.middleware;

  getAdmins = function(req, res) {
    users.getAdmins()
      .then(function(result) {
        res.status(200).send(result);
      })
      .catch( /* istanbul ignore next */ function(err) {
        res.status(400).send(err);
      });
  };

  getApiKey = function(req, res) {
    users.createApikey(req.session['user'])
      .then(function(result) {
        res.status(200).send({
          'key': result.key,
          'userId': result.userId,
          'shortEmail': result.email
        });
      })
      .catch(function(err){
        res.status(404).send(err);
      });
  };

  deleteApiKey = function(req, res) {
    users.deleteApikey(req.session['user'])
      .then(function(result) {
        console.log('---------------- delete route success');
        console.log(result);
        res.status(200).send(result);
      })
      .catch(function(err){
        res.status(404).send(err);
      });
  };

  app.get('/api/users/admins', [includes.middleware.auth.requireLogin], getAdmins);
  // try to get data from here
  app.get('/api/users/apikey', [includes.middleware.auth.requireLogin], getApiKey);
  // try to get data from here
  app.delete('/api/users/apikey', [includes.middleware.auth.requireLogin], deleteApiKey);

};
