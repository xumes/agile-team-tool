const LOAD_PROJECT = 'LOAD_PROJECT';

const initialState = {
  id: '',
  name: '',
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
