module.exports = function(app, includes) {

  var iteration = require('../../models/iteration');

  app.get('/api/_design/teams/_view/teams', function(req, res, next) {
    iteration.getByTeam(function(err, result) {
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
          'msg': 'Successfully fetched teams.',
          'result': result
        });
      }
    });
  });

  app.get('/api/_design/teams/_view/iterinfo', function(req, res, next) {
    var keys = req.query.keys || undefined;
    console.log('keys:', keys);
    iteration.getByIterinfo(keys, function(err, result) {
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
          'msg': 'Successfully fetched teams.',
          'result': result
        });
      }
    });

  });

  // NOTE: not working
  app.get('/api/_design/teams/_view/getCompletedIterations', function(req, res, next) {
    var startkey = req.query.startkey;
    var endkey = req.query.endkey;
    if (!startkey || !endkey) {
      return res.status(500).json({
        'success': false,
        'msg': 'Parameter startkey/endkey is missing.'
      });
    }

    iteration.getCompletedIterations(startkey, endkey, function(err, result) {
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
      // console.log('result:',result);
      if (result) {
        return res.json({
          'success': true,
          'msg': 'Successfully fetched teams.',
          'result': result
        });
      }
    });
  });
};