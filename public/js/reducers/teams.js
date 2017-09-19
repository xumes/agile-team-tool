const actionTypes = require('./../actions/action-types');

const teams = (state = [], action) => {
  switch (action.type) {
    case actionTypes.team.ADD_TEAM:
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
    case actionTypes.team.REMOVE_TEAM:
      return state.filter(team => team.name !== action.name);
    default:
      return state;
  }
};

module.exports = teams;
