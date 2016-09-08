var schedule = require('node-schedule');
var snapshot = require('../models/snapshot');
var workerLogger = require('../middleware/logger').get('worker');

schedule.scheduleJob('*/3 * * * *', function() {
  snapshot.updateRollUpData()
    .then(function() {
      workerLogger.verbose('Successfully updated iteration rollup data for squads');
      snapshot.updateRollUpSquads()
        .then(function() {
          workerLogger.verbose('Successfully updated score roll-up data for squads');
        })
        .catch(function(err) {
          workerLogger.error('Unable to update rollup score err=', err);
        });
    })
    .catch(function(err) {
      workerLogger.error('Unable to update rollup data err=', err);
    });
});