const PropTypes = require('prop-types');

const types = {
  tools: PropTypes.arrayOf(PropTypes.shape({
    toolId: PropTypes.string,
    toolName: PropTypes.string,
    servers: PropTypes.array,
  })),
  team: PropTypes.shape({
    teamId: PropTypes.number,
    name: PropTypes.string,
    type: PropTypes.string,
    integration: PropTypes.shape({
      id: PropTypes.number,
      toolId: PropTypes.string,
      server: PropTypes.string,
      projectArea: PropTypes.string,
      settings: PropTypes.shape({
        defects: PropTypes.object,
        velocity: PropTypes.object,
        throughput: PropTypes.object,
        wip: PropTypes.object,
        backlog: PropTypes.object,
        deployments: PropTypes.object,
        iterationPattern: PropTypes.string,
      }),
    }),
  }),
  projects: PropTypes.arrayOf(PropTypes.shape({
    projectId: PropTypes.string,
    projectName: PropTypes.string,
  })),
  preview: PropTypes.shape({
    velocity: PropTypes.arrayOf(PropTypes.shape({
      storyPointsCommitted: PropTypes.number,
      storyPointsDelivered: PropTypes.number,
    })),
    throughput: PropTypes.arrayOf(PropTypes.shape({
      storyCardsCommitted: PropTypes.number,
      storyCardsDelivered: PropTypes.number,
    })),
    defects: PropTypes.arrayOf(PropTypes.shape({
      defectsStartBal: PropTypes.number,
      defectsOpened: PropTypes.number,
      defectsClosed: PropTypes.number,
      defectsEndBal: PropTypes.number,
    })),
    deployments: PropTypes.arrayOf(PropTypes.shape({})),
    wip: PropTypes.arrayOf(PropTypes.shape({})),
    backlog: PropTypes.arrayOf(PropTypes.shape({})),
  }),
  wizard: PropTypes.shape({ page: PropTypes.number, close: PropTypes.bool }),
  loadTools: PropTypes.func,
  loadTeam: PropTypes.func,
  loadProjects: PropTypes.func,
  goToPage: PropTypes.func,
};

const defaults = {
  tools: [
    { toolId: '', toolName: '', servers: [] },
  ],
  integration: {},
  settings: {},
  team: {},
  projects: [
    { projectId: '', projectName: '' },
  ],
  preview: {},
  wizard: { page: 1, close: false },
  loadTools: () => {},
  loadTeam: () => {},
  loadProjects: () => {},
  goToPage: () => {},
};

module.exports = {
  types,
  defaults,
};
