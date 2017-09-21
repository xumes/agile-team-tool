const React = require('react');
const propTypes = require('../prop-types');

const Defects = (props) => {
  const defects = props.defects;
  const storyType = defects.storyTypeId && defects.storyTypeId.length ? defects.storyTypeId[0] : '';
  const storyStartingPoint = defects.storyInProgressStates && defects.storyInProgressStates.length ? defects.storyInProgressStates.join(', ') : '';
  const storyEndingPoint = defects.storyResolvedStates && defects.storyResolvedStates.length ? defects.storyResolvedStates.join(', ') : '';

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

Defects.propTypes = propTypes.types;
Defects.defaultProps = propTypes.defaults;

module.exports = Defects;
