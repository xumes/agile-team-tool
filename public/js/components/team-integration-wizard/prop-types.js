const PropTypes = require('prop-types');

const types = {
  tools: PropTypes.arrayOf(PropTypes.shape({
    toolId: PropTypes.string,
    toolName: PropTypes.string,
    servers: PropTypes.array,
  })),
  team: PropTypes.shape({
    name: PropTypes.string,
    type: PropTypes.string,
    integration: PropTypes.shape({
      id: PropTypes.number,
      toolId: PropTypes.string,
      server: PropTypes.string,
      projectArea: PropTypes.string,
      settings: PropTypes.object,
    }),
  }),
  loadTools: PropTypes.func,
  loadTeam: PropTypes.func,
  loadProjects: PropTypes.func,
};

const defaults = {
  tools: [
    { toolId: '', toolName: '', servers: [] },
  ],
  integration: {},
  team: {},
  loadTools: () => {},
  loadTeam: () => {},
  loadProjects: () => {},
};

module.exports = {
  types,
  defaults,
};

