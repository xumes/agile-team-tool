const UPDATE_METRIC_TYPE = 'UPDATE_METRIC_TYPE';
const UPDATE_VALUE = 'UPDATE_VALUE';

const initialState = {};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_METRIC_TYPE:
      return { ...state, metricType: action.metricType };
    case UPDATE_VALUE:
      return { ...state, value: action.value };
    default:
      return state;
  }
};

module.exports = reducer;
