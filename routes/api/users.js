const Users = require('../../models/users');
// Get admins and supports api call
const _ = require('underscore');

module.exports = (app, includes) => {
  const getAdmins = (req, res) => {
    Users.getAdmins()
      .then((result) => {
        res.status(200).send(result);
      })
      .catch(/* istanbul ignore next */ (err) => {
        res.status(400).send(err);
      });
  };

  const isUserAllowed = (req, res) => {
    if (_.isUndefined(req.query.teamId) || _.isEmpty(req.query.teamId)) {
      res.status(400).send({
        error: 'teamId is empty',
      });
    } else {
      Users.isUserAllowed(req.session.user.ldap.uid, req.query.teamId)
        .then((result) => {
          res.status(200).send(result);
        })
        .catch(/* istanbul ignore next */ (err) => {
          res.status(400).send(err);
        });
    }
  };

  const getApiKey = (req, res) => {
    Users.createApikey(req.session.user)
      .then((result) => {
        res.status(200).send({
          key: result.key,
          userId: result.userId,
          shortEmail: result.email,
        });
      })
      .catch((err) => {
        res.status(404).send(err);
      });
  };

  const deleteApiKey = (req, res) => {
    Users.deleteApikey(req.session.user)
      .then((result) => {
        res.status(200).send(result);
      })
      .catch((err) => {
        res.status(404).send(err);
      });
  };

  const getActiveUser = (req, res) => {
    // return active user session
    res.send(req.session.user);
  };

  const getUsersInfo = (req, res) => {
    if (!req.body.ids || _.isEmpty(req.body.ids)) {
      res.status(400).send({ error: 'ids is empty' });
    } else {
      Users.getUsersInfo(req.body.ids)
        .then((result) => {
          res.status(200).send(result);
        })
        .catch((err) => {
          res.status(404).send(err);
        });
    }
  };

  const getActiveUserInfo = (req, res) => {
    let userId;
    const user = req.session.user;
    if (user) {
      userId = user ? user.ldap.uid.toUpperCase() : '';
      Users.getUsersInfo(userId)
        .then((result) => {
          res.status(200).send(result);
        })
        .catch((err) => {
          res.status(404).send(err);
        });
    }
  };

  const updateUser = (req, res) => {
    const user = req.session.user;
    const userId = user ? user.ldap.uid.toUpperCase() : '';
    Users.isUserAdmin(userId)
      .then((result) => {
        const userInfo = req.body;
        if (!result) {
          // remove adminAccess override on update if current user is not admin
          delete userInfo.adminAccess;
        }
        return Users.updateUser(userInfo);
      })
      .then((result) => {
        res.status(200).send(result);
      })
      .catch((err) => {
        res.status(404).send(err);
      });
  };

  const createUser = (req, res) => {
    const user = req.session.user;
    const userId = user ? user.ldap.uid.toUpperCase() : '';
    Users.isUserAdmin(userId)
      .then((result) => {
        const userInfo = req.body;
        if (!result) {
          // remove adminAccess override on create if current user is not admin
          delete userInfo.adminAccess;
        }
        return Users.create(userInfo);
      })
      .then((result) => {
        res.status(200).send(result);
      })
      .catch((err) => {
        res.status(404).send(err);
      });
  };

  const isUserImageBroken = (req, res) => {
    Users.isUserImageBroken(req.params.uid)
      .then((result) => {
        res.status(200).send(result);
      })
      .catch(() => {
        res.status(200).send('');
      });
  };

  app.get('/api/users/active', [includes.middleware.auth.requireLogin], getActiveUser);

  app.get('/api/users/isuserallowed', [includes.middleware.auth.requireLogin], isUserAllowed);

  app.get('/api/users/admins', [includes.middleware.auth.requireLogin], getAdmins);
  // try to get data from here
  app.get('/api/users/apikey', [includes.middleware.auth.requireLogin], getApiKey);
  // try to get data from here
  app.delete('/api/users/apikey', [includes.middleware.auth.requireLogin], deleteApiKey);

  app.post('/api/users/info', [includes.middleware.auth.requireLogin], getUsersInfo);

  app.get('/api/users/activeInfo', [includes.middleware.auth.requireLogin], getActiveUserInfo);

  app.put('/api/users/', [includes.middleware.auth.requireLogin], updateUser);

  app.post('/api/users/create', [includes.middleware.auth.requireLogin], createUser);

  app.get('/api/users/image/:uid', [includes.middleware.auth.requireLogin], isUserImageBroken);
};
