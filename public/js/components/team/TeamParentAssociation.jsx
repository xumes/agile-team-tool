var React = require('react');

var TeamParentAssociation = React.createClass({


  render: function() {
    var overallStyle = {
      'display': this.props.visible == false ? 'none': 'block'
    };
    return (
      <h1 style={overallStyle}>Parent Team Association {this.props.teamId}</h1>
    )
  }



});

module.exports = TeamParentAssociation;