var teamscoreModel = require('../../models/teamscore');

module.exports = function(app, includes) {
  getGpsCoordinate = function(req, res){
    var location = req.params.location;
    teamscoreModel.getGpsCoordinate(location)
      .then(function(result){
        res.status(200).send(result);
      })
      .catch(function(err){
        res.status(err.statusCode).send(err);
      });
  };

  getTimezone = function(req, res){
    var location = req.body.loc;
    teamscoreModel.getTimezone(location)
      .then(function(result){
        res.status(200).send(result);
      })
      .catch(function(err){
        res.status(err.statusCode).send(err);
      });
  };

  calculateScore = function(req, res) {
    teamscoreModel.calculateScore(req.body)
      .then(function(result){
        // result is number, '' change it to string
        res.status(200).send(''+result);
      })
      .catch(function(err){
        res.status(err.statusCode).send(err.message);
      });
  };

  calculateScoreByTimezone = function(req, res) {
    teamscoreModel.calculateScoreByTimezone(req.body.loc)
      .then(function(result){
        // result is number, '' change it to string
        res.status(200).send(''+result);
      })
      .catch(function(err){
        res.status(err.statusCode).send(err.message);
      });
  };

  app.post('/api/teamscore/calculatescore/', [includes.middleware.auth.requireLogin], calculateScore);

  // Transfer location(city, state, country) info to gps coordinate api
  app.get('/api/teamscore/getgpscoordinate/:location', [includes.middleware.auth.requireLogin], getGpsCoordinate);
  // Transfer location info to time zone
  app.post('/api/teamscore/gettimezone/', [includes.middleware.auth.requireLogin], getTimezone);

  app.post('/api/teamscore/calculate/', [includes.middleware.auth.requireLogin], calculateScoreByTimezone);
};
