var teamModel = require('../../models/teams');
var iterationModel = require('../../models/iteration');
var util = require('../../helpers/util');
var loggers = require('../../middleware/logger');
var _ = require('underscore');

module.exports = function(app, includes) {
  getIterations = function (req, res) {
    var includeDocs = req.query.docs || false;
    var teamId = req.query.teamId || '';
    if (_.isEmpty(teamId)) {
      res.status(400).send({
        status: 400,
        message: 'Missing parameter. \'teamId\' is required.'
      });
    }
    teamModel.getUserTeamIdsByUid(req.apiuser.userId)
      .then(function(teamIds) {
        /* istanbul ignore else */
        if (_.isEmpty(teamIds) || teamIds.indexOf(teamId) == -1) {
          res.status(400).send({
            status: 400,
            message: 'Unauthorized access.  You must be a member of the team or a member of its parent team.'
          });
        } else {
          iterationModel.getByIterInfo(teamId, includeDocs)
            .then(function(iterations) {
              iterations = util.returnObject(iterations);
              iterations = !_.isEmpty(iterations) ? iterations : [];
              var apiIterations = [];
              _.each(iterations, function(iteration) {
                apiIterations.push(iterationModel.setApiIterationObject(iteration));
              });
              res.status(200).send(apiIterations);
            });
        }
      })
      .catch( /* istanbul ignore next */ function(err) {
        loggers.get('api').error('[v1.iterations.getIterations]:', err);
        res.status(400).send(err);
      });
  };

  putIteration = function (req, res) {
    var data = req.body || {};
    var _id = data._id || '';
    if (_.isEmpty(_id)) {
      res.status(400).send({
        status: 400,
        message: 'Missing iteration id. \'_id\' is required.'
      });
    }
    iterationModel.setApiIterationAction(data, req.apiuser, 'edit')
      .then(function(iterationData) {
        res.status(200).send(iterationModel.setApiIterationObject(iterationData));
      })
      .catch( /* istanbul ignore next */ function(err) {
        loggers.get('api').error('[v1.iterations.putIteration]:', err);
        res.status(400).send(err);
      });
  };

  postIteration = function (req, res) {
    var data = req.body || {};
    var teamId = data.teamId || '';
    teamModel.getUserTeamIdsByUid(req.apiuser.userId)
      .then(function(teamIds) {
        /* istanbul ignore else */
        if (_.isEmpty(teamIds) || teamIds.indexOf(teamId) == -1) {
          res.status(400).send({
            status: 400,
            message: 'Unauthorized access.  You must be a member of the team or a member of its parent team.'
          });
        } else {
          iterationModel.setApiIterationAction(data, req.apiuser, 'add')
            .then(function(iterationData) {
              res.status(200).send(iterationModel.setApiIterationObject(iterationData));
            })
            .catch( /* istanbul ignore next */ function(err) {
              loggers.get('api').error('[v1.iterations.postIteration]:', err);
              res.status(400).send(err);
            });
        }
      })
      .catch( /* istanbul ignore next */ function(err) {
        loggers.get('api').error('[v1.iterations.postIteration]:', err);
        res.status(400).send(err);
      });
  };

  deleteIteration = function (req, res) {
    res.status(400).send({
      status: 400,
      message: 'Deleting iteration is not currently supported.'
    });
  };

  app.get('/v1/iterations', includes.middleware.auth.requireApikey, getIterations);
  app.put('/v1/iterations', includes.middleware.auth.requireApikey, putIteration);
  app.post('/v1/iterations', includes.middleware.auth.requireApikey, postIteration);
  app.delete('/v1/iterations', includes.middleware.auth.requireApikey, deleteIteration);
};
