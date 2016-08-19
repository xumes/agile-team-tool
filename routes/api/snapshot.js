var snapshotModel = require('../../models/snapshot');

module.exports = function(app, includes) {
  var middleware = includes.middleware;

  updateRollUpData = /* istanbul ignore next */ function(req, res) {
    snapshotModel.updateRollUpData()
      .then(function(result){
        res.status(200).send(result);
      })
      .catch( /* istanbul ignore next */ function(err){
        res.status(400).send(err);
      });
  },

  getRollUpData = function(req,res) {
    var startTime = req.query.startTime;
    var endTime = req.query.endTime;
    if (_.isUndefined(startTime)) {
      var msg = {'error' : 'missing start time'};
      res.status(400).send(msg);
    }
    else if (_.isUndefined(endTime)) {
      var msg = {'error' : 'missing end time'};
      res.status(400).send(msg);
    }
    else if (new Date(endTime) >= new Date()) {
      var msg = {'error' : 'end time is after current time'};
      res.status(400).send(msg);
    }
    else if (new Date(endTime) < new Date(startTime)) {
      var msg = {'error' : 'start time is after end time'};
      res.status(400).send(msg);
    } else {
      snapshotModel.getRollUpData(startTime, endTime)
        .then(function(result){
          res.status(200).send(result);
        })
        .catch( /* istanbul ignore next */ function(err){
          res.status(400).send(err);
        });
    }
  }

  app.get('/api/snapshot/updaterollupdata/', [includes.middleware.auth.requireLogin], updateRollUpData);
  app.get('/api/snapshot/getrollupdata', [includes.middleware.auth.requireLogin], getRollUpData);
};
