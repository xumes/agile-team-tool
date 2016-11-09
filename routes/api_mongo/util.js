var System = require('../../models/mongodb/system');
var util = require('../../helpers/util');

module.exports = function(app, includes) {
  var middleware = includes.middleware;

  getSystemStatus = function(req, res) {
    System.getSystemStatus()
      .then(function(result) {
        res.status(200).send(result);
      })
      .catch( /* istanbul ignore next */ function(err) {
        res.status(400).send(err);
      });
  };

  getServerTime = function(req, res) {
    var result = util.getServerTime();
    res.status(200).send(result);
  };


  // Get system status api call
  app.get('/api/util/systemstatus', [includes.middleware.auth.requireLogin], getSystemStatus);
  // Get server time api call
  app.get('/api/util/servertime', [includes.middleware.auth.requireLogin], getServerTime);
};
