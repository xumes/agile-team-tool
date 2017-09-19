const actionTypes = require('./../actions/action-types');

const integration = (state = {}, action) => {
  switch (action.type) {
    case actionTypes.integration.ADD_INTEGRATION:
      return action.integration;
    case actionTypes.integration.UPDATE_TOOL:
      return { ...state, tool: action.tool };
    case actionTypes.integration.UPDATE_SERVER:
      return { ...state, server: action.server };
    case actionTypes.integration.UPDATE_TEAM_NAME:
      return { ...state, teamName: action.teamName };
    case actionTypes.integration.ADD_METRIC:
      return {
        ...state,
        metrics: [
          ...state.metrics,
          { metricName: action.metricName },
        ],
      };
    case actionTypes.integration.REMOVE_METRIC:
      return state.metrics.filter(metric => metric.metricName !== action.metricName);
    default:
      return state;
  }
};

module.exports = integration;
