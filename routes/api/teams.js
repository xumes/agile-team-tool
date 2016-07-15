var teamModel = require('../../models/teams');

module.exports = function(app, includes) {
  var middleware  = includes.middleware;

  getTeam = function(req, res) {
    teamId = req.params.teamId;
    teamModel.getTeam(teamId, function(err, result){
      if(err)
        return res.status(500).send({ error: err });
      else
        return res.send(result);
    });
  };

  getTeamRole = function(req, res){
    teamModel.getRole(function(err, result){
      if(err)
        return res.status(500).send({ error: err });
      else
        return res.send(result);
    });
  };

getTeamName = function(req, res){
    teamModel.getName(function(err, result){
      if(err)
        return res.status(500).send({ error: err });
      else
        return res.send(result);
    });
  };

  app.get('/api/teams/roles', [includes.middleware.auth.requireLogin], getTeamRole);

  app.get('/api/teams/names', [includes.middleware.auth.requireLogin], getTeamName);

  app.get('/api/teams/:teamId?', [includes.middleware.auth.requireLogin], getTeam);

};