var React = require('react');

var TeamLinks = React.createClass({


  render: function() {
    var overallStyle = {
      'display': this.props.visible == false ? 'none': 'block'
    };
    if (this.props.selectedTeam.team != undefined) {
      return (
        <h1 style={overallStyle}>Important Links - {this.props.selectedTeam.team._id}</h1>
      )
    } else {
      return null;
    }
  }



});

module.exports = TeamLinks;
