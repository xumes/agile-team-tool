const Redux = require('react-redux');
const TeamIntegrationWizard = require('./../../components').TeamIntegrationWizard;
const toolActions = require('./../../modules/tools');
const integrationActions = require('./../../modules/integration');
const teamActions = require('./../../modules/team');
const projectActions = require('./../../modules/project');

const mapStateToProps = state => ({
  integration: state.integration,
  tools: state.tools,
  team: state.team,
  project: state.project,
});

const mapDispatchToProps = dispatch => ({
  loadIntegration: () => dispatch(integrationActions.loadIntegration()),
  loadTools: () => dispatch(toolActions.showRTC()),
  loadTeam: () => dispatch(teamActions.loadTeam()),
  loadProject: () => dispatch(projectActions.loadProject()),
});

const Tools = Redux.connect(
  mapStateToProps,
  mapDispatchToProps,
)(TeamIntegrationWizard);

module.exports = Tools;
