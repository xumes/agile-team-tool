var React = require('react');
var api = require('../api.jsx');

var HomeSpinner = React.createClass({
  render: function() {
    var spinnerContainerStyle = {
      'display': 'none',
      'textAlign': 'center'
    };
    var spinnerStyle = {
      'display': 'inline-block',
      'marginTop':'10em'
    };
    var spanStyle = {
      'padding': 0
    };
    return (
      <div id={this.props.id} style={spinnerContainerStyle}>
        <div style={spinnerStyle} class="clear-loading loading-effect-1">
          <span style={spanStyle}></span>
          <span style={spanStyle}></span>
          <span style={spanStyle}></span>
        </div>
      </div>
    )
  }
});

module.exports = HomeSpinner;
