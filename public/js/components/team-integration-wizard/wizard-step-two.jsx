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
        <span>
          Your Agile Team Tool Squad
        </span>
        <select>
          <option selected="selected">{props.team.name}</option>
        </select>
        <span className="att-integration__label">
          {props.tools[0].toolId} Server
        </span>
        <select className="att-integration__dropdown">
          <option selected="selected">{props.team.integration.server}</option>
        </select>
        <span className="att-integration__label">
          {props.tools[0].toolId} Project Area
        </span>
        <select className="att-integration__dropdown">
          <option selected="selected">{projectName}</option>
        </select>
      </div>
    </div>
  );
};

WizardStepTwo.propTypes = propTypes.types;
WizardStepTwo.defaultProps = propTypes.defaults;

module.exports = WizardStepTwo;
