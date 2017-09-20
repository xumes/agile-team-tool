require('./team-integration-wizard.scss');
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

    this.props = props;
    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
    this.save = this.save.bind(this);
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

  save() {
    this.setState({
      showModal: false,
    }, () => {
      console.log('saved!');
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
        hide: true,
      },
      btnPrevious: {
        order: 1,
      },
      btnNext: {
        hide: true,
      },
      btnSave: {
        id: 'btnSave',
        label: 'Save',
        class: 'ibm-btn-pri ibm-btn-small ibm-btn-blue-50 u-mr-sm',
        onClick: this.save,
        hide: false,
        order: 2,
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
          <Wizard onClose={this.hide} navButtons={this.navButtons}>
            <WizardStepOne page="1" options={pageOneOptions} tools={this.props.tools} />
            <WizardStepTwo page="2" options={pageTwoOptions} tools={this.props.tools} />
            <WizardStepThree page="3" options={pageThreeOptions} />
            <WizardStepFour page="4" options={pageFourOptions} />
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
