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
  app.get('/api/users/admins', [includes.middleware.auth.requireLogin], getAdmins);

};
