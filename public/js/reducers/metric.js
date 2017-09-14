export const UPDATE_METRIC_TYPE = 'UPDATE_METRIC_TYPE';
export const UPDATE_VALUE = 'UPDATE_VALUE';

const metric = (state = {}, action) => {
  switch (action.type) {
    case UPDATE_METRIC_TYPE:
      return { ...state, metricType: action.metricType };
    case UPDATE_VALUE:
      return { ...state, value: action.value };
    default:
      return state;
  }
};

export default metric;
