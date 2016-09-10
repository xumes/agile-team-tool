var Promise = require('bluebird');
var cache = require('../../middleware/cache');
var settings = require('../../settings');

module.exports = function(app, includes) {
  var render = includes.render;

  getHomeVariables = function(req, res) {
    Promise.join(
        cache.setSystemInfoCache(),
        //cache.setUserTeams(req.session['email']),
        function(systemCache, userTeamList) {
          var json = {
            'user': req.session['user'],
            'systemAdmin': systemCache.systemAdmin,
            'systemStatus': systemCache.systemStatus,
            'environment': settings.environment,
            'userTeamList': userTeamList,
            'allTeams': [],
            'allTeamsLookup': []
          };
          res.status(200).send(json);

        })
      .catch( /* istanbul ignore next */ function(err) {
        res.status(400).send(err);
      });
  };

  getTeamManagementVariables = function(req, res) {
    Promise.join(
        cache.setTeamCache(req.session['email']),
        function(allCache) {
          var json = {
            'user': req.session['user'],
            'systemAdmin': allCache.systemAdmin,
            'systemStatus': allCache.systemStatus,
            'environment': settings.environment,
            'userTeamList': allCache.userTeamList,
            'allTeams': allCache.allTeams,
            'allTeamsLookup': allCache.allTeamsLookup,
            'memberRoles': allCache.memberRoles
          };
          res.status(200).send(json);

        })
      .catch( /* istanbul ignore next */ function(err) {
        res.status(400).send(err);
      });
  };

  getIterationManagementVariables = function(req, res) {
    Promise.join(
        cache.setSystemInfoCache(),
        cache.setActiveSquadTeams(),
        cache.setUserTeams(req.session['email']),
        function(systemCache, squadTeams, userTeamList) {
          var json = {
            'user': req.session['user'],
            'systemAdmin': systemCache.systemAdmin,
            'systemStatus': systemCache.systemStatus,
            'environment': settings.environment,
            'userTeamList': userTeamList,
            'squadTeams': squadTeams,
            'allTeams': [],
            'allTeamsLookup': []
          };
          res.status(200).send(json);

        })
      .catch( /* istanbul ignore next */ function(err) {
        res.status(400).send(err);
      });
  };

  getAssessmentManagementVariables = function(req, res) {
    Promise.join(
        cache.setSystemInfoCache(),
        cache.setActiveSquadTeams(),
        cache.setUserTeams(req.session['email']),
        function(systemCache, squadTeams, userTeamList) {
          var json = {
            'user': req.session['user'],
            'systemAdmin': systemCache.systemAdmin,
            'systemStatus': systemCache.systemStatus,
            'environment': settings.environment,
            'userTeamList': userTeamList,
            'squadTeams': squadTeams,
            'allTeams': [],
            'allTeamsLookup': []
          };
          res.status(200).send(json);

        })
      .catch( /* istanbul ignore next */ function(err) {
        res.status(400).send(err);
      });
  };

  getHelpVariables = function(req, res) {
    Promise.join(
        cache.setSystemInfoCache(),
        cache.setAllTeams(),
        cache.setUserTeams(req.session['email']),
        function(systemCache, allTeams, userTeamList) {
          var json = {
            'user': req.session['user'],
            'systemAdmin': systemCache.systemAdmin,
            'systemStatus': systemCache.systemStatus,
            'environment': settings.environment,
            'userTeamList': userTeamList,
            'allTeams': allTeams
          };
          res.status(200).send(json);

        })
      .catch( /* istanbul ignore next */ function(err) {
        res.status(400).send(err);
      });
  };

  app.get('/api/uihelper/home', [includes.middleware.auth.requireLogin], getHomeVariables);

  app.get('/api/uihelper/team', [includes.middleware.auth.requireLogin], getTeamManagementVariables);

  app.get('/api/uihelper/iteration', [includes.middleware.auth.requireLogin], getIterationManagementVariables);

  app.get('/api/uihelper/assessment', [includes.middleware.auth.requireLogin], getAssessmentManagementVariables);

  app.get('/api/uihelper/progress', [includes.middleware.auth.requireLogin], getAssessmentManagementVariables);

  app.get('/api/uihelper/help', [includes.middleware.auth.requireLogin], getHelpVariables);

};
