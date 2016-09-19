var crypto = require('crypto');
var iterations = {
  teamDocValid: {
    name: 'testteamid_1',
    desc: 'team document description',
    squadteam: 'Yes',
    testdata: 'Yes'
  },
  iterationDocValid: {
    '_id': 'testmyid-' + crypto.randomBytes(20).toString('hex'),
    'type': 'iterationinfo',
    'team_id': 'testteamid_1',
    'iteration_name': 'testiterationname-' + crypto.randomBytes(4).toString('hex'),
    'iteration_start_dt': '07/19/2016',
    'iteration_end_dt': '07/20/2016',
    'iterationinfo_status': 'Not complete',
    'team_mbr_cnt': '1',
    'nbr_committed_stories': '3',
    'nbr_stories_dlvrd': '',
    'nbr_committed_story_pts': '4',
    'nbr_story_pts_dlvrd': '',
    'iteration_comments': '',
    'team_mbr_change': 'No',
    'last_updt_user': 'ortegaaa@ph.ibm.com',
    'fte_cnt': '0.0',
    'nbr_dplymnts': '',
    'nbr_defects': '',
    'client_sat': '1.0',
    'team_sat': '4',
    'nbr_cycletime_WIP': '',
    'nbr_cycletime_in_backlog': '',
    'last_updt_dt': '2016-04-04 03:07:10 EDT',
    'created_user': 'ortegaaa@ph.ibm.com',
    'created_dt': '2016-04-04 03:07:10 EDT',
    'testdata': 'Yes'
  },
  iterationDoc_duplicateIterName: {
    '_id': 'testmyid-' + crypto.randomBytes(20).toString('hex'),
    'type': 'iterationinfo',
    'team_id': 'testteamid_1',
    'iteration_name': 'testiterationname-1',
    'iteration_start_dt': '07/19/2016',
    'iteration_end_dt': '07/20/2016',
    'iterationinfo_status': 'Not complete',
    'team_mbr_cnt': '1',
    'nbr_committed_stories': '3',
    'nbr_stories_dlvrd': '',
    'nbr_committed_story_pts': '4',
    'nbr_story_pts_dlvrd': '',
    'iteration_comments': '',
    'team_mbr_change': 'No',
    'last_updt_user': 'ortegaaa@ph.ibm.com',
    'fte_cnt': '0.0',
    'nbr_dplymnts': '',
    'nbr_defects': '',
    'client_sat': '1.0',
    'team_sat': '4',
    'nbr_cycletime_WIP': '',
    'nbr_cycletime_in_backlog': '',
    'last_updt_dt': '2016-04-04 03:07:10 EDT',
    'created_user': 'ortegaaa@ph.ibm.com',
    'created_dt': '2016-04-04 03:07:10 EDT',
    'testdata': 'Yes'
  },
  iterationDocInvalid: {
    '_id': 'testmyid-' + crypto.randomBytes(20).toString('hex'),
    'type': 'iterationinfo',
    'team_id': '',
    'iteration_name': '',
    'iteration_start_dt': '07/19/2016',
    'iteration_end_dt': '07/20/2016',
    'iterationinfo_status': 'Not complete',
    'team_mbr_cnt': '1',
    'nbr_committed_stories': '3',
    'nbr_stories_dlvrd': '',
    'nbr_committed_story_pts': '4',
    'nbr_story_pts_dlvrd': '',
    'iteration_comments': '',
    'team_mbr_change': 'No',
    'last_updt_user': 'ortegaaa@ph.ibm.com',
    'fte_cnt': '0.0',
    'nbr_dplymnts': '',
    'nbr_defects': '',
    'nbr_cycletime_WIP': '',
    'nbr_cycletime_in_backlog': '',
    'client_sat': 'alpha',
    'team_sat': '-1',
    'last_updt_dt': '2016-04-04 03:07:10 EDT',
    'created_user': 'ortegaaa@ph.ibm.com',
    'created_dt': '2016-04-04 03:07:10 EDT',
    'testdata': 'Yes'
  },
  iterationDocValid_sample2: {
    '_id': 'testmyid-' + crypto.randomBytes(20).toString('hex'),
    'type': 'iterationinfo',
    'team_id': 'testteamid_1',
    'iteration_name': 'testiterationname-' + crypto.randomBytes(5).toString('hex'),
    'iteration_start_dt': '07/19/2016',
    'iteration_end_dt': '07/20/2016',
    'iterationinfo_status': 'Not complete',
    'team_mbr_cnt': '1',
    'nbr_committed_stories': '3',
    'nbr_stories_dlvrd': '',
    'nbr_committed_story_pts': '4',
    'nbr_story_pts_dlvrd': '',
    'iteration_comments': '',
    'team_mbr_change': 'No',
    'last_updt_user': 'ortegaaa@ph.ibm.com',
    'fte_cnt': '0.0',
    'nbr_dplymnts': '',
    'nbr_defects': '',
    'nbr_cycletime_WIP': '',
    'nbr_cycletime_in_backlog': '',
    'client_sat': '1.5',
    'team_sat': '1.5',
    'last_updt_dt': '2016-04-04 03:07:10 EDT',
    'created_user': 'ortegaaa@ph.ibm.com',
    'created_dt': '2016-04-04 03:07:10 EDT',
    'testdata': 'Yes'
  },
  iterationDocValid_sample3: {
    '_id': 'testmyid-' + crypto.randomBytes(20).toString('hex'),
    'type': 'iterationinfo',
    'team_id': 'testteamid_1',
    'iteration_name': 'testiterationname-1',
    'iteration_start_dt': '08/01/2016',
    'iteration_end_dt': '08/20/2016',
    'iterationinfo_status': 'Completed',
    'team_mbr_cnt': '1',
    'nbr_committed_stories': '3',
    'nbr_stories_dlvrd': '1',
    'nbr_committed_story_pts': '4',
    'nbr_story_pts_dlvrd': '',
    'iteration_comments': '',
    'team_mbr_change': 'No',
    'last_updt_user': 'ortegaaa@ph.ibm.com',
    'fte_cnt': '0.0',
    'nbr_dplymnts': '',
    'nbr_defects': '',
    'nbr_cycletime_WIP': '5.4',
    'nbr_cycletime_in_backlog': '8.6',
    'client_sat': '1.5',
    'team_sat': '1.5',
    'last_updt_dt': '2016-04-04 03:07:10 EDT',
    'created_user': 'ortegaaa@ph.ibm.com',
    'created_dt': '2016-04-04 03:07:10 EDT',
    'testdata': 'Yes'
  },
  user: {
    'shortEmail': 'john.doe@ph.ibm.com',
    'testdata': 'Yes'
  },
  userDetails: {
    testdata: 'Yes',
    shortEmail: 'john.doe@ph.ibm.com',
    ldap: {
      serialNumber: '123456PH1',
      hrFirstName: 'John',
      hrLastName: 'Doe'
    }
  },
  allTeams: [{
    _id: 'ag_team_CIOServicesEMEA-CGTest_1460465673227',
    testdata: 'Yes',
    name: 'CIO Services EMEA - CG Test',
    squadteam: 'Yes',
    parent_team_id: '',
    child_team_id: [],
    total_members: 7,
    total_allocation: 7
  }, {
    _id: 'ag_team_zTESTTeamSquaderl_1457798006050',
    testdata: 'Yes',
    name: 'zTEST Team Squad erl',
    squadteam: 'Yes',
    parent_team_id: '',
    child_team_id: [],
    total_members: 7,
    total_allocation: 7
  }],
  userTeams: [{
    _id: 'testteamid_1',
    testdata: 'Yes',
    _rev: '1-826f7437fc89b1b4d7370c7dd5f8fc0b',
    name: 'testteamid_1',
    parent_team_id: '',
    child_team_id: [],
    squadteam: 'Yes'
  }]
};
module.exports = iterations;
