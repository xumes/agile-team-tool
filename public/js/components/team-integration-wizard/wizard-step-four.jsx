const React = require('react');
const _ = require('lodash');
const propTypes = require('./prop-types');

const WizardStepFour = (props) => {
  const settings = props.team.integration.settings;
  const metricItems = _.keys(settings)
    .map(item => (<li>{item}</li>));

  return (
    <div className="att-integration">
      <h2 className="att-integration__heading-step">
        Step 4 of 4: Preview your results
      </h2>
      <p className="att-integration__paragraph-step">
        Here are your calculated results from your latest iteration.
        These results will be automatically populated in the
        Iteration Overview panel once you save the configuration.
      </p>
      <div className="att-integration__preview">
        <ul className="att-integration__unstyled-list">
          <li className="att-integration__unstyled-list__bold">
            Velocity
            <span> (Development)</span>
          </li>
          <p>Story points committed<span>22</span></p>
          <p>Story points delivered<span>24</span></p>

          <li className="att-integration__unstyled-list__bold">
            Throughput
            <span> (Operations)</span>
          </li>
          <p>Items committed<span>12</span></p>
          <p>Items delivered<span>13</span></p>

          <li className="att-integration__unstyled-list__bold">
            Time in Work In Progress (WIP)
          </li>
          <p>WIP cycle time<span>22</span></p>

          <li className="att-integration__unstyled-list__bold">
            Time in Backlog
          </li>
          <p>Backlog cycle time<span>2.4</span></p>

          <li className="att-integration__unstyled-list__bold">
            Defects
          </li>
          <p>Opening balance<span>0</span></p>
          <p>New this iteration<span>3</span></p>
          <p>Resolved this iteration<span>1</span></p>
          <p>Closing balance<span>2</span></p>

          <li className="att-integration__unstyled-list__bold">
            Deployments
          </li>
          <p>Deployments this iteration<span>1</span></p>
        </ul>
      </div>
    </div>
  );
};

WizardStepFour.propTypes = propTypes.types;
WizardStepFour.defaultProps = propTypes.defaults;

module.exports = WizardStepFour;
