var React = require('react');
var DatePicker = require('react-datepicker');
var moment = require('moment');

var Datepicker = React.createClass({
  componentDidUpdate: function() {
    // $('.react-datepicker-ignore-onclickoutside').css('readonly','true');
    if (this.props.enableDatepicker) {
        $('#submitDatePicker').prop('disabled',false);
    } else {
      $('#submitDatePicker').prop('disabled',true);
    }
    if (this.props.submittedDate == null) {
      $('#submitDatePicker').val('');
    } else {
      $('#submitDatePicker').datepicker('setDate', new Date(this.props.submittedDate));
    }
  },
  componentDidMount: function() {
    // $('#datepicker').datepicker();
    $('#submitDatePicker').css('readonly','true');
    $('#submitDatePicker').datepicker({
      maxDate: 0,
      dateFormat: 'ddMyy'
    });
    $('#submitDatePicker').datepicker('option', 'dateFormat', 'ddMyy');
    $('#ui-datepicker-div').attr('role', 'region');
    $('#ui-datepicker-div').attr('aria-label', 'datepicker');
  },
  render: function() {
    var enableDatepicker = this.props.enableDatepicker;
    var selectFieldWidth = {'width':'300px'};
    return(
      <input type='text' id='submitDatePicker' readOnly='readonly' placeholder='Optional assessment date' size='30' disabled='true'/>
    )
    // if(enableDatepicker){
    //   return (
    //     <DatePicker dateFormat='DDMMMYYYY' id='submitDatePicker' selected={this.props.submittedDate} onChange={this.props.dateChangeHandler} size='44' />
    //   );
    // } else {
    //   if (this.props.submittedDate == null) {
    //     var startDate = 'Optional assessment date'
    //   } else {
    //     startDate = moment(this.props.submittedDate).format('DDMMMYYYY');
    //   }
    //   return (
    //     <input type='text' class='ibm-date-picker hasDatepicker' name='assessmentDate' id='assessmentDate' size='44' value='' readOnly='readonly' placeholder={startDate} style={selectFieldWidth} disabled='disabled' />
    //   );
    // }
  }
});

module.exports = Datepicker;
