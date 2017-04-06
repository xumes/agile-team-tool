var teamModel = require('../../models/mongodb/teams');
var sysModel = require('../../models/mongodb/system');
// var teamIndex = require('../../models/index/teamIndex');
// var validate = require('validate.js');
var _ = require('underscore');

module.exports = function(app, includes) {
  //checked
  searchTeamWithName = function(req, res) {
    var keyword = req.params.name;
    if (keyword != '' && keyword != undefined) {
      teamModel.searchTeamWithName(keyword)
        .then(function(result){
          res.status(200).send(result);
        })
        .catch(function(err){
          res.status(404).send(err);
        });
    } else {
      var err = 'keyword is missing';
      res.status(400).send(err);
    }
  };

  //checked
  createTeam = function(req, res) {
    teamModel.createTeam(req.body, req.session['user'])
      .then(function(result) {
        res.status(201).send(result);
      })
      .catch(function(err) {
        res.status(400).send(err);
      });
  };

  //checked
  deleteTeam = function(req, res) {
    teamModel.softDelete(req.body, req.session['user'])
      .then(function(result) {
        res.status(200).send(result);
      })
      .catch(function(err) {
        res.status(400).send(err);
      });
  };

  //checked
  updateTeam = function(req, res) {
    teamModel.updateTeam(req.body, req.session['user'])
      .then(function(result) {
        res.status(200).send(result);
      })
      .catch(function(err) {
        res.status(400).send(err);
      });
  };

  updateLink = function(req, res) {
    var links = req.body['links'];
    var user = req.session['user'];
    var teamId = req.body['teamId'];
    teamModel.modifyImportantLinks(teamId, user, links)
      .then(function(result){
        res.send(result);
      })
      .catch( /* istanbul ignore next */ function(err) {
        // cannot simulate this error during testing
        res.status(400).send(err);
      });
  };

  deleteLink = function(req, res) {
    var links = req.body['links'];
    var user = req.session['user'];
    var teamId = req.body['teamId'];
    teamModel.deleteImportantLinks(teamId, user, links)
      .then(function(result){
        res.send(result);
      })
      .catch( /* istanbul ignore next */ function(err) {
        // cannot simulate this error during testing
        res.status(400).send(err);
      });
  };

  //checked
  associateTeam = function(req, res) {
    teamModel.associateTeams(req.body.parentTeamId, req.body.childTeamId, req.session['user'])
      .then(function(result){
        res.status(200).send(result);
      })
      .catch(function(err){
        res.status(400).send(err);
      });
  };

  //checked
  removeAssociation = function(req, res) {
    teamModel.removeAssociation(req.body.childTeamId, req.session['user'])
      .then(function(result){
        res.status(200).send(result);
      })
      .catch(function(err){
        res.status(400).send(err);
      });
  };

  //checked
  modifyTeamMembers = function(req, res) {
    teamModel.modifyTeamMembers(req.body['_id'], req.session['user'], req.body['members'])
      .then(function(result){
        res.status(200).send(result);
      })
      .catch(function(err){
        res.status(400).send(err);
      });
  };

  getTeamLinkLabels = function(req, res) {
    sysModel.getTeamLinkLabels()
      .then(function(result) {
        res.status(200).send(result);
      })
      .catch( /* istanbul ignore next */ function(err) {
        // cannot simulate this error during testing
        res.status(400).send(err);
      });
  };

  //checked
  getTeamMemberRoles = function(req, res) {
    sysModel.getTeamMemberRoles()
      .then(function(result) {
        res.status(200).send(result);
      })
      .catch( /* istanbul ignore next */ function(err) {
        // cannot simulate this error during testing
        res.status(400).send(err);
      });
  };

  //checked
  getByTeamName = function(req, res) {
    var teamName = req.params.teamName;
    teamModel.getByName(teamName)
      .then(function(result) {
        res.status(200).send(result);
      })
      .catch( /* istanbul ignore next */ function(err) {
        // cannot simulate this error during testing
        res.status(400).send(err);
      });
  };

  getTeamByEmail = function(req, res) {
    var email = req.params.email;
    teamModel.getTeamByEmail(email)
      .then(function(result) {
        res.send(result);
      })
      .catch(function(err) {
        res.status(400).send(err);
      });
  };

  getTeamsByUserId = function(req, res) {
    var uid = req.params.uid;
    teamModel.getTeamsByUserId(uid)
      .then(function(result) {
        res.send(result);
      })
      .catch( /* istanbul ignore next */ function(err) {
        res.status(400).send(err);
      });
  };

  //checked
  getTeam = function(req, res) {
    var teamId = req.params.teamId;
    teamModel.getTeam(req.params.teamId)
      .then(function(result) {
        res.send(result);
      })
      .catch(function(err) {
        res.status(400).send(err);
      });
  };

  // initLookupIndex = function(req, res) {
  //   var teamId = req.params.teamId;
  //   teamIndex.initIndex()
  //     .then(function(result) {
  //       res.status(200).send(result);
  //     })
  //     .catch( /* istanbul ignore next */ function(err) {
  //       res.status(400).send(err);
  //     });
  // };

  getSelectableParents = function(req, res) {
    var teamId = req.params.teamId;
    teamModel.getSelectableParents(teamId)
      .then(function(result) {
        res.status(200).send(result);
      })
      .catch( /* istanbul ignore next */ function(err) {
        res.status(400).send(err);
      });
  };

  // getParent = function(req, res) {
  //   var teamId = req.params.teamId;
  //   teamModel.getParentByTeamId(teamId)
  //     .then(function(result) {
  //       if (_.isEmpty(result)) {
  //         res.status(404).json({message: 'No parent info available'});
  //       }
  //       else
  //         res.status(200).json(result);
  //     })
  //     .catch(/* istanbul ignore next */ function(err) {
  //       res.status(400).send(err);
  //     });
  // };

  getSelectableChildren = function(req, res) {
    var teamId = req.params.teamId;
    teamModel.getSelectableChildren(teamId)
      .then(function(result) {
        res.status(200).send(result);
      })
      .catch( /* istanbul ignore next */ function(err) {
        res.status(400).send(err);
      });
  };

  // getLookupIndex = function(req, res) {
  //   if (!_.isEmpty(req.query)) {
  //     var id = req.query.id || '';
  //     var squadteam = req.query.squadteam || 'no';
  //     squadteam = squadteam.toUpperCase() == 'YES' ? true : false;
  //     teamModel.getLookupTeamByType(id, squadteam)
  //       .then(function(result) {
  //         res.status(200).send(result);
  //       })
  //       .catch( /* istanbul ignore next */ function(err) {
  //         res.status(400).send(err);
  //       });
  //
  //   } else {
  //     var teamId = req.params.teamId;
  //     teamModel.getLookupIndex(teamId)
  //       .then(function(result) {
  //         res.status(200).send(result);
  //       })
  //       .catch( /* istanbul ignore next */ function(err) {
  //         res.status(400).send(err);
  //       });
  //   }
  // };

  // getSquadsOfParent = function(req, res) {
  //   var teamId = req.params.teamId;
  //   teamModel.getSquadsOfParent(teamId)
  //     .then(function(result) {
  //       res.status(200).send(result);
  //     })
  //     .catch( /* istanbul ignore next */ function(err) {
  //       res.status(400).send(err);
  //     });
  // };

  //checked
  getAllRootTeams = function(req, res) {
    teamModel.getRootTeams(req.params.uid)
      .then(function(result) {
        res.status(200).send(result);
      })
      .catch( /* istanbul ignore next */ function(err) {
        res.status(400).send(err);
      });
  };

  //checked
  getStandaloneTeams = function(req, res) {
    teamModel.getStandalone(req.params.uid)
      .then(function(result){
        res.status(200).send(result);
      })
      .catch( /* istanbul ignore next */ function(err){
        res.status(400).send(err);
      });
  };

  //checked - test case is coded
  getAllRootTeamsSquadNonSquad = function(req, res) {
    teamModel.getAllRootTeamsSquadNonSquad()
      .then(function(result) {
        res.status(200).send(result);
      })
      .catch( /* istanbul ignore next */ function(err) {
        res.status(400).send(err);
      });
  };


  //checked
  getChildrenByPathId = function(req, res) {
    teamModel.getChildrenByPathId(req.params.pathId)
      .then(function(result){
        res.status(200).send(result);
      })
      .catch( /* istanbul ignore next */ function(err){
        res.status(400).send(err);
      });
  };

  //checked
  hasChildrenByPathId = function(req, res) {
    teamModel.hasChildrenByPathId(req.params.pathId)
      .then(function(result){
        res.status(200).send(result);
      })
      .catch( /* istanbul ignore next */ function(err){
        res.status(400).send(err);
      });
  };

  //checked
  loadTeamChildDetails = function(req, res) {
    teamModel.loadTeamChildDetails(req.params.teamId)
      .then(function(result){
        res.status(200).send(result);
      })
      .catch( /* istanbul ignore next */ function(err){
        res.status(400).send(err);
      });
  };

  //checked
  getTeamByPathId = function(req, res) {
    teamModel.getTeamByPathId(req.params.pathId)
      .then(function(result){
        res.status(200).send(result);
      })
      .catch( /* istanbul ignore next */ function(err){
        res.status(400).send(err);
      });
  };

  // getAllChildrenOnPath = function(req, res) {
  //   teamModel.getAllChildrenOnPath(req.body.path)
  //     .then(function(result){
  //       res.status(200).send(result);
  //     })
  //     .catch( /* istanbul ignore next */ function(err){
  //       res.status(400).send(err);
  //     });
  // };

  //checked
  getSquadTeams = function(req, res) {
    var filter = req.query.filter;
    filter = _.isEmpty(filter) ? null : JSON.parse(decodeURI(filter));
    teamModel.getSquadTeams(null, filter)
      .then(function(result){
        res.status(200).send(result);
      })
      .catch( /* istanbul ignore next */ function(err){
        res.status(400).send(err);
      });
  };

  //
  getNonSquadTeams = function(req, res) {
    var filter = req.query.filter;
    filter = _.isEmpty(filter) ? null : JSON.parse(decodeURI(filter));
    teamModel.getNonSquadTeams(null, filter)
      .then(function(result){
        res.status(200).send(result);
      })
      .catch( /* istanbul ignore next */ function(err){
        res.status(400).send(err);
      });
  };

  //checked
  getTeamHierarchy = function(req, res) {
    teamModel.getTeamHierarchy(req.params.path)
      .then(function(result){
        res.status(200).send(result);
      })
      .catch( /* istanbul ignore next */ function(err){
        res.status(400).send(err);
      });
  };

  getDesigner = function(req, res) {
    teamModel.getDesigner()
      .then(function(result){
        res.status(200).send(result);
      })
      .catch( /* istanbul ignore next */ function(err){
        res.status(400).send(err);
      });
  };

  // search team with name
  app.get('/api/teams/search/:name', [includes.middleware.auth.requireLogin], searchTeamWithName);

  // delete team document
  app.delete('/api/teams/', [includes.middleware.auth.requireLogin], deleteTeam);

  // delete a link
  app.delete('/api/teams/links', [includes.middleware.auth.requireLogin], deleteLink);

  // create new team document
  app.post('/api/teams/', [includes.middleware.auth.requireLogin], createTeam);

  // update existing team document
  app.put('/api/teams/', [includes.middleware.auth.requireLogin], updateTeam);

  // associate team document
  app.put('/api/teams/associates', [includes.middleware.auth.requireLogin], associateTeam);

  // remove association team document
  app.put('/api/teams/removeassociation', [includes.middleware.auth.requireLogin], removeAssociation);

  // modify  team members
  app.put('/api/teams/members', [includes.middleware.auth.requireLogin], modifyTeamMembers);

  // modify links
  app.put('/api/teams/links', [includes.middleware.auth.requireLogin], updateLink);

  // modify links
  app.get('/api/teams/linklabels', [includes.middleware.auth.requireLogin], getTeamLinkLabels);

  // get all applicable team roles
  app.get('/api/teams/roles', [includes.middleware.auth.requireLogin], getTeamMemberRoles);

  // get all squad team
  app.get('/api/teams/squads', [includes.middleware.auth.requireLogin], getSquadTeams);

  // get all non squad team
  app.get('/api/teams/nonsquads', [includes.middleware.auth.requireLogin], getNonSquadTeams);

  // get team doc by team name
  app.get('/api/teams/names/:teamName?', [includes.middleware.auth.requireLogin], getByTeamName);

  // get all teams by email
  app.get('/api/teams/members/:email', [includes.middleware.auth.requireLogin], getTeamByEmail);

  // get all teams by userId
  app.get('/api/teams/membersUid/:uid', [includes.middleware.auth.requireLogin], getTeamsByUserId);

  // get all team or team details if teamId exists
  app.get('/api/teams/:teamId?', [includes.middleware.auth.requireLogin], getTeam);

  // list of parent and child team ids associated with the team
  // app.get('/api/teams/lookup/initialize', [includes.middleware.auth.requireLogin], initLookupIndex);

  // selectable parent teams of a team
  app.get('/api/teams/lookup/parents/:teamId?', [includes.middleware.auth.requireLogin], getSelectableParents);

  // return parent of a team
  // app.get('/api/teams/lookup/parent/:teamId?', [includes.middleware.auth.requireLogin], getParent);

  // selectable child teams of a team
  app.get('/api/teams/lookup/children/:teamId?', [includes.middleware.auth.requireLogin], getSelectableChildren);

  // list of squad teams associated with the team
  // app.get('/api/teams/lookup/squads/:teamId?', [includes.middleware.auth.requireLogin], getSquadsOfParent);

  // list of parent and child team ids associated with the team
  // app.get('/api/teams/lookup/team/:teamId?', [includes.middleware.auth.requireLogin], getLookupIndex);

  // get all root teams
  app.get('/api/teams/lookup/rootteams/:uid?', [includes.middleware.auth.requireLogin], getAllRootTeams);

  // get all root teams - for both squad and non-squad
  app.get('/api/teams/lookup/allrootteamssquadnonsquad', [includes.middleware.auth.requireLogin], getAllRootTeamsSquadNonSquad);

  // get all standalone teams
  app.get('/api/teams/lookup/standalone/:uid?', [includes.middleware.auth.requireLogin], getStandaloneTeams);

  // get first level children teams by parent's pathId
  app.get('/api/teams/children/:pathId', [includes.middleware.auth.requireLogin], getChildrenByPathId);

  // get children boolean indicator
  app.get('/api/teams/haschildren/:pathId', [includes.middleware.auth.requireLogin], hasChildrenByPathId);

  // get team info and if it has a child
  app.get('/api/teams/teamchilddetail/:teamId', [includes.middleware.auth.requireLogin], loadTeamChildDetails);

  // get team info by pathId
  app.get('/api/teams/pathId/:pathId', [includes.middleware.auth.requireLogin], getTeamByPathId);

  // app.post('/api/teams/children/', [includes.middleware.auth.requireLogin], getAllChildrenOnPath);

  // return hierarchy of a team
  app.get('/api/teams/hierarchy/team/:path?', [includes.middleware.auth.requireLogin], getTeamHierarchy);
  // app.get('/api/teams/getDesigner/getDesigner', [includes.middleware.auth.requireLogin], getDesigner);

};
