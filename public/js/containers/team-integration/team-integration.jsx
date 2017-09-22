const Redux = require('react-redux');
const TeamIntegrationWizard = require('./../../components').TeamIntegrationWizard;
const toolActions = require('./../../modules/tools');
const teamActions = require('./../../modules/team');
const projectsActions = require('./../../modules/projects');
const iterationActions = require('./../../modules/iteration');

const mapStateToProps = state => ({
  projects: state.projects,
  team: state.team,
  tools: state.tools,
  preview: state.preview,
});

const mapDispatchToProps = dispatch => ({
  loadTools: () => dispatch(toolActions.loadTools()),
  loadIntegration: teamId => dispatch(teamActions.loadIntegration(teamId)),
  loadProjects: (toolId, server) => dispatch(projectsActions.loadProjects(toolId, server)),
  showPreview: teamId => dispatch(iterationActions.showPreview(teamId)),
});

const Tools = Redux.connect(
  mapStateToProps,
  mapDispatchToProps,
)(TeamIntegrationWizard);

module.exports = Tools;
