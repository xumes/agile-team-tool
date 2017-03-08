var React = require('react');
var api = require('../api.jsx');
var InlineSVG = require('svg-inline-react');
var _ = require('underscore');
var moment = require('moment');
var business = require('moment-business');
var HomeAddIteration = require('./HomeAddIteration.jsx');
var HomeEditIteration = require('./HomeEditIteration.jsx');
var Tooltip = require('react-tooltip');
var utils = require('../utils.jsx');
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
      editIteration: false,
      selectedField:'',
      selectedIter: new Object()
    }
  },
  componentDidMount: function(){
    var data = this.getSelectedIteration();
    if (data != null){
      this.setState({selectedIter: data});
    }
  },

  componentWillReceiveProps: function(nextProps){
    var prev = this.getSelectedIteration();
    var next = this.getSelectedIteration(nextProps);
    if (!_.isEqual(this.props.loadDetailTeam.iterations, nextProps.loadDetailTeam.iterations) ||
     !_.isEqual(prev, next)){      
      this.setState({selectedIter: next});
    }
  },
  
  componentDidUpdate: function(prevProps, prevState) {
    if (!_.isEmpty(this.state.selectedIter) && prevState.selectedIter._id != this.state.selectedIter._id
    || !_.isEqual(this.props.loadDetailTeam.iterations, prevProps.loadDetailTeam.iterations)){
      var data = this.getSelectedIteration();
        this.setState({selectedIter: data});
    }
    var self = this;
    $('select[id="homeIterSelection"]').select2();
    $('select[id="homeIterSelection"]').change(self.props.iterChangeHandler);
    
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
    if ($('#'+id).val() != this.state.selectedIter[id]){
      var iterationData = this.recalculate(id);
      this.props.updateTeamIteration(iterationData);
      this.setState({selectedField:'', selectedIter:iterationData});
    }
  },
  cancelChange: function(id) {
    this.setState({selectedField:''});
  },

  showAddIteration: function() {
    if (!this.state.createIteration)
      this.setState({createIteration: true});
  },

  showEditIteration: function() {
    if (!this.state.editIteration)
      this.setState({editIteration: true});
  },

  closeIteration: function(){
    this.setState({createIteration: false, editIteration: false});
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
        openDefects = utils.numericValue($('#defectsStartBal').val());
        newDefects = utils.numericValue($('#defects').text());
        closedDefects = utils.numericValue($('#defectsClosed').text());
        defectsEndBal = openDefects + newDefects - closedDefects;
        selectedIter['defectsEndBal'] = defectsEndBal;
        break;
      case 'defects':
        openDefects = utils.numericValue($('#defectsStartBal').text());
        newDefects = utils.numericValue($('#defects').val());
        closedDefects = utils.numericValue($('#defectsClosed').text());
        defectsEndBal = openDefects + newDefects - closedDefects;
        selectedIter['defectsEndBal'] = defectsEndBal;
        break;
      case 'defectsClosed':
        openDefects = utils.numericValue($('#defectsStartBal').text());
        newDefects = utils.numericValue($('#defects').text());
        closedDefects = utils.numericValue($('#defectsClosed').val());
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
     utils.getOptimumAvailability(maxWorkDays, selectedIter.teamId)
     .then(function(result){
        selectedIter.teamAvailability = result;
        return;
     })
     .catch(function(err){
       console.log(err);
     });
    }
    selectedIter.personDaysAvailable = (selectedIter.teamAvailability - selectedIter.personDaysUnavailable).toFixed(2);
    return selectedIter;
  },

  updateStories: function(selectedIter){
    $('#storiesDays').text((utils.numericValue($('#deliveredStories').val())/this.float2Decimal(selectedIter.personDaysAvailable)).toFixed(1));
  },

  updateStoryPoints: function(selectedIter){
    $('#storyPointsDays').text((utils.numericValue($('#storyPointsDelivered').val())/this.float2Decimal(selectedIter.personDaysAvailable)).toFixed(1));
  },

  float2Decimal:function(val) {
    var value = parseFloat(val);
    if (!isNaN(value)) {
      return value.toFixed(2);
    }
    else {
      return 0.00;
    }
  },

  float1Decimal:function(val) {
    var value = parseFloat(val);
    if (!isNaN(value)) {
      return value.toFixed(1);
    }
    else {
      return 0.0;
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
      this.saveIter(e.target.id);
    }
  },

  roundOff2Decimal:function(e) {
    var value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      value = value.toFixed(2);
      e.target.value = value;
      this.saveIter(e.target.id);
    }
  },

  resetTeamAvailability: function(){
    
    var self = this;
    var selectedIter;
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
    var maxWorkDays = business.weekDays(moment(selectedIter.startDate, 'YYYY-MM-DD'),moment(selectedIter.endDate, 'YYYY-MM-DD'));
    utils.getOptimumAvailability(maxWorkDays, selectedIter.teamId)
    .then(function(result){
      if (confirm('You are about to overwrite the contents of ‘Optimum team availability’ with '+result+'.  Do you want to continue?')){
        selectedIter.teamAvailability = result;
        selectedIter.personDaysAvailable = (selectedIter.teamAvailability - self.float2Decimal(selectedIter.personDaysUnavailable)).toFixed(2);
        self.props.updateTeamIteration(selectedIter);
        self.setState({selectedField:''});
      }
    })
    .catch(function(err){
      console.log(err);
    });    
  },

  getSelectedIteration: function(data){
    var self = this;
    var defIterId = null;
    if (data != null){
      if (!_.isEmpty(data.loadDetailTeam.iterations) && data.loadDetailTeam.iterations.length > 0) {
        if (data.selectedIter != '') {
          defIterId = data.selectedIter;
        } else {
          defIterId = data.loadDetailTeam.iterations[0]._id.toString();
        }
        var defIter = _.find(data.loadDetailTeam.iterations, function(iter){
          if (iter._id.toString() == defIterId) {
            return iter;
          }
        });
      }
    }
    else if (!_.isEmpty(self.props.loadDetailTeam.iterations) && self.props.loadDetailTeam.iterations.length > 0) {
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
      }
    return defIter;
  },

  handleChange: function(e){    
    var temp = _.clone(this.state.selectedIter);
    temp[e.target.id] = e.target.value;
    this.setState({selectedIter:temp});
  },

  updateSelectedIteration: function(iterData){
    if (!_.isEqual(this.state.selectedIter, selectedIter)){
      this.setState({selectedIter:iterData});
    }
    
  },

  render: function() {
    var self = this;
    if (_.isEmpty(self.props.loadDetailTeam) || self.props.loadDetailTeam.team.type != 'squad') {
      return null;
    } else {
      var iterations = null;
      var defIterId = '';
      var access = this.props.loadDetailTeam.access;
      if (!_.isEmpty(self.props.loadDetailTeam.iterations) && self.props.loadDetailTeam.iterations.length > 0) {
        iterations = self.props.loadDetailTeam.iterations.map(function(iter){
          iterName =iter.name + ' (' + moment(iter.startDate).format('DD MMM YYYY') + ' - ' + moment(iter.endDate).format('DD MMM YYYY') + ')';
          return (
            <option key={iter._id} value={iter._id}>{iterName}</option>
          )
        });
        var defIter = this.state.selectedIter;
        var lastUpdatedBy = defIter.updatedBy;
        var lastUpdateTime = moment(defIter.updateDate).format('MMM DD YYYY');
        if (_.isEqual(defIter.memberChanged,true) || _.isEqual(defIter.memberChanged,'true')) {
          iterData.memberChanged = 'Yes';
        } else {
          iterData.memberChanged = 'No';
        }

        if (defIter.status === 'Completed' && _.isNull(defIter.teamAvailability)){
          iterData.teamAvailability = 'N/A';
          iterData.personDaysUnavailable = 'N/A';
          iterData.personDaysAvailable = 'N/A';
          storiesDays = 'N/A';
          storyPointsDays = 'N/A';
        }
        else{
          iterData.teamAvailability = !_.isNull(defIter.teamAvailability)? this.float2Decimal(defIter.teamAvailability): '0.00';
          iterData.personDaysUnavailable = !_.isNull(defIter.personDaysUnavailable)? this.float2Decimal(defIter.personDaysUnavailable): '0.00';
          iterData.personDaysAvailable = !_.isNull(defIter.personDaysAvailable)? this.float2Decimal(defIter.personDaysAvailable) : '0.00' ;
          storiesDays = this.float2Decimal(defIter.deliveredStories)/this.float2Decimal(iterData.personDaysAvailable);
          storiesDays = !isFinite(storiesDays) ? '0.0': storiesDays.toFixed(1);
          storyPointsDays = this.float2Decimal(defIter.storyPointsDelivered)/this.float2Decimal(iterData.personDaysAvailable);
          storyPointsDays = !isFinite(storyPointsDays) ? '0.0': storyPointsDays.toFixed(1);
        }
        iterData.name = defIter.name;
        iterData.startDate = moment(defIter.startDate).format('DD MMM YYYY');
        iterData.endDate = moment(defIter.endDate).format('DD MMM YYYY');
        iterData.memberFte = (defIter.memberFte == null) ? '' : defIter.memberFte;
        iterData.committedStories = utils.numericValue(defIter.committedStories);
        iterData.deliveredStories = utils.numericValue(defIter.deliveredStories);
        iterData.committedStoryPoints =utils.numericValue(defIter.committedStoryPoints);
        iterData.storyPointsDelivered = utils.numericValue(defIter.storyPointsDelivered);
        iterData.deployments = utils.numericValue(defIter.deployments);
        iterData.defectsStartBal = utils.numericValue(defIter.defectsStartBal);
        iterData.defects = utils.numericValue(defIter.defects);
        iterData.defectsClosed = utils.numericValue(defIter.defectsClosed);
        iterData.defectsEndBal = utils.numericValue(defIter.defectsEndBal);
        iterData.cycleTimeWIP = _.isNull(defIter.cycleTimeWIP) || _.isUndefined(defIter.cycleTimeWIP) ? '0.0' : this.float1Decimal(defIter.cycleTimeWIP);
        iterData.cycleTimeInBacklog = _.isNull(defIter.cycleTimeInBacklog) || _.isUndefined(defIter.cycleTimeInBacklog) ? '0.0' : this.float1Decimal(defIter.cycleTimeInBacklog);
        iterData.clientSatisfaction = _.isNull(defIter.clientSatisfaction) || _.isUndefined(defIter.clientSatisfaction) ? '0.0' : this.float1Decimal(defIter.clientSatisfaction);
        iterData.teamSatisfaction = _.isNull(defIter.teamSatisfaction) || _.isUndefined(defIter.teamSatisfaction) ? '0.0' : this.float1Decimal(defIter.teamSatisfaction);
        iterData.comment = (defIter.comment == null) ? '' : defIter.comment;

        return (
          <div>
            <div class='home-iter-title'>Iteration Overview</div>
            <Tooltip html={true} type="light"/>
            <div class='home-iter-selection-block'>
              <div class='iter-select'>
                <select value={defIter._id} id='homeIterSelection' onChange={this.props.iterChangeHandler} ref="homeIterSelection">
                  {iterations}
                </select>
              </div>
              <div class={access?'home-iter-add-btn-block':'home-iter-add-btn-block-disabled'} onClick={access?this.showAddIteration:''} style={access?{'cursor':'pointer'}:{'cursor':'default'}}>
                <InlineSVG src={require('../../../img/Att-icons/att-icons_Add.svg')} data-tip='Create New Iteration'></InlineSVG>
              </div>
            </div>
            <HomeAddIteration isOpen={this.state.createIteration} onClose={this.closeIteration} loadDetailTeam={self.props.loadDetailTeam} iterListHandler={this.props.iterListHandler}/>
            
            <div class='home-iter-name-block' style={{'height':'5%'}}>
              <div class='home-iter-content-title' id='iteration-name'>{iterData.name}</div>
              <div class='home-iter-team-date' id='iteration-date'>{iterData.startDate} - {iterData.endDate}</div>
              <div class={access?'home-iter-edit-btn-block':'home-iter-edit-btn-block-disabled'} onClick={access?this.showEditIteration:''} style={access?{'cursor':'pointer'}:{'cursor':'default'}}>
                <InlineSVG src={require('../../../img/Att-icons/att-icons_edit.svg')} data-tip='Edit Iteration Name/Date'></InlineSVG>
              </div>
              <div class="ibm-rule ibm-alternate" style={{'width':'96%','marginTop':'1em'}}>
                <hr />
              </div>
            </div>
            <HomeEditIteration isOpen={this.state.editIteration} onClose={this.closeIteration} selectedIter={this.state.selectedIter} iterListHandler={this.props.iterListHandler}/>
            
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
                <div class={access?'home-iter-team-availability':'home-iter-team-availability-disabled'}>
                  <InlineSVG src={require('../../../img/Att-icons/att-icons_team-reset.svg')} data-tip='Reset your Sprint Availability based on your current Team Member structure.' onClick={this.resetTeamAvailability}></InlineSVG>
                </div>
              </div>
              <div class='home-iter-content-col' style={{'height': '20%'}}>
                <div class='home-iter-content-sub' data-tip='The number of person days team members will be unavailable to work on team deliverables due to holidays, vacation/leave, education, illness.'>Person days unavailable</div>
                {this.state.selectedField === 'personDaysUnavailable'?
                  <input id='personDaysUnavailable' class='home-iter-content-point' onKeyPress={this.decimalNumCheck} onBlur={this.roundOff2Decimal} defaultValue={iterData.personDaysUnavailable} onPaste={this.paste} />:
                  <div id='personDaysUnavailable' class='home-iter-content-point home-iter-content-point-hover' onClick={access?this.iterBlockClickHandler:''}>{iterData.personDaysUnavailable}</div>
                }
                {this.state.selectedField === 'personDaysUnavailable'?
                  <div>
                    <div class='home-iter-content-btn' onClick={this.saveBtnClickHandler.bind(null, 'personDaysUnavailable')}>
                      <InlineSVG src={require('../../../img/Att-icons/att-icons_confirm.svg')}></InlineSVG>
                    </div>
                    <div class='home-iter-content-btn' style={{'right':'-19.1%'}} onClick={this.cancelBtnClickHandler.bind(null, 'personDaysUnavailable')}>
                      <InlineSVG src={require('../../../img/Att-icons/att-icons_close-cancel.svg')}></InlineSVG>
                    </div>
                  </div>:''
                }
              </div>
              <div class='home-iter-content-col' style={{'height': '20%'}}>
                <div class='home-iter-content-sub' data-tip='Indicate if there was a change to the team’s makeup during this iteration. Changes might include adding, replacing, removing members or changing a team member’s allocation % that you feel is significant enough to be noted.  Indicating a team change might help to explain a higher/lower team productivity when compared to other iterations.'>Was there a team change?</div>
                {this.state.selectedField === 'memberChanged'?
                  <div className='home-iter-member-change'>
                    <select id='memberChanged' defaultValue={defIter.memberChanged} onBlur={this.saveBtnClickHandler.bind(null,'memberChanged')}>
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
                    <div class='home-iter-content-btn' style={{'right':'-19.1%'}} onClick={this.cancelBtnClickHandler.bind(null, 'memberChanged')}>
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
                  <input id='committedStories' class='home-iter-content-point' onKeyPress={this.wholeNumberCheck} onBlur={this.saveBtnClickHandler.bind(null,'committedStories')} defaultValue={iterData.committedStories} onPaste={this.paste} />:
                  <div id='committedStories' class='home-iter-content-point home-iter-content-point-hover' onClick={access?this.iterBlockClickHandler:''}>{iterData.committedStories}</div>
                }
                {this.state.selectedField === 'committedStories'?
                  <div>
                    <div class='home-iter-content-btn' onClick={this.saveBtnClickHandler.bind(null, 'committedStories')}>
                      <InlineSVG src={require('../../../img/Att-icons/att-icons_confirm.svg')}></InlineSVG>
                    </div>
                    <div class='home-iter-content-btn' style={{'right':'-19.1%'}} onClick={this.cancelBtnClickHandler.bind(null, 'committedStories')}>
                      <InlineSVG src={require('../../../img/Att-icons/att-icons_close-cancel.svg')}></InlineSVG>
                    </div>
                  </div>:''
                }
              </div>
              <div class='home-iter-content-col' style={{'height': '25%'}}>
                <div class='home-iter-content-sub' data-tip='Primarily for Operations teams, this is the actual number of Stories, Cards or Tickets the team was able to deliver for this iteration period.'>Stories/Cards/Tickets-Delivered</div>
                {this.state.selectedField === 'deliveredStories'?
                  <input id='deliveredStories' class='home-iter-content-point' onKeyPress={this.wholeNumberCheck} onBlur={this.saveBtnClickHandler.bind(null,'deliveredStories')} defaultValue={iterData.deliveredStories} onPaste={this.paste} />:
                  <div id='deliveredStories' class='home-iter-content-point home-iter-content-point-hover' onClick={access?this.iterBlockClickHandler:''}>{iterData.deliveredStories}</div>
                }
                {this.state.selectedField === 'deliveredStories'?
                  <div>
                    <div class='home-iter-content-btn' onClick={this.saveBtnClickHandler.bind(null, 'deliveredStories')}>
                      <InlineSVG src={require('../../../img/Att-icons/att-icons_confirm.svg')}></InlineSVG>
                    </div>
                    <div class='home-iter-content-btn' style={{'right':'-19.1%'}} onClick={this.cancelBtnClickHandler.bind(null, 'deliveredStories')}>
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
                  <input id='committedStoryPoints' class='home-iter-content-point' onKeyPress={this.wholeNumberCheck} onBlur={this.saveBtnClickHandler.bind(null,'committedStoryPoints')} defaultValue={iterData.committedStoryPoints} onPaste={this.paste} />:
                  <div id='committedStoryPoints' class='home-iter-content-point home-iter-content-point-hover' onClick={access?this.iterBlockClickHandler:''}>{iterData.committedStoryPoints}</div>
                }
                {this.state.selectedField === 'committedStoryPoints'?
                  <div>
                    <div class='home-iter-content-btn' onClick={this.saveBtnClickHandler.bind(null, 'committedStoryPoints')}>
                      <InlineSVG src={require('../../../img/Att-icons/att-icons_confirm.svg')}></InlineSVG>
                    </div>
                    <div class='home-iter-content-btn' style={{'right':'-19.1%'}} onClick={this.cancelBtnClickHandler.bind(null, 'committedStoryPoints')}>
                      <InlineSVG src={require('../../../img/Att-icons/att-icons_close-cancel.svg')}></InlineSVG>
                    </div>
                  </div>:''
                }
              </div>
              <div class='home-iter-content-col' style={{'height': '20%'}}>
                <div class='home-iter-content-sub' data-tip='Primarily for Delivery teams, this is the actual number of Story points the team was able to deliver for this iteration period.'>Story points delivered</div>
                {this.state.selectedField === 'storyPointsDelivered'?
                  <input id='storyPointsDelivered' class='home-iter-content-point' onKeyPress={this.wholeNumberCheck} onBlur={this.saveBtnClickHandler.bind(null,'storyPointsDelivered')} defaultValue={iterData.storyPointsDelivered} onPaste={this.paste} />:
                  <div id='storyPointsDelivered' class='home-iter-content-point home-iter-content-point-hover' onClick={access?this.iterBlockClickHandler:''}>{iterData.storyPointsDelivered}</div>
                }
                {this.state.selectedField === 'storyPointsDelivered'?
                  <div>
                    <div class='home-iter-content-btn' onClick={this.saveBtnClickHandler.bind(null, 'storyPointsDelivered')}>
                      <InlineSVG src={require('../../../img/Att-icons/att-icons_confirm.svg')}></InlineSVG>
                    </div>
                    <div class='home-iter-content-btn' style={{'right':'-19.1%'}} onClick={this.cancelBtnClickHandler.bind(null, 'storyPointsDelivered')}>
                      <InlineSVG src={require('../../../img/Att-icons/att-icons_close-cancel.svg')}></InlineSVG>
                    </div>
                  </div>:''
                }
              </div>
              <div class='home-iter-content-col' style={{'height': '20%'}}>
                <div class='home-iter-content-sub' data-tip='The number of code drops moved to production for this iteration. (Ex. If 3 enhancements/defects went into production on a single ‘push’, this is one deployment.)'>Deployments this iteration</div>
                {this.state.selectedField === 'deployments'?
                  <input id='deployments' class='home-iter-content-point' onKeyPress={this.wholeNumberCheck} onBlur={this.saveBtnClickHandler.bind(null,'deployments')} defaultValue={iterData.deployments} onPaste={this.paste} />:
                  <div id='deployments' class='home-iter-content-point home-iter-content-point-hover' onClick={access?this.iterBlockClickHandler:''}>{iterData.deployments}</div>
                }
                {this.state.selectedField === 'deployments'?
                  <div>
                    <div class='home-iter-content-btn' onClick={this.saveBtnClickHandler.bind(null, 'deployments')}>
                      <InlineSVG src={require('../../../img/Att-icons/att-icons_confirm.svg')}></InlineSVG>
                    </div>
                    <div class='home-iter-content-btn' style={{'right':'-19.1%'}} onClick={this.cancelBtnClickHandler.bind(null, 'deployments')}>
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
                  <input id='defectsStartBal' class='home-iter-content-point' onKeyPress={this.wholeNumberCheck} onBlur={this.saveBtnClickHandler.bind(null,'defectsStartBal')} defaultValue={iterData.defectsStartBal} onPaste={this.paste} />:
                  <div id='defectsStartBal' class='home-iter-content-point home-iter-content-point-hover' onClick={access?this.iterBlockClickHandler:''}>{iterData.defectsStartBal}</div>
                }
                {this.state.selectedField === 'defectsStartBal'?
                  <div>
                    <div class='home-iter-content-btn' onClick={this.saveBtnClickHandler.bind(null, 'defectsStartBal')}>
                      <InlineSVG src={require('../../../img/Att-icons/att-icons_confirm.svg')}></InlineSVG>
                    </div>
                    <div class='home-iter-content-btn' style={{'right':'-19.1%'}} onClick={this.cancelBtnClickHandler.bind(null, 'defectsStartBal')}>
                      <InlineSVG src={require('../../../img/Att-icons/att-icons_close-cancel.svg')}></InlineSVG>
                    </div>
                  </div>:''
                }
              </div>
              <div class='home-iter-content-col' style={{'height': '20%'}}>
                <div class='home-iter-content-sub' data-tip='This is the number of production defects discovered during this iteration.'>New this iteration</div>
                {this.state.selectedField === 'defects'?
                  <input id='defects' class='home-iter-content-point' onKeyPress={this.wholeNumberCheck} onBlur={this.saveBtnClickHandler.bind(null,'defects')} defaultValue={iterData.defects} onPaste={this.paste} />:
                  <div id='defects' class='home-iter-content-point home-iter-content-point-hover' onClick={access?this.iterBlockClickHandler:''}>{iterData.defects}</div>
                }
                {this.state.selectedField === 'defects'?
                  <div>
                    <div class='home-iter-content-btn' onClick={this.saveBtnClickHandler.bind(null, 'defects')}>
                      <InlineSVG src={require('../../../img/Att-icons/att-icons_confirm.svg')}></InlineSVG>
                    </div>
                    <div class='home-iter-content-btn' style={{'right':'-19.1%'}} onClick={this.cancelBtnClickHandler.bind(null, 'defects')}>
                      <InlineSVG src={require('../../../img/Att-icons/att-icons_close-cancel.svg')}></InlineSVG>
                    </div>
                  </div>:''
                }
              </div>
              <div class='home-iter-content-col' style={{'height': '20%'}}>
                <div class='home-iter-content-sub' data-tip='This is the number of production defects resolved during this iteration.  In some situations, depending on the type of team, this might also include defects transferred to another team.'>Resolved this iteration</div>
                {this.state.selectedField === 'defectsClosed'?
                  <input id='defectsClosed' class='home-iter-content-point' onKeyPress={this.wholeNumberCheck} onBlur={this.saveBtnClickHandler.bind(null,'defectsClosed')} defaultValue={iterData.defectsClosed} onPaste={this.paste} />:
                  <div id='defectsClosed' class='home-iter-content-point home-iter-content-point-hover' onClick={access?this.iterBlockClickHandler:''}>{iterData.defectsClosed}</div>
                }
                {this.state.selectedField === 'defectsClosed'?
                  <div>
                    <div class='home-iter-content-btn' onClick={this.saveBtnClickHandler.bind(null, 'defectsClosed')}>
                      <InlineSVG src={require('../../../img/Att-icons/att-icons_confirm.svg')}></InlineSVG>
                    </div>
                    <div class='home-iter-content-btn' style={{'right':'-19.1%'}} onClick={this.cancelBtnClickHandler.bind(null, 'defectsClosed')}>
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
                    <div class='home-iter-content-btn' style={{'right':'-19.1%'}} onClick={this.cancelBtnClickHandler.bind(null, 'cycleTimeWIP')}>
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
                    <div class='home-iter-content-btn' style={{'right':'-19.1%'}} onClick={this.cancelBtnClickHandler.bind(null, 'cycleTimeInBacklog')}>
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
                    <div class='home-iter-content-btn' style={{'right':'-19.1%'}} onClick={this.cancelBtnClickHandler.bind(null, 'clientSatisfaction')}>
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
                    <div class='home-iter-content-btn' style={{'right':'-19.1%'}} onClick={this.cancelBtnClickHandler.bind(null, 'teamSatisfaction')}>
                      <InlineSVG src={require('../../../img/Att-icons/att-icons_close-cancel.svg')}></InlineSVG>
                    </div>
                  </div>:''
                }
              </div>
            </div>
            <div class='home-iter-comment-block'>
              <div class='home-iter-content-title' data-tip='Enter any comments you feel are relevant to this iteration.  Perhaps it was something unplanned that affected the team’s deliverables, either positively or negatively.'>Iteration Comments</div>
              <textarea class='home-iter-comment-test' readOnly={!access} value={iterData.comment} onBlur={this.saveBtnClickHandler.bind(null, 'comment')} onChange={this.handleChange}  id='comment'/>:
            </div>
          </div>

        )
      } else {
        return (
          <div>
            <div class='home-iter-title'>Iteration Overview</div>
            <Tooltip html={true} type="light"/>
            <div class='home-iter-selection-block'>
              <div class='iter-select'>
                <select value={0} id='homeIterSelection'>
                  <option key={0} value={0}>{'No iteration results'}</option>
                </select>
              </div>
              <div class={access?'home-iter-add-btn-block':'home-iter-add-btn-block-disabled'} onClick={access?this.showAddIteration:''} style={access?{'cursor':'pointer'}:{'cursor':'default'}}>
                <InlineSVG src={require('../../../img/Att-icons/att-icons_Add.svg')} data-tip='Create New Iteration'></InlineSVG>
              </div>
            </div>
            <HomeAddIteration isOpen={this.state.createIteration} onClose={this.closeIteration} loadDetailTeam={this.props.loadDetailTeam} iterListHandler={this.props.iterListHandler}/>
          </div>
        )
      }
    }
  }
});

module.exports = HomeIterContent;
