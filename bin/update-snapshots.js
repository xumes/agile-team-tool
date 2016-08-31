var schedule = require('node-schedule');
var snapshot = require('../models/snapshot');
var workerLogger  = require('../middleware/logger').get('worker');

schedule.scheduleJob('*/15 * * * *', function() {
  snapshot.updateRollUpSquads()
    .then(function() {
      workerLogger.verbose('Successfully updated iteration rollup data for squads');
    })
    .catch(function(err) {
      workerLogger.error('Unable to update rollup data err=', err);
    });
  snapshot.updateRollUpData()
    .then(function() {
      workerLogger.verbose('Successfully updated score roll-up data for squads');
    })
});