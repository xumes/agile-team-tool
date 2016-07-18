var teamModel = require('../../models/teams');

module.exports = function(app, includes) {
  var middleware  = includes.middleware;

  getTeam = function(req, res) {
    var teamId = req.params.teamId;
    teamModel.getTeam(teamId)
      .then(function(result){
        res.send(result);
      })
      .catch(function(err){
        res.send(400, err);
      });
  };

  getTeamRole = function(req, res){
    teamModel.getRole()
      .then(function(result){
        res.send(result);
      })
      .catch(function(err){
        res.send(400, err);
      });
  };

getTeamName = function(req, res){
    teamModel.getName()
      .then(function(result){
        res.send(result);
      })
      .catch(function(err){
        res.send(400, err);
      });
  };

  app.get('/api/teams/roles', [includes.middleware.auth.requireLogin], getTeamRole);

  app.get('/api/teams/names', [includes.middleware.auth.requireLogin], getTeamName);

  app.get('/api/teams/:teamId?', [includes.middleware.auth.requireLogin], getTeam);

};