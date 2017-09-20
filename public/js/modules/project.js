const LOAD_PROJECT = 'LOAD_TEAM';

const initialState = {
  id: '_4uZ-oIznEeeXUay1vBusKg',
  name: 'Seven Kingdoms',
};

const loadProject = project => ({ type: LOAD_PROJECT, project });

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case LOAD_PROJECT:
      return state;
    default:
      return state;
  }
};

module.exports = {
  reducer,
  loadProject,
};
