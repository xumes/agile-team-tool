// action types
const LOAD_TOOLS = 'LOAD_TOOLS';
const LOAD_TOOLS_SUCCESS = 'LOAD_TOOLS_SUCCESS';
const LOAD_TOOLS_FAIL = 'LOAD_TOOLS_FAIL';
const SHOW_RTC = 'SHOW_RTC';

const initialState = [
  {
    toolId: '',
    toolName: '',
  },
];

// actions
const loadTools = () => ({
  type: [LOAD_TOOLS],
  payload: {
    request: { url: '/integrations/tools' },
  },
});

const showRTC = () => ({
  type: SHOW_RTC,
});

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case LOAD_TOOLS:
      return action.payload.request.data;

    case LOAD_TOOLS_SUCCESS:
      return action.payload.data.tools;

    case LOAD_TOOLS_FAIL:
      throw new Error(action.error.message);

    case SHOW_RTC:
      return state;

    default:
      return state;
  }
};

module.exports = {
  reducer,
  loadTools,
  showRTC,
};
