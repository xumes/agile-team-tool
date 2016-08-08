var users = require('../../models/users');
// Get admins and supports api call
module.exports = function(app, includes) {
  var middleware  = includes.middleware;

  getAdmins = function(req, res) {
    users.getAdmins(adminId)
      .then(function(result){
        res.status(200).send(result);
      })
      /* istanbul ignore next */
      .catch(function(err){
        res.status(400).send(err);
      });
  };
app.get('/api/users/admins', [includes.middleware.auth.requireLogin], getAdmins);
};
