const React = require('react');
const propTypes = require('./prop-types');

const WizardStepThree = props => (
  <div className="att-integration">
    <h2 className="att-integration__heading-step">
      Step 3 of 4: Configure your metrics
    </h2>
    <p className="att-integration__paragraph-step">
      Enter the {props.tools[0].toolId} attributes you use
      to calculate your team&apos;s key agile metrics.
    </p>
    <div className="att-integration__configuration">
      <div className="att-integration__configuration-menu">
        <ul className="att-integration__unstyled-menu-list">
          <li>Velocity</li>
          <li>Throughput</li>
          <li>Time in Work In Progress (WIP)</li>
          <li>Time in Backlog</li>
          <li>Defects</li>
          <li>Deployments</li>
        </ul>
      </div>
      <div className="att-integration__configuration-display">
        <label htmlFor="work-item-type">Work Item Type</label>
        <p><input type="text" value="Story" /></p>

        <label htmlFor="starting-point">Starting point</label>
        <div className="att-integration__configuration-display__subcontainer">
          <div>
            <label htmlFor="attribute">Attribute</label>
            <p><input
              className="subcontainer-attribute"
              type="text"
              value="State"
            /></p>
          </div>
          <div>
            <label htmlFor="value">Value</label>
            <p><input type="text" value="Committed, New" /></p>
          </div>
        </div>

        <label htmlFor="ending-point">Ending point</label>
        <div className="att-integration__configuration-display__subcontainer">
          <div>
            <label htmlFor="attribute">Attribute</label>
            <p><input
              className="subcontainer-attribute"
              type="text"
              value="State"
            /></p>
          </div>
          <div>
            <label htmlFor="value">Value</label>
            <p><input type="text" value="Closed" /></p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

WizardStepThree.propTypes = propTypes.types;
WizardStepThree.defaultProps = propTypes.defaults;

module.exports = WizardStepThree;
