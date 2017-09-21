const integration = require('./integration');

const LOAD_TEAM = 'LOAD_TEAM';

const initialState = {
  name: 'JC\'s Dragon Slayers',
  type: '',
  integration: integration.initialState,
};

const loadTeam = team => ({ type: LOAD_TEAM, team });

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case LOAD_TEAM:
      return state;
    default:
      return state;
  }
};

module.exports = {
  reducer,
  loadTeam,
};
