const Redux = require('react-redux');
const TeamIntegrationWizard = require('./../../components').TeamIntegrationWizard;
const toolActions = require('./../../modules/tools');
const teamActions = require('./../../modules/team');
const projectsActions = require('./../../modules/projects');

const mapStateToProps = state => ({
  projects: state.projects,
  team: state.team,
  tools: state.tools,
});

const mapDispatchToProps = dispatch => ({
  loadTools: () => dispatch(toolActions.loadTools()),
  loadTeam: () => dispatch(teamActions.loadTeam()),
  loadProjects: (toolId, server) => dispatch(projectsActions.loadProjects(toolId, server)),
});

const Tools = Redux.connect(
  mapStateToProps,
  mapDispatchToProps,
)(TeamIntegrationWizard);

module.exports = Tools;
