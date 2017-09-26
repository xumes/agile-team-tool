const Redux = require('react-redux');
const TeamIntegrationWizard = require('./../../components').TeamIntegrationWizard;
const toolActions = require('./../../modules/tools');
const teamActions = require('./../../modules/team');
const projectsActions = require('./../../modules/projects');
const previewActions = require('./../../modules/preview');
const wizardActions = require('./../../modules/wizard');

const mapStateToProps = state => ({
  projects: state.projects,
  team: state.team,
  tools: state.tools,
  preview: state.preview,
  wizard: state.wizard,
});

const mapDispatchToProps = dispatch => ({
  loadTools: () => dispatch(toolActions.loadTools()),
  loadIntegration: teamId => dispatch(teamActions.loadIntegration(teamId)),
  loadProjects: (toolId, server) => dispatch(projectsActions.loadProjects(toolId, server)),
  showPreview: (teamId, integration) => dispatch(previewActions.showPreview(teamId, integration)),
  goToPage: pageNumber => dispatch(wizardActions.goToPage(pageNumber)),
});

const Tools = Redux.connect(
  mapStateToProps,
  mapDispatchToProps,
)(TeamIntegrationWizard);

module.exports = Tools;
