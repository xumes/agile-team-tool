const team = {
  ADD_TEAM: 'ADD_TEAM',
  REMOVE_TEAM: 'REMOVE_TEAM',
};

const tool = {
  SHOW_ALL: 'SHOW_ALL',
};

const integration = {
  LOAD_INTEGRATION: 'LOAD_INTEGRATION',
  REMOVE_INTEGRATION: 'REMOVE_INTEGRATION',
  UPDATE_TOOL: 'UPDATE_TOOL',
  UPDATE_SERVER: 'UPDATE_SERVER',
  UPDATE_TEAM_NAME: 'UPDATE_TEAM_NAME',
  ADD_METRIC: 'ADD_METRIC',
  REMOVE_METRIC: 'REMOVE_METRIC',
};

const metric = {
  UPDATE_METRIC_TYPE: 'UPDATE_METRIC_TYPE',
  UPDATE_VALUE: 'UPDATE_VALUE',
};

const actionTypes = {
  team,
  tool,
  integration,
  metric,
};

module.exports = actionTypes;
