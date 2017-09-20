const React = require('react');
const PropTypes = require('prop-types');


const WizardStepTwo = props => (
  <div className="att-integration">
    <h2 className="att-integration__heading-step">
      Step 2 of 4: Locate your {props.tools[0].toolName} team
    </h2>
    <span className="att-integration__label">
      Your Agile Team Tool Squad
    </span>
    <select className="att-integration__dropdown">
      <option value="Option 1">Option 1</option>
      <option value="Option 2">Option 2</option>
      <option value="Option 3">Option 3</option>
    </select>
    <span className="att-integration__label">
      {props.integration.server} Server
    </span>
    <select className="att-integration__dropdown">
      <option value="Option 1">Option 1</option>
      <option value="Option 2">Option 2</option>
      <option value="Option 3">Option 3</option>
    </select>
    <span className="att-integration__label">
      {props.project.name} Project Area
    </span>
    <select className="att-integration__dropdown">
      <option value="Option 1">Option 1</option>
      <option value="Option 2">Option 2</option>
      <option value="Option 3">Option 3</option>
    </select>
  </div>
);

WizardStepTwo.propTypes = {
  tools: PropTypes.arrayOf(PropTypes.shape({
    toolId: PropTypes.string,
    toolName: PropTypes.string,
    servers: PropTypes.arrayOf(PropTypes.string),
  })),
  integration: PropTypes.shape({
    id: PropTypes.number,
    toolId: PropTypes.string,
    server: PropTypes.string,
    projectArea: PropTypes.string,
  }),
  project: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
  }),
};

WizardStepTwo.defaultProps = {
  tools: [],
  integration: {},
  project: {},
};

module.exports = WizardStepTwo;
