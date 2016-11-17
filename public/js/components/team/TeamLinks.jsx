var React = require('react');

var TeamLinks = React.createClass({
  render: function() {
    var self = this;
    if (this.props.selectedTeam.team != undefined) {
      return (
        <div class='ibm-show-hide ibm-widget-processed' id='teamLinkSection'>
          <h2 class='ibm-bold ibm-h4'>
            <a class='' title='Expand/Collapse' style={{'cursor':'pointer'}} onClick={()=>self.props.showHideSection('teamLinkSection')}>
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
