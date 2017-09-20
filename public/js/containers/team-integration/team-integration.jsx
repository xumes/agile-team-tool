const Redux = require('react-redux');
const TeamIntegrationWizard = require('./../../components').TeamIntegrationWizard;
const toolActions = require('./../../modules/tools');
const integrationActions = require('./../../modules/integration');

const mapStateToProps = state => ({
  integration: state.integration,
  tools: state.tools,
});

const mapDispatchToProps = dispatch => ({
  loadIntegration: () => dispatch(integrationActions.loadIntegration()),
  showAllTools: () => dispatch(toolActions.showRTC()),
});

const Tools = Redux.connect(
  mapStateToProps,
  mapDispatchToProps,
)(TeamIntegrationWizard);

module.exports = Tools;
