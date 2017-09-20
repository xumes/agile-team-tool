const React = require('react');

const WizardStepThree = () => (
  <div className="att-integration">
    <h2 className="att-integration__heading-step">
      Step 3 of 4: Configure your metrics
    </h2>
    <ul className="att-integration__unordered-list">
      <li>Velocity</li>
      <li>Throughput</li>
      <li>Time in WIP</li>
      <li>Time in Funnel</li>
    </ul>
  </div>
);

WizardStepThree.propTypes = {
};

WizardStepThree.defaultProps = {
};

module.exports = WizardStepThree;
