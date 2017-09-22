const React = require('react');
const propTypes = require('./prop-types');

const WizardStepFour = (props) => {
  const preview = props.preview ? props.preview : '';

  const velocity = preview.velocity.length ? preview.velocity : [];
  const ptsCommitted = velocity[0].storyPointsCommitted ? velocity[0].storyPointsCommitted : 0;
  const ptsDelivered = velocity[1].storyPointsDelivered ? velocity[1].storyPointsDelivered : 0;

  const throughput = preview.throughput.length ? preview.throughput : [];
  const cardsCommitted = throughput[0].storyCardsCommitted ? throughput[0].storyCardsCommitted : 0;
  const cardsDelivered = throughput[1].storyCardsDelivered ? throughput[1].storyCardsDelivered : 0;

  const defects = preview.defects.length ? preview.defects : [];
  const defectsStartBal = defects[0].defectsStartBal ? defects[0].defectsStartBal : 0;
  const defectsOpened = defects[1].defectsOpened2 ? defects[1].defectsOpened : 0;
  const defectsClosed = defects[2].defectsClosed ? defects[2].defectsClosed : 0;
  const defectsEndBal = defects[3].defectsEndBal ? defects[3].defectsEndBal : 0;

  // const deployments = preview.deployments.length ? preview.deployments : [];
  const wip = preview.wip ? preview.wip : 0;
  const backlog = preview.backlog ? preview.backlog : 0;

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
          <p>Story points committed<span>{ptsCommitted}</span></p>
          <p>Story points delivered<span>{ptsDelivered}</span></p>

          <li className="att-integration__unstyled-list__bold">
            Throughput
            <span> (Operations)</span>
          </li>
          <p>Items committed<span>{cardsCommitted}</span></p>
          <p>Items delivered<span>{cardsDelivered}</span></p>

          <li className="att-integration__unstyled-list__bold">
            Time in Work In Progress (WIP)
          </li>
          <p>WIP cycle time<span>{wip}</span></p>

          <li className="att-integration__unstyled-list__bold">
            Time in Backlog
          </li>
          <p>Backlog cycle time<span>{backlog}</span></p>

          <li className="att-integration__unstyled-list__bold">
            Defects
          </li>
          <p>Opening balance<span>{defectsStartBal}</span></p>
          <p>New this iteration<span>{defectsOpened}</span></p>
          <p>Resolved this iteration<span>{defectsClosed}</span></p>
          <p>Closing balance<span>{defectsEndBal}</span></p>

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
