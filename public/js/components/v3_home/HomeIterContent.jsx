var React = require('react');
var api = require('../api.jsx');
var InlineSVG = require('svg-inline-react');
var _ = require('underscore');
var moment = require('moment');
var business = require('moment-business');
var HomeAddIteration = require('./HomeAddIteration.jsx');
var Tooltip = require('react-tooltip');
var selectedIter = new Object();
var lockMessage = 'This value is automatically calculated and can’t be updated directly.';
var clientSatisfactionTT = 'Please indicate the satisfaction level of your client(s) with the results of this iteration using the following scale:' +
    '<br/>4 - Very satisfied' +
    '<br/>3 - Satisfied' +
    '<br/>2 - Dissatisfied' +
    '<br/>1 - Very dissatisfied';

var teamSatisfactionTT = 'Please indicate how happy your team was during the course of this iteration using the following scale:' +
    '<br />4 - Very happy' +
    '<br />3 - Happy' +
    '<br />2 - Unhappy' +
    '<br />1 - Very unhappy';
var iterData = {
  memberChanged : 'No',
  memberFte : '',
  committedStories : '',
  deliveredStories : '',
  committedStoryPoints : '',
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
  getInitialState: function() {
    return {
      createIteration: false,
      selectedField:''
    }
  },
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
      $('.home-iter-content-point home-iter-member-change').on('click', function() {
        setTimeout(function() {
          document.execCommand('selectAll', false, null);
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
    this.setState({selectedField:e.target.id});
  },
  saveBtnClickHandler: function(id) {
    this.saveIter(id);
  },
  cancelBtnClickHandler: function(id) {
    this.cancelChange(id);
  },
  saveIter: function(id) {
    var iterationData = this.recalculate(id);
    this.props.updateTeamIteration(iterationData);
    this.setState({selectedField:''});
    
  },
  cancelChange: function(id) {
    this.setState({selectedField:''});
  },

  showAddIteration: function() {
    if (!this.state.createIteration)
      this.setState({createIteration: true});
  },

  closeIteration: function(){
    this.setState({createIteration: false});
  },

  getTeamMembers : function(team){
    var teamMembers = [];
    if (!_.isEmpty(team) && team.members) {
      _.each(team.members, function(member) {
        var temp = _.find(teamMembers, function(item){
          if( item.userId === member.userId)
            return item;
        });
        if (temp === undefined) {
          teamMembers.push(member);
        }
      });
    }
    return teamMembers;
  },

  getOptimumAvailability: function(maxWorkDays){
    var team = this.props.loadDetailTeam.team;
    var members = this.getTeamMembers(team);
    var availability = 0;
    var self = this;
    _.each(members, function(member){
      var allocation =  member.allocation/100;
      var avgWorkWeek = (member.workTime != null ? self.numericValue(member.workTime) : 100 )/100;
      availability += (allocation * avgWorkWeek * maxWorkDays);
    });

    return availability.toFixed(1);
  },

  isWithinIteration: function(starDate,endDate){
    var currDate = moment(new Date(), 'YYYY-MM-DD').utc();
    var endDate = moment(endDate, 'YYYY-MM-DD');
    var starDate = moment(starDate, 'YYYY-MM-DD');
    
    return currDate.isBetween(starDate,endDate, null, "[]");
  },

  recalculate: function(id){
    var selectedIter;
    var self = this;
    if (self.props.selectedIter != '') {
       var iteration = _.find(self.props.loadDetailTeam.iterations, function(iter){
          if (iter._id.toString() == self.props.selectedIter) {
            return iter;
          }
        });
        if (iteration != undefined){
          selectedIter = _.clone(iteration);
        }
    }
    else {
      selectedIter = _.clone(self.props.loadDetailTeam.iterations[0]);
    }
    var openDefects;
    var newDefects;
    var closedDefects;
    var closedDefects;
    selectedIter[id] = $('#'+id).val();
    switch (id){
      case 'personDaysUnavailable':
        selectedIter = this.updateAvailability(selectedIter);
        break;
      case 'defectsStartBal':
        openDefects = this.numericValue($('#defectsStartBal').val());
        newDefects = this.numericValue($('#defects').text());
        closedDefects = this.numericValue($('#defectsClosed').text());
        defectsEndBal = openDefects + newDefects - closedDefects;
        selectedIter['defectsEndBal'] = defectsEndBal;
        break;
      case 'defects':
        openDefects = this.numericValue($('#defectsStartBal').text());
        newDefects = this.numericValue($('#defects').val());
        closedDefects = this.numericValue($('#defectsClosed').text());
        defectsEndBal = openDefects + newDefects - closedDefects;
        selectedIter['defectsEndBal'] = defectsEndBal;
        break;
      case 'defectsClosed':
        openDefects = this.numericValue($('#defectsStartBal').text());
        newDefects = this.numericValue($('#defects').text());
        closedDefects = this.numericValue($('#defectsClosed').val());
        defectsEndBal = openDefects + newDefects - closedDefects;
        selectedIter['defectsEndBal'] = defectsEndBal;
        selectedIter[id] = $('#'+id).val();
        break;
      case 'deliveredStories':
        this.updateStories(selectedIter);
        break;
      case 'storyPointsDelivered':
        this.updateStoryPoints(selectedIter);
        break;
    }

    return selectedIter;
   
  },

  updateAvailability: function(selectedIter){
    var isAllowed = this.isWithinIteration(selectedIter.startDate,selectedIter.endDate);
    if (isAllowed){
      //recalculate team availability only if current date is within iteration
      var maxWorkDays = business.weekDays(moment(selectedIter.startDate, 'YYYY-MM-DD'),moment(selectedIter.endDate, 'YYYY-MM-DD'));
      selectedIter.teamAvailability = this.getOptimumAvailability(maxWorkDays);
    }
    selectedIter.personDaysAvailable = (selectedIter.teamAvailability - selectedIter.personDaysUnavailable).toFixed(1);
    return selectedIter;
  },

  updateStories: function(selectedIter){
    $('#storiesDays').text((this.numericValue($('#deliveredStories').val())/this.numericValue(selectedIter.personDaysAvailable)).toFixed(1));
  },

  updateStoryPoints: function(selectedIter){
    $('#storyPointsDays').text((this.numericValue($('#storyPointsDelivered').val())/this.numericValue(selectedIter.personDaysAvailable)).toFixed(1));
  },

  numericValue:function(data) {
    var value = parseInt(data);
    if (!isNaN(value)) {
      return value;
    }
    else {
      return 0;
    }
  },

  wholeNumberCheck: function(e){
    var pattern = /^\d*$/;
    if (e.charCode >= 32 && e.charCode < 127 &&  !pattern.test(String.fromCharCode(e.charCode)))
    {
      e.preventDefault();
    }
  },

  paste:function(e) {
    e.preventDefault();
  },

  decimalNumCheck:function(e) {
    var pattern = /^\d*[.]?\d*$/;
    if (e.charCode >= 32 && e.charCode < 127 &&  !pattern.test(e.target.value + String.fromCharCode(e.charCode)))
    {
      e.preventDefault();
    }
  },

  roundOff:function(e) {
    var value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      value = value.toFixed(1);
      e.target.value = value;
    }
  },

  render: function() {
    var self = this;
    selectedIter = new Object();
    if (_.isEmpty(self.props.loadDetailTeam) || self.props.loadDetailTeam.team.type != 'squad') {
      return null;
    } else {
      var iterations = null;
      var defIterId = '';
      if (!_.isEmpty(self.props.loadDetailTeam.iterations) && self.props.loadDetailTeam.iterations.length > 0) {
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
        if (_.isEqual(defIter.memberChanged,true) || _.isEqual(defIter.memberChanged,'true')) {
          iterData.memberChanged = 'Yes';
        } else {
          iterData.memberChanged = 'No';
        }
        iterData.memberFte = (defIter.memberFte == null) ? '' : defIter.memberFte;
        iterData.teamAvailability = (defIter.teamAvailability == null) ? '' : defIter.teamAvailability;
        iterData.personDaysUnavailable = (defIter.personDaysUnavailable == null) ? '' : defIter.personDaysUnavailable;
        iterData.personDaysAvailable = (defIter.personDaysAvailable == null) ? '' : defIter.personDaysAvailable;
        iterData.committedStories = (defIter.committedStories == null) ? '' : defIter.committedStories;
        iterData.deliveredStories = (defIter.deliveredStories == null) ? '' : defIter.deliveredStories;
        iterData.committedStoryPoints = (defIter.committedStoryPoints == null) ? '' : defIter.committedStoryPoints;
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
        storiesDays = this.numericValue(iterData.deliveredStories)/this.numericValue(iterData.personDaysAvailable);
        storiesDays = !isFinite(storiesDays) ? '0.0': storiesDays.toFixed(1);
        storyPointsDays = this.numericValue(iterData.storyPointsDelivered)/this.numericValue(iterData.personDaysAvailable);
        storyPointsDays = !isFinite(storyPointsDays) ? '0.0': storyPointsDays.toFixed(1);
        var access = self.props.loadDetailTeam.access;
        
        return (
          <div>
            <div class='home-iter-title'>Iteration Overview</div>
            <Tooltip html={true}/>
            <div class='home-iter-selection-block'>
              <div class='iter-select'>
                <select value={defIterId} id='homeIterSelection' onChange={this.props.iterChangeHandler}>
                  {iterations}
                </select>
              </div>
              <div class='home-iter-add-btn-block' onClick={this.showAddIteration} style={{'cursor':'pointer'}}>
                <InlineSVG src={require('../../../img/Att-icons/att-icons_Add.svg')} data-tip='Create New Iteration'></InlineSVG>
              </div>
            </div>
            <HomeAddIteration isOpen={this.state.createIteration} onClose={this.closeIteration} loadDetailTeam={self.props.loadDetailTeam} iterListHandler={this.props.iterListHandler}/>
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
                <div class='home-iter-content-sub' data-tip='The calculated number of ‘person days’ available for this iteration based on team member’s allocation %, Full Time/Part Time/ Half time status and the length of the iteration.'>Optimum team availability (In days)</div>
                <div id='optimumPoint' class='home-iter-content-point-uneditable'>{iterData.teamAvailability}</div>
                  <div class='home-iter-locked-btn'>
                    <InlineSVG src={require('../../../img/Att-icons/att-icons_locked.svg')} data-tip={lockMessage}></InlineSVG>
                  </div>
              </div>
              <div class='home-iter-content-col' style={{'height': '20%'}}>
                <div class='home-iter-content-sub' data-tip='The number of person days team members will be unavailable to work on team deliverables due to holidays, vacation/leave, education, illness.'>Person days unavailable</div>
                {this.state.selectedField === 'personDaysUnavailable'?
                  <input id='personDaysUnavailable' class='home-iter-content-point' onKeyPress={this.decimalNumCheck} onBlur={this.roundOff} defaultValue={iterData.personDaysUnavailable} onPaste={this.paste} />:
                  <div id='personDaysUnavailable' class='home-iter-content-point home-iter-content-point-hover' onClick={access?this.iterBlockClickHandler:''}>{iterData.personDaysUnavailable}</div>
                }
                {this.state.selectedField === 'personDaysUnavailable'?
                  <div>
                    <div class='home-iter-content-btn' onClick={this.saveBtnClickHandler.bind(null, 'personDaysUnavailable')}>
                      <InlineSVG src={require('../../../img/Att-icons/att-icons_confirm.svg')}></InlineSVG>
                    </div>
                    <div class='home-iter-content-btn' style={{'right':'-19%'}} onClick={this.cancelBtnClickHandler.bind(null, 'personDaysUnavailable')}>
                      <InlineSVG src={require('../../../img/Att-icons/att-icons_close-cancel.svg')}></InlineSVG>
                    </div>
                  </div>:''
                }
              </div>
              <div class='home-iter-content-col' style={{'height': '20%'}}>
                <div class='home-iter-content-sub' data-tip='Indicate if there was a change to the team’s makeup during this iteration. Changes might include adding, replacing, removing members or changing a team member’s allocation % that you feel is significant enough to be noted.  Indicating a team change might help to explain a higher/lower team productivity when compared to other iterations.'>Was there a team change?</div>
                {this.state.selectedField === 'memberChanged'?
                  <div className='home-iter-member-change'>
                    <select id='memberChanged' defaultValue={defIter.memberChanged}>
                      <option key='Yes' value={true}>Yes</option>
                      <option key='No' value={false}>No</option>
                    </select>
                  </div>:
                  <div id='memberChanged' class='home-iter-content-point home-iter-content-point-hover' onClick={access?this.iterBlockClickHandler:''}>{iterData.memberChanged}</div>
                }
                {this.state.selectedField === 'memberChanged'?
                  <div>
                    <div class='home-iter-content-btn' onClick={this.saveBtnClickHandler.bind(null, 'memberChanged')}>
                      <InlineSVG src={require('../../../img/Att-icons/att-icons_confirm.svg')}></InlineSVG>
                    </div>
                    <div class='home-iter-content-btn' style={{'right':'-19%'}} onClick={this.cancelBtnClickHandler.bind(null, 'memberChanged')}>
                      <InlineSVG src={require('../../../img/Att-icons/att-icons_close-cancel.svg')}></InlineSVG>
                    </div>
                  </div>:''
                }
              </div>
              <div class='home-iter-content-col' style={{'height': '20%'}}>
                <div class='home-iter-content-sub' data-tip='The number of person days the team had available calculated by subtracting the Person days unavailable from the Optimum team availability (in days).'>Person days available</div>
                <div id='personDays' class='home-iter-content-point-uneditable'>{iterData.personDaysAvailable}</div>
                  <div class='home-iter-locked-btn'>
                    <InlineSVG src={require('../../../img/Att-icons/att-icons_locked.svg')} data-tip={lockMessage}></InlineSVG>
                  </div>
              </div>
            </div>

            <div class='home-iter-throughput-block'>
              <div class='home-iter-content-col' style={{'height': '25%'}}>
                <div class='home-iter-content-title'>Throughput (Operations)</div>
              </div>
              <div class='home-iter-content-col' style={{'height': '25%'}}>
                <div class='home-iter-content-sub' data-tip='Primarily for Operations teams, this is the number of Stories, Cards or Tickets the team has committed to delivering as part of their iteration planning.'>Stories/Cards/Tickets-Committed</div>
                {this.state.selectedField === 'committedStories'?
                  <input id='committedStories' class='home-iter-content-point' onKeyPress={this.wholeNumberCheck} defaultValue={iterData.committedStories} onPaste={this.paste} />:
                  <div id='committedStories' class='home-iter-content-point home-iter-content-point-hover' onClick={access?this.iterBlockClickHandler:''}>{iterData.committedStories}</div>
                }
                {this.state.selectedField === 'committedStories'?
                  <div>
                    <div class='home-iter-content-btn' onClick={this.saveBtnClickHandler.bind(null, 'committedStories')}>
                      <InlineSVG src={require('../../../img/Att-icons/att-icons_confirm.svg')}></InlineSVG>
                    </div>
                    <div class='home-iter-content-btn' style={{'right':'-19%'}} onClick={this.cancelBtnClickHandler.bind(null, 'committedStories')}>
                      <InlineSVG src={require('../../../img/Att-icons/att-icons_close-cancel.svg')}></InlineSVG>
                    </div>
                  </div>:''
                }
              </div>
              <div class='home-iter-content-col' style={{'height': '25%'}}>
                <div class='home-iter-content-sub' data-tip='Primarily for Operations teams, this is the actual number of Stories, Cards or Tickets the team was able to deliver for this iteration period.'>Stories/Cards/Tickets-Delivered</div>
                {this.state.selectedField === 'deliveredStories'?
                  <input id='deliveredStories' class='home-iter-content-point' onKeyPress={this.wholeNumberCheck} defaultValue={iterData.deliveredStories} onPaste={this.paste} />:
                  <div id='deliveredStories' class='home-iter-content-point home-iter-content-point-hover' onClick={access?this.iterBlockClickHandler:''}>{iterData.deliveredStories}</div>
                }
                {this.state.selectedField === 'deliveredStories'?
                  <div>
                    <div class='home-iter-content-btn' onClick={this.saveBtnClickHandler.bind(null, 'deliveredStories')}>
                      <InlineSVG src={require('../../../img/Att-icons/att-icons_confirm.svg')}></InlineSVG>
                    </div>
                    <div class='home-iter-content-btn' style={{'right':'-19%'}} onClick={this.cancelBtnClickHandler.bind(null, 'deliveredStories')}>
                      <InlineSVG src={require('../../../img/Att-icons/att-icons_close-cancel.svg')}></InlineSVG>
                    </div>
                  </div>:''
                }
              </div>
              <div class='home-iter-content-col' style={{'height': '25%'}}>
                <div class='home-iter-content-sub' data-tip='The calculated number of stories, cards or tickets delivered per person day.  Stories, Cards or Tickets delivered divided by the number of person days available.'>Stories per person days</div>
                <div id='storiesDays' class='home-iter-content-point-uneditable'>{storiesDays}</div>
                  <div class='home-iter-locked-btn'>
                    <InlineSVG src={require('../../../img/Att-icons/att-icons_locked.svg')} data-tip={lockMessage}></InlineSVG>
                  </div>
              </div>
            </div>

            <div class='home-iter-velocity-block'>
              <div class='home-iter-content-col' style={{'height': '20%'}}>
                <div class='home-iter-content-title'>Velocity (Development)</div>
              </div>
              <div class='home-iter-content-col' style={{'height': '20%'}}>
                <div class='home-iter-content-sub' data-tip='Primarily for Delivery teams, this is the number of Story points the team has committed to delivering as part of their iteration planning.'>Story points committed</div>
                {this.state.selectedField === 'committedStoryPoints'?
                  <input id='committedStoryPoints' class='home-iter-content-point' onKeyPress={this.wholeNumberCheck} defaultValue={iterData.committedStoryPoints} onPaste={this.paste} />:
                  <div id='committedStoryPoints' class='home-iter-content-point home-iter-content-point-hover' onClick={access?this.iterBlockClickHandler:''}>{iterData.committedStoryPoints}</div>
                }
                {this.state.selectedField === 'committedStoryPoints'?
                  <div>
                    <div class='home-iter-content-btn' onClick={this.saveBtnClickHandler.bind(null, 'committedStoryPoints')}>
                      <InlineSVG src={require('../../../img/Att-icons/att-icons_confirm.svg')}></InlineSVG>
                    </div>
                    <div class='home-iter-content-btn' style={{'right':'-19%'}} onClick={this.cancelBtnClickHandler.bind(null, 'committedStoryPoints')}>
                      <InlineSVG src={require('../../../img/Att-icons/att-icons_close-cancel.svg')}></InlineSVG>
                    </div>
                  </div>:''
                }
              </div>
              <div class='home-iter-content-col' style={{'height': '20%'}}>
                <div class='home-iter-content-sub' data-tip='Primarily for Delivery teams, this is the actual number of Story points the team was able to deliver for this iteration period.'>Story points delivered</div>
                {this.state.selectedField === 'storyPointsDelivered'?
                  <input id='storyPointsDelivered' class='home-iter-content-point' onKeyPress={this.wholeNumberCheck} defaultValue={iterData.storyPointsDelivered} onPaste={this.paste} />:
                  <div id='storyPointsDelivered' class='home-iter-content-point home-iter-content-point-hover' onClick={access?this.iterBlockClickHandler:''}>{iterData.storyPointsDelivered}</div>
                }
                {this.state.selectedField === 'storyPointsDelivered'?
                  <div>
                    <div class='home-iter-content-btn' onClick={this.saveBtnClickHandler.bind(null, 'storyPointsDelivered')}>
                      <InlineSVG src={require('../../../img/Att-icons/att-icons_confirm.svg')}></InlineSVG>
                    </div>
                    <div class='home-iter-content-btn' style={{'right':'-19%'}} onClick={this.cancelBtnClickHandler.bind(null, 'storyPointsDelivered')}>
                      <InlineSVG src={require('../../../img/Att-icons/att-icons_close-cancel.svg')}></InlineSVG>
                    </div>
                  </div>:''
                }
              </div>
              <div class='home-iter-content-col' style={{'height': '20%'}}>
                <div class='home-iter-content-sub' data-tip='The number of code drops moved to production for this iteration. (Ex. If 3 enhancements/defects went into production on a single ‘push’, this is one deployment.)'>Deployments this iteration</div>
                {this.state.selectedField === 'deployments'?
                  <input id='deployments' class='home-iter-content-point' onKeyPress={this.wholeNumberCheck} defaultValue={iterData.deployments} onPaste={this.paste} />:
                  <div id='deployments' class='home-iter-content-point home-iter-content-point-hover' onClick={access?this.iterBlockClickHandler:''}>{iterData.deployments}</div>
                }
                {this.state.selectedField === 'deployments'?
                  <div>
                    <div class='home-iter-content-btn' onClick={this.saveBtnClickHandler.bind(null, 'deployments')}>
                      <InlineSVG src={require('../../../img/Att-icons/att-icons_confirm.svg')}></InlineSVG>
                    </div>
                    <div class='home-iter-content-btn' style={{'right':'-19%'}} onClick={this.cancelBtnClickHandler.bind(null, 'deployments')}>
                      <InlineSVG src={require('../../../img/Att-icons/att-icons_close-cancel.svg')}></InlineSVG>
                    </div>
                  </div>:''
                }
              </div>
              <div class='home-iter-content-col' style={{'height': '20%'}}>
                <div class='home-iter-content-sub' data-tip='The calculated number of story points delivered per person day.  Story points delivered divided by the number of person days available.'>Story points per person days</div>
                <div id='storyPointsDays' class='home-iter-content-point-uneditable'>{storyPointsDays}</div>
                  <div class='home-iter-locked-btn'>
                    <InlineSVG src={require('../../../img/Att-icons/att-icons_locked.svg')} data-tip={lockMessage}></InlineSVG>
                  </div>
              </div>
            </div>

            <div class='home-iter-defects-block'>
              <div class='home-iter-content-col' style={{'height': '20%'}}>
                <div class='home-iter-content-title'>Defects</div>
              </div>
              <div class='home-iter-content-col' style={{'height': '20%'}}>
                <div class='home-iter-content-sub' data-tip='This is the number of production defects your are starting out with in this iteration.  This is pre-populated from the closing balance of defects from the previous iteration.'>Opening balance</div>
                {this.state.selectedField === 'defectsStartBal'?
                  <input id='defectsStartBal' class='home-iter-content-point' onKeyPress={this.wholeNumberCheck} defaultValue={iterData.defectsStartBal} onPaste={this.paste} />:
                  <div id='defectsStartBal' class='home-iter-content-point home-iter-content-point-hover' onClick={access?this.iterBlockClickHandler:''}>{iterData.defectsStartBal}</div>
                }
                {this.state.selectedField === 'defectsStartBal'?
                  <div>
                    <div class='home-iter-content-btn' onClick={this.saveBtnClickHandler.bind(null, 'defectsStartBal')}>
                      <InlineSVG src={require('../../../img/Att-icons/att-icons_confirm.svg')}></InlineSVG>
                    </div>
                    <div class='home-iter-content-btn' style={{'right':'-19%'}} onClick={this.cancelBtnClickHandler.bind(null, 'defectsStartBal')}>
                      <InlineSVG src={require('../../../img/Att-icons/att-icons_close-cancel.svg')}></InlineSVG>
                    </div>
                  </div>:''
                }
              </div>
              <div class='home-iter-content-col' style={{'height': '20%'}}>
                <div class='home-iter-content-sub' data-tip='This is the number of production defects discovered during this iteration.'>New this iteration</div>
                {this.state.selectedField === 'defects'?
                  <input id='defects' class='home-iter-content-point' onKeyPress={this.wholeNumberCheck} defaultValue={iterData.defects} onPaste={this.paste} />:
                  <div id='defects' class='home-iter-content-point home-iter-content-point-hover' onClick={access?this.iterBlockClickHandler:''}>{iterData.defects}</div>
                }
                {this.state.selectedField === 'defects'?
                  <div>
                    <div class='home-iter-content-btn' onClick={this.saveBtnClickHandler.bind(null, 'defects')}>
                      <InlineSVG src={require('../../../img/Att-icons/att-icons_confirm.svg')}></InlineSVG>
                    </div>
                    <div class='home-iter-content-btn' style={{'right':'-19%'}} onClick={this.cancelBtnClickHandler.bind(null, 'defects')}>
                      <InlineSVG src={require('../../../img/Att-icons/att-icons_close-cancel.svg')}></InlineSVG>
                    </div>
                  </div>:''
                }
              </div>
              <div class='home-iter-content-col' style={{'height': '20%'}}>
                <div class='home-iter-content-sub' data-tip='This is the number of production defects resolved during this iteration.  In some situations, depending on the type of team, this might also include defects transferred to another team.'>Resolved this iteration</div>
                {this.state.selectedField === 'defectsClosed'?
                  <input id='defectsClosed' class='home-iter-content-point' onKeyPress={this.wholeNumberCheck} defaultValue={iterData.defectsClosed} onPaste={this.paste} />:
                  <div id='defectsClosed' class='home-iter-content-point home-iter-content-point-hover' onClick={access?this.iterBlockClickHandler:''}>{iterData.defectsClosed}</div>
                }
                {this.state.selectedField === 'defectsClosed'?
                  <div>
                    <div class='home-iter-content-btn' onClick={this.saveBtnClickHandler.bind(null, 'defectsClosed')}>
                      <InlineSVG src={require('../../../img/Att-icons/att-icons_confirm.svg')}></InlineSVG>
                    </div>
                    <div class='home-iter-content-btn' style={{'right':'-19%'}} onClick={this.cancelBtnClickHandler.bind(null, 'defectsClosed')}>
                      <InlineSVG src={require('../../../img/Att-icons/att-icons_close-cancel.svg')}></InlineSVG>
                    </div>
                  </div>:''
                }
              </div>
              <div class='home-iter-content-col' style={{'height': '20%'}}>
                <div class='home-iter-content-sub' data-tip='This is the number of production defects still open to be resolved at the close of this iteration.  This is pre-calculated as follows: (Opening balance + New this iteration) – Resolved this iteration = Closing balance.'>Closing balance</div>
                <div id='defectsEndBal' class='home-iter-content-point-uneditable'>{iterData.defectsEndBal}</div>
                  <div class='home-iter-locked-btn'>
                    <InlineSVG src={require('../../../img/Att-icons/att-icons_locked.svg')} data-tip={lockMessage}></InlineSVG>
                  </div>
              </div>
            </div>

            <div class='home-iter-cyclage-block'>
              <div class='home-iter-content-col' style={{'height': '33.3%'}}>
                <div class='home-iter-content-title'>Cycle Time</div>
              </div>
              <div class='home-iter-content-col' style={{'height': '33.3%'}}>
                <div class='home-iter-content-sub' data-tip='Work in Progress; for each story delivered in this iteration, how long did it take to go from being worked on (planned for this iteration) to production delivery? Put the average number of work days in this field.'>Time in WIP (In days)</div>
                {this.state.selectedField === 'cycleTimeWIP'?
                  <input id='cycleTimeWIP' class='home-iter-content-point' onKeyPress={this.decimalNumCheck} onBlur={this.roundOff} defaultValue={iterData.cycleTimeWIP} onPaste={this.paste} />:
                  <div id='cycleTimeWIP' class='home-iter-content-point home-iter-content-point-hover' onClick={access?this.iterBlockClickHandler:''}>{iterData.cycleTimeWIP}</div>
                }
                {this.state.selectedField === 'cycleTimeWIP'?
                  <div>
                    <div class='home-iter-content-btn' onClick={this.saveBtnClickHandler.bind(null, 'cycleTimeWIP')}>
                      <InlineSVG src={require('../../../img/Att-icons/att-icons_confirm.svg')}></InlineSVG>
                    </div>
                    <div class='home-iter-content-btn' style={{'right':'-19%'}} onClick={this.cancelBtnClickHandler.bind(null, 'cycleTimeWIP')}>
                      <InlineSVG src={require('../../../img/Att-icons/att-icons_close-cancel.svg')}></InlineSVG>
                    </div>
                  </div>:''
                }
              </div>
              <div class='home-iter-content-col' style={{'height': '33.3%'}}>
                <div class='home-iter-content-sub' data-tip='For each story delivered in this iteration how long was it in your backlog before it was planned for this iteration? Put the average number of work days in this field.'>Time in Backlog (In days)</div>
                {this.state.selectedField === 'cycleTimeInBacklog'?
                  <input id='cycleTimeInBacklog' class='home-iter-content-point' onKeyPress={this.decimalNumCheck} onBlur={this.roundOff} defaultValue={iterData.cycleTimeInBacklog} onPaste={this.paste} />:
                  <div id='cycleTimeInBacklog' class='home-iter-content-point home-iter-content-point-hover' onClick={access?this.iterBlockClickHandler:''}>{iterData.cycleTimeInBacklog}</div>
                }
                {this.state.selectedField === 'cycleTimeInBacklog'?
                  <div>
                    <div class='home-iter-content-btn' onClick={this.saveBtnClickHandler.bind(null, 'cycleTimeInBacklog')}>
                      <InlineSVG src={require('../../../img/Att-icons/att-icons_confirm.svg')}></InlineSVG>
                    </div>
                    <div class='home-iter-content-btn' style={{'right':'-19%'}} onClick={this.cancelBtnClickHandler.bind(null, 'cycleTimeInBacklog')}>
                      <InlineSVG src={require('../../../img/Att-icons/att-icons_close-cancel.svg')}></InlineSVG>
                    </div>
                  </div>:''
                }
              </div>
            </div>
            <div class='home-iter-overal-block'>
              <div class='home-iter-content-col' style={{'height': '33.3%'}}>
                <div class='home-iter-content-title'>Overall Satisfaction</div>
              </div>
              <div class='home-iter-content-col' style={{'height': '33.3%'}}>
                <div class='home-iter-content-sub' data-tip={clientSatisfactionTT}>Client satisfaction</div>
                {this.state.selectedField === 'clientSatisfaction'?
                  <input id='clientSatisfaction' class='home-iter-content-point' onKeyPress={this.decimalNumCheck} onBlur={this.roundOff} defaultValue={iterData.clientSatisfaction} onPaste={this.paste} />:
                  <div id='clientSatisfaction' class='home-iter-content-point home-iter-content-point-hover' onClick={access?this.iterBlockClickHandler:''}>{iterData.clientSatisfaction}</div>
                }
                {this.state.selectedField === 'clientSatisfaction'?
                  <div>
                    <div class='home-iter-content-btn' onClick={this.saveBtnClickHandler.bind(null, 'clientSatisfaction')}>
                      <InlineSVG src={require('../../../img/Att-icons/att-icons_confirm.svg')}></InlineSVG>
                    </div>
                    <div class='home-iter-content-btn' style={{'right':'-19%'}} onClick={this.cancelBtnClickHandler.bind(null, 'clientSatisfaction')}>
                      <InlineSVG src={require('../../../img/Att-icons/att-icons_close-cancel.svg')}></InlineSVG>
                    </div>
                  </div>:''
                }
              </div>
              <div class='home-iter-content-col' style={{'height': '33.3%'}}>
                <div class='home-iter-content-sub' data-tip={teamSatisfactionTT}>Team satisfaction</div>
                {this.state.selectedField === 'teamSatisfaction'?
                  <input id='teamSatisfaction' class='home-iter-content-point' onKeyPress={this.decimalNumCheck} onBlur={this.roundOff} defaultValue={iterData.teamSatisfaction} onPaste={this.paste} />:
                  <div id='teamSatisfaction' class='home-iter-content-point home-iter-content-point-hover' onClick={access?this.iterBlockClickHandler:''}>{iterData.teamSatisfaction}</div>
                }
                {this.state.selectedField === 'teamSatisfaction'?
                  <div>
                    <div class='home-iter-content-btn' onClick={this.saveBtnClickHandler.bind(null, 'teamSatisfaction')}>
                      <InlineSVG src={require('../../../img/Att-icons/att-icons_confirm.svg')}></InlineSVG>
                    </div>
                    <div class='home-iter-content-btn' style={{'right':'-19%'}} onClick={this.cancelBtnClickHandler.bind(null, 'teamSatisfaction')}>
                      <InlineSVG src={require('../../../img/Att-icons/att-icons_close-cancel.svg')}></InlineSVG>
                    </div>
                  </div>:''
                }
              </div>
            </div>
            <div class='home-iter-comment-block'>
              <div class='home-iter-content-title' data-tip='Enter any comments you feel are relevant to this iteration.  Perhaps it was something unplanned that affected the team’s deliverables, either positively or negatively.'>Iteration Comments</div>
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
