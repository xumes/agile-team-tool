var React = require('react');
var DatePicker = require('react-datepicker');
var moment = require('moment');

require('react-datepicker/dist/react-datepicker.css');

var Datepicker = React.createClass({
  displayName: 'Example',

  getInitialState: function() {
    return {
      startDate: moment()
    };
  },

  handleChange: function(date) {
    this.setState({
      startDate: date
    });
  },

  render: function() {
    var enableDatepicker = this.props.enableDatepicker();
    var selectFieldWidth = {'width':'300px'};
    if(enableDatepicker){
      return <DatePicker selected={this.state.startDate} onChange={this.handleChange} size="44" />;
    } else {
      return (<input type="text" class="ibm-date-picker hasDatepicker" name="assessmentDate" id="assessmentDate" size="44" value="" readonly="readonly" placeholder="Optional assessment date" style={selectFieldWidth} disabled="disabled" />)
    }
  }
});

module.exports = Datepicker;