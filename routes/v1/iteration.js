var teamModel = require('../../models/teams');
var iterationModel = require('../../models/iterations');
var userModel = require('../../models/users');
var util = require('../../helpers/util');
var loggers = require('../../middleware/logger');
var _ = require('underscore');
var cors = require('cors');

module.exports = function(app, includes) {
  getIterations = function (req, res) {
    var teamId = req.query.teamId || '';
    if (_.isEmpty(teamId)) {
      res.status(400).send({
        status: 400,
        message: 'Missing parameter. \'teamId\' is required.'
      });
    } else {
      userModel.isUserAllowed(req.apiuser.userId,teamId)
        .then(function(isAllowed) {
          if (!isAllowed) {
            res.status(400).send({message: 'Unauthorized access.  You must be a member of the team or a member of its parent team.'});
          } else {
            iterationModel.getByIterInfo(teamId)
              .then(function(iterations) {
                res.status(200).send(iterations);
              })
              .catch( /* istanbul ignore next  */ function(err) {
                loggers.get('api').error('[v1.iterations.getIterations]:', err);
                res.status(400).send(err);
              });
          }
        })
        .catch( /* istanbul ignore next  */ function(err) {
          loggers.get('api').error('[v1.iterations.getIterations]:', err);
          res.status(400).send(err);
        });
    }
  };

  putIteration = function (req, res) {
    var data = req.body || {};
    var _id = data._id || '';
    if (_.isEmpty(_id)) {
      res.status(400).send({
        message: 'Missing iteration id. \'_id\' is required.'
      });
    } else {
      if (_.isEmpty(data)) {
        res.status(400).send({
          error: 'Iteration data is missing'
        });
      }
      iterationModel.edit(data._id, data, req.apiuser)
        .then(function(result) {
          res.status(200).send(result);
        })
        .catch( /* istanbul ignore next */ function(err) {
        /* cannot simulate Cloudant error during testing */
          loggers.get('api').error('[v1_mongo.iterations.putIteration]:', err);
          res.status(400).send(err);
        });
    }
  };

  postIteration = function (req, res) {
    var data = req.body || {};
    var teamId = data.teamId || '';
    teamModel.getTeamsByUserId(req.apiuser.userId)
      .then(function(teamIds) {
        /* istanbul ignore else */
        if (_.isEmpty(teamId)) {
          res.status(400).send({
            message: 'Missing parameter. \'teamId\' is required.'
          });
        } else {
          iterationModel.add(data, req.apiuser)
            .then(function(iterationData) {
              res.status(200).send(iterationData);
            })
            .catch( /* istanbul ignore next */ function(err) {
              loggers.get('api').error('[v1.iterations.postIteration - add]:', err);
              res.status(400).send(err);
            });
        }
      })
      .catch( /* istanbul ignore next */ function(err) {
        loggers.get('api').error('[v1.iterations.postIteration - isUserAllowed]:', err);
        res.status(400).send(err);
      });
  };

  deleteIteration = function (req, res) {
    res.status(400).send({
      status: 400,
      message: 'Deleting iteration is not currently supported.'
    });
  };

  app.get('/v1/iterations', cors({origin: '*'}), includes.middleware.auth.requireMongoApikey, getIterations);
  app.put('/v1/iterations', cors({origin: '*'}), includes.middleware.auth.requireMongoApikey, putIteration);
  app.post('/v1/iterations', cors({origin: '*'}), includes.middleware.auth.requireMongoApikey, postIteration);
  app.delete('/v1/iterations', cors({origin: '*'}), includes.middleware.auth.requireMongoApikey, deleteIteration);
};
