var teamscoreModel = require('../../models/teamscore');

module.exports = function(app, includes) {

  // getTimezone = function(req, res){
  //   var location = req.body.loc;
  //   teamscoreModel.getTimezone(location)
  //     .then(function(result){
  //       res.status(200).send(result);
  //     })
  //     .catch(function(err){
  //       res.status(err.statusCode).send(err);
  //     });
  // };

  calculateScoreByTimezone = function(req, res) {
    teamscoreModel.calculateScoreByTimezone(req.body.loc)
      .then(function(result){
        // result is number, '' change it to string
        res.status(200).send(result);
      })
      .catch( /* istanbul ignore next */ function(err){
        res.status(err.statusCode).send(err.message);
      });
  };
  // app.post('/api/teamscore/gettimezone/', [includes.middleware.auth.requireLogin], getTimezone);

  app.post('/api/teamscore/calculate/', [includes.middleware.auth.requireLogin], calculateScoreByTimezone);
};
