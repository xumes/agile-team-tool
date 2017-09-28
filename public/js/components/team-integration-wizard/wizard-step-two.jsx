const React = require('react');
const propTypes = require('./prop-types');
const InlineSVG = require('svg-inline-react');
const dropdownIcon = require('../../../img/Att-icons/att-icons_show.svg');

class WizardStepTwo extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedServer: props.team.integration ? props.team.integration.server : '',
      selectedProject: '',
    };

    this.props = props;
    this.updateServer = this.updateServer.bind(this);
    this.updateProject = this.updateProject.bind(this);
  }

  updateServer(event) {
    this.setState({ selectedServer: event.target.text });
  }

  updateProject(event) {
    this.setState({ selectedProject: event.target.text });
  }

  render() {
    const props = this.props;
    const toolId = props.tools && props.tools.length ? props.tools[0].toolId : 0;
    const teamName = props.team ? props.team.name : '';
    const projects = props.projects && props.projects.length ? props.projects : [];
    const servers = props.tools[0].servers &&
      props.tools[0].servers.length ? props.tools[0].servers : [];

    const serverOptions = servers
      .map(server =>
        (
          <option onClick={this.updateServer}>{server}</option>
        ),
      );

    const projectNames = projects
      .map(project =>
        (
          <option onClick={this.updateProject}>{project.projectName}</option>
        ),
      );

    return (
      <div className="att-integration">
        <h2 className="att-integration__heading-step">
          Step 2 of 4: Locate your {toolId} team
        </h2>
        <div className="att-integration__container">
          <span htmlFor="your-squad">Your Agile Team Tool Squad</span>
          <input type="text" value={teamName} />

          <span>{toolId} Server</span>
          <div className="dropdown">
            <button className="dropdown-btn">{this.state.selectedServer}
              <InlineSVG src={dropdownIcon} />
            </button>
            <div className="dropdown-content">
              {serverOptions}
            </div>
          </div>

          <span>{toolId} Project Area</span>
          <div className="dropdown">
            <button className="dropdown-btn">{this.state.selectedProject}
              <InlineSVG src={dropdownIcon} />
            </button>
            <div className="dropdown-content">
              {projectNames}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

WizardStepTwo.propTypes = propTypes.types;
WizardStepTwo.defaultProps = propTypes.defaults;

module.exports = WizardStepTwo;
