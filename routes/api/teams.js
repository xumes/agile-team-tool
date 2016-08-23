var teamModel = require('../../models/teams');
var validate = require('validate.js');
var _ = require('underscore');

module.exports = function(app, includes) {
  var middleware  = includes.middleware;
  createTeam = function(req, res){
    var teamDoc = req.body;
    teamModel.createTeam(teamDoc, req.session['user'])
      .then(function(result){
        var addResult = new Object();
        middleware.cache.updateTeamCache(req, result);
        middleware.cache.retrieveUserTeams(req.session['email'])
        .then(function (body){
          addResult.team = result;
          addResult.userTeams = body;
          res.status(201).send(addResult);
        });
      })
      .catch(function(err){
        res.status(400).send(err);
      })
  };

  deleteTeam = function(req, res){
    if(!(_.isEmpty(req.body['doc_status'])) &&  req.body['doc_status'] === 'delete'){
      teamModel.updateOrDeleteTeam(req.body, req.session, 'delete')
        .then(function(result){
          var delResult = new Object();
          middleware.cache.updateTeamCache(req, req.body);
          middleware.cache.retrieveUserTeams(req.session['email'])
          .then(function (body){
            delResult.team = result;
            delResult.userTeams = body;
            res.status(200).send(delResult);
          });
        })
        .catch(function(err){
          res.status(400).send(err);
        })
    }else{
      res.status(400).send({ error : 'Invalid request' });
    }
  }

  updateTeam = function(req, res){
    teamModel.updateOrDeleteTeam(req.body, req.session, 'update')
      .then(function(result){
        var updateResult = new Object();
        middleware.cache.updateTeamCache(req, result);
        middleware.cache.retrieveUserTeams(req.session['email'])
        .then(function (body){
          updateResult.team = result;
          updateResult.userTeams = body;
          res.send(updateResult);
        });
      })
      .catch(function(err){
        res.status(400).send(err);
      });
  };

  associateTeam = function(req, res){
    var action = req.body.action;
    var valid = teamModel.associateActions(action);
    if(typeof valid === 'object' || valid === false){
      res.status(400).send({ error : 'Invalid action' });
    }else{
      teamModel.associateTeams(req.body, action, req.session)
      .then(function(result) {
        _.each(result, function(team) {
          middleware.cache.updateTeamCache(req, team);
        });

        var associateResult = new Object();
        middleware.cache.retrieveUserTeams(req.session['email'])
        .then(function (body){
          associateResult.team = result;
          associateResult.userTeams = body;
          res.send(associateResult);
        });
      })
      .catch( /* istanbul ignore next */ function(err){
        // cannot simulate this error during testing
        res.status(400).send(err);
      });
    }
  };

  getTeamRole = function(req, res){
    teamModel.getRole()
      .then(function(result){
        res.send(result);
      })
      .catch( /* istanbul ignore next */ function(err){
        // cannot simulate this error during testing
        res.status(400).send(err);
      });
  };

  getTeamName = function(req, res){
    var teamName = req.params.teamName;
    teamModel.getName(teamName)
      .then(function(result){
        res.send(result);
      })
      .catch( /* istanbul ignore next */ function(err){
        // cannot simulate this error during testing
        res.status(400).send(err);
      });
  };

  getTeamByEmail = function(req,res){
    var email = req.params.email;
    teamModel.getTeamByEmail(email)
      .then(function(result){
        res.send(result);
      })
      .catch(function(err){
        res.status(400).send(err);
      })
  }

  getTeam = function(req, res) {
    /* use query to get top level, children or parent team */
    if (!_.isEmpty(req.query)) {
      teamModel.getRootTeams(req.query)
        .then(function(result){
          res.status(200).send(result);
        })
        .catch( /* istanbul ignore next */ function(err){
          res.status(400).send(err);
        });
    }
    /* get team by ID */
    else {
      var teamId = req.params.teamId;
      teamModel.getTeam(teamId)
        .then(function(result){
          middleware.cache.updateTeamCache(req, result);
          res.send(result);
        })
        .catch(function(err){
          res.status(400).send(err);
        });
    }
  };

  getSelectableParents = function(req, res) {
    var teamId = req.params.teamId;
    teamModel.getSelectableParents(teamId)
    .then(function(result) {
      res.status(200).send(result);
    })
    .catch( /* istanbul ignore next */ function(err){
      res.status(400).send(err);
    });
  };

  getSelectableChildren = function(req, res) {
    console.log(req.params.teamId);
    var teamId = req.params.teamId;
    teamModel.getSelectableChildren(teamId)
    .then(function(result) {
      res.status(200).send(result);
    })
    .catch( /* istanbul ignore next */ function(err){
      res.status(400).send(err);
    });
  };

  getLookupIndex = function(req, res) {
    var teamId = req.params.teamId;
    teamModel.getLookupIndex(teamId)
    .then(function(result) {
      res.status(200).send(result);
    })
    .catch( /* istanbul ignore next */ function(err){
      console.log("route error");
      res.status(400).send(err);
    });
  };

  getSquadsOfParent = function(req, res) {
    var teamId = req.params.teamId;
    teamModel.getSquadsOfParent(teamId)
    .then(function(result) {
      res.status(200).send(result);
    })
    .catch( /* istanbul ignore next */ function(err){
      res.status(400).send(err);
    });
  };

  getUserTeam = function(req,res){
    var email = req.params.email;
    teamModel.getUserTeams(email)
      .then(function(result){
        res.send(result);
      })
      .catch(function(err){
        res.status(400).send(err);
      });
  };

  // delete team document
  app.delete('/api/teams/', [includes.middleware.auth.requireLogin], deleteTeam);

  // create new team document
  app.post('/api/teams/', [includes.middleware.auth.requireLogin], createTeam);

  // update existing team document
  app.put('/api/teams/', [includes.middleware.auth.requireLogin], updateTeam);

  // associate team document
  app.put('/api/teams/associates', [includes.middleware.auth.requireLogin], associateTeam);

  // get all applicable team roles
  app.get('/api/teams/roles', [includes.middleware.auth.requireLogin], getTeamRole);

  // get team document by name
  app.get('/api/teams/names/:teamName?', [includes.middleware.auth.requireLogin], getTeamName);

  // get all team by email
  app.get('/api/teams/members/:email', [includes.middleware.auth.requireLogin], getTeamByEmail);

  // get all team or team details if teamId exists
  app.get('/api/teams/:teamId?', [includes.middleware.auth.requireLogin], getTeam);

  // selectable parent teams of a team
  app.get('/api/teams/lookup/parents/:teamId?', [includes.middleware.auth.requireLogin], getSelectableParents);

  // selectable child teams of a team
  app.get('/api/teams/lookup/children/:teamId?', [includes.middleware.auth.requireLogin], getSelectableChildren);

  // list of squad teams associated with the team
  app.get('/api/teams/lookup/squads/:teamId?', [includes.middleware.auth.requireLogin], getSquadsOfParent);

  // list of parent and child team ids associated with the team
  app.get('/api/teams/lookup/team/:teamId?', [includes.middleware.auth.requireLogin], getLookupIndex);

  // get list of teams where user has access
  app.get('/api/teams/userTeams/:email',[includes.middleware.auth.requireLogin], getUserTeam);

};
