const React = require('react');
const propTypes = require('../prop-types');

const WIP = (props) => {
  const wip = props.wip;
  const storyType = wip.storyTypeId && wip.storyTypeId.length ? wip.storyTypeId[0] : '';
  const storyStartingPoint = wip.storyInProgressStates && wip.storyInProgressStates.length ? wip.storyInProgressStates.join(', ') : '';
  const storyEndingPoint = wip.storyResolvedStates && wip.storyResolvedStates.length ? wip.storyResolvedStates.join(', ') : '';

  return (
    <div className="att-integration__configuration-display">
      <label htmlFor="work-item-type">Work Item Type - WIP</label>
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

WIP.propTypes = propTypes.types;
WIP.defaultProps = propTypes.defaults;

module.exports = WIP;
