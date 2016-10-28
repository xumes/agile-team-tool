var React = require('react');

var TeamLinks = React.createClass({


  render: function() {
    var overallStyle = {
      'display': this.props.visible == false ? 'none': 'block'
    };

    return (
      <h1 style={overallStyle}>Important Links - {this.props.teamId}</h1>
    )
  }



});

module.exports = TeamLinks;