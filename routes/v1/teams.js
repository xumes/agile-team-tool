var teamModel = require('../../models/teams');
var loggers = require('../../middleware/logger');
var cors = require('cors');

module.exports = function(app, includes) {
  getTeams = function (req, res) {
    //return teamModel.getTeamsByUserId(req.apiuser.userId)
    return teamModel.getAllUserTeamsByUserId(req.apiuser.userId)
      .then(function(teams) {
        res.status(200).send(teams);
      })
      .catch( /* istanbul ignore next */ function(err) {
        loggers.get('api').error('[v1.teams.getTeams]:', err);
        res.status(400).send(err);
      });
  };

  app.get('/v1/teams', cors({origin: true}), includes.middleware.auth.requireMongoApikey, getTeams);
};
