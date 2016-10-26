var React = require('react');

var TeamChildAssociation = React.createClass({


  render: function() {
    var overallStyle = {
      'display': this.props.visible == false ? 'none': 'block'
    };

    return (
      <h1 style={overallStyle}>Team Child Association {this.props.teamId}</h1>
    )
  }



});

module.exports = TeamChildAssociation;