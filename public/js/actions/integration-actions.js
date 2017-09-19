const actionTypes = require('./action-types');

const loadIntegration =
  integration => ({ type: actionTypes.integration.LOAD_INTEGRATION, integration });
const removeIntegration = id => ({ type: actionTypes.integration.REMOVE_INTEGRATION, id });
const updateTool = tool => ({ type: actionTypes.integration.UPDATE_TOOL, tool });
const updateServer = server => ({ type: actionTypes.integration.UPDATE_SERVER, server });
const updateTeamName = teamName => ({ type: actionTypes.integration.UPDATE_TEAM_NAME, teamName });
const addMetric = metric => ({ type: actionTypes.integration.ADD_METRIC, ...metric });
const removeMetric = metricName => ({ type: actionTypes.integration.REMOVE_METRIC, ...metricName });

module.exports = {
  loadIntegration,
  removeIntegration,
  updateTool,
  updateServer,
  updateTeamName,
  addMetric,
  removeMetric,
};
