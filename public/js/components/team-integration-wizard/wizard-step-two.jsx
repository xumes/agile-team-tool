const React = require('react');
const propTypes = require('./prop-types');

const WizardStepTwo = (props) => {
  const projectName = props.projects && props.projects.length ? props.projects[0].projectName : '';

  return (
    <div className="att-integration">
      <h2 className="att-integration__heading-step">
        Step 2 of 4: Locate your {props.tools[0].toolId} team
      </h2>
      <div className="att-integration__container">
        <span htmlFor="your-squad">Your Agile Team Tool Squad</span>
        <p><input type="text" value={props.team.name} /></p>

        <span className="att-integration__label">
          {props.tools[0].toolId} Server
        </span>
        <select className="att-integration__dropdown">
          <option defaultValue={props.team.integration.server}>
            {props.team.integration.server}
          </option>
        </select>

        <span className="att-integration__label">
          {props.tools[0].toolId} Project Area
        </span>
        <select className="att-integration__dropdown">
          <option defaultValue={projectName}>{projectName}</option>
        </select>
      </div>
    </div>
  );
};

WizardStepTwo.propTypes = propTypes.types;
WizardStepTwo.defaultProps = propTypes.defaults;

module.exports = WizardStepTwo;
