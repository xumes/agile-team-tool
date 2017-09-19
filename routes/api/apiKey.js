const _ = require('underscore');
const apiKeysModel = require('../../models/apiKeys');

module.exports = (app, includes) => {
  const getApiKey = /* instabul ingore next */ (req, res) => {
    apiKeysModel.createApikey(req.session.user)
      .then((result) => {
        res.status(200).json({
          apiKey: result.key,
          shortEmail: result.email,
        });
      })
      .catch(/* instabul ingore next */ (err) => {
        res.status(400).send(err);
      });
  };

  const getUserApikeyByUser = /* instabul ingore next */ (req, res) => {
    apiKeysModel.getUserApikeyByUser(req.session.user)
      .then((result) => {
        if (!_.isEmpty(result)) {
          res.status(200).json({
            apiKey: result.key,
            shortEmail: result.email,
          });
        } else {
          res.status(404).send(`This user: ${req.session.user.ldap.uid} does not have an api key.`);
        }
      })
      .catch(/* instabul ingore next */ (err) => {
        res.status(400).send(err);
      });
  };

  const deleteApiKey = (req, res) => {
    apiKeysModel.deleteApikey(req.session.user)
      .then((result) => {
        if (result === 'user not exist') {
          res.status(404).send(result);
        } else {
          res.status(200).send(result);
        }
      })
      .catch((err) => {
        res.status(400).send(err);
      });
  };


  // try to get data from here
  /* instabul ingore next */
  app.get('/api/developer/apiKey', [includes.middleware.auth.requireLogin], getApiKey); // old path
  /* instabul ingore next */
  app.get('/api/apiKey/apiKey', [includes.middleware.auth.requireLogin], getApiKey);
  /* instabul ingore next */
  app.get('/api/apiKey/apiKeyByUser', [includes.middleware.auth.requireLogin], getUserApikeyByUser);
  /* instabul ingore next */
  app.delete('/api/apiKey/apikey', [includes.middleware.auth.requireLogin], deleteApiKey);
};
