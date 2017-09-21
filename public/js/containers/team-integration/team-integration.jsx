const Redux = require('react-redux');
const TeamIntegrationWizard = require('./../../components').TeamIntegrationWizard;
const toolActions = require('./../../modules/tools');
const teamActions = require('./../../modules/team');
const projectActions = require('./../../modules/project');

const mapStateToProps = state => ({
  tools: state.tools,
  team: state.team,
  project: state.project,
});

const mapDispatchToProps = dispatch => ({  
  loadTools: () => dispatch(toolActions.showRTC()),
  loadTeam: () => dispatch(teamActions.loadTeam()),
  loadProject: () => dispatch(projectActions.loadProject()),
});

const Tools = Redux.connect(
  mapStateToProps,
  mapDispatchToProps,
)(TeamIntegrationWizard);

module.exports = Tools;
