var React = require('react');

var TeamAssessment = React.createClass({


  render: function() {
    var overallStyle = {
      'display': this.props.visible == false ? 'none': 'block'
    };

    return (
      <h1 style={overallStyle}>Assessment Information {this.props.teamId}</h1>
    )
  }



});

module.exports = TeamAssessment;