var React = require('react');

var TeamLinks = React.createClass({


  render: function() {
    var self = this;
    var overallStyle = {
      'display': this.props.visible == false ? 'none': 'block'
    };
    if (this.props.selectedTeam.team != undefined) {
      return (
        <div class='ibm-show-hide ibm-widget-processed' id='teamLinkSection' style={overallStyle}>
          <h2 class='ibm-bold ibm-h4'>
            <a class='' title='Expand/Collapse' onClick={()=>self.props.showHideSection('teamLinkSection')}>
              Important Links
            </a>
          </h2>
        </div>
      )
    } else {
      return null;
    }
  }



});

module.exports = TeamLinks;
