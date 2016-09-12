var mapModel = require('../../models/teamscore');

module.exports = function(app, includes) {
  getGpsCoordinate = function(req, res){
    var location = req.params.location;
    mapModel.getGpsCoordinate(location)
      .then(function(result){
        res.status(200).send(result);
      })
      .catch(function(err){
        res.status(err.statusCode).send(err);
      });
  };

  getTimezone = function(req, res){
    var location = req.params.location;
    mapModel.getTimezone(location)
      .then(function(result){
        res.status(200).send(result);
      })
      .catch(function(err){
        res.status(err.statusCode).send(err);
      });
  };

  // Transfer location(city, state, country) info to gps coordinate api
  app.get('/api/teamscore/getgpscoordinate/:location', [includes.middleware.auth.requireLogin], getGpsCoordinate);
  // Transfer location info to time zone
  app.get('/api/teamscore/gettimezone/:location', [includes.middleware.auth.requireLogin], getTimezone);
};
