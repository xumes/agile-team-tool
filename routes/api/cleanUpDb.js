var cleanUpModel = require('../../models/cleanUpDb');
var _ = require('underscore');

module.exports = function(app, includes) {
  var middleware  = includes.middleware;
  cleanUpDataById = function(req, res) {
    if (req.body.id != undefined && !_.isEmpty(req.body.id)) {
          cleanUpModel.cleanUpDataById(req.body.id)
            .then(function(result){
              res.status(200).send(result);
            })
            .catch(function(err){
              res.status(400).send(err);
            });
    } else {
      var err = {'error' : 'id is empty'};
      res.status(400).send(err);
    }
  }

  app.delete('/api/cleanup/'/*,[includes.middleware.auth.requireLogin]*/, cleanUpDataById);
}
