var snapshotModel = require('../../models/snapshot');
var _ = require('underscore');

module.exports = function(app, includes) {
  var middleware = includes.middleware;

  getTopLevelTeams = function(req, res) {
    snapshotModel.getTopLevelTeams(req.params.email)
      .then(function(result){
        res.status(200).send(result);
      })
      .catch( /* istanbul ignore next */ function(err){
          res.status(400).send(err);
      });
  },

  updateRollUpSquads = function(req, res) {
    snapshotModel.updateRollUpSquads()
      .then(function(result){
        res.status(200).send(result);
      })
      .catch( /* istanbul ignore next */ function(err){
        res.status(400).send(err);
      });
  },

  updateRollUpData = function(req, res) {
    snapshotModel.updateRollUpData()
      .then(function(result){
        res.status(200).send(result);
      })
      .catch( /* istanbul ignore next */ function(err){
        res.status(400).send(err);
      });
  },

  getRollUpDataByTeam = function(req, res) {
    if (!_.isEmpty(req.params.teamId) && (req.params.teamId != undefined)) {
      snapshotModel.getRollUpDataByTeam(req.params.teamId)
        .then(function(result){
          res.status(200).send(result);
        })
        .catch( /* istanbul ignore next */ function(err){
          res.status(400).send(err);
        });
    } else {
      var msg = {'error' : 'team id is not right'};
      res.status(400).send(msg)
    }
  },

  getRollUpSquadsByTeam = function(req, res) {
    if (!_.isEmpty(req.params.teamId) && (req.params.teamId != undefined)) {
      snapshotModel.getRollUpSquadsByTeam(req.params.teamId)
        .then(function(result){
          res.status(200).send(result);
        })
        .catch( /* istanbul ignore next */ function(err){
          res.status(400).send(err);
        });
    } else {
      var msg = {'error' : 'team id is not right'};
      res.status(400).send(msg)
    }
  },

  // getRollUpData = function(req,res) {
  //   var startTime = req.query.startTime;
  //   var endTime = req.query.endTime;
  //   if (_.isUndefined(startTime)) {
  //     var msg = {'error' : 'missing start time'};
  //     res.status(400).send(msg);
  //   }
  //   else if (_.isUndefined(endTime)) {
  //     var msg = {'error' : 'missing end time'};
  //     res.status(400).send(msg);
  //   }
  //   else if (new Date(endTime) >= new Date()) {
  //     var msg = {'error' : 'end time is after current time'};
  //     res.status(400).send(msg);
  //   }
  //   else if (new Date(endTime) < new Date(startTime)) {
  //     var msg = {'error' : 'start time is after end time'};
  //     res.status(400).send(msg);
  //   } else {
  //     snapshotModel.getRollUpData(startTime, endTime)
  //       .then(function(result){
  //         res.status(200).send(result);
  //       })
  //       .catch( /* istanbul ignore next */ function(err){
  //         res.status(400).send(err);
  //       });
  //   }
  // }

  app.get('/api/snapshot/getteams/:email', [includes.middleware.auth.requireLogin], getTopLevelTeams);
  app.get('/api/snapshot/updaterollupsquads', [includes.middleware.auth.requireLogin], updateRollUpSquads);
  app.get('/api/snapshot/updaterollupdata/', [includes.middleware.auth.requireLogin], updateRollUpData);
  app.get('/api/snapshot/rollupdatabyteam/:teamId', [includes.middleware.auth.requireLogin], getRollUpDataByTeam);
  app.get('/api/snapshot/rollupsquadsbyteam/:teamId', [includes.middleware.auth.requireLogin], getRollUpSquadsByTeam);
  // app.get('/api/snapshot/getrollupdata', [includes.middleware.auth.requireLogin], getRollUpData);
};
