var Promise = require('bluebird');
var teamModel = Promise.promisifyAll(require('../../models/teams'));

module.exports = function(app, includes) {
  var middleware  = includes.middleware;

  getTeam = function(req, res) {
    var teamId = req.params.teamId;
    teamModel.getTeamAsync(teamId)
      .then(function(result){
        res.send(result);
      })
      .catch(function(err){
        res.send(400, { error: err });
      });
  };

  getTeamRole = function(req, res){
    teamModel.getRoleAsync(teamId)
      .then(function(result){
        return res.send(result);
      })
      .catch(function(err){
        return res.send(400, { error: err });
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