"use strict";

var teamModel = require('../../models/teams');
var iterationModel = require('../../models/iteration');

module.exports = function(app, includes) {
  var middleware  = includes.middleware;

  var getIterinfo = function(req, res, next) {
    var keys = req.query.keys || undefined;
    iterationModel.getByIterinfo(keys, function(err, result) {
      if (err) {
        return res.status(500).json({
          'success': false,
          'msg': err
        });
      }
      /* istanbul ignore next */
      if (!result) {
        return res.status(500).json({
          'success': false,
          'msg': 'Record not found.'
        });
      }
      if (result) {
        return res.json({
          'success': true,
          'msg': 'Successfully fetched team iteration details.',
          'result': result
        });
      }
    });
  };

  var getCompletedIterations = function(req, res, next) {
    var startkey = req.query.startkey;
    var endkey = req.query.endkey;
    if (!startkey || !endkey) {
      return res.status(500).json({
        'success': false,
        'msg': 'Parameter startkey/endkey is missing.'
      });
    }

    iterationModel.getCompletedIterations(startkey, endkey, function(err, result) {
      if (err) {
        return res.status(500).json({
          'success': false,
          'msg': err
        });
      }
      /* istanbul ignore next */
      if (!result) {
        return res.status(500).json({
          'success': false,
          'msg': 'Record not found.'
        });
      }
      if (result) {
        return res.json({
          'success': true,
          'msg': 'Successfully fetched completed iterations.',
          'result': result
        });
      }
    });
  };

  app.get('/api/_design/teams/_view/iterinfo', [includes.middleware.auth.requireLogin], getIterinfo);
  app.get('/api/_design/teams/_view/getCompletedIterations', [includes.middleware.auth.requireLogin], getCompletedIterations);

};