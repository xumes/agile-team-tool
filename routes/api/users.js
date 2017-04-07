var Users = require('../../models/users');
// Get admins and supports api call
var _ = require('underscore');
module.exports = function(app, includes) {
  var middleware = includes.middleware;

  getAdmins = function(req, res) {
    Users.getAdmins()
      .then(function(result) {
        res.status(200).send(result);
      })
      .catch( /* istanbul ignore next */ function(err) {
        res.status(400).send(err);
      });
  };

  isUserAllowed = function(req, res) {
    if (_.isUndefined(req.query.teamId) || _.isEmpty(req.query.teamId)) {
      res.status(400).send({
        'error': 'teamId is empty'
      });
    } else {
      Users.isUserAllowed(req.session.user.ldap.uid, req.query.teamId)
        .then(function(result) {
          res.status(200).send(result);
        })
        .catch( /* istanbul ignore next */ function(err) {
          res.status(400).send(err);
        });
    }
  };

  getApiKey = function(req, res) {
    Users.createApikey(req.session['user'])
      .then(function(result) {
        res.status(200).send({
          'key': result.key,
          'userId': result.userId,
          'shortEmail': result.email
        });
      })
      .catch(function(err) {
        res.status(404).send(err);
      });
  };

  deleteApiKey = function(req, res) {
    Users.deleteApikey(req.session['user'])
      .then(function(result) {
        res.status(200).send(result);
      })
      .catch(function(err) {
        res.status(404).send(err);
      });
  };

  getActiveUser = function(req, res) {
    // return active user session
    res.send(req.session['user']);
  };

  getUsersInfo = function(req, res) {
    if (!req.body.ids || _.isEmpty(req.body.ids)) {
      res.status(400).send({'error': 'ids is empty'});
    } else {
      Users.getUsersInfo(req.body.ids)
        .then(function(result) {
          res.status(200).send(result);
        })
        .catch(function(err) {
          res.status(404).send(err);
        });
    }
  };

  getActiveUserInfo = function(req, res) {
    var userId;
    var user = req.session['user'];
    if (user) {
      userId = user ? user['ldap']['uid'].toUpperCase() : '';
      Users.getUsersInfo(userId)
        .then(function(result) {
          res.status(200).send(result);
        })
        .catch(function(err) {
          res.status(404).send(err);
        });
    }
  };

  updateUser = function(req, res) {
    Users.updateUser(req.body)
      .then(function(result) {
        res.status(200).send(result);
      })
      .catch(function(err) {
        res.status(404).send(err);
      });
  };

  createUser = function(req, res) {
    Users.create(req.body)
      .then(function(result) {
        res.status(200).send(result);
      })
      .catch(function(err) {
        res.status(404).send(err);
      });
  };

  // //TODO: Refactor this and store in the database
  // getRoles = function(req, res) {
  //   var roles = [{
  //     name: 'Analyst'
  //   }, {
  //     name: 'Architect'
  //   }, {
  //     name: 'Consultant'
  //   }, {
  //     name: 'DBA'
  //   }, {
  //     name: 'Designer'
  //   }, {
  //     name: 'Developer'
  //   }, {
  //     name: 'Infrastructure'
  //   }, {
  //     name: 'Iteration Manager'
  //   }, {
  //     name: 'Manager'
  //   }, {
  //     name: 'Operations and Support'
  //   }, {
  //     name: 'Product Owner'
  //   }, {
  //     name: 'Program & Project Mgmt'
  //   }, {
  //     name: 'Tester'
  //   }];
  //   res.json(roles);
  // };

  app.get('/api/users/active', [includes.middleware.auth.requireLogin], getActiveUser);

  app.get('/api/users/isuserallowed', [includes.middleware.auth.requireLogin], isUserAllowed);

  app.get('/api/users/admins', [includes.middleware.auth.requireLogin], getAdmins);
  // try to get data from here
  app.get('/api/users/apikey', [includes.middleware.auth.requireLogin], getApiKey);
  // try to get data from here
  app.delete('/api/users/apikey', [includes.middleware.auth.requireLogin], deleteApiKey);

  // app.get('/api/users/roles', [includes.middleware.auth.requireLogin], getRoles);

  app.post('/api/users/info', [includes.middleware.auth.requireLogin], getUsersInfo);
  app.get('/api/users/activeInfo', [includes.middleware.auth.requireLogin], getActiveUserInfo);
  app.put('/api/users/', [includes.middleware.auth.requireLogin], updateUser);
  app.post('/api/users/create', [includes.middleware.auth.requireLogin], createUser);
};
