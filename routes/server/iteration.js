var settings = require('../../settings');
var Promise  = require('bluebird');
var Team     = require('../../models/mongodb/teams');
var User     = require('../../models/mongodb/users');
var _        = require('underscore');

module.exports = function(app, includes) {
  var render = includes.render;

  var showIteration = function(req, res) {
    var json = {
      'pageTitle': 'Iteration Management',
      'googleAnalyticsKey': settings.googleAnalyticsKey,
      'ibmNPSKey': settings.ibmNPSKey,
      'environment': settings.environment
    };

    var userId = req.session.userId;
    Promise.join(
        User.findUserByUserId(userId),
        Team.getTeamsByUserId(userId, {'name':1}),
        Team.getSquadTeams({'name':1}),
        function(userDoc, userTeams, squadTeams){
          json['userTeamList'] = _.sortBy(userTeams, 'name');
          json['squadTeams'] = _.sortBy(squadTeams, 'name');

          json['user'] = req.session['user'];
          json['environment'] = settings.environment;
          //TODO see if we need these
          json['systemStatus'] = [];
          json['systemAdmin'] = [];
          //TODO not sure why this is needed
          json['allTeams'] = [];
          json['allTeamsLookup'] = [];

          render(req, res, 'iteration', json);
        }
    );
  };
  app.get('/iteration', includes.middleware.auth.requireLoginWithRedirect, showIteration);
};
