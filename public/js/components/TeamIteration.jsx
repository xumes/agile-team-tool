var React = require('react');

var TeamIteration = React.createClass({


  render: function() {
    var overallStyle = {
      'display': this.props.visible == false ? 'none': 'block'
    };
    return (
      <h1 style={overallStyle}>Team Iteration {this.props.teamId}</h1>
    )
  }



});

module.exports = TeamIteration;