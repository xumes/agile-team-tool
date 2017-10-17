const React = require('react');
const propTypes = require('./prop-types');
const Velocity = require('./metrics/velocity.jsx');
const Throughput = require('./metrics/throughput.jsx');
const Wip = require('./metrics/wip.jsx');
const Backlog = require('./metrics/backlog.jsx');
const Defects = require('./metrics/defects.jsx');

class WizardStepThree extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      metrics: 'velocity',
    };

    this.props = props;
    this.setMetricView = this.setMetricView.bind(this);
  }

  setMetricView(event) {
    this.setState({ metrics: event.target.id });
  }

  render() {
    const toolId = this.props.tools.length ? this.props.tools[0].toolId : '';
    const settings = this.props.team && this.props.integration &&
      this.props.team.integration.settings ? this.props.team.integration.settings : '';
    const velocity = settings ? settings.velocity : '';
    const throughput = settings ? settings.throughput : '';
    const wip = settings ? settings.wip : '';
    const backlog = settings ? settings.backlog : '';
    const defects = settings ? settings.defects : '';

    const metricItems = [
      {
        id: 'velocity',
        label: 'Velocity',
      },
      {
        id: 'throughput',
        label: 'Throughput',
      },
      {
        id: 'wip',
        label: 'Time in Work In Progress (WIP)',
      },
      {
        id: 'backlog',
        label: 'Time in Backlog',
      },
      {
        id: 'defects',
        label: 'Defects',
      },
    ];

    const listItems = metricItems
      .map(item =>
        (
          <li>
            <a
              className={this.state.metrics === item.id ? 'li-selected' : ''}
              role="button"
              tabIndex="0"
              id={item.id}
              onClick={this.setMetricView}
            >{item.label}</a>
          </li>),
      );

    return (
      <div className="att-integration">
        <h2 className="att-integration__heading-step">
          Step 3 of 4: Configure your metrics
        </h2>
        <p className="att-integration__paragraph-step">
          Enter the {toolId} attributes you use
          to calculate your team&apos;s key agile metrics.
        </p>
        <div className="att-integration__configuration">
          <div className="att-integration__configuration-menu">
            <ul className="att-integration__unstyled-menu-list">
              {listItems}
            </ul>
          </div>
          {this.state.metrics === 'velocity' && <Velocity velocity={velocity} />}
          {this.state.metrics === 'throughput' && <Throughput throughput={throughput} />}
          {this.state.metrics === 'wip' && <Wip wip={wip} />}
          {this.state.metrics === 'backlog' && <Backlog backlog={backlog} />}
          {this.state.metrics === 'defects' && <Defects defects={defects} />}
        </div>
      </div>
    );
  }
}

WizardStepThree.propTypes = propTypes.types;
WizardStepThree.defaultProps = propTypes.defaults;

module.exports = WizardStepThree;
