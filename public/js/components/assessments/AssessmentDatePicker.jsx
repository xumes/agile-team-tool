const React = require('react');
const PropTypes = require('prop-types');

const AssessmentDatePicker = React.createClass({
  propTypes: {
    onClick: PropTypes.func,
    value: PropTypes.string,
  },

  render() {
    const styles = {
      display: this.props.haveAccess ? 'none' : 'block',
    };

    return (
      <div
        className="assessment-date-picker-h2"
        onClick={this.props.onClick}
        style={styles}
        role="button"
        tabIndex="0"
      >
        {'override'}
      </div>
    );
  },
});

module.exports = AssessmentDatePicker;
