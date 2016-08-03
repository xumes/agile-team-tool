var util = require('../../helpers/util');

// Admins stored at document id ag_ref_access_control
var adminId = 'ag_ref_access_control';
// System status stored at document id ag_ref_system_status_control
var systemId = 'ag_ref_system_status_control';


module.exports = function(app, includes) {
  var middleware  = includes.middleware;

  getAdmins = function(req, res) {
    util.getAdmins(adminId)
      .then(function(result){
        res.status(200).send(result);
      })
      /* istanbul ignore next */
      .catch(function(err){
        res.status(400).send(err);
      });
  };

  getSystemStatus = function(req, res) {
    util.getSystemStatus(systemId)
      .then(function(result){
        res.status(200).send(result);
      })
      /* istanbul ignore next */
      .catch(function(err){
        res.status(400).send(err);
      });
  };

  getServerTime = function(req, res) {
     var result = util.getServerTime();
     res.status(200).send(result);
  };

  // Get admins and supports api call
  app.get('/api/util/admins', [includes.middleware.auth.requireLogin], getAdmins);
  // Get system status api call
  app.get('/api/util/systemstatus', [includes.middleware.auth.requireLogin], getSystemStatus);
  // Get server time api call
  app.get('/api/util/servertime', [includes.middleware.auth.requireLogin], getServerTime);
};
