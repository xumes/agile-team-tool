var React = require('react');
var api = require('../api.jsx');
var InlineSVG = require('svg-inline-react');
var _ = require('underscore');
var moment = require('moment');
var business = require('moment-business');
var HomeAddIteration = require('./HomeAddIteration.jsx');
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
  getInitialState: function() {
    return {
      createIteration: false,
      showMemberDropdown: false
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
    $('#'+e.target.id).parent().children('.home-iter-content-btn').css('display','inline-block')
    $('#'+e.target.id).css('background-color', '#FFFFFF').css('border', '0.1em solid #4178BE');
    $('#'+e.target.id).prop('contenteditable', 'true');
  },
  memberChangeClickHandler: function(e) {
    var self = this;
    _.each($('.home-iter-content-point'), function(blk){
      if (blk.id != '') {
        self.cancelChange(blk.id);
      }
    });
    $('#'+e.target.id).parent().children('.home-iter-content-btn').css('display','inline-block')
    this.setState({showMemberDropdown:true});
  },
  saveBtnClickHandler: function(id) {
    this.saveIter(id);
    if (!this.showMemberDropdown)
      this.setState({showMemberDropdown:false});
  },
  cancelBtnClickHandler: function(id) {
    this.cancelChange(id);
    if (!this.showMemberDropdown)
      this.setState({showMemberDropdown:false});
  },
  saveIter: function(id) {
    iterData[id] = $('#'+id).html()
    $('#'+id).parent().children('.home-iter-content-btn').css('display','none')
    $('#'+id).css('background-color', '').css('border', '');
    $('#'+id).prop('contenteditable', 'false');
    this.recalculate(id);
  },
  cancelChange: function(id) {
    $('#'+id).parent().children('.home-iter-content-btn').css('display','none')
    $('#'+id).css('background-color', '').css('border', '');
    $('#'+id).html(iterData[id]);
    $('#'+id).prop('contenteditable', 'false');
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
    switch (id){
      case 'personDaysUnavailable':
        selectedIter = this.updateAvailability(selectedIter);
        selectedIter[id] = $('#'+id).html();
        break;
      case 'defectsStartBal':
      case 'defects':
      case 'defectsClosed':
        selectedIter = this.updateDefect(selectedIter);
        selectedIter[id] = $('#'+id).html();
        break;
      case 'deliveredStories':
        this.updateStories(selectedIter);
        selectedIter[id] = $('#'+id).html();
        break;
      case 'storyPointsDelivered':
        this.updateStoryPoints(selectedIter);
        selectedIter[id] = $('#'+id).html();
        break;
      case 'memberChanged':
        selectedIter['memberChanged'] = $('#memberChanged').val();
        break;
    }
    this.props.updateTeamIteration(selectedIter);
  },

  updateAvailability: function(selectedIter){
    if (selectedIter.personDaysUnavailable != $('#personDaysUnavailable').text()){
      var isAllowed = this.isWithinIteration(selectedIter.startDate,selectedIter.endDate);
      if (isAllowed){
        //recalculate team availability only if current date is within iteration
        var maxWorkDays = business.weekDays(moment(selectedIter.startDate, 'YYYY-MM-DD'),moment(selectedIter.endDate, 'YYYY-MM-DD'));
        selectedIter.teamAvailability = this.getOptimumAvailability(maxWorkDays);
      }
      selectedIter.personDaysUnavailable = $('#personDaysUnavailable').text();
      selectedIter.personDaysAvailable = (selectedIter.teamAvailability - selectedIter.personDaysUnavailable).toFixed(1);
    }
    return selectedIter;
  },

  updateDefect : function(selectedIter){
    var openDefects = this.numericValue($('#defectsStartBal').text());
    var newDefects = this.numericValue($('#defects').text());
    var closedDefects = this.numericValue($('#defectsClosed').text());
    var defectsEndBal = openDefects + newDefects - closedDefects;
      
    selectedIter['defectsEndBal'] = defectsEndBal;
    return selectedIter;
  },

  updateStories: function(selectedIter){
    $('#storiesDays').text((this.numericValue($('#deliveredStories').text())/this.numericValue(selectedIter.personDaysAvailable)).toFixed(1));
  },

  updateStoryPoints: function(selectedIter){
    $('#storyPointsDays').text((this.numericValue($('#storyPointsDelivered').text())/this.numericValue(selectedIter.personDaysAvailable)).toFixed(1));
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
        storiesDays = (this.numericValue(iterData.deliveredStories)/this.numericValue(iterData.personDaysAvailable)).toFixed(1);
        storyPointsDays = (this.numericValue(iterData.storyPointsDelivered)/this.numericValue(iterData.personDaysAvailable)).toFixed(1);
        var access = self.props.loadDetailTeam.access;
        var memberChangeDropdown;
        if (this.state.showMemberDropdown){
          memberChangeDropdown = 
            (<div className='home-iter-member-change'>
               <select id='memberChanged' defaultValue={defIter.memberChanged}>
                 <option key='Yes' value={true}>Yes</option>
                 <option key='No' value={false}>No</option>
              </select>
            </div>)
        }
        else {
          memberChangeDropdown = (<div id='memberChanged' class='home-iter-content-point home-iter-content-point-hover' onClick={access?this.memberChangeClickHandler:''}>{iterData.memberChanged}</div>)
        }
        return (
          <div>
            <div class='home-iter-title'>Iteration Overview</div>
            <div class='home-iter-selection-block'>
              <div class='iter-select'>
                <select value={defIterId} id='homeIterSelection' onChange={this.props.iterChangeHandler}>
                  {iterations}
                </select>
              </div>
              <div class='home-iter-add-btn-block' onClick={this.showAddIteration} style={{'cursor':'pointer'}}>
                <InlineSVG src={require('../../../img/Att-icons/att-icons_Add.svg')}></InlineSVG>
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
                <div class='home-iter-content-sub'>Optimum team availability (In days)</div>
                <div id='optimumPoint' class='home-iter-content-point-uneditable'>{iterData.teamAvailability}</div>
                  <div class='home-iter-locked-btn'>
                    <InlineSVG src={require('../../../img/Att-icons/att-icons_locked.svg')}></InlineSVG>
                  </div>
              </div>
              <div class='home-iter-content-col' style={{'height': '20%'}}>
                <div class='home-iter-content-sub'>Person days unavailable</div>
                <div id='personDaysUnavailable' class='home-iter-content-point home-iter-content-point-hover' onClick={access?this.iterBlockClickHandler:''}>{iterData.personDaysUnavailable}</div>
                <div class='home-iter-content-btn' onClick={this.saveBtnClickHandler.bind(null, 'personDaysUnavailable')}>
                  <InlineSVG src={require('../../../img/Att-icons/att-icons_confirm.svg')}></InlineSVG>
                </div>
                <div class='home-iter-content-btn' style={{'right':'-19%'}} onClick={this.cancelBtnClickHandler.bind(null, 'personDaysUnavailable')}>
                  <InlineSVG src={require('../../../img/Att-icons/att-icons_close-cancel.svg')}></InlineSVG>
                </div>
              </div>
              <div class='home-iter-content-col' style={{'height': '20%'}}>
                <div class='home-iter-content-sub'>Was there a team member change?</div>
                {memberChangeDropdown}
                  <div class='home-iter-content-btn' onClick={this.saveBtnClickHandler.bind(null, 'memberChanged')}>
                    <InlineSVG src={require('../../../img/Att-icons/att-icons_confirm.svg')}></InlineSVG>
                  </div>
                  <div class='home-iter-content-btn' style={{'right':'-19%'}} onClick={this.cancelBtnClickHandler.bind(null, 'memberChanged')}>
                    <InlineSVG src={require('../../../img/Att-icons/att-icons_close-cancel.svg')}></InlineSVG>
                  </div>
              </div>
              <div class='home-iter-content-col' style={{'height': '20%'}}>
                <div class='home-iter-content-sub'>Person days available</div>
                <div id='personDays' class='home-iter-content-point-uneditable'>{iterData.personDaysAvailable}</div>
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
                <div id='storiesDays' class='home-iter-content-point-uneditable'>{storiesDays}</div>
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
                <div id='storyPointsDays' class='home-iter-content-point-uneditable'>{storyPointsDays}</div>
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
                <div id='defectsEndBal' class='home-iter-content-point-uneditable'>{iterData.defectsEndBal}</div>
                  <div class='home-iter-locked-btn'>
                    <InlineSVG src={require('../../../img/Att-icons/att-icons_locked.svg')}></InlineSVG>
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
