const React = require('react');
const PropTypes = require('prop-types');


const IntegrationWizardStepTwo = (props) => {
  const { data } = props;
  data.type = 'RTC';

  return (
    <div className="att-integration">
      <h2 className="att-integration__heading">
        Step 2 of 4: Locate your {data.type} team
      </h2>
      <span className="att-integration__label">
        Server
      </span>
      <select className="att-integration__dropdown">
        <option value="Option 1">Option 1</option>
        <option value="Option 2">Option 2</option>
        <option value="Option 3">Option 3</option>
      </select>
      <span className="att-integration__label">
        {data.type} Project Area
      </span>
      <select className="att-integration__dropdown">
        <option value="Option 1">Option 1</option>
        <option value="Option 2">Option 2</option>
        <option value="Option 3">Option 3</option>
      </select>
      <span className="att-integration__label">
        ATT Team
      </span>
      <select className="att-integration__dropdown">
        <option value="Option 1">Option 1</option>
        <option value="Option 2">Option 2</option>
        <option value="Option 3">Option 3</option>
      </select>
      <span className="att-integration__label">
        Iterations
      </span>
      <select className="att-integration__dropdown">
        <option value="Option 1">Option 1</option>
        <option value="Option 2">Option 2</option>
        <option value="Option 3">Option 3</option>
      </select>
    </div>
  );
};

IntegrationWizardStepTwo.propTypes = {
  data: PropTypes.shape({
    type: PropTypes.string,
  }),
};

IntegrationWizardStepTwo.defaultProps = {
  data: {
    type: '',
  },
};

module.exports = IntegrationWizardStepTwo;
