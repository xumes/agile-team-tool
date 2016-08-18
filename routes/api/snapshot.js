var snapshotModel = require('../../models/snapshot');

module.exports = function(app, includes) {
  var middleware = includes.middleware;
  rollUpData = function(req, res) {
    snapshotModel.calculation()
      .then(function(result){
        res.status(200).send(result);
      })
      .catch( /* istanbul ignore next */ function(err){
        res.status(400).send(err);
      });
  }
  app.get('/api/snapshot/rollupdata/', [includes.middleware.auth.requireLogin], rollUpData);
};
