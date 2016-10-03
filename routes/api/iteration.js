'use strict';
var util = require('../../helpers/util');
var loggers = require('../../middleware/logger');
var validate = require('validate.js');
var _ = require('underscore');
var sprintf = require('sprintf-js').sprintf;
var setting = require('../../settings.js');
var iterationModel = require('../../models/mongodb/iterations');

var formatErrMsg = function(msg) {
  loggers.get('api').error('Error: ' + msg);
  return {
    error: msg
  };
};

module.exports = function(app, includes) {
  var middleware = includes.middleware;

  /**
   * Get iteration docs by keys(teamId) or get all iteration info docs
   * Cloudant view1: _design/teams/_view/iterinfo?keys=["ag_team_sample_team1_1469007856095"]
   * Cloudant view2: _design/teams/_view/iterinfo
   * @param {String}   teamId(optional)
   */
  var getIterinfo = function(req, res, next) {
    var teamId = req.params.teamId || undefined;
    loggers.get('api').verbose('[iterationRoute.getIterinfo] teamId:', teamId);
    iterationModel.getByIterInfo(teamId)
      .then(function(result) {
        res.status(200).send(result);
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
   * @return mongodb will return null if no match id
   */
  var getIterationDoc = function(req, res, next) {
    var docId = req.params.id || undefined;
    loggers.get('api').verbose('[iterationRoute.getIterationDoc] docId:', docId);
    iterationModel.get(docId)
      .then(function(result) {
        res.status(200).send(result);
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
        res.status(200).send(result);
      })
      .catch( /* istanbul ignore next */ function(err) {
        /* cannot simulate Cloudant error during testing */
        formatErrMsg('[getCompletedIterations]:' + err);
        return res.status(400).send(err);
      });
  };

  /**
   * Add iteration doc
   * @param {String}  request_body
   */
  var createIteration = function(req, res, next) {
    var data = req.body;
    if (_.isEmpty(data)) {
      return res.status(400).send({
        error: 'Iteration data is missing'
      });
    }
    // loggers.get('api').verbose('[createIteration] POST data:', data);
    // console.log('[createIteration] POST data:', data);
    iterationModel.add(data, req.session['user'])
      .then(function(result) {
        res.send(result);
      })
      .catch( /* istanbul ignore next */ function(err) {
        /* cannot simulate Cloudant error during testing */
        // console.log('[api] [createIteration]:', err);
        loggers.get('api').error('[iterationRoute.createIteration]:', err);
        res.status(400).send(err);
      });
  };

  /**
   * Update iteration doc
   * @param {String}  iteration docId
   * @param {String}  request_body
   */
  var updateIteration = function(req, res, next) {
    var curIterationId = req.params.iterationId;
    var data = req.body;
    if (_.isEmpty(curIterationId)) {
      return res.status(400).send({
        error: 'iterationId is missing'
      });
    }
    if (_.isEmpty(data)) {
      return res.status(400).send({
        error: 'Iteration data is missing'
      });
    }
    // loggers.get('api').verbose('[updateIteration] POST data:', JSON.stringify(data, null, 4));
    iterationModel.edit(curIterationId, data, req.session['user'])
      .then(function(result) {
        res.status(200).send(result);
      })
      .catch( /* istanbul ignore next */ function(err) {
        /* cannot simulate Cloudant error during testing */
        loggers.get('api').error('[iterationRoute.updateIteration]:', err);
        res.status(400).send(err);
      });
  };

  /**
   * Search index function for Iteration docs
   * Cloudant views: _design/iterations/_search/searchAll?q=teamId AND completed:Y AND end_date:[20160401 TO 20160723]&include_docs=true&sort="-end_date"
   * Accepts querystring parameters such as:
   * @param {String}    id (teamId) (required)
   * @param {String}    status (Y or N) (optional)
   * @param {Date}      startdate (format: YYYYMMDD) (optional)
   * @param {Date}      enddate (format: YYYYMMDD) (optional)
   * @param {Number}    limit (optional)
   * @param {Boolean}   includeDocs (true or false) (optional)
   */
  var searchTeamIteration = function(req, res, next) {
    var teamId = req.query.id;
    if (!teamId) {
      return res.status(400).send({
        error: 'TeamId is required'
      });
    }
    var params = {
      id: teamId,
      status: req.query.status,
      startDate: req.query.startdate,
      endDate: req.query.enddate,
      includeDocs:  req.query.includeDocs,
      limit: req.query.limit
    };
    iterationModel.searchTeamIteration(params)
      .then(function(result) {
        return res.status(200).send(result);
      })
      .catch( /* istanbul ignore next */ function(err) {
        formatErrMsg('[iterationRoute.searchTeamIteration]:', err);
        return res.status(400).send(err);
      });
  };

  app.get('/api/iteration/searchTeamIteration', [includes.middleware.auth.requireLogin], searchTeamIteration);
  app.get('/api/iteration/completed', [includes.middleware.auth.requireLogin], getCompletedIterations);
  app.get('/api/iteration/:teamId?', [includes.middleware.auth.requireLogin], getIterinfo);
  app.get('/api/iteration/current/:id', [includes.middleware.auth.requireLogin], getIterationDoc);
  app.post('/api/iteration', [includes.middleware.auth.requireLogin], createIteration);
  app.put('/api/iteration/:iterationId?', [includes.middleware.auth.requireLogin], updateIteration);
};
