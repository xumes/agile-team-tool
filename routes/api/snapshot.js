const snapshotModel = require('../../models/snapshot');
const _ = require('underscore');

module.exports = (app, includes) => {
  const updateRollUpData = (req, res) => {
    snapshotModel.updateRollUpData()
      .then((result) => {
        res.status(200).send(result);
      })
      .catch(/* istanbul ignore next */ (err) => {
        res.status(400).send(err);
      });
  };

  const getRollUpDataByTeam = (req, res) => {
    if (!_.isEmpty(req.params.teamId) && (req.params.teamId !== undefined)) {
      snapshotModel.getRollUpDataByTeamId(req.params.teamId)
        .then((result) => {
          res.status(200).send(result);
        })
        .catch(/* istanbul ignore next */ (err) => {
          res.status(400).send(err);
        });
    } else {
      const msg = {
        error: 'team id is not right',
      };
      res.status(400).send(msg);
    }
  };

  const completeIterations = (req, res) => {
    snapshotModel.completeIterations()
      .then((result) => {
        res.status(200).send(result);
      })
      .catch(/* istanbul ignore next */ (err) => {
        res.status(400).send(err);
      });
  };

  const updateUsersLocation = (req, res) => {
    snapshotModel.updateUsersLocation()
      .then((result) => {
        res.status(200).send(result);
      })
      .catch(/* istanbul ignore next */ (err) => {
        res.status(400).send(err);
      });
  };

  app.get('/api/snapshot/completeiterations', [includes.middleware.auth.requireLogin], completeIterations);
  app.get('/api/snapshot/get/:teamId', [includes.middleware.auth.requireLogin], getRollUpDataByTeam);
  app.get('/api/snapshot/updaterollupdata/', [includes.middleware.auth.requireLogin], updateRollUpData);
  app.get('/api/snapshot/updateuserslocation', [includes.middleware.auth.requireLogin], updateUsersLocation);
};
