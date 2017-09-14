export const UPDATE_TOOL = 'UPDATE_TOOL';
export const UPDATE_SERVER = 'UPDATE_SERVER';
export const UPDATE_TEAM_NAME = 'UPDATE_TEAM_NAME';
export const ADD_METRIC = 'ADD_METRIC';
export const REMOVE_METRIC = 'REMOVE_METRIC';

const integration = (state = {}, action) => {
  switch (action.type) {
    case UPDATE_TOOL:
      return { ...state, tool: action.tool };
    case UPDATE_SERVER:
      return { ...state, server: action.server };
    case UPDATE_TEAM_NAME:
      return { ...state, teamName: action.teamName };
    case ADD_METRIC:
      return {
        ...state,
        metrics: [
          ...state.metrics,
          { metricName: action.metricName },
        ],
      };
    case REMOVE_METRIC:
      return state.metrics.filter(metric => metric.metricType !== action.metricType);
    default:
      return state;
  }
};

export default integration;
