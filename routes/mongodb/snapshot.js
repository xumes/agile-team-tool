var snapshotModel = require('../../models/mongodb/snapshot');
var _ = require('underscore');

module.exports = function(app, includes) {
  var middleware = includes.middleware;

  getTopLevelTeams = function(req, res) {
    snapshotModel.getTopLevelTeams(req.params.email)
      .then(function(result) {
        res.status(200).send(result);
      })
      .catch( /* istanbul ignore next */ function(err) {
        res.status(400).send(err);
      });
  },

  updateRollUpSquads = function(req, res) {
    snapshotModel.updateRollUpSquads()
      .then(function(result) {
        res.status(200).send(result);
      })
      .catch( /* istanbul ignore next */ function(err) {
        res.status(400).send(err);
      });
  },

  updateRollUpData = function(req, res) {
    snapshotModel.updateRollUpData()
      .then(function(result) {
        res.status(200).send(result);
      })
      .catch( /* istanbul ignore next */ function(err) {
        res.status(400).send(err);
      });
  },

  getRollUpDataByTeam = function(req, res) {
    if (!_.isEmpty(req.params.teamId) && (req.params.teamId != undefined)) {
      snapshotModel.getRollUpDataByTeam(req.params.teamId)
        .then(function(result) {
          res.status(200).send(result);
        })
        .catch( /* istanbul ignore next */ function(err) {
          res.status(400).send(err);
        });
    } else {
      var msg = {
        'error': 'team id is not right'
      };
      res.status(400).send(msg);
    }
  },

  getRollUpSquadsByTeam = function(req, res) {
    if (!_.isEmpty(req.params.teamId) && (req.params.teamId != undefined)) {
      snapshotModel.getRollUpSquadsByTeam(req.params.teamId)
        .then(function(result) {
          res.status(200).send(result);
        })
        .catch( /* istanbul ignore next */ function(err) {
          res.status(400).send(err);
        });
    } else {
      var msg = {
        'error': 'team id is not right'
      };
      res.status(400).send(msg);
    }
  },

  completeIterations = function(req, res) {
    snapshotModel.completeIterations()
      .then(function(result) {
        res.status(200).send(result);
      })
      .catch( /* istanbul ignore next */ function(err) {
        res.status(400).send(err);
      });
  },

  app.get('/api/mongodb/snapshot/updaterollupdata/', [includes.middleware.auth.requireLogin], updateRollUpData);
};
