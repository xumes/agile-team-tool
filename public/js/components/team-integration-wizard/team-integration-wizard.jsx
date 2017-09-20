require('./team-integration.scss');
const React = require('react');
const PropTypes = require('prop-types');
const CommonModal = require('../common-modal/common-modal.jsx');
const WizardStepOne = require('./wizard-step-one.jsx');
const WizardStepTwo = require('./wizard-step-two.jsx');
const WizardStepThree = require('./wizard-step-three.jsx');
const WizardStepFour = require('./wizard-step-four.jsx');
const Wizard = require('../wizard/wizard.jsx');
const InlineSVG = require('svg-inline-react');
const confirmIcon = require('../../../img/Att-icons/att-icons_confirm.svg');

class TeamIntegration extends React.Component {
  constructor(props) {
    super(props);

    if (props.tools) props.showAllTools();

    this.state = {
      showModal: false,
    };

    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
  }

  show() {
    this.setState({
      showModal: true,
    });
  }

  hide() {
    this.setState({
      showModal: false,
    });
  }

  render() {
    return (
      <div className="att-hti">
        <div
          className="home-team-header-teamname-btn"
          id="homeHeaderIntegrationBtn"
          onClick={this.show}
          role="button"
          tabIndex="0"
        >
          <InlineSVG
            title="Configure Agile Tool Integration"
            class="home-team-header-teamname-btn-img"
            src={confirmIcon}
          />
        </div>

        <CommonModal
          heading="Integration"
          show={this.state.showModal}
          onHide={this.hide}
        >
          <Wizard
            onClose={this.hide}
          >
            <WizardStepOne page={1} tools={this.props.tools} />
            <WizardStepTwo page={2} tools={this.props.tools} />
            <WizardStepThree page={3} tools={this.props.tools} />
            <WizardStepFour page={4} tools={this.props.tools} />
          </Wizard>
        </CommonModal>
      </div>
    );
  }
}

TeamIntegration.propTypes = {
  tools: PropTypes.arrayOf(PropTypes.shape({
    toolId: PropTypes.string,
    toolName: PropTypes.string,
    servers: PropTypes.array,
  })),
  showAllTools: PropTypes.func,
};

TeamIntegration.defaultProps = {
  tools: [],
  showAllTools: () => {},
};


module.exports = TeamIntegration;
