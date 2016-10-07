var teamModel = require('../../models/teams');
var util = require('../../helpers/util');
var loggers = require('../../middleware/logger');
var _ = require('underscore');

module.exports = function(app, includes) {
  getTeams = function (req, res) {
    var includeDocs = req.query.docs || false;
    var all = req.query.all || false;
    if (all) {
      teamModel.getUserTeamIdsByUid(req.apiuser.userId)
        .then(function(teamIds) {
          return teamModel.getAllTeams(teamIds, includeDocs);
        })
        .then(function(teams) {
          res.status(200).send(teams);
        })
        .catch( /* istanbul ignore next */ function(err) {
          loggers.get('api').error('[v1.teams.getTeams]:', err);
          res.status(400).send(err);
        });
    } else {
      teamModel.getTeamByUid(req.apiuser.userId, includeDocs)
        .then(function(teams) {
          teams = util.returnObject(teams);
          teams = !_.isEmpty(teams) ? teams : [];
          res.status(200).send(teams);
        })
        .catch( /* istanbul ignore next */ function(err) {
          loggers.get('api').error('[v1.teams.getTeams]:', err);
          res.status(400).send(err);
        });
    }
  };

  app.get('/v1/teams', includes.middleware.auth.requireApikey, getTeams);
};
