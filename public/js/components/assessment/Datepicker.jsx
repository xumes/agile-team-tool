var React = require('react');
var DatePicker = require('react-datepicker');
var moment = require('moment');

require('react-datepicker/dist/react-datepicker.css');

var Datepicker = React.createClass({
  render: function() {
    var enableDatepicker = this.props.enableDatepicker;
    var selectFieldWidth = {'width':'300px'};
    if(enableDatepicker){
      return (
        <DatePicker dateFormat='DDMMMYYYY' id='submitDatePicker' selected={this.props.submittedDate} onChange={this.props.dateChangeHandler} size='44' />
      );
    } else {
      startDate = moment(this.props.submittedDate).format('DDMMMYYYY');
      return (
        <input type='text' class='ibm-date-picker hasDatepicker' name='assessmentDate' id='assessmentDate' size='44' value='' readOnly='readonly' placeholder={startDate} style={selectFieldWidth} disabled='disabled' />
      );
    }
  }
});

module.exports = Datepicker;
