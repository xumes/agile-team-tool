var teamModel = require('../../models/mongodb/teams');
var iterationModel = require('../../models/mongodb/iterations');
var userModel = require('../../models/mongodb/users');
var util = require('../../helpers/util');
var loggers = require('../../middleware/logger');
var _ = require('underscore');

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
    console.log ('_id : '+ _id);
    if (_.isEmpty(_id)) {
      console.log ('_id is empty ');
      res.status(400).send({
        message: 'Missing iteration id. \'_id\' is required.'
      });
    } else {
      if (_.isEmpty(data)) {
        console.log ('data is empty ');
        res.status(400).send({
          error: 'Iteration data is missing'
        });
      }
      console.log ('req session userid : '+ req.apiuser.userId);
      iterationModel.edit(data._id, data, req.apiuser.userId)
        .then(function(result) {
          console.log ('Successful update data. v1_mongo.iterations.putIteration');
          res.status(200).send(result);
        })
        .catch( /* istanbul ignore next */ function(err) {
        /* cannot simulate Cloudant error during testing */
        // console.log('[api] [createIteration]:', err);
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
          console.log ('req session userid : '+ req.apiuser.userId);
          iterationModel.add(data, req.apiuser.userId)
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

  app.get('/v1_mongo/iterations', includes.middleware.auth.requireApikey, getIterations);
  app.put('/v1_mongo/iterations', includes.middleware.auth.requireApikey, putIteration);
  app.post('/v1_mongo/iterations', includes.middleware.auth.requireApikey, postIteration);
  app.delete('/v1/iterations', includes.middleware.auth.requireApikey, deleteIteration);
};
