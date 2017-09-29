require('./team-integration-wizard.scss');
const React = require('react');
const CommonModal = require('../common-modal/common-modal.jsx');
const WizardStepOne = require('./wizard-step-one.jsx');
const WizardStepTwo = require('./wizard-step-two.jsx');
const WizardStepThree = require('./wizard-step-three.jsx');
const WizardStepFour = require('./wizard-step-four.jsx');
const Wizard = require('../wizard/wizard.jsx');
const InlineSVG = require('svg-inline-react');
const flowIcon = require('../../../img/Att-icons/att-icons_flow.svg');
const propTypes = require('./prop-types');

class TeamIntegrationWizard extends React.Component {
  constructor(props) {
    super(props);

    this.props = props;

    props.goToPage(1);
    props.loadTools();
    this.loadIntegration();

    this.state = {
      showModal: false,
    };

    this.props = props;
    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
    this.save = this.save.bind(this);
    this.preview = this.preview.bind(this);
  }

  async loadIntegration() {
    const integration = await this.props.loadIntegration(this.props.team.teamId);

    this.props.loadProjects(
      integration.toolId,
      integration.server,
    );
  }

  show() {
    this.setState({
      showModal: true,
    });
  }

  hide() {
    this.props.goToPage(1);
    this.setState({
      showModal: false,
    });
  }

  save() {
    this.hide();
  }

  preview() {
    this.props.showPreview(this.props.team.teamId).then(() => {
      this.props.goToPage(this.props.wizard.page + 1);
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
        hide: true,
      },
      btnPreview: {
        id: 'btnPreview',
        label: 'Preview',
        class: 'ibm-btn-pri ibm-btn-small ibm-btn-blue-50 u-mr-sm',
        onClick: this.preview,
        hide: false,
        order: 2,
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
            src={flowIcon}
          />
        </div>

        <CommonModal
          heading="Integrate with RTC"
          show={this.state.showModal}
          onHide={this.hide}
        >
          <Wizard onClose={this.hide} wizard={this.props.wizard} goToPage={this.props.goToPage}>
            <WizardStepOne
              page="1"
              options={pageOneOptions}
              tools={this.props.tools}
            />
            <WizardStepTwo
              page="2"
              options={pageTwoOptions}
              tools={this.props.tools}
              team={this.props.team}
              projects={this.props.projects}
              updateServer={this.props.updateServer}
              updateProject={this.props.updateProject}
            />
            <WizardStepThree
              page="3"
              options={pageThreeOptions}
              tools={this.props.tools}
              team={this.props.team}
            />
            <WizardStepFour
              page="4"
              options={pageFourOptions}
              team={this.props.team}
              preview={this.props.preview}
            />
          </Wizard>
        </CommonModal>
      </div>
    );
  }
}

TeamIntegrationWizard.propTypes = propTypes.types;
TeamIntegrationWizard.defaultProps = propTypes.defaults;

module.exports = TeamIntegrationWizard;
