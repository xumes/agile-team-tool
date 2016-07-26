var otherModel = require('../../models/others');

// Admins stored at document id ag_ref_access_control
var adminId = 'ag_ref_access_control';
// System status stored at document id ag_ref_system_status_control
var systemId = 'ag_ref_system_status_control';


module.exports = function(app, includes) {
  var middleware  = includes.middleware;

  getAdmins = function(req, res) {
    otherModel.getAdmins(adminId)
      .then(function(result){
        res.send(200, result);
      })
      .catch(function(err){
        res.send(400, err);
      });
  };

  getSystemStatus = function(req, res) {
    otherModel.getSystemStatus(systemId)
      .then(function(result){
        res.send(200, result);
      })
      .catch(function(err){
        res.send(400, err);
      });
  };

  getServerTime = function(req, res) {
    var result = otherModel.getServerTime();
    res.send(200, result);
  };

  // Get admins and supports api call
  app.get('/api/others/admins', [includes.middleware.auth.requireLogin], getAdmins);
  // Get system status api call
  app.get('/api/others/systemstatus', [includes.middleware.auth.requireLogin], getSystemStatus);
  // Get server time api call
  app.get('/api/others/servertime', [includes.middleware.auth.requireLogin], getServerTime);
};
