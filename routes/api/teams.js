var teamModel = require('../../models/teams');

module.exports = function(app, includes) {
  var middleware  = includes.middleware;

  getTeam = function(req, res) {
    teamId = 'ag_team_Agile Talent Business Management'; //req.params.teamId;
    console.log('teamId: ' + teamId);
    teamModel.getTeam(teamId, function(err, result){
      if(err)
        res.status(500).send({ error: err });
      else
        res.send(result)
    });
  };

  app.get('/api/teams/:teamId?', [includes.middleware.auth.requireLogin], getTeam);

};