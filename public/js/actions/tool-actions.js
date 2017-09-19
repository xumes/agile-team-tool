const actionTypes = require('./action-types');

const showAllTools = () => ({
  type: actionTypes.tool.SHOW_ALL,
  payload: {
    request: { url: '/integrations/tools' },
  },
});

module.exports = {
  showAllTools,
};
