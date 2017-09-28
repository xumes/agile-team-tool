const React = require('react');
const propTypes = require('../prop-types');

const Defects = (props) => {
  const defects = props.defects;
  const defectTypeId = defects.defectTypeId && defects.defectTypeId.length ? defects.defectTypeId[0] : '';
  const defectInProgressStates = defects.defectInProgressStates && defects.defectInProgressStates.length ? defects.defectInProgressStates.join(', ') : '';
  const defectResolvedStates = defects.defectResolvedStates && defects.defectResolvedStates.length ? defects.defectResolvedStates.join(', ') : '';

  return (
    <div className="att-integration__configuration-display">
      <label htmlFor="defect-item-type">Defect Item Type - Defects</label>
      <p><input type="text" value={defectTypeId} /></p>

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
          <p><input type="text" value={defectInProgressStates} /></p>
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
          <p><input type="text" value={defectResolvedStates} /></p>
        </div>
      </div>
    </div>
  );
};

Defects.propTypes = propTypes.types;
Defects.defaultProps = propTypes.defaults;

module.exports = Defects;
