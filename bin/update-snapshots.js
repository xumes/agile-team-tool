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

schedule.scheduleJob('1 0 * * *', function() {
  snapshot.completeIterations()
    .then(function() {
      workerLogger.verbose('Successfully processed "Not Complete" iterations.');
    })
    .catch(function(err) {
      workerLogger.error('Unable to process "Not Complete" iterations err=', err);
    });
});
