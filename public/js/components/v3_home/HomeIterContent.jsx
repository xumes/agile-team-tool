var React = require('react');
var api = require('../api.jsx');
var InlineSVG = require('svg-inline-react');
var _ = require('underscore');
var moment = require('moment');
var selectedIter = new Object();
var iterData = {
  memberChanged : 'No',
  memberFte : '',
  committedStories : '',
  deliveredStories : '',
  commitedStoryPoints : '',
  storyPointsDelivered : '',
  deployments : '',
  defectsStartBal : '',
  defects : '',
  defectsClosed : '',
  defectsEndBal : '',
  cycleTimeWIP : '',
  cycleTimeInBacklog : '',
  clientSatisfaction : '',
  teamSatisfaction : '',
  comment: '',
}

var HomeIterContent = React.createClass({
  componentDidUpdate: function() {
    var self = this;
    if (!($('#homeIterSelection').hasClass('select2-hidden-accessible'))) {
      $('#homeIterSelection').select2({'width': '100%'});
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
      $('.home-iter-content-point').addClass('home-iter-content-point-hover');
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
      $('.home-iter-content-point').removeClass('home-iter-content-point-hover');
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
    iterData[id] = $('#'+id).html()
    $('#'+id).parent().children('.home-iter-content-btn').css('display','none')
    $('#'+id).css('background-color', '').css('border', '');
    $('#'+id).prop('contenteditable', 'false');
  },
  cancelChange: function(id) {
    $('#'+id).parent().children('.home-iter-content-btn').css('display','none')
    $('#'+id).css('background-color', '').css('border', '');
    $('#'+id).html(iterData[id]);
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
          iterData.memberChanged = 'Yes';
        } else {
          iterData.memberChanged = 'No';
        }
        iterData.memberFte = (defIter.memberFte == null) ? '' : defIter.memberFte;
        iterData.committedStories = (defIter.committedStories == null) ? '' : defIter.committedStories;
        iterData.deliveredStories = (defIter.deliveredStories == null) ? '' : defIter.deliveredStories;
        iterData.commitedStoryPoints = (defIter.commitedStoryPoints == null) ? '' : defIter.commitedStoryPoints;
        iterData.storyPointsDelivered = (defIter.storyPointsDelivered == null) ? '' : defIter.storyPointsDelivered;
        iterData.deployments = (defIter.deployments == null) ? '' : defIter.deployments;
        iterData.defectsStartBal = (defIter.defectsStartBal == null) ? '' : defIter.defectsStartBal;
        iterData.defects = (defIter.defects == null) ? '' : defIter.defects;
        iterData.defectsClosed = (defIter.defectsClosed == null) ? '' : defIter.defectsClosed;
        iterData.defectsEndBal = (defIter.defectsEndBal == null) ? '' : defIter.defectsEndBal;
        iterData.cycleTimeWIP = (defIter.cycleTimeWIP == null) ? '' : defIter.cycleTimeWIP;
        iterData.cycleTimeInBacklog = (defIter.cycleTimeInBacklog == null) ? '' : defIter.cycleTimeInBacklog;
        iterData.clientSatisfaction = (defIter.clientSatisfaction == null) ? '' : defIter.clientSatisfaction;
        iterData.teamSatisfaction = (defIter.teamSatisfaction == null) ? '' : defIter.teamSatisfaction;
        iterData.comment = (defIter.comment == null) ? '' : defIter.comment;
        var access = self.props.loadDetailTeam.access;
        return (
          <div>
            <div class='home-iter-title'>Iteration Overview</div>
            <div class='home-iter-selection-block'>
              <div class='iter-select'>
                <select defaultValue={defIterId} id='homeIterSelection'>
                  {iterations}
                </select>
              </div>
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
                  <div class='home-iter-locked-btn'>
                    <InlineSVG src={require('../../../img/Att-icons/att-icons_locked.svg')}></InlineSVG>
                  </div>
              </div>
              <div class='home-iter-content-col' style={{'height': '20%'}}>
                <div class='home-iter-content-sub'>Person days unavailable</div>
                <div id='memberFte' class='home-iter-content-point home-iter-content-point-hover' onClick={access?this.iterBlockClickHandler:''}>{iterData.memberFte}</div>
                <div class='home-iter-content-btn' onClick={this.saveBtnClickHandler.bind(null, 'memberFte')}>
                  <InlineSVG src={require('../../../img/Att-icons/att-icons_confirm.svg')}></InlineSVG>
                </div>
                <div class='home-iter-content-btn' style={{'right':'-19%'}} onClick={this.cancelBtnClickHandler.bind(null, 'memberFte')}>
                  <InlineSVG src={require('../../../img/Att-icons/att-icons_close-cancel.svg')}></InlineSVG>
                </div>
              </div>
              <div class='home-iter-content-col' style={{'height': '20%'}}>
                <div class='home-iter-content-sub'>Was there a team member change?</div>
                <div id='memberChanged' class='home-iter-content-point home-iter-content-point-hover' onClick={access?this.iterBlockClickHandler:''}>{iterData.memberChanged}</div>
                  <div class='home-iter-content-btn' onClick={this.saveBtnClickHandler.bind(null, 'memberChanged')}>
                    <InlineSVG src={require('../../../img/Att-icons/att-icons_confirm.svg')}></InlineSVG>
                  </div>
                  <div class='home-iter-content-btn' style={{'right':'-19%'}} onClick={this.cancelBtnClickHandler.bind(null, 'memberChanged')}>
                    <InlineSVG src={require('../../../img/Att-icons/att-icons_close-cancel.svg')}></InlineSVG>
                  </div>
              </div>
              <div class='home-iter-content-col' style={{'height': '20%'}}>
                <div class='home-iter-content-sub'>Person days available</div>
                <div id='personDays' class='home-iter-content-point-uneditable'></div>
                  <div class='home-iter-locked-btn'>
                    <InlineSVG src={require('../../../img/Att-icons/att-icons_locked.svg')}></InlineSVG>
                  </div>
              </div>
            </div>

            <div class='home-iter-throughput-block'>
              <div class='home-iter-content-col' style={{'height': '25%'}}>
                <div class='home-iter-content-title'>Throughput (Operations)</div>
              </div>
              <div class='home-iter-content-col' style={{'height': '25%'}}>
                <div class='home-iter-content-sub'>Stories/Cards/Tickets-Committed</div>
                <div id='committedStories' class='home-iter-content-point home-iter-content-point-hover' onClick={access?this.iterBlockClickHandler:''}>{iterData.committedStories}</div>
                  <div class='home-iter-content-btn' onClick={this.saveBtnClickHandler.bind(null, 'committedStories')}>
                    <InlineSVG src={require('../../../img/Att-icons/att-icons_confirm.svg')}></InlineSVG>
                  </div>
                  <div class='home-iter-content-btn' style={{'right':'-19%'}} onClick={this.cancelBtnClickHandler.bind(null, 'committedStories')}>
                    <InlineSVG src={require('../../../img/Att-icons/att-icons_close-cancel.svg')}></InlineSVG>
                  </div>
              </div>
              <div class='home-iter-content-col' style={{'height': '25%'}}>
                <div class='home-iter-content-sub'>Stories/Cards/Tickets-Delivered</div>
                <div id='deliveredStories' class='home-iter-content-point home-iter-content-point-hover' onClick={access?this.iterBlockClickHandler:''}>{iterData.deliveredStories}</div>
                  <div class='home-iter-content-btn' onClick={this.saveBtnClickHandler.bind(null, 'deliveredStories')}>
                    <InlineSVG src={require('../../../img/Att-icons/att-icons_confirm.svg')}></InlineSVG>
                  </div>
                  <div class='home-iter-content-btn' style={{'right':'-19%'}} onClick={this.cancelBtnClickHandler.bind(null, 'deliveredStories')}>
                    <InlineSVG src={require('../../../img/Att-icons/att-icons_close-cancel.svg')}></InlineSVG>
                  </div>
              </div>
              <div class='home-iter-content-col' style={{'height': '25%'}}>
                <div class='home-iter-content-sub'>Stories per person days</div>
                <div id='storiesDays' class='home-iter-content-point-uneditable'></div>
                  <div class='home-iter-locked-btn'>
                    <InlineSVG src={require('../../../img/Att-icons/att-icons_locked.svg')}></InlineSVG>
                  </div>
              </div>
            </div>

            <div class='home-iter-velocity-block'>
              <div class='home-iter-content-col' style={{'height': '20%'}}>
                <div class='home-iter-content-title'>Velocity (Development)</div>
              </div>
              <div class='home-iter-content-col' style={{'height': '20%'}}>
                <div class='home-iter-content-sub'>Story points committed</div>
                <div id='commitedStoryPoints' class='home-iter-content-point home-iter-content-point-hover' onClick={access?this.iterBlockClickHandler:''}>{iterData.commitedStoryPoints}</div>
                  <div class='home-iter-content-btn' onClick={this.saveBtnClickHandler.bind(null, 'commitedStoryPoints')}>
                    <InlineSVG src={require('../../../img/Att-icons/att-icons_confirm.svg')}></InlineSVG>
                  </div>
                  <div class='home-iter-content-btn' style={{'right':'-19%'}} onClick={this.cancelBtnClickHandler.bind(null, 'commitedStoryPoints')}>
                    <InlineSVG src={require('../../../img/Att-icons/att-icons_close-cancel.svg')}></InlineSVG>
                  </div>
              </div>
              <div class='home-iter-content-col' style={{'height': '20%'}}>
                <div class='home-iter-content-sub'>Story points delivered</div>
                <div id='storyPointsDelivered' class='home-iter-content-point home-iter-content-point-hover' onClick={access?this.iterBlockClickHandler:''}>{iterData.storyPointsDelivered}</div>
                  <div class='home-iter-content-btn' onClick={this.saveBtnClickHandler.bind(null, 'storyPointsDelivered')}>
                    <InlineSVG src={require('../../../img/Att-icons/att-icons_confirm.svg')}></InlineSVG>
                  </div>
                  <div class='home-iter-content-btn' style={{'right':'-19%'}} onClick={this.cancelBtnClickHandler.bind(null, 'storyPointsDelivered')}>
                    <InlineSVG src={require('../../../img/Att-icons/att-icons_close-cancel.svg')}></InlineSVG>
                  </div>
              </div>
              <div class='home-iter-content-col' style={{'height': '20%'}}>
                <div class='home-iter-content-sub'>Deployments this iteration</div>
                <div id='deployments' class='home-iter-content-point' onClick={access?this.iterBlockClickHandler:''}>{iterData.deployments}</div>
                  <div class='home-iter-content-btn' onClick={this.saveBtnClickHandler.bind(null, 'deployments')}>
                    <InlineSVG src={require('../../../img/Att-icons/att-icons_confirm.svg')}></InlineSVG>
                  </div>
                  <div class='home-iter-content-btn' style={{'right':'-19%'}} onClick={this.cancelBtnClickHandler.bind(null, 'deployments')}>
                    <InlineSVG src={require('../../../img/Att-icons/att-icons_close-cancel.svg')}></InlineSVG>
                  </div>
              </div>
              <div class='home-iter-content-col' style={{'height': '20%'}}>
                <div class='home-iter-content-sub'>Story points per person days</div>
                <div id='storyPointsDays' class='home-iter-content-point-uneditable'></div>
                  <div class='home-iter-locked-btn'>
                    <InlineSVG src={require('../../../img/Att-icons/att-icons_locked.svg')}></InlineSVG>
                  </div>
              </div>
            </div>

            <div class='home-iter-defects-block'>
              <div class='home-iter-content-col' style={{'height': '20%'}}>
                <div class='home-iter-content-title'>Defects</div>
              </div>
              <div class='home-iter-content-col' style={{'height': '20%'}}>
                <div class='home-iter-content-sub'>Opening balance</div>
                <div id='defectsStartBal' class='home-iter-content-point home-iter-content-point-hover' onClick={access?this.iterBlockClickHandler:''}>{iterData.defectsStartBal}</div>
                  <div class='home-iter-content-btn' onClick={this.saveBtnClickHandler.bind(null, 'defectsStartBal')}>
                    <InlineSVG src={require('../../../img/Att-icons/att-icons_confirm.svg')}></InlineSVG>
                  </div>
                  <div class='home-iter-content-btn' style={{'right':'-19%'}} onClick={this.cancelBtnClickHandler.bind(null, 'defectsStartBal')}>
                    <InlineSVG src={require('../../../img/Att-icons/att-icons_close-cancel.svg')}></InlineSVG>
                  </div>
              </div>
              <div class='home-iter-content-col' style={{'height': '20%'}}>
                <div class='home-iter-content-sub'>New this iteration</div>
                <div id='defects' class='home-iter-content-point home-iter-content-point-hover' onClick={access?this.iterBlockClickHandler:''}>{iterData.defects}</div>
                  <div class='home-iter-content-btn' onClick={this.saveBtnClickHandler.bind(null, 'defects')}>
                    <InlineSVG src={require('../../../img/Att-icons/att-icons_confirm.svg')}></InlineSVG>
                  </div>
                  <div class='home-iter-content-btn' style={{'right':'-19%'}} onClick={this.cancelBtnClickHandler.bind(null, 'defects')}>
                    <InlineSVG src={require('../../../img/Att-icons/att-icons_close-cancel.svg')}></InlineSVG>
                  </div>
              </div>
              <div class='home-iter-content-col' style={{'height': '20%'}}>
                <div class='home-iter-content-sub'>Resolved this iteration</div>
                <div id='defectsClosed' class='home-iter-content-point home-iter-content-point-hover' onClick={access?this.iterBlockClickHandler:''}>{iterData.defectsClosed}</div>
                  <div class='home-iter-content-btn' onClick={this.saveBtnClickHandler.bind(null, 'defectsClosed')}>
                    <InlineSVG src={require('../../../img/Att-icons/att-icons_confirm.svg')}></InlineSVG>
                  </div>
                  <div class='home-iter-content-btn' style={{'right':'-19%'}} onClick={this.cancelBtnClickHandler.bind(null, 'defectsClosed')}>
                    <InlineSVG src={require('../../../img/Att-icons/att-icons_close-cancel.svg')}></InlineSVG>
                  </div>
              </div>
              <div class='home-iter-content-col' style={{'height': '20%'}}>
                <div class='home-iter-content-sub'>Closing balance</div>
                <div id='defectsEndBal' class='home-iter-content-point home-iter-content-point-hover' onClick={access?this.iterBlockClickHandler:''}>{iterData.defectsEndBal}</div>
                  <div class='home-iter-content-btn' onClick={this.saveBtnClickHandler.bind(null, 'defectsEndBal')}>
                    <InlineSVG src={require('../../../img/Att-icons/att-icons_confirm.svg')}></InlineSVG>
                  </div>
                  <div class='home-iter-content-btn' style={{'right':'-19%'}} onClick={this.cancelBtnClickHandler.bind(null, 'defectsEndBal')}>
                    <InlineSVG src={require('../../../img/Att-icons/att-icons_close-cancel.svg')}></InlineSVG>
                  </div>
              </div>
            </div>

            <div class='home-iter-cyclage-block'>
              <div class='home-iter-content-col' style={{'height': '33.3%'}}>
                <div class='home-iter-content-title'>Cyclage</div>
              </div>
              <div class='home-iter-content-col' style={{'height': '33.3%'}}>
                <div class='home-iter-content-sub'>WIP Cycle Time (In days)</div>
                <div id='cycleTimeWIP' class='home-iter-content-point home-iter-content-point-hover' onClick={access?this.iterBlockClickHandler:''}>{iterData.cycleTimeWIP}</div>
                  <div class='home-iter-content-btn' onClick={this.saveBtnClickHandler.bind(null, 'cycleTimeWIP')}>
                    <InlineSVG src={require('../../../img/Att-icons/att-icons_confirm.svg')}></InlineSVG>
                  </div>
                  <div class='home-iter-content-btn' style={{'right':'-19%'}} onClick={this.cancelBtnClickHandler.bind(null, 'cycleTimeWIP')}>
                    <InlineSVG src={require('../../../img/Att-icons/att-icons_close-cancel.svg')}></InlineSVG>
                  </div>
              </div>
              <div class='home-iter-content-col' style={{'height': '33.3%'}}>
                <div class='home-iter-content-sub'>Backlog Cycle Time (In days)</div>
                <div id='cycleTimeInBacklog' class='home-iter-content-point home-iter-content-point-hover' onClick={access?this.iterBlockClickHandler:''}>{iterData.cycleTimeInBacklog}</div>
                  <div class='home-iter-content-btn' onClick={this.saveBtnClickHandler.bind(null, 'cycleTimeInBacklog')}>
                    <InlineSVG src={require('../../../img/Att-icons/att-icons_confirm.svg')}></InlineSVG>
                  </div>
                  <div class='home-iter-content-btn' style={{'right':'-19%'}} onClick={this.cancelBtnClickHandler.bind(null, 'cycleTimeInBacklog')}>
                    <InlineSVG src={require('../../../img/Att-icons/att-icons_close-cancel.svg')}></InlineSVG>
                  </div>
              </div>
            </div>
            <div class='home-iter-overal-block'>
              <div class='home-iter-content-col' style={{'height': '33.3%'}}>
                <div class='home-iter-content-title'>Overal Satisfaction</div>
              </div>
              <div class='home-iter-content-col' style={{'height': '33.3%'}}>
                <div class='home-iter-content-sub'>Client satisfaction</div>
                <div id='clientSatisfaction' class='home-iter-content-point home-iter-content-point-hover' onClick={access?this.iterBlockClickHandler:''}>{iterData.clientSatisfaction}</div>
                  <div class='home-iter-content-btn' onClick={this.saveBtnClickHandler.bind(null, 'clientSatisfaction')}>
                    <InlineSVG src={require('../../../img/Att-icons/att-icons_confirm.svg')}></InlineSVG>
                  </div>
                  <div class='home-iter-content-btn' style={{'right':'-19%'}} onClick={this.cancelBtnClickHandler.bind(null, 'clientSatisfaction')}>
                    <InlineSVG src={require('../../../img/Att-icons/att-icons_close-cancel.svg')}></InlineSVG>
                  </div>
              </div>
              <div class='home-iter-content-col' style={{'height': '33.3%'}}>
                <div class='home-iter-content-sub'>Team satisfaction</div>
                <div id='teamSatisfaction' class='home-iter-content-point home-iter-content-point-hover' onClick={access?this.iterBlockClickHandler:''}>{iterData.teamSatisfaction}</div>
                  <div class='home-iter-content-btn' onClick={this.saveBtnClickHandler.bind(null, 'teamSatisfaction')}>
                    <InlineSVG src={require('../../../img/Att-icons/att-icons_confirm.svg')}></InlineSVG>
                  </div>
                  <div class='home-iter-content-btn' style={{'right':'-19%'}} onClick={this.cancelBtnClickHandler.bind(null, 'teamSatisfaction')}>
                    <InlineSVG src={require('../../../img/Att-icons/att-icons_close-cancel.svg')}></InlineSVG>
                  </div>
              </div>
            </div>
            <div class='home-iter-comment-block'>
              <div class='home-iter-content-title'>Iteration Comments</div>
              <textarea class='home-iter-comment-test' readOnly={!access}>{iterData.comment}</textarea>
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
