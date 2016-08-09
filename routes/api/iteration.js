"use strict";

var iterationModel = require('../../models/iteration');
var loggers = require('../../middleware/logger');
var validate = require('validate.js');
var _ = require('underscore');
var sprintf = require("sprintf-js").sprintf;

var formatErrMsg = function(msg){
  loggers.get('api').info('Error: ' + msg);
  return { error : msg };
};

module.exports = function(app, includes) {
  var middleware  = includes.middleware;

  /**
   * Get iteration docs by keys(team_id) or get all iteration info docs
   * Cloudant view1: _design/teams/_view/iterinfo?keys=["ag_team_sample_team1_1469007856095"]
   * Cloudant view2: _design/teams/_view/iterinfo
   * @param {String}   team_id(optional)
   */
  var getIterinfo = function(req, res, next) {
    var teamId = req.params.teamId || undefined;
    loggers.get('api').info('[iterationRoute.getIterinfo] teamId:', teamId);
    iterationModel.getByIterInfo(teamId)
    .then(function(result) {
      res.send(result);
    })
    .catch( /* istanbul ignore next */ function(err) {
      /* cannot simulate Cloudant error during testing */
      formatErrMsg('[iterationRoute.getIterinfo]:' + err);
      return res.status(400).send({ error: err });
    });
  };

  /**
   * Get single iteration doc by docId
   * @param {String}  docId
   */
  var getIterationDoc = function(req, res, next) {
    var docId = req.params.id || undefined;
    loggers.get('api').info('[iterationRoute.getIterationDoc] docId:', docId);
    iterationModel.get(docId)
    .then(function(result) {
      res.send(result);
    })
    .catch( /* istanbul ignore next */ function(err) {
      /* cannot simulate Cloudant error during testing */
      formatErrMsg('[iterationRoute.getIterationDoc]:' + err);
      return res.status(400).send({ error: err });
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
    loggers.get('api').info('[iterationRoute.getCompletedIterations] startkey:%s endkey:%s', startkey, endkey);
    iterationModel.getCompletedIterationsByKey(startkey, endkey)
    .then(function(result) {
      res.send(result);
    })
    .catch( /* istanbul ignore next */ function(err) {
      /* cannot simulate Cloudant error during testing */
      formatErrMsg('[getCompletedIterations]:' + err);
      return res.status(400).send({ error: err });
    });
  };

  /**
   * Add iteration doc
   * @param {String}  request_body
   */
  var createIteration = function(req, res, next) {
    var data = req.body;
    if (_.isEmpty(data)) {
      return res.status(400).send({ error: 'Iteration data is missing' });
    }
    // loggers.get('api').info('[createIteration] POST data:', data);
    // console.log('[createIteration] POST data:', data);
    iterationModel.add(data, req.session['user'], req.session["allTeams"], req.session["myTeams"])
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
      return res.status(400).send({ error: 'iterationId is missing' });
    }
    if (_.isEmpty(data)) {
      return res.status(400).send({ error: 'Iteration data is missing' });
    }
    // loggers.get('api').info('[updateIteration] POST data:', JSON.stringify(data, null, 4));
    iterationModel.edit(curIterationId, data, req.session['user'], req.session["allTeams"], req.session["myTeams"])
    .then(function(result) {
      res.send(result);
    })
    .catch( /* istanbul ignore next */ function(err) {
      /* cannot simulate Cloudant error during testing */
      loggers.get('api').error('[iterationRoute.updateIteration]:', err);
      res.status(400).send(err);
    });
  };

  var getCompletedTeamIteration = function(req, res, next) {
    var team_id = req.query.team_id;
    var end_date1 = req.query.end_date1;
    var end_date2 = req.query.end_date2;

    if (!team_id) {
      return res.status(400).send({ error: 'Team Id is missing' });
    }

    if (!end_date1) {
      return res.status(400).send({ error: 'Earliest end date is missing' });
    }

    if (!end_date2) {
      return res.status(400).send({ error: 'Latest end date is missing' });
    }

    loggers.get('api').info('[iterationRoute.getCompletedTeamIteration] team_id:%s end_date1:%s end_date2:%s', team_id, end_date1, end_date2);
    var q = '';
    q = sprintf("team_id:%s AND status:Completed end_date:[%s TO %s]&sort=-end_date", team_id, end_date1, end_date2);
    loggers.get('api').info('[iterationRoute.getCompletedTeamIteration] q:' + q);
    iterationModel.completedTeamIteration(q)
    .then(function(result) {
      return res.status(200).send(result);
    })
    .catch( /* istanbul ignore next */ function(err) {
      /* cannot simulate Cloudant error during testing */
      formatErrMsg('[iterationRoute.getCompletedTeamIteration]:', err);
      return res.status(400).send({ error: err });
    });
  };

  app.get('/api/iteration/completed/byteam', [includes.middleware.auth.requireLogin], getCompletedTeamIteration);
  app.get('/api/iteration/completed', [includes.middleware.auth.requireLogin], getCompletedIterations);
  app.get('/api/iteration/:teamId?', [includes.middleware.auth.requireLogin], getIterinfo);
  app.get('/api/iteration/current/:id', [includes.middleware.auth.requireLogin], getIterationDoc);

  app.post('/api/iteration', [includes.middleware.auth.requireLogin], createIteration);
  app.put('/api/iteration/:iterationId?', [includes.middleware.auth.requireLogin], updateIteration);
};