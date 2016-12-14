var React = require('react');
var api = require('../api.jsx');
var InlineSVG = require('svg-inline-react');
var _ = require('underscore');
var moment = require('moment');
var selectedIter = new Object();

var HomeIterContent = React.createClass({
  componentDidUpdate: function() {
    var self = this;
    if (!($('#homeIterSelection').hasClass('select2-hidden-accessible'))) {
      $('#homeIterSelection').select2();
      $('#homeIterSelection').change(self.props.iterChangeHandler);
    }
    _.each($('.home-iter-content-point'), function(blk){
      if (blk.id != '') {
        $('#'+blk.id).parent().children('.home-iter-content-btn').css('display','none')
        $('#'+blk.id).css('background-color', '').css('border', '');
        $('#'+blk.id).prop('contenteditable', 'false');
      }
    });
    if (self.props.loadDetailTeam.access) {
      $('.home-iter-content-point').on('click', function() {
        setTimeout(function() {
          document.execCommand('selectAll', false, null)
        }, 0);
      });
      $('.home-iter-content-point').keypress(function(e){
        var key = e.which;
        if (key == 13)  // the enter key code
        {
          self.saveIter(e.target.id);
        }
      });
      $('.home-iter-content-point').keyup(function(e){
        if (e.keyCode == 27) {
          self.cancelChange(e.target.id);
        }
      });
    } else {
      $('.home-iter-content-point').prop('onclick',null).off('click');
      $('.home-iter-content-point').keypress(function(e){

      });
      $('.home-iter-content-point').keyup(function(e){

      });
    }
  },
  iterBlockClickHandler: function(e) {
    var self = this;
    _.each($('.home-iter-content-point'), function(blk){
      if (blk.id != '') {
        self.cancelChange(blk.id);
      }
    });
    $('#'+e.target.id).parent().children('.home-iter-content-btn').css('display','inline-block')
    $('#'+e.target.id).css('background-color', '#FFFFFF').css('border', '0.1em solid #4178BE');
    $('#'+e.target.id).prop('contenteditable', 'true');
  },
  saveBtnClickHandler: function(id) {
    this.saveIter(id);
  },
  cancelBtnClickHandler: function(id) {
    this.cancelChange(id);
  },
  saveIter: function(id) {
    $('#'+id).data('default',$('#'+id).html());
    $('#'+id).parent().children('.home-iter-content-btn').css('display','none')
    $('#'+id).css('background-color', '').css('border', '');
    $('#'+id).prop('contenteditable', 'false');
  },
  cancelChange: function(id) {
    $('#'+id).parent().children('.home-iter-content-btn').css('display','none')
    $('#'+id).css('background-color', '').css('border', '');
    $('#'+id).html($('#'+id).data('default'));
    $('#'+id).prop('contenteditable', 'false');
  },
  render: function() {
    var self = this;
    selectedIter = new Object();
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
            selectedIter = iter;
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
        var memberFte = (defIter.memberFte == null) ? '' : defIter.memberFte;
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
        var access = self.props.loadDetailTeam.access;
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
              <div class='home-iter-content-col' style={{'height': '20%'}}>
                <div class='home-iter-content-title'>Sprint Availability</div>
              </div>
              <div class='home-iter-content-col' style={{'height': '20%'}}>
                <div class='home-iter-content-sub'>Optimum team availability (In days)</div>
                <div id='optimumPoint' class='home-iter-content-point-uneditable'></div>
              </div>
              <div class='home-iter-content-col' style={{'height': '20%'}}>
                <div class='home-iter-content-sub'>Person days unavailable</div>
                <div data-default={memberFte} id='memberFte' class='home-iter-content-point home-iter-content-point-hover' onClick={access?this.iterBlockClickHandler:''}>{memberFte}</div>
                <div class='home-iter-content-btn' onClick={this.saveBtnClickHandler.bind(null, 'memberFte')}>
                  <InlineSVG src={require('../../../img/Att-icons/att-icons_info.svg')}></InlineSVG>
                </div>
                <div class='home-iter-content-btn' style={{'right':'-19%'}} onClick={this.cancelBtnClickHandler.bind(null, 'memberFte')}>
                  <InlineSVG src={require('../../../img/Att-icons/att-icons_info.svg')}></InlineSVG>
                </div>
              </div>
              <div class='home-iter-content-col' style={{'height': '20%'}}>
                <div class='home-iter-content-sub'>Was there a team member change?</div>
                <div data-default={memberChanged} id='memberChanged' class='home-iter-content-point home-iter-content-point-hover' onClick={access?this.iterBlockClickHandler:''}>{memberChanged}</div>
                  <div class='home-iter-content-btn'>
                    <InlineSVG src={require('../../../img/Att-icons/att-icons_info.svg')}></InlineSVG>
                  </div>
                  <div class='home-iter-content-btn' style={{'right':'-19%'}}>
                    <InlineSVG src={require('../../../img/Att-icons/att-icons_info.svg')}></InlineSVG>
                  </div>
              </div>
              <div class='home-iter-content-col' style={{'height': '20%'}}>
                <div class='home-iter-content-sub'>Person days available</div>
                <div id='personDays' class='home-iter-content-point-uneditable'></div>
              </div>
            </div>

            <div class='home-iter-throughput-block'>
              <div class='home-iter-content-col' style={{'height': '25%'}}>
                <div class='home-iter-content-title'>Throughput (Operations)</div>
              </div>
              <div class='home-iter-content-col' style={{'height': '25%'}}>
                <div class='home-iter-content-sub'>Stories/Cards/Tickets-Committed</div>
                <div data-default={committedStories} id='committedStories' class='home-iter-content-point home-iter-content-point-hover' onClick={access?this.iterBlockClickHandler:''}>{committedStories}</div>
                  <div class='home-iter-content-btn'>
                    <InlineSVG src={require('../../../img/Att-icons/att-icons_info.svg')}></InlineSVG>
                  </div>
                  <div class='home-iter-content-btn' style={{'right':'-19%'}}>
                    <InlineSVG src={require('../../../img/Att-icons/att-icons_info.svg')}></InlineSVG>
                  </div>
              </div>
              <div class='home-iter-content-col' style={{'height': '25%'}}>
                <div class='home-iter-content-sub'>Stories/Cards/Tickets-Delivered</div>
                <div data-default={deliveredStories} id='deliveredStories' class='home-iter-content-point home-iter-content-point-hover' onClick={access?this.iterBlockClickHandler:''}>{deliveredStories}</div>
                  <div class='home-iter-content-btn'>
                    <InlineSVG src={require('../../../img/Att-icons/att-icons_info.svg')}></InlineSVG>
                  </div>
                  <div class='home-iter-content-btn' style={{'right':'-19%'}}>
                    <InlineSVG src={require('../../../img/Att-icons/att-icons_info.svg')}></InlineSVG>
                  </div>
              </div>
              <div class='home-iter-content-col' style={{'height': '25%'}}>
                <div class='home-iter-content-sub'>Stories per person days</div>
                <div id='storiesDays' class='home-iter-content-point-uneditable'></div>
              </div>
            </div>

            <div class='home-iter-velocity-block'>
              <div class='home-iter-content-col' style={{'height': '20%'}}>
                <div class='home-iter-content-title'>Velocity (Development)</div>
              </div>
              <div class='home-iter-content-col' style={{'height': '20%'}}>
                <div class='home-iter-content-sub'>Story points committed</div>
                <div data-default={commitedStoryPoints} id='commitedStoryPoints' class='home-iter-content-point home-iter-content-point-hover' onClick={access?this.iterBlockClickHandler:''}>{commitedStoryPoints}</div>
                  <div class='home-iter-content-btn'>
                    <InlineSVG src={require('../../../img/Att-icons/att-icons_info.svg')}></InlineSVG>
                  </div>
                  <div class='home-iter-content-btn' style={{'right':'-19%'}}>
                    <InlineSVG src={require('../../../img/Att-icons/att-icons_info.svg')}></InlineSVG>
                  </div>
              </div>
              <div class='home-iter-content-col' style={{'height': '20%'}}>
                <div class='home-iter-content-sub'>Story points delivered</div>
                <div data-default={storyPointsDelivered} id='storyPointsDelivered' class='home-iter-content-point home-iter-content-point-hover' onClick={access?this.iterBlockClickHandler:''}>{storyPointsDelivered}</div>
                  <div class='home-iter-content-btn'>
                    <InlineSVG src={require('../../../img/Att-icons/att-icons_info.svg')}></InlineSVG>
                  </div>
                  <div class='home-iter-content-btn' style={{'right':'-19%'}}>
                    <InlineSVG src={require('../../../img/Att-icons/att-icons_info.svg')}></InlineSVG>
                  </div>
              </div>
              <div class='home-iter-content-col' style={{'height': '20%'}}>
                <div class='home-iter-content-sub'>Deployments this iteration</div>
                <div data-default={deployments} id='deployments' class='home-iter-content-point' onClick={access?this.iterBlockClickHandler:''}>{deployments}</div>
                  <div class='home-iter-content-btn'>
                    <InlineSVG src={require('../../../img/Att-icons/att-icons_info.svg')}></InlineSVG>
                  </div>
                  <div class='home-iter-content-btn' style={{'right':'-19%'}}>
                    <InlineSVG src={require('../../../img/Att-icons/att-icons_info.svg')}></InlineSVG>
                  </div>
              </div>
              <div class='home-iter-content-col' style={{'height': '20%'}}>
                <div class='home-iter-content-sub'>Story points per person days</div>
                <div id='storyPointsDays' class='home-iter-content-point-uneditable'></div>
              </div>
            </div>

            <div class='home-iter-defects-block'>
              <div class='home-iter-content-col' style={{'height': '20%'}}>
                <div class='home-iter-content-title'>Defects</div>
              </div>
              <div class='home-iter-content-col' style={{'height': '20%'}}>
                <div class='home-iter-content-sub'>Opening balance</div>
                <div data-default={defectsStartBal} id='defectsStartBal' class='home-iter-content-point home-iter-content-point-hover' onClick={access?this.iterBlockClickHandler:''}>{defectsStartBal}</div>
                  <div class='home-iter-content-btn'>
                    <InlineSVG src={require('../../../img/Att-icons/att-icons_info.svg')}></InlineSVG>
                  </div>
                  <div class='home-iter-content-btn' style={{'right':'-19%'}}>
                    <InlineSVG src={require('../../../img/Att-icons/att-icons_info.svg')}></InlineSVG>
                  </div>
              </div>
              <div class='home-iter-content-col' style={{'height': '20%'}}>
                <div class='home-iter-content-sub'>New this iteration</div>
                <div data-default={defects} id='defects' class='home-iter-content-point home-iter-content-point-hover' onClick={access?this.iterBlockClickHandler:''}>{defects}</div>
                  <div class='home-iter-content-btn'>
                    <InlineSVG src={require('../../../img/Att-icons/att-icons_info.svg')}></InlineSVG>
                  </div>
                  <div class='home-iter-content-btn' style={{'right':'-19%'}}>
                    <InlineSVG src={require('../../../img/Att-icons/att-icons_info.svg')}></InlineSVG>
                  </div>
              </div>
              <div class='home-iter-content-col' style={{'height': '20%'}}>
                <div class='home-iter-content-sub'>Resolved this iteration</div>
                <div data-default={defectsClosed} id='defectsClosed' class='home-iter-content-point home-iter-content-point-hover' onClick={access?this.iterBlockClickHandler:''}>{defectsClosed}</div>
                  <div class='home-iter-content-btn'>
                    <InlineSVG src={require('../../../img/Att-icons/att-icons_info.svg')}></InlineSVG>
                  </div>
                  <div class='home-iter-content-btn' style={{'right':'-19%'}}>
                    <InlineSVG src={require('../../../img/Att-icons/att-icons_info.svg')}></InlineSVG>
                  </div>
              </div>
              <div class='home-iter-content-col' style={{'height': '20%'}}>
                <div class='home-iter-content-sub'>Closing balance</div>
                <div data-default={defectsEndBal} id='defectsEndBal' class='home-iter-content-point home-iter-content-point-hover' onClick={access?this.iterBlockClickHandler:''}>{defectsEndBal}</div>
                  <div class='home-iter-content-btn'>
                    <InlineSVG src={require('../../../img/Att-icons/att-icons_info.svg')}></InlineSVG>
                  </div>
                  <div class='home-iter-content-btn' style={{'right':'-19%'}}>
                    <InlineSVG src={require('../../../img/Att-icons/att-icons_info.svg')}></InlineSVG>
                  </div>
              </div>
            </div>

            <div class='home-iter-cyclage-block'>
              <div class='home-iter-content-col' style={{'height': '33.3%'}}>
                <div class='home-iter-content-title'>Cyclage</div>
              </div>
              <div class='home-iter-content-col' style={{'height': '33.3%'}}>
                <div class='home-iter-content-sub'>WIP Cycle Time (In days)</div>
                <div data-default={cycleTimeWIP} id='cycleTimeWIP' class='home-iter-content-point home-iter-content-point-hover' onClick={access?this.iterBlockClickHandler:''}>{cycleTimeWIP}</div>
                  <div class='home-iter-content-btn'>
                    <InlineSVG src={require('../../../img/Att-icons/att-icons_info.svg')}></InlineSVG>
                  </div>
                  <div class='home-iter-content-btn' style={{'right':'-19%'}}>
                    <InlineSVG src={require('../../../img/Att-icons/att-icons_info.svg')}></InlineSVG>
                  </div>
              </div>
              <div class='home-iter-content-col' style={{'height': '33.3%'}}>
                <div class='home-iter-content-sub'>Backlog Cycle Time (In days)</div>
                <div data-default={cycleTimeInBacklog} id='cycleTimeInBacklog' class='home-iter-content-point home-iter-content-point-hover' onClick={access?this.iterBlockClickHandler:''}>{cycleTimeInBacklog}</div>
                  <div class='home-iter-content-btn'>
                    <InlineSVG src={require('../../../img/Att-icons/att-icons_info.svg')}></InlineSVG>
                  </div>
                  <div class='home-iter-content-btn' style={{'right':'-19%'}}>
                    <InlineSVG src={require('../../../img/Att-icons/att-icons_info.svg')}></InlineSVG>
                  </div>
              </div>
            </div>
            <div class='home-iter-overal-block'>
              <div class='home-iter-content-col' style={{'height': '33.3%'}}>
                <div class='home-iter-content-title'>Overal Satisfaction</div>
              </div>
              <div class='home-iter-content-col' style={{'height': '33.3%'}}>
                <div class='home-iter-content-sub'>Client satisfaction</div>
                <div data-default={clientSatisfaction} id='clientSatisfaction' class='home-iter-content-point home-iter-content-point-hover' onClick={access?this.iterBlockClickHandler:''}>{clientSatisfaction}</div>
                  <div class='home-iter-content-btn'>
                    <InlineSVG src={require('../../../img/Att-icons/att-icons_info.svg')}></InlineSVG>
                  </div>
                  <div class='home-iter-content-btn' style={{'right':'-19%'}}>
                    <InlineSVG src={require('../../../img/Att-icons/att-icons_info.svg')}></InlineSVG>
                  </div>
              </div>
              <div class='home-iter-content-col' style={{'height': '33.3%'}}>
                <div class='home-iter-content-sub'>Team satisfaction</div>
                <div data-default={teamSatisfaction} id='teamSatisfaction' class='home-iter-content-point home-iter-content-point-hover' onClick={access?this.iterBlockClickHandler:''}>{teamSatisfaction}</div>
                  <div class='home-iter-content-btn'>
                    <InlineSVG src={require('../../../img/Att-icons/att-icons_info.svg')}></InlineSVG>
                  </div>
                  <div class='home-iter-content-btn' style={{'right':'-19%'}}>
                    <InlineSVG src={require('../../../img/Att-icons/att-icons_info.svg')}></InlineSVG>
                  </div>
              </div>
            </div>
            <div class='home-iter-comment-block'>
              <div class='home-iter-content-title'>Iteration Comments</div>
              <textarea class='home-iter-comment-test' defaultValue={defIter.comment}></textarea>
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
