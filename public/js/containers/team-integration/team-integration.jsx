const React = require('react');
const Redux = require('react-redux');
const TeamIntegrationWizard = require('./../../components').TeamIntegrationWizard;
const Tools = require('./tools.jsx');
const actions = require('./../../modules/integration');

const mapStateToProps = state => ({ teamIntegration: state.teamIntegration });
const mapDispatchToProps = dispatch => ({ onSubmit: () => dispatch(actions.loadIntegration()) });

Redux.connect(
  mapStateToProps,
  mapDispatchToProps,
)(TeamIntegrationWizard);

class TeamIntegration extends React.Component {
  render() {
    return (<Tools />);
  }
}

module.exports = TeamIntegration;
