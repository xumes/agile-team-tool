var snapshotModel = require('../../models/snapshot');
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

  updateAssessmentRollUpData = function(req, res) {
    snapshotModel.updateAssessmentRollUpData()
      .then(function(result) {
        res.status(200).send(result);
      })
      .catch( /* istanbul ignore next */ function(err) {
        res.status(400).send(err);
      });
  },

  getAssessmentRollUpByTeam = function(req, res) {
    if (!_.isEmpty(req.params.teamId) && (req.params.teamId != undefined)) {
      snapshotModel.getAssessmentRollUpByTeam(req.params.teamId)
        .then(function(result) {
          res.status(200).send(result);
        })
        .catch( /* istanbul ignore next */ function(err) {
          res.status(400).send(err);
        });
    } else {
      var msg = {
        'error': 'Missing team id.'
      };
      res.status(400).send(msg);
    }
  },

  cleanUpDb = function(req, res) {
    if (!req.params.teamId) {
      res.status(400).send({'error': 'id is empty'});
    } else {
      console.log(req.params.teamId);
      snapshotModel.cleanUpDb(req.params.teamId)
      .then(function(result) {
        res.status(200).send(result);
      })
      .catch( /* istanbul ignore next */ function(err) {
        res.status(400).send(err);
      });
    }
  },

  batchCleanUpDb = function(req, res) {
    if (!req.body.id) {
      res.status(400).send({'error': 'id is empty'});
    } else {
      snapshotModel.batchCleanUpDb(req.body.id)
      .then(function(result) {
        res.status(200).send(result);
      })
      .catch( /* istanbul ignore next */ function(err) {
        res.status(400).send(err);
      });
    }
  },

  app.get('/api/snapshot/getteams/:email', [includes.middleware.auth.requireLogin], getTopLevelTeams);
  app.get('/api/snapshot/updaterollupsquads', [includes.middleware.auth.requireLogin], updateRollUpSquads);
  app.get('/api/snapshot/updaterollupdata/', [includes.middleware.auth.requireLogin], updateRollUpData);
  app.get('/api/snapshot/rollupdatabyteam/:teamId', [includes.middleware.auth.requireLogin], getRollUpDataByTeam);
  app.get('/api/snapshot/rollupsquadsbyteam/:teamId', [includes.middleware.auth.requireLogin], getRollUpSquadsByTeam);
  app.get('/api/snapshot/completeiterations', [includes.middleware.auth.requireLogin], completeIterations);
  app.get('/api/snapshot/updateAssessmentRollUpData', [includes.middleware.auth.requireLogin], updateAssessmentRollUpData);
  app.get('/api/snapshot/rollupassessmentbyteam/:teamId', [includes.middleware.auth.requireLogin], getAssessmentRollUpByTeam);
  app.get('/api/snapshot/cleanup/:teamId', cleanUpDb);
  app.delete('/api/snapshot/batchcleanup', batchCleanUpDb);
};
