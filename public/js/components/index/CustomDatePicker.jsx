const React = require('react');
const PropTypes = require('prop-types');
const InlineSVG = require('svg-inline-react');
const calendarIcon = require('../../../img/Att-icons/att-icons_calendar.svg');

const CustomDatePicker = React.createClass({
  propTypes: {
    onClick: PropTypes.func,
    value: PropTypes.string,
  },

  render() {
    return (
      <div className="home-iter-new-dates">
        <input
          type="text"
          className="home-iter-date"
          id={this.props.fieldId}
          readOnly
          onClick={this.props.onClick}
          value={this.props.value}
        />
        <div
          className="home-iter-cal-btn-block"
          onClick={this.props.onClick}
          role="button"
          tabIndex="0"
        >
          <InlineSVG src={calendarIcon} />
        </div>
      </div>
    )
  },
});
module.exports = CustomDatePicker;
