const LOAD_PROJECTS = 'LOAD_PROJECTS';
const LOAD_PROJECTS_SUCCESS = 'LOAD_PROJECTS_SUCCESS';
const LOAD_PROJECTS_FAIL = 'LOAD_PROJECTS_FAIL';

const initialState = [];

// actions
const loadProjects = (toolId, server) => ({
  type: [LOAD_PROJECTS],
  payload: {
    request: { url: `/integrations/tool/${toolId}/server/${server}/projects` },
  },
});

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case LOAD_PROJECTS:
      return action.payload.request.data;

    case LOAD_PROJECTS_SUCCESS:
      return action.payload.data.projects;

    case LOAD_PROJECTS_FAIL:
      throw new Error(action.error.message);

    default:
      return state;
  }
};

module.exports = {
  reducer,
  loadProjects,
};
