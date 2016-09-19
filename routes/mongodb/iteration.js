var iterationModel = require('../../models/mongodb/iteration.js');
var util = require('../../helpers/util');
var loggers = require('../../middleware/logger');
var _ = require('underscore');

var formatErrMsg = function(msg) {
  loggers.get('api').error('Error: ' + msg);
  return {
    error: msg
  };
};

module.exports = function(app, includes) {
  var middleware = includes.middleware;

  /**
   * Get iteration docs by keys(team_id) or get all iteration info docs
   * Cloudant view1: _design/teams/_view/iterinfo?keys=["ag_team_sample_team1_1469007856095"]
   * Cloudant view2: _design/teams/_view/iterinfo
   * @param {String}   team_id(optional)
   */
  var getIterinfo = function(req, res, next) {
    var teamId = req.params.teamId || undefined;
    loggers.get('api').verbose('[iterationRoute.getIterinfo] teamId:', teamId);
    iterationModel.getByIterInfo(teamId)
      .then(function(result) {
        res.send(result);
      })
      .catch( /* istanbul ignore next */ function(err) {
        /* cannot simulate Cloudant error during testing */
        formatErrMsg('[iterationRoute.getIterinfo]:' + err);
        return res.status(400).send(err);
      });
  };

  /**
   * Get single iteration doc by docId
   * @param {String}  docId
   */
  var getIterationDoc = function(req, res, next) {
    var docId = req.params.id || undefined;
    loggers.get('api').verbose('[iterationRoute.getIterationDoc] docId:', docId);
    iterationModel.get(docId)
      .then(function(result) {
        res.send(result);
      })
      .catch( /* istanbul ignore next */ function(err) {
        /* cannot simulate Cloudant error during testing */
        formatErrMsg('[iterationRoute.getIterationDoc]:', JSON.stringify(err));
        return res.status(400).send(err);
      });
  };

  /**
   * Get completed iterations by keys(startkey/endkey)
   * @param {String}  startkey
   * @param {String}  endkey
   */
  var getCompletedIterations = function(req, res, next) {
    var startkey = req.query.startkey || undefined;
    var endkey = req.query.endkey || undefined;
    loggers.get('api').verbose('[iterationRoute.getCompletedIterations] startkey:%s endkey:%s', startkey, endkey);
    iterationModel.getCompletedIterationsByKey(startkey, endkey)
      .then(function(result) {
        res.send(result);
      })
      .catch( /* istanbul ignore next */ function(err) {
        /* cannot simulate Cloudant error during testing */
        formatErrMsg('[getCompletedIterations]:' + err);
        return res.status(400).send(err);
      });
  };

  app.get('/api/mongodb/iteration/completed', [includes.middleware.auth.requireLogin], getCompletedIterations);
  app.get('/api/mongodb/iteration/current/:id', [includes.middleware.auth.requireLogin], getIterationDoc);
  app.get('/api/mongodb/iteration/:teamId?', [includes.middleware.auth.requireLogin], getIterinfo);
};
