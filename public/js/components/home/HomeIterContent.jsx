var React = require('react');
var api = require('../api.jsx');
var InlineSVG = require('svg-inline-react');
var _ = require('underscore');
var moment = require('moment');

var HomeIterContent = React.createClass({
  componentDidUpdate: function() {
    if (!($('#homeIterSelection').hasClass('select2-hidden-accessible'))) {
      $('#homeIterSelection').select2();
      $('#homeIterSelection').change(this.props.iterChangeHandler);
    }
  },
  render: function() {
    var self = this;
    if (_.isEmpty(self.props.loadDetailTeam) || self.props.loadDetailTeam.team.type != 'squad') {
      return null;
    } else {
      var iterations = null;
      var defIterId = '';
      if (self.props.loadDetailTeam.iterations.length > 0) {
        iterations = self.props.loadDetailTeam.iterations.map(function(iter){
          iterName =iter.name + ' (' + moment(iter.startDate).format('DD MMM YYYY') + ' - ' + moment(iter.endDate).format('DD MMM YYYY') + ')';
          return (
            <option key={iter._id} value={iter._id}>{iterName}</option>
          )
        });
        if (self.props.selectedIter != '') {
          defIterId = self.props.selectedIter;
        } else {
          defIterId = self.props.loadDetailTeam.iterations[0]._id.toString();
        }
        var defIter = _.find(self.props.loadDetailTeam.iterations, function(iter){
          if (iter._id.toString() == defIterId) {
            return iter;
          }
        });
        var lastUpdatedBy = defIter.updatedBy;
        var lastUpdateTime = moment(defIter.updateDate).format('MMM DD YYYY');
        if (defIter.memberChanged) {
          var memberChanged = 'Yes';
        } else {
          memberChanged = 'No';
        }
        var committedStories = (defIter.committedStories == null) ? '' : defIter.committedStories;
        var deliveredStories = (defIter.deliveredStories == null) ? '' : defIter.deliveredStories;
        var commitedStoryPoints = (defIter.commitedStoryPoints == null) ? '' : defIter.commitedStoryPoints;
        var storyPointsDelivered = (defIter.storyPointsDelivered == null) ? '' : defIter.storyPointsDelivered;
        var deployments = (defIter.deployments == null) ? '' : defIter.deployments;
        var defectsStartBal = (defIter.defectsStartBal == null) ? '' : defIter.defectsStartBal;
        var defects = (defIter.defects == null) ? '' : defIter.defects;
        var defectsClosed = (defIter.defectsClosed == null) ? '' : defIter.defectsClosed;
        var defectsEndBal = (defIter.defectsEndBal == null) ? '' : defIter.defectsEndBal;
        var cycleTimeWIP = (defIter.cycleTimeWIP == null) ? '' : defIter.cycleTimeWIP;
        var cycleTimeInBacklog = (defIter.cycleTimeInBacklog == null) ? '' : defIter.cycleTimeInBacklog;
        var clientSatisfaction = (defIter.clientSatisfaction == null) ? '' : defIter.clientSatisfaction;
        var teamSatisfaction = (defIter.teamSatisfaction == null) ? '' : defIter.teamSatisfaction;
        return (
          <div>
            <div class='home-iter-title'>Iteration Overview</div>
            <div class='home-iter-selection-block'>
              <select defaultValue={defIterId} id='homeIterSelection'>
                {iterations}
              </select>
              <div class='home-iter-add-btn-block'>
                <InlineSVG src={require('../../../img/Att-icons/att-icons_Add.svg')}></InlineSVG>
              </div>
            </div>
            <div class='home-iter-last-update-block'>
              <div class='home-iter-last-update-title'>Last updated</div>
              <div class='home-iter-last-update'>
                {lastUpdatedBy}
                <br/>
                {lastUpdateTime}
              </div>
            </div>
            <div class='home-iter-sprint-block'>
              <div class='home-iter-content-title'>Sprint Availability</div>
              <div class='home-iter-content-sub'>Optimum team availability (In days)</div>
              <div class='home-iter-content-point' style={{'height': '16%'}}></div>
              <div class='home-iter-content-sub'>Person days unavailable</div>
              <div class='home-iter-content-point' style={{'height': '16%'}}></div>
              <div class='home-iter-content-sub'>Was there a team member change?</div>
              <div class='home-iter-content-point' style={{'height': '16%'}}>{memberChanged}</div>
              <div class='home-iter-content-sub'>Person days available</div>
              <div class='home-iter-content-point' style={{'height': '16%'}}></div>

            </div>
            <div class='home-iter-throughput-block'>
              <div class='home-iter-content-title'>Throughput (Operations)</div>
              <div class='home-iter-content-sub'>Stories/Cards/Tickets-Committed</div>
              <div class='home-iter-content-point' style={{'height': '20%'}}>{committedStories}</div>
              <div class='home-iter-content-sub'>Stories/Cards/Tickets-Delivered</div>
              <div class='home-iter-content-point' style={{'height': '20%'}}>{deliveredStories}</div>
              <div class='home-iter-content-sub'>Stories per person days</div>
              <div class='home-iter-content-point' style={{'height': '20%'}}></div>
            </div>
            <div class='home-iter-velocity-block'>
              <div class='home-iter-content-title'>Velocity (Development)</div>
              <div class='home-iter-content-sub'>Story points committed</div>
              <div class='home-iter-content-point' style={{'height': '16%'}}>{commitedStoryPoints}</div>
              <div class='home-iter-content-sub'>Story points delivered</div>
              <div class='home-iter-content-point' style={{'height': '16%'}}>{storyPointsDelivered}</div>
              <div class='home-iter-content-sub'>Deployments this iteration</div>
              <div class='home-iter-content-point' style={{'height': '16%'}}>{deployments}</div>
              <div class='home-iter-content-sub'>Story points per person days</div>
              <div class='home-iter-content-point' style={{'height': '16%'}}></div>
            </div>
            <div class='home-iter-defects-block'>
              <div class='home-iter-content-title'>Defects</div>
              <div class='home-iter-content-sub'>Opening balance</div>
              <div class='home-iter-content-point' style={{'height': '16%'}}>{defectsStartBal}</div>
              <div class='home-iter-content-sub'>New this iteration</div>
              <div class='home-iter-content-point' style={{'height': '16%'}}>{defects}</div>
              <div class='home-iter-content-sub'>Resolved this iteration</div>
              <div class='home-iter-content-point' style={{'height': '16%'}}>{defectsClosed}</div>
              <div class='home-iter-content-sub'>Closing balance</div>
              <div class='home-iter-content-point' style={{'height': '16%'}}>{defectsEndBal}</div>
            </div>
            <div class='home-iter-cyclage-block'>
              <div class='home-iter-content-title'>Cyclage</div>
              <div class='home-iter-content-sub'>WIP Cycle Time (In days)</div>
              <div class='home-iter-content-point' style={{'height': '26.4%'}}>{cycleTimeWIP}</div>
              <div class='home-iter-content-sub'>Backlog Cycle Time (In days)</div>
              <div class='home-iter-content-point' style={{'height': '26.4%'}}>{cycleTimeInBacklog}</div>
            </div>
            <div class='home-iter-overal-block'>
              <div class='home-iter-content-title'>Overal Satisfaction</div>
              <div class='home-iter-content-sub'>Client satisfaction</div>
              <div class='home-iter-content-point' style={{'height': '26.4%'}}>{clientSatisfaction}</div>
              <div class='home-iter-content-sub'>Team satisfaction</div>
              <div class='home-iter-content-point' style={{'height': '26.4%'}}>{teamSatisfaction}</div>
            </div>
            <div class='home-iter-comment-block'>
              <div class='home-iter-content-title'>Iteration Comments</div>
              <textarea class='home-iter-comment-test' value={defIter.comment}></textarea>
            </div>
          </div>

        )
      } else {
        return (
          <div>
            <div class='home-iter-title'>Iteration Overview</div>
            <div class='home-no-iter-info'>No iterations</div>
          </div>
        )
      }
    }
  }
});

module.exports = HomeIterContent;
