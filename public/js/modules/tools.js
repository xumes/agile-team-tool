// action types
const SHOW_ALL = 'SHOW_ALL';
const SHOW_RTC = 'SHOW_RTC';

const initialState = [
  {
    toolId: 'RTC',
    toolName: 'Rational Team Concert',
    servers: [
      'igartc01.swg.usma.ibm.com',
      'igartc02.swg.usma.ibm.com',
      'igartc03.swg.usma.ibm.com',
    ],
  },
];

// actions
const showAllTools = () => ({
  type: SHOW_ALL,
  payload: {
    request: { url: '/integrations/tools' },
  },
});

const showRTC = () => ({
  type: SHOW_RTC,
});

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case SHOW_ALL:
      return action.payload.request.data;

    case SHOW_RTC:
      return state;

    default:
      return state;
  }
};

module.exports = {
  reducer,
  showAllTools,
  showRTC,
};
