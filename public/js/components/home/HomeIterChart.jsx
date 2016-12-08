var React = require('react');
var api = require('../api.jsx');
// var Highcharts = require('highcharts');

var HomeIterChart = React.createClass({
  render: function() {
    return (
      <div class='container-body-col-2-1'>
        <div id={this.props.id}></div>
      </div>
    )
  }
});

module.exports = HomeIterChart;
