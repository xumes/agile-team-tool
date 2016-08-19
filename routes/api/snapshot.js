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
    snapshotModel.getRollUpData('03/18/2016','08/18/2016')
      .then(function(result){
        res.status(200).send(result);
      })
      .catch( /* istanbul ignore next */ function(err){
        res.status(400).send(err);
      });
  }

  app.get('/api/snapshot/updaterollupdata/', [includes.middleware.auth.requireLogin], updateRollUpData);
  app.get('/api/snapshot/getrollupdata/', [includes.middleware.auth.requireLogin], getRollUpData);
};
