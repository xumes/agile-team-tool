const React = require('react');
const PropTypes = require('prop-types');


const WizardStepOne = props => (
  <div className="att-integration">
    <h2 className="att-integration__heading">
      1 of 4: RTC Integration Overview
    </h2>
    <article className="att-integration__article">
      <div className="att-integration__article__image">
        <img
          className="att-integration__article__image__rtc-logo"
          alt="IBM Rational Policy Tester Logo"
          src={'../../img/ibm-rtc-logo-2x.png'}
        />
      </div>
      <div className="att-integration__article__text">
        <h2 className="att-integration__heading">{props.tools[0].toolName}</h2>
        <p>
          Are you spending time entering agile metrics manually into
          the Agile Team Tool? This integration will automate the key
          agile metrics including:
        </p>
        <ul className="att-integration__unordered-list">
          <li>Velocity</li>
          <li>Throughput</li>
          <li>Time in WIP</li>
          <li>Time in Funnel</li>
        </ul>
      </div>
    </article>
  </div>
);

WizardStepOne.propTypes = {
  tools: PropTypes.arrayOf(PropTypes.shape({
    toolId: PropTypes.string,
    toolName: PropTypes.string,
    servers: PropTypes.arrayOf(PropTypes.string),
  })),
};

WizardStepOne.defaultProps = {
  tools: [],
};

module.exports = WizardStepOne;
