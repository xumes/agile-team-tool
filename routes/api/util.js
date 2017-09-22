const System = require('../../models/system');
const util = require('../../helpers/util');

module.exports = (app, includes) => {
  const getSystemStatus = (req, res) => {
    System.getSystemStatus()
      .then((result) => {
        res.status(200).send(result);
      })
      .catch(/* istanbul ignore next */ (err) => {
        res.status(400).send(err);
      });
  };

  const getServerTime = (req, res) => {
    const result = util.getServerTime();
    res.status(200).send(result);
  };


  // Get system status api call
  app.get('/api/util/systemstatus', [includes.middleware.auth.requireLogin], getSystemStatus);
  // Get server time api call
  app.get('/api/util/servertime', [includes.middleware.auth.requireLogin], getServerTime);
};
