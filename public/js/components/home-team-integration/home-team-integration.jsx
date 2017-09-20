require('./home-team-integration.scss');
const React = require('react');
const CommonModal = require('../common-modal/common-modal.jsx');
const IntegrationWizardStepOne = require('../home-team-integration/wizard-one.jsx');
const IntegrationWizardStepTwo = require('../home-team-integration/wizard-two.jsx');
const IntegrationWizardStepThree = require('../home-team-integration/wizard-three.jsx');
const IntegrationWizardStepFour = require('../home-team-integration/wizard-four.jsx');
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

    const pageOneOptions = {
      btnCancel: {
        order: 1,
      },
      btnPrevious: {
        hide: true,
      },
      btnNext: {
        order: 2,
      },
    };

    const pageTwoOptions = {
      btnCancel: {
        hide: true,
      },
      btnPrevious: {
        order: 1,
      },
      btnNext: {
        order: 2,
      },
    };

    const pageThreeOptions = {
      btnCancel: {
        hide: true,
      },
      btnPrevious: {
        order: 1,
      },
      btnNext: {
        order: 2,
        label: 'Preview',
      },
    };

    const pageFourOptions = {
      btnCancel: {
        order: 1,
      },
      btnPrevious: {
        hide: true,
      },
      btnNext: {
        order: 2,
        label: 'Save',
        onClick: 'this.save',
      },
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
          heading="Integrate with RTC"
          show={this.state.showModal}
          onHide={this.hide}
        >
          <Wizard
            onClose={this.hide}
            navButtons={this.navButtons}
          >
            <IntegrationWizardStepOne
              data={this.integration}
              page="1"
              options={pageOneOptions}
            />
            <IntegrationWizardStepTwo
              data={this.integration}
              page="2"
              options={pageTwoOptions}
            />
            <IntegrationWizardStepThree
              data={this.integration}
              page="3"
              options={pageThreeOptions}
            />
            <IntegrationWizardStepFour
              data={this.integration}
              page="4"
              options={pageFourOptions}
            />
          </Wizard>
        </CommonModal>
      </div>
    );
  }
}

module.exports = HomeTeamIntegration;
