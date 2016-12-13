var React = require('react');
var api = require('../api.jsx');
var chartStatus = require('./chartStatus.jsx').chartStatus;

var HomeIterChart = React.createClass({
  render: function() {
    return (
      <div id={this.props.id + '_block'} class='container-body-col-2-1'>
        <div id={this.props.id}></div>
      </div>
    )
  }
});

module.exports = HomeIterChart;
