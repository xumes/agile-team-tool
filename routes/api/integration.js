var _ = require('lodash');
module.exports = function(app, includes) {

  app.get('/api/integrations/tools', function(req, res)  {
    return res.json({
      tools: [
        {
          toolId: 'RTC',
          toolName: 'Rational Team Concert (RTC)',
          servers: [
            'igartc01.swg.usma.ibm.com',
            'igartc02.swg.usma.ibm.com',
            'igartc03.swg.usma.ibm.com'
          ]
        }
      ]
    });
  });

  app.get('/api/integrations/tool/:toolId/server/:server/projects', function(req, res) {
    return res.json({
      projects: [
        {
          projectId: '_4uZ-oIznEeeXUay1vBusKg',
          projectName: 'Agile Team Tool'
        }
      ]
    });
  });

  app.get('/api/teams/:teamId/integration', function(req, res) {
    return res.json({
      toolId: 'RTC',
      server: 'igartc02.swg.usma.ibm.com',
      projectId: '_4uZ-oIznEeeXUay1vBusKg',
      settings: {
        defects: {
          defectTypeId: ['com.ibm.team.workitem.workitemType.defect'],
          defectInProgressStates: ['In Progress', 'Verified'],
          defectResolvedStates: ['Resolved'],
        },
        velocity: {
          storyTypeId: ['com.ibm.team.apt.workItemType.story'],
          storyPointsId: 'com.ibm.team.apt.attribute.complexity',
          storyInProgressStates: ['In Progress', 'In Review'],
          storyResolvedStates: ['Verified', 'Done'],
        },
        throughput: {
          storyTypeId: ['com.ibm.team.apt.workItemType.story'],
          storyPointsId: 'com.ibm.team.apt.attribute.complexity',
          storyInProgressStates: ['In Progress', 'In Review'],
          storyResolvedStates: ['Verified', 'Done'],
        },
        wip: {
          storyTypeId: ['com.ibm.team.apt.workItemType.story'],
          storyPointsId: 'com.ibm.team.apt.attribute.complexity',
          storyInProgressStates: ['In Progress', 'In Review'],
          storyResolvedStates: ['Verified', 'Done'],
        },
        backlog: {
          storyTypeId: ['com.ibm.team.apt.workItemType.story'],
          storyPointsId: 'com.ibm.team.apt.attribute.complexity',
          storyInProgressStates: ['In Progress', 'In Review'],
          storyResolvedStates: ['Verified', 'Done'],
        },
        deployments: {},      
        iterationPattern: 'Sprint %',
      },
    });
  });

  app.post('/api/teams/:teamId/integration', function(req, res) {
    if (_.isEmpty(req.params.teamId) ||
      _.any(['projectId', 'iterationPattern',
        'defectTypeId', 'defectInProgressStates', 'defectResolvedStates',
        'storyTypeId', 'storyPointsId', 'storyInProgressStates'], function(prop) {
        return _.has(req.body, prop);
      })) {
      return res.status(400).json({
        message: 'Invalid parameters'
      });
    } else {
      return res.status(200).json({
        message: 'created'
      });
    }
  });
  app.get('/api/integrations/tool/:toolId/server/:server/project/:projectId/states', function(req, res) {
    return res.json({
    });
  });
  app.post('/api/teams/:teamId/integration/preview', function(req, res) {
    return res.json({
      velocity: [
        {storyPointsCommitted: 5},
        {storyPointsDelivered: 2},
      ],
      throughput: [
        {storyCardsCommitted: 2},
        {storyCardsDelivered: 1},
      ],
      defects: [
        {defectsStartBal: 0},
        {defectsOpened: 0},
        {defectsClosed: 0},
        {defectsEndBal: 0},
      ],
      deployments: [],
      wip: 23,
      backlog: 14,
    });
  });
};
