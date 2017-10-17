const React = require('react');
const propTypes = require('./prop-types');
const InlineSVG = require('svg-inline-react');
const dropdownIcon = require('../../../img/Att-icons/att-icons_show.svg');
const _ = require('lodash');

class WizardStepTwo extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
    };

    this.props = props;
    this.updateServer = this.updateServer.bind(this);
    this.updateProject = this.updateProject.bind(this);
  }

  updateServer(event) {
    this.props.updateServer(event.target.text);
    this.server.focus();
  }

  updateProject(event) {
    this.props.updateProject(event.target.value);
    this.project.focus();
  }

  render() {
    const props = this.props;
    const toolId = props.tools && props.tools.length ? props.tools[0].toolId : 0;
    const teamName = props.team ? props.team.name : '';
    const projects = props.projects && props.projects.length ? props.projects : [];
    const selectedServer = props.team && props.team.integration && props.team.integration.server ? props.team.integration.server : '';
    const selectedProjectId = props.team && props.team.integration && props.team.integration.projectId ? props.team.integration.projectId : '';
    const selectedProject = _.find(projects, p => selectedProjectId === p.projectId);

    const servers = props.tools[0].servers &&
      props.tools[0].servers.length ? props.tools[0].servers : [];

    const serverOptions = servers
      .map(server => (<option onClick={this.updateServer}>{server}</option>));

    const projectNames = projects
      .map(project => (
        <option
          onClick={this.updateProject}
          value={project.projectId}
        >
          {project.projectName}
        </option>
      ));

    return (
      <div className="att-integration">
        <h2 className="att-integration__heading-step">
          Step 2 of 4: Locate your {toolId} team
        </h2>
        <div className="att-integration__container">
          <span htmlFor="your-squad">Your Agile Team Tool Squad</span>
          <input type="text" value={teamName} />
          <div>
            <span>{toolId} Server</span>
            <div className="dropdown">
              <button
                ref={(s) => { this.server = s; }}
                className="dropdown-btn"
              >{selectedServer}
                <InlineSVG src={dropdownIcon} />
              </button>
              <div className="dropdown-content">
                {serverOptions}
              </div>
            </div>
          </div>
          <div>
            <span>{toolId} Project Area</span>
            <div className="dropdown">
              <button
                ref={(p) => { this.project = p; }}
                className="dropdown-btn"
              >{selectedProject.projectName}
                <InlineSVG src={dropdownIcon} />
              </button>
              <div className="dropdown-content">
                {projectNames}
              </div>
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
