const Redux = require('react-redux');
const TeamIntegrationWizard = require('./../../components').TeamIntegrationWizard;
const toolActions = require('./../../modules/tools');
const teamActions = require('./../../modules/team');
const integrationActions = require('./../../modules/integration');
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

const Tools = Redux.connect(mapStateToProps, {
  loadTools: toolActions.loadTools,
  loadIntegration: teamActions.loadIntegration,
  updateTool: integrationActions.updateTool,
  updateServer: integrationActions.updateServer,
  updateTeamName: integrationActions.updateTeamName,
  updateProjectArea: integrationActions.updateProjectArea,
  loadProjects: projectsActions.loadProjects,
  showPreview: previewActions.showPreview,
  goToPage: wizardActions.goToPage,
})(TeamIntegrationWizard);

module.exports = Tools;
