require('./home-team-integration.scss');
const React = require('react');
const CommonModal = require('../common-modal/common-modal.jsx');
const IntegrationWizardStepOne = require('../home-team-integration/integration-wizard-step-one.jsx');
const IntegrationWizardStepTwo = require('../home-team-integration/integration-wizard-step-two.jsx');
const IntegrationWizardStepThree = require('../home-team-integration/integration-wizard-step-three.jsx');
const IntegrationWizardStepFour = require('../home-team-integration/integration-wizard-step-four.jsx');
const Wizard = require('../wizard/wizard.jsx');
const InlineSVG = require('svg-inline-react');
const confirmIcon = require('../../../img/Att-icons/att-icons_confirm.svg');


class HomeTeamIntegration extends React.Component {
  constructor(props) {
    super(props);

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
    this.integration = {
      type: '',
    };

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
            <IntegrationWizardStepOne data={this.integration} page={1} />
            <IntegrationWizardStepTwo data={this.integration} page={2} />
            <IntegrationWizardStepThree data={this.integration} page={3} />
            <IntegrationWizardStepFour data={this.integration} page={4} />
          </Wizard>
        </CommonModal>
      </div>
    );
  }
}

module.exports = HomeTeamIntegration;
