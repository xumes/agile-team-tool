var users = require('../../models/mongodb/users');
// Get admins and supports api call
var _ = require('underscore');
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

  isUserAllowed = function(req, res) {
    if (_.isUndefined(req.query.email) || _.isEmpty(req.query.email)) {
      res.status(400).send({'error': 'email is empty'});
    }
    else if (_.isUndefined(req.query.teamId) || _.isEmpty(req.query.teamId)) {
      res.status(400).send({'error': 'team id is empty'});
    } else {
      users.isUserAllowed(req.query.email, req.query.teamId)
        .then(function(result) {
          res.status(200).send(result);
        })
        .catch( /* istanbul ignore next */ function(err) {
          res.status(400).send(err);
        });
    }
  };

  app.get('/api/users/admins', [includes.middleware.auth.requireLogin], getAdmins);
  app.get('/api/users/isuserallowed', [includes.middleware.auth.requireLogin], isUserAllowed);

};
