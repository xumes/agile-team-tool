const Redux = require('react-redux');
const TeamIntegrationWizard = require('./../../components').TeamIntegrationWizard;
const actions = require('./../../modules/tools');

const mapStateToProps = state => ({ tools: state.tools });
const mapDispatchToProps = dispatch => ({ showAllTools: () => dispatch(actions.showRTC()) });

const Tools = Redux.connect(
  mapStateToProps,
  mapDispatchToProps,
)(TeamIntegrationWizard);

module.exports = Tools;
