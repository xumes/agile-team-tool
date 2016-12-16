var React = require('react');
var api = require('../api.jsx');

var HomeIterChart = React.createClass({
  render: function() {
    return (
      <div class='ibm-col-6-2'>
        <div id={this.props.id} style={{'width': '100%','minHeight':'280px'}}></div>
      </div>
    )
  }
});

module.exports = HomeIterChart;
