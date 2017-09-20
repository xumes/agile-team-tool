const ADD_TEAM = 'ADD_TEAM';
const REMOVE_TEAM = 'REMOVE_TEAM';

const initialState = [];

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_TEAM:
      return [
        ...state,
        {
          name: action.name,
          role: action.role,
          allocation: action.allocation,
          userId: action.userId,
          email: action.email,
          workTime: action.workTime,
        },
      ];
    case REMOVE_TEAM:
      return state.filter(team => team.name !== action.name);
    default:
      return state;
  }
};

module.exports = reducer;
