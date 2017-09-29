// NOTE: Integration model is currently separated from the team model to mitigate the effect
// of this new feature from the existing Team API model.
// The plan moving forward is to make integration part of the team model.

// action types
const UPDATE_TOOL = 'UPDATE_TOOL';
const UPDATE_SERVER = 'UPDATE_SERVER';
const UPDATE_TEAM_NAME = 'UPDATE_TEAM_NAME';
const UPDATE_PROJECT_AREA = 'UPDATE_PROJECT_AREA';
const ADD_METRIC = 'ADD_METRIC';
const REMOVE_METRIC = 'REMOVE_METRIC';

const initialState = {};

// actions
const updateTool = toolId => ({ type: UPDATE_TOOL, toolId });
const updateServer = server => ({ type: UPDATE_SERVER, server });
const updateTeamName = teamName => ({ type: UPDATE_TEAM_NAME, teamName });
const updateProjectArea = projectArea => ({ type: UPDATE_PROJECT_AREA, projectArea });
const addMetric = metric => ({ type: ADD_METRIC, ...metric });
const removeMetric = metricName => ({ type: REMOVE_METRIC, ...metricName });

// reducer
const reducer = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_TOOL:
      return { ...state, tool: action.toolId };
    case UPDATE_SERVER:
      return { ...state, server: action.server };
    case UPDATE_TEAM_NAME:
      return { ...state, teamName: action.teamName };
    case UPDATE_PROJECT_AREA:
      return { ...state, projectArea: action.projectArea };
    case ADD_METRIC:
      return {
        ...state,
        metrics: [
          ...state.metrics,
          { metricName: action.metricName },
        ],
      };
    case REMOVE_METRIC:
      return state.metrics.filter(metric => metric.metricName !== action.metricName);
    default:
      return state;
  }
};

module.exports = {
  reducer,
  initialState,
  updateTool,
  updateServer,
  updateTeamName,
  updateProjectArea,
  addMetric,
  removeMetric,
};
