const React = require('react');
const propTypes = require('../prop-types');

const Throughput = (props) => {
  const throughput = props.throughput;
  const storyType = throughput.storyTypeId && throughput.storyTypeId.length ? throughput.storyTypeId[0] : '';
  const storyStartingPoint = throughput.storyInProgressStates && throughput.storyInProgressStates.length ? throughput.storyInProgressStates.join(', ') : '';
  const storyEndingPoint = throughput.storyResolvedStates && throughput.storyResolvedStates.length ? throughput.storyResolvedStates.join(', ') : '';

  return (
    <div className="att-integration__configuration-display">
      <label htmlFor="work-item-type">Work Item Type  - Throughput</label>
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

Throughput.propTypes = propTypes.types;
Throughput.defaultProps = propTypes.defaults;

module.exports = Throughput;
