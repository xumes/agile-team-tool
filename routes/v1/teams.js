const teamModel = require('../../models/teams');
const loggers = require('../../middleware/logger');
const cors = require('cors');

module.exports = (app, includes) => {
  function getTeams(req, res) {
    // return teamModel.getTeamsByUserId(req.apiuser.userId)
    return teamModel.getAllUserTeamsByUserId(req.apiuser.userId)
      .then((teams) => {
        res.status(200).send(teams);
      })
      .catch(/* istanbul ignore next */ (err) => {
        loggers.get('api').error('[v1.teams.getTeams]:', err);
        res.status(400).send(err);
      });
  }

  app.get('/v1/teams', cors({ origin: true }), includes.middleware.auth.requireMongoApikey, getTeams);
};
