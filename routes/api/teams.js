const teamModel = require('../../models/teams');
const sysModel = require('../../models/system');
// var teamIndex = require('../../models/index/teamIndex');
// var validate = require('validate.js');
const _ = require('underscore');

module.exports = (app, includes) => {
  // checked
  const searchTeamWithName = (req, res) => {
    const keyword = req.params.name;
    if (keyword !== '' && keyword !== undefined) {
      teamModel.searchTeamWithName(keyword)
        .then((result) => {
          res.status(200).send(result);
        })
        .catch((err) => {
          res.status(404).send(err);
        });
    } else {
      const err = 'keyword is missing';
      res.status(400).send(err);
    }
  };

  // checked
  const createTeam = (req, res) => {
    teamModel.createTeam(req.body, req.session.user)
      .then((result) => {
        res.status(201).send(result);
      })
      .catch((err) => {
        res.status(400).send(err);
      });
  };

  // checked
  const deleteTeam = (req, res) => {
    teamModel.softDeleteArchive(req.body, req.session.user, 'delete')
      .then((result) => {
        res.status(200).send(result);
      })
      .catch((err) => {
        res.status(400).send(err);
      });
  };

  // checked
  const updateTeam = (req, res) => {
    teamModel.updateTeam(req.body, req.session.user)
      .then((result) => {
        res.status(200).send(result);
      })
      .catch((err) => {
        res.status(400).send(err);
      });
  };

  const archiveTeam = (req, res) => {
    let docStatus = null;
    if (req.body.docStatus && req.body.docStatus.toLowerCase() === 'archive') {
      docStatus = 'archive';
    }
    teamModel.softDeleteArchive(req.body, req.session.user, docStatus)
      .then((result) => {
        res.status(200).send(result);
      })
      .catch((err) => {
        res.status(400).send(err);
      });
  };

  const updateLink = (req, res) => {
    const links = req.body.links;
    const user = req.session.user;
    const teamId = req.body.teamId;
    teamModel.modifyImportantLinks(teamId, user, links)
      .then((result) => {
        res.send(result);
      })
      .catch(/* istanbul ignore next */ (err) => {
        // cannot simulate this error during testing
        res.status(400).send(err);
      });
  };

  const deleteLink = (req, res) => {
    const links = req.body.links;
    const user = req.session.user;
    const teamId = req.body.teamId;
    teamModel.deleteImportantLinks(teamId, user, links)
      .then((result) => {
        res.send(result);
      })
      .catch(/* istanbul ignore next */ (err) => {
        // cannot simulate this error during testing
        res.status(400).send(err);
      });
  };

  // checked
  const associateTeam = (req, res) => {
    teamModel.associateTeams(req.body.parentTeamId, req.body.childTeamId, req.session.user)
      .then((result) => {
        res.status(200).send(result);
      })
      .catch((err) => {
        res.status(400).send(err);
      });
  };

  // checked
  const removeAssociation = (req, res) => {
    teamModel.removeAssociation(req.body.childTeamId, req.session.user)
      .then((result) => {
        res.status(200).send(result);
      })
      .catch((err) => {
        res.status(400).send(err);
      });
  };

  // checked
  const modifyTeamMembers = (req, res) => {
    teamModel.modifyTeamMembers(req.body._id, req.session.user, req.body.members)  // eslint-disable-line
      .then((result) => {
        res.status(200).send(result);
      })
      .catch((err) => {
        res.status(400).send(err);
      });
  };

  const getTeamLinkLabels = (req, res) => {
    sysModel.getTeamLinkLabels()
      .then((result) => {
        res.status(200).send(result);
      })
      .catch(/* istanbul ignore next */ (err) => {
        // cannot simulate this error during testing
        res.status(400).send(err);
      });
  };

  // checked
  const getTeamMemberRoles = (req, res) => {
    sysModel.getTeamMemberRoles()
      .then((result) => {
        res.status(200).send(result);
      })
      .catch(/* istanbul ignore next */ (err) => {
        // cannot simulate this error during testing
        res.status(400).send(err);
      });
  };

  // checked
  const getByTeamName = (req, res) => {
    const teamName = req.params.teamName;
    teamModel.getByName(teamName)
      .then((result) => {
        res.status(200).send(result);
      })
      .catch(/* istanbul ignore next */ (err) => {
        // cannot simulate this error during testing
        res.status(400).send(err);
      });
  };

  const getTeamByEmail = (req, res) => {
    const email = req.params.email;
    teamModel.getTeamsByEmail(email)
      .then((result) => {
        res.send(result);
      })
      .catch((err) => {
        res.status(400).send(err);
      });
  };

  const getTeamsByUserId = (req, res) => {
    const uid = req.params.uid;
    teamModel.getTeamsByUserId(uid)
      .then((result) => {
        res.send(result);
      })
      .catch(/* istanbul ignore next */ (err) => {
        res.status(400).send(err);
      });
  };

  // checked
  const getTeam = (req, res) => {
    teamModel.getTeam(req.params.teamId)
      .then((result) => {
        res.send(result);
      })
      .catch((err) => {
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

  const getSelectableParents = (req, res) => {
    const teamId = req.params.teamId;
    teamModel.getSelectableParents(teamId)
      .then((result) => {
        res.status(200).send(result);
      })
      .catch(/* istanbul ignore next */ (err) => {
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

  const getSelectableChildren = (req, res) => {
    const teamId = req.params.teamId;
    teamModel.getSelectableChildren(teamId)
      .then((result) => {
        res.status(200).send(result);
      })
      .catch(/* istanbul ignore next */ (err) => {
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

  // checked
  const getAllRootTeams = (req, res) => {
    teamModel.getRootTeams(req.params.uid)
      .then((result) => {
        res.status(200).send(result);
      })
      .catch(/* istanbul ignore next */ (err) => {
        res.status(400).send(err);
      });
  };

  // checked
  const getStandaloneTeams = (req, res) => {
    teamModel.getStandalone(req.params.uid)
      .then((result) => {
        res.status(200).send(result);
      })
      .catch(/* istanbul ignore next */ (err) => {
        res.status(400).send(err);
      });
  };

  // checked - test case is coded
  const getAllRootTeamsSquadNonSquad = (req, res) => {
    teamModel.getAllRootTeamsSquadNonSquad()
      .then((result) => {
        res.status(200).send(result);
      })
      .catch(/* istanbul ignore next */ (err) => {
        res.status(400).send(err);
      });
  };


  // checked
  const getChildrenByPathId = (req, res) => {
    teamModel.getChildrenByPathId(req.params.pathId)
      .then((result) => {
        res.status(200).send(result);
      })
      .catch(/* istanbul ignore next */ (err) => {
        res.status(400).send(err);
      });
  };

  // checked
  const hasChildrenByPathId = (req, res) => {
    teamModel.hasChildrenByPathId(req.params.pathId)
      .then((result) => {
        res.status(200).send(result);
      })
      .catch(/* istanbul ignore next */ (err) => {
        res.status(400).send(err);
      });
  };

  // checked
  const loadTeamChildDetails = (req, res) => {
    teamModel.loadTeamChildDetails(req.params.teamId)
      .then((result) => {
        res.status(200).send(result);
      })
      .catch(/* istanbul ignore next */ (err) => {
        res.status(400).send(err);
      });
  };

  // checked
  const getTeamByPathId = (req, res) => {
    teamModel.getTeamByPathId(req.params.pathId)
      .then((result) => {
        res.status(200).send(result);
      })
      .catch(/* istanbul ignore next */ (err) => {
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

  // checked
  const getSquadTeams = (req, res) => {
    let filter = req.query.filter;
    filter = _.isEmpty(filter) ? null : JSON.parse(decodeURI(filter));
    teamModel.getSquadTeams(null, filter)
      .then((result) => {
        res.status(200).send(result);
      })
      .catch(/* istanbul ignore next */ (err) => {
        res.status(400).send(err);
      });
  };

  //
  const getNonSquadTeams = (req, res) => {
    let filter = req.query.filter;
    filter = _.isEmpty(filter) ? null : JSON.parse(decodeURI(filter));
    teamModel.getNonSquadTeams(null, filter)
      .then((result) => {
        res.status(200).send(result);
      })
      .catch(/* istanbul ignore next */ (err) => {
        res.status(400).send(err);
      });
  };

  // checked
  const getTeamHierarchy = (req, res) => {
    teamModel.getTeamHierarchy(req.params.path)
      .then((result) => {
        res.status(200).send(result);
      })
      .catch(/* istanbul ignore next */ (err) => {
        res.status(400).send(err);
      });
  };

  const getDesigner = (req, res) => { // eslint-disable-line
    teamModel.getDesigner()
      .then((result) => {
        res.status(200).send(result);
      })
      .catch(/* istanbul ignore next */ (err) => {
        res.status(400).send(err);
      });
  };

  const validateMemberData = (req, res) => {
    teamModel.validateMemberData(req.params.teamId)
      .then((result) => {
        res.status(200).send(result);
      })
      .catch(/* istanbul ignore next */ (err) => {
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

  // archive team document
  app.put('/api/teams/archive', [includes.middleware.auth.requireLogin], archiveTeam);

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
  // app.get('/api/teams/lookup/initialize',
  //  [includes.middleware.auth.requireLogin], initLookupIndex);

  // selectable parent teams of a team
  app.get('/api/teams/lookup/parents/:teamId?', [includes.middleware.auth.requireLogin], getSelectableParents);

  // return parent of a team
  // app.get('/api/teams/lookup/parent/:teamId?',
  //  [includes.middleware.auth.requireLogin], getParent);

  // selectable child teams of a team
  app.get('/api/teams/lookup/children/:teamId?', [includes.middleware.auth.requireLogin], getSelectableChildren);

  // list of squad teams associated with the team
  // app.get('/api/teams/lookup/squads/:teamId?',
  // [includes.middleware.auth.requireLogin], getSquadsOfParent);

  // list of parent and child team ids associated with the team
  // app.get('/api/teams/lookup/team/:teamId?',
  //  [includes.middleware.auth.requireLogin], getLookupIndex);

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

  // app.post('/api/teams/children/',
  //  [includes.middleware.auth.requireLogin], getAllChildrenOnPath);

  // return hierarchy of a team
  app.get('/api/teams/hierarchy/team/:path?', [includes.middleware.auth.requireLogin], getTeamHierarchy);
  // app.get('/api/teams/getDesigner/getDesigner',
  // [includes.middleware.auth.requireLogin], getDesigner);

  app.get('/api/teams/validate/member/:teamId?', [includes.middleware.auth.requireLogin], validateMemberData);
};
