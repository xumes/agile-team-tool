// action types
const LOAD_TEAM = 'LOAD_TEAM';
const LOAD_INTEGRATION = 'LOAD_INTEGRATION';
const LOAD_INTEGRATION_SUCCESS = 'LOAD_INTEGRATION_SUCCESS';
const UPDATE_TOOL = 'UPDATE_TOOL';
const UPDATE_SERVER = 'UPDATE_SERVER';
const UPDATE_TEAM_NAME = 'UPDATE_TEAM_NAME';
const UPDATE_PROJECT_ID = 'UPDATE_PROJECT_ID';

const initialState = {
  teamId: 1,
  name: 'JC\'s Dragon Slayers',
  type: '',
};

// actions
const loadTeam = team => ({ type: LOAD_TEAM, team });
const loadIntegration = teamId => ({
  type: [LOAD_INTEGRATION],
  payload: {
    request: { url: `/teams/${teamId}/integration` },
  },
});
const updateTool = toolId => ({ type: UPDATE_TOOL, toolId });
const updateServer = server => ({ type: UPDATE_SERVER, server });
const updateTeamName = teamName => ({ type: UPDATE_TEAM_NAME, teamName });
const updateProject = projectId => ({ type: UPDATE_PROJECT_ID, projectId });

// reducer
const reducer = (state = initialState, action) => {
  switch (action.type) {
    case LOAD_TEAM:
      return state;
    case LOAD_INTEGRATION:
      return action.payload.request.data;
    case LOAD_INTEGRATION_SUCCESS:
      return { ...state, integration: action.payload.data };
    case UPDATE_TOOL:
      return { ...state, tool: action.toolId };
    case UPDATE_SERVER:
      return { ...state, integration: { ...state.integration, server: action.server } };
    case UPDATE_TEAM_NAME:
      return { ...state, teamName: action.teamName };
    case UPDATE_PROJECT_ID:
      return { ...state, integration: { ...state.integration, projectId: action.projectId } };
    default:
      return state;
  }
};

module.exports = {
  reducer,
  loadTeam,
  loadIntegration,
  updateTool,
  updateServer,
  updateTeamName,
  updateProject,
};
