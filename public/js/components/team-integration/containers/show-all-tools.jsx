const Redux = require('react-redux');
const toolActions = require('./../../../actions/tool-actions');
const TeamIntegration = require('./../team-integration.jsx');

const mapStateToProps = state => ({ tools: state.tools });
const mapDispatchToProps = dispatch => ({
  showAllTools: () => dispatch(toolActions.showAllTools()) });

const ShowAllTools = Redux.connect(
  mapStateToProps,
  mapDispatchToProps,
)(TeamIntegration);

module.exports = ShowAllTools;
