const React = require('react');
const propTypes = require('../prop-types');

const Deployments = (props) => {
  const deployments = props.deployments;
  const storyType = deployments.storyTypeId && deployments.storyTypeId.length ? deployments.storyTypeId[0] : '';
  const storyStartingPoint = deployments.storyInProgressStates && deployments.storyInProgressStates.length ? deployments.storyInProgressStates.join(', ') : '';
  const storyEndingPoint = deployments.storyResolvedStates && deployments.storyResolvedStates.length ? deployments.storyResolvedStates.join(', ') : '';

  return (
    <div className="att-integration__configuration-display">
      <label htmlFor="work-item-type">Work Item Type</label>
      <p><input type="text" value={storyType} /></p>

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
          <p><input type="text" value={storyStartingPoint} /></p>
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
          <p><input type="text" value={storyEndingPoint} /></p>
        </div>
      </div>
    </div>
  );
};

Deployments.propTypes = propTypes.types;
Deployments.defaultProps = propTypes.defaults;

module.exports = Deployments;
