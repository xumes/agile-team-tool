const React = require('react');
const propTypes = require('./prop-types');
const Velocity = require('./metrics/velocity.jsx');
// const Throughput = require('./metrics/throughput.jsx');
// const Wip = require('./metrics/wip.jsx');
// const Backlog = require('./metrics/backlog.jsx');
// const Defects = require('./metrics/defects.jsx');
// const Deployments = require('./metrics/deployments.jsx');

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
          <li className="li-selected">Velocity</li>
          <li>Throughput</li>
          <li>Time in Work In Progress (WIP)</li>
          <li>Time in Backlog</li>
          <li>Defects</li>
          <li>Deployments</li>
        </ul>
      </div>
      <Velocity velocity={props.team.integration.settings.velocity} />
      {/* <Throughput throughput={props.team.integration.settings.throughput} />
      <Wip wip={props.team.integration.settings.wip} />
      <Backlog backlog={props.team.integration.settings.backlog} />
      <Defects defects={props.team.integration.settings.defects} />
      <Deployments deployments={props.team.integration.settings.deployments} /> */}
    </div>
  </div>
);

WizardStepThree.propTypes = propTypes.types;
WizardStepThree.defaultProps = propTypes.defaults;

module.exports = WizardStepThree;
