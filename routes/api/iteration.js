module.exports = function(app, includes) {

  var iteration = require('../../models/iteration');
  console.log(iteration);

  app.get('/api/_design/teams/_view/teams', function(req, res, next) {
    iteration.findByTeams(function(err, result) {
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

  app.get('/api/_design/teams/_view/iterinfo', function(req, res, next) {
    var keys = req.query.keys;
    if (!keys) {
      return res.status(500).json({
        'success': false,
        'msg': 'Parameter keys is missing.'
      });
    }
    iteration.findByIterinfo(keys, function(err, result) {
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