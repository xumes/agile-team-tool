var React = require('react');
var api = require('../api.jsx');
var InlineSVG = require('svg-inline-react');
var ReactModal = require('react-modal');
var moment = require('moment');
var DatePicker = require('react-datepicker');

var CustomDatePicker = React.createClass({

  propTypes: {
onClick: React.PropTypes.func,
value: React.PropTypes.string
},
render: function() {
      return (
        <div className='home-iter-new-dates'>
          <input type="text" className='home-iter-date' id={this.props.fieldId} readOnly onClick={this.props.onClick} value={this.props.value}/>
          <div class='home-iter-cal-btn-block' onClick={this.props.onClick}>
            <InlineSVG src={require('../../../img/Att-icons/att-icons_calendar.svg')}></InlineSVG>
          </div>
        </div>
      )
  }
});
module.exports = CustomDatePicker;
