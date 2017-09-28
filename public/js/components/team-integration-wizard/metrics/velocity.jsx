const React = require('react');
const propTypes = require('../prop-types');

const Velocity = (props) => {
  const velocity = props.velocity;
  const storyType = velocity.storyTypeId && velocity.storyTypeId.length ? velocity.storyTypeId[0] : '';
  const storyStartingPoint = velocity.storyInProgressStates && velocity.storyInProgressStates.length ? velocity.storyInProgressStates.join(', ') : '';
  const storyEndingPoint = velocity.storyResolvedStates && velocity.storyResolvedStates.length ? velocity.storyResolvedStates.join(', ') : '';

  return (
    <div className="att-integration__configuration-display">
      <label htmlFor="work-item-type">Work Item Type - Velocity</label>
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

Velocity.propTypes = propTypes.types;
Velocity.defaultProps = propTypes.defaults;

module.exports = Velocity;
