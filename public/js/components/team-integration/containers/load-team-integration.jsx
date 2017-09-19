const Redux = require('react-redux');
const loadIntegration = require('./../../../actions/integration-actions');
const TeamIntegration = require('./../team-integration.jsx');

const mapStateToProps = state => ({ teamIntegration: state.teamIntegration });
const mapDispatchToProps = dispatch => ({ onSubmit: id => dispatch(loadIntegration(id)) });

const LoadTeamIntegration = Redux.connect(
  mapStateToProps,
  mapDispatchToProps,
)(TeamIntegration);

module.exports = LoadTeamIntegration;
