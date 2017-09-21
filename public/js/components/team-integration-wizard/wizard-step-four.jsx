const React = require('react');
const PropTypes = require('prop-types');

const WizardStepFour = (props) => {
  const metrics = props.integration.metrics;
  const metricItems = metrics
    .map(item =>
      (
        <li>{item.configType}</li>
      ),
    );
  return (
    <div className="att-integration">
      <h2 className="att-integration__heading-step">
        Step 4 of 4: Preview your results
      </h2>
      <ul className="att-integration__unstyled-list">
        {metricItems}
      </ul>
    </div>
  );
};

WizardStepFour.propTypes = {
  integration: PropTypes.shape({
    id: PropTypes.number,
    toolId: PropTypes.string,
    server: PropTypes.string,
    projectArea: PropTypes.string,
    metrics: PropTypes.arrayOf(PropTypes.string),
  }),
};

WizardStepFour.defaultProps = {
  integration: {},
};

module.exports = WizardStepFour;
