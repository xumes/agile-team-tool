const React = require('react');
const PropTypes = require('prop-types');


const WizardStepThree = (props) => {
  const { data } = props;
  data.type = 'RTC';

  return (
    <div className="att-integration">
      <h2 className="att-integration__heading">
        3 of 4: Configure Metrics
      </h2>
      <p>
        Something will go here..
      </p>
    </div>
  );
};

WizardStepThree.propTypes = {
  data: PropTypes.shape({
    type: PropTypes.string,
  }),
};

WizardStepThree.defaultProps = {
  data: {
    type: '',
  },
};

module.exports = WizardStepThree;
