const React = require('react');
const PropTypes = require('prop-types');


const IntegrationWizardStepFour = (props) => {
  const { data } = props;
  data.type = 'RTC';

  return (
    <div className="att-integration">
      <h2 className="att-integration__heading">
        4 of 4: Preview Calculaations
      </h2>
      <p>
        Something will go here..
      </p>
    </div>
  );
};

IntegrationWizardStepFour.propTypes = {
  data: PropTypes.shape({
    type: PropTypes.string,
  }),
};

IntegrationWizardStepFour.defaultProps = {
  data: {
    type: '',
  },
};

module.exports = IntegrationWizardStepFour;
