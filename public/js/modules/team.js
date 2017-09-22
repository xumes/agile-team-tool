// action types
const LOAD_TEAM = 'LOAD_TEAM';
const LOAD_INTEGRATION = 'LOAD_INTEGRATION';
const LOAD_INTEGRATION_SUCCESS = 'LOAD_INTEGRATION_SUCCESS';

const initialState = {
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

// reducer
const reducer = (state = initialState, action) => {
  switch (action.type) {
    case LOAD_TEAM:
      return state;

    case LOAD_INTEGRATION:
      return action.payload.request.data;

    case LOAD_INTEGRATION_SUCCESS:
      return { ...state, integration: action.payload.data };

    default:
      return state;
  }
};

module.exports = {
  reducer,
  loadTeam,
  loadIntegration,
};
