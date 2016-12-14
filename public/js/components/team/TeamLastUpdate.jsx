var React = require('react');
var _ = require('underscore');
var moment = require('moment');
var timeFormat = 'MMM DD, YYYY, HH:mm'

var TeamLastUpdate = React.createClass({
  showHideSection: function() {
    this.props.showHideSection('lastUpdateSection');
  },
  render: function() {
    var self = this;
    if (self.props.selectedTeam.team == undefined) {
      var updateTime = null;
      var updatedBy = null;
    } else {
      updatedBy = self.props.selectedTeam.team.updatedBy;
      updateTime = moment(self.props.selectedTeam.team.updateDate).format(timeFormat) + ' (UTC)';
    }
    return (
      <div class='ibm-show-hide ibm-widget-processed' id='lastUpdateSection'>
        <h2 class='ibm-bold ibm-h4'>
          <a class='' href='#show-hide' title='Expand/Collapse' style={{'cursor':'pointer'}} onClick={self.showHideSection}>
            Last update
          </a>
        </h2>
        <div class='ibm-container-body' id='auditInfoSection' style={{'display':'none'}}>
         <div><span style={{'fontSize':'9pt'}}>Last update: {updateTime}  <span style={{'fontSize':'9pt'}} id='lastUpdateTimestamp'></span>      &nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;      Updated by: {updatedBy}  <span style={{'fontSize':'9pt'}} id='lastUpdateUser'></span></span></div>
        </div>
      </div>
    )
  }
});

module.exports = TeamLastUpdate;
