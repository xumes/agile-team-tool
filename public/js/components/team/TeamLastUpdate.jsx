var React = require('react');
var _ = require('underscore');
var moment = require('moment');
var timeFormat = 'MMM DD, YYYY, HH:mm'

var TeamLastUpdate = React.createClass({
  // showHideSection: function() {
  //   if ($('#lastUpdateSection a').hasClass('ibm-show-active')) {
  //     $('#lastUpdateSection a').removeClass('ibm-show-active');
  //     $('#lastUpdateSection h2').removeClass('ibm-showing');
  //     $('#auditInfoSection').css('display','none');
  //   } else {
  //     $('.squad-sections h2 a').removeClass('ibm-show-active');
  //     $('.squad-sections h2').removeClass('ibm-showing');
  //     $('#lastUpdateSection a').addClass('ibm-show-active');
  //     $('#lastUpdateSection h2').addClass('ibm-showing');
  //     $('#auditInfoSection').css('display','block');
  //   }
  // },
  render: function() {
    var self = this;
    if (self.props.selectedTeam.team == undefined) {
      var updateTime = null;
      var updatedBy = null;
    } else {
      updatedBy = self.props.selectedTeam.team.updatedBy;
      updateTime = moment(self.props.selectedTeam.team.updateDate).format(timeFormat) + ' (UTC)';
    }
    var overallStyle = {
      'display': self.props.visible == false ? 'none': 'block'
    };
    return (
      <div class='ibm-show-hide ibm-widget-processed' id='lastUpdateSection' style={overallStyle}>
        <h2 class='ibm-bold ibm-h4'>
          <a class='' href='#show-hide' title='Expand/Collapse' onClick={()=>self.props.showHideSection('lastUpdateSection')}>
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
