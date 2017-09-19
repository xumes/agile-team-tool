const actionTypes = require('./../actions/action-types');

const metric = (state = {}, action) => {
  switch (action.type) {
    case actionTypes.metric.UPDATE_METRIC_TYPE:
      return { ...state, metricType: action.metricType };
    case actionTypes.metric.UPDATE_VALUE:
      return { ...state, value: action.value };
    default:
      return state;
  }
};

module.exports = metric;
