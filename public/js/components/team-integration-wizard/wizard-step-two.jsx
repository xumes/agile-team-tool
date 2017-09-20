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
      {props.tools[0].toolName} Server
    </span>
    <select className="att-integration__dropdown">
      <option value="Option 1">Option 1</option>
      <option value="Option 2">Option 2</option>
      <option value="Option 3">Option 3</option>
    </select>
    <span className="att-integration__label">
      {props.tools[0].toolName} Project Area
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
};

WizardStepTwo.defaultProps = {
  tools: [],
};

module.exports = WizardStepTwo;
