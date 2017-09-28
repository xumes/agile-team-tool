const React = require('react');
const propTypes = require('../prop-types');

const Backlog = (props) => {
  const backlog = props.backlog;
  const storyType = backlog.storyTypeId && backlog.storyTypeId.length ? backlog.storyTypeId[0] : '';
  const storyStartingPoint = backlog.storyInProgressStates && backlog.storyInProgressStates.length ? backlog.storyInProgressStates.join(', ') : '';
  const storyEndingPoint = backlog.storyResolvedStates && backlog.storyResolvedStates.length ? backlog.storyResolvedStates.join(', ') : '';

  return (
    <div className="att-integration__configuration-display">
      <label htmlFor="work-item-type">Work Item Type - Backlog</label>
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

Backlog.propTypes = propTypes.types;
Backlog.defaultProps = propTypes.defaults;

module.exports = Backlog;
