var React = require('react');
var ReactModal = require('react-modal');
var moment = require('moment');
var DatePicker = require('react-datepicker');

var AssessmentDatePicker = React.createClass({
  propTypes: {
    onClick: React.PropTypes.func,
    value: React.PropTypes.string
  },

  render: function() {
      return (
        <h2 class='assessment-date-picker-h2' onClick={this.props.onClick} style={{'display':this.props.haveAccess?'none':'block'}}>{'override'}</h2>
      )
  }
});
module.exports = AssessmentDatePicker;
