const actionTypes = require('./../actions/action-types');

const tools = (state = {}, action) => {
  switch (action.type) {
    case actionTypes.tool.SHOW_ALL:
      // TODO: replace the hardcoded data 
      // with actual payload request when it is ready.
      // return action.payload.request.data;
      return [
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
    default:
      return state;
  }
};

module.exports = tools;
