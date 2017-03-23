var React = require('react');
var api = require('../api.jsx');
var InlineSVG = require('svg-inline-react');
var ReactModal = require('react-modal');
var moment = require('moment');
var business = require('moment-business');
var DatePicker = require('react-datepicker');
var CustomDate = require('./CustomDatePicker.jsx');
var utils = require('../utils.jsx');

var initData = {
  'startDate':null,
  'endDate':null,
  'name':'',
  'teamId':'',
  'memberCount':'',
  'memberFte':'',
  'storyPointsDelivered':'',
  'committedStoryPoints':'',
  'deliveredStories':'',
  'committedStories':'',
  'teamAvailability':'',
  'personDaysUnavailable':'',
  'personDaysAvailable':''
};

var invalidBorder = '#f00';
var invalidBackground = '';


var HomeAddIteration = React.createClass({
  getInitialState: function() {
    return {
      iterationStartDate: null,
      iterationEndDate: null,
      name: '',
      c_name:true,
      c_stories_op_committed:false,
      c_stories_dev_committed:false,
      c_stories_op_delivered:true,
      c_stories_dev_delivered: true,
    }
  },

  componentDidMount: function(){
    this.reset();
  },

  componentDidUpdate: function(prevProps, prevState){
    if (prevProps.loadDetailTeam !== this.props.loadDetailTeam) {
      this.reset();
    }
  },

  reset: function(){
    if (this.props.loadDetailTeam.iterations.length > 0){
      var name = this.props.loadDetailTeam.iterations[0].name + ' (copy)';
      this.startDateChange(this.props.loadDetailTeam.iterations[0].endDate != null ?new moment(this.props.loadDetailTeam.iterations[0].endDate).add(1,'day'):null);
      this.setState({
        name: name, 
        c_name: true, 
        c_stories_op_committed:false,
        c_stories_dev_committed:false,
        c_stories_op_delivered:true,
        c_stories_dev_delivered: true});
    }
    else {
      this.setState({
      name: '', 
      c_name: false, 
      c_stories_op_committed:false,
      c_stories_dev_committed:false,
      c_stories_op_delivered:false,
      c_stories_dev_delivered: false,
      iterationStartDate: null,
      iterationEndDate: null});
    }
  },

  close: function(){
    this.reset();
    this.props.onClose();
  },

  startDateChange: function(date){
    var selectedStartDate = moment.utc(date);
    var selectedEndDate = moment.utc(this.state.iterationEndDate);
    if (selectedStartDate <= selectedEndDate) {
      utils.clearFieldErrorHighlight('startDate');
      utils.clearFieldErrorHighlight('endDate');
    }

    selectedEndDate = selectedStartDate.add(13,'day');
    this.setState({iterationStartDate: date, iterationEndDate:selectedEndDate});
  },

  endDateChange: function(date){
    var selectedStartDate = moment.utc(this.state.iterationStartDate);
    var selectedEndDate = moment.utc(date);
    if (selectedEndDate >= selectedStartDate) {
      utils.clearFieldErrorHighlight('startDate');
      utils.clearFieldErrorHighlight('endDate');
    }
    this.setState({iterationEndDate: selectedEndDate});
  },

  nameChange: function(e){
    this.setState({name: e.target.value});
  },

  updateIterationInfo: function(action){
    var self = this;
    if (action == 'add'){
      this.setState({addBtnDisable: true});
      this.processIteration();
    }
    else if (action == 'clearIteration') {
      if (action == 'clear'){
        var resetData = _.clone(initData);
        this.setState({iteration:resetData, enableFields: false, readOnlyAccess: false, addBtnDisable: true});
      }
    }
  },

  populateCopyData: function(data){
    if (this.props.loadDetailTeam.iterations.length > 0){
      if (this.state.c_stories_op_committed){
        data.committedStories = this.props.loadDetailTeam.iterations[0].committedStories;
      }
      if (this.state.c_stories_op_delivered){
        data.deliveredStories = this.props.loadDetailTeam.iterations[0].deliveredStories;
        
      }
      if (this.state.c_stories_dev_committed) {
        data.committedStoryPoints = this.props.loadDetailTeam.iterations[0].committedStoryPoints;
      }
      if (this.state.c_stories_dev_delivered){
        data.storyPointsDelivered = this.props.loadDetailTeam.iterations[0].storyPointsDelivered;
      }
    }
    return data;
  },

  teamMemCount: function () {
    var count = 0;
    var tmArr = [];
    var currentTeam = this.props.loadDetailTeam.team;
    if (!_.isEmpty(currentTeam) && currentTeam.members) {
       $.each(currentTeam.members, function(key, member) {
        if (tmArr.indexOf(member.userId) == -1) {
          count++;
          tmArr.push(member.userId);
        }
      });
    }
    return count;
  },

  teamMemFTE: function () {
    var fte = 0.0;
    var currentTeam = this.props.loadDetailTeam.team;
    if (!_.isEmpty(currentTeam) && currentTeam.members) {
      var teamCount = 0;
      var self = this;
      _.each(currentTeam.members, function(member) {
        teamCount += self.numericValue(member.allocation);
      });
      fte = parseFloat(teamCount / 100).toFixed(1);
    }
    return fte;
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

  
  processIteration: function () {
    var self =this;
    api.loadTeam(self.props.loadDetailTeam.team._id)
    .then(function(data) {
      if (data != undefined) {
        var jsonData = data;
        if (jsonData.type != undefined && jsonData.type.toLowerCase() != 'squad') {
          alert('Team information has been changed to non squad.  Iteration information cannot be entered for non squad teams.');
          self.updateIterationInfo('clearIteration');
          return;
        }

        var maxWorkDays = business.weekDays(moment.utc(self.state.iterationStartDate), moment.utc(self.state.iterationEndDate));
        if (!business.isWeekendDay(moment.utc(self.state.iterationEndDate))){
          maxWorkDays +=1;
        }
        utils.getOptimumAvailability(maxWorkDays, self.props.loadDetailTeam.team._id)
          .then(function(availability){
            var data = _.clone(initData);
            data = self.populateCopyData(data);
            data.memberCount = self.teamMemCount();
            data.memberFte = self.teamMemFTE();
            data['teamId'] = self.props.loadDetailTeam.team._id;
            data['name'] = self.state.name;
            data['startDate'] = new Date(self.state.iterationStartDate);
            data['endDate'] = new Date(self.state.iterationEndDate);
            data['teamAvailability'] = availability;
            data['personDaysUnavailable'] = '';
            data['personDaysAvailable'] = availability;
            return data;
          })
          .then(function(data){
            return api.addIteration(data);
          })
          .then(function(result) {
              utils.clearHighlightedIterErrors();
              alert('You have successfully added Iteration information.');
              self.props.iterListHandler();
              self.close();       
          })
          .catch(function(err){
            utils.handleIterationErrors(err);
          });
      }
    });
  },

  copyNameChange: function(e){
    var copyName = '';
    if (e.target.checked && this.props.loadDetailTeam.iterations.length > 0) {
        copyName = this.props.loadDetailTeam.iterations[0].name + ' (copy)';
    }
    this.setState({name: copyName, c_name: e.target.checked})
  },

  copyOpCommStories: function(e){
    if (e.target.checked && this.state.c_stories_op_delivered )
      this.setState({c_stories_op_committed : e.target.checked, c_stories_op_delivered: false});
    else
      this.setState({c_stories_op_committed : e.target.checked});
  },

  copyOpDelStories: function(e){
    if(e.target.checked && this.state.c_stories_op_committed)
      this.setState({c_stories_op_delivered : e.target.checked, c_stories_op_committed: false});
    else
      this.setState({c_stories_op_delivered : e.target.checked});
  },

  copyDevCommStories: function(e){
    if(e.target.checked && this.state.c_stories_dev_delivered)
      this.setState({c_stories_dev_committed : e.target.checked, c_stories_dev_delivered: false});
    else
      this.setState({c_stories_dev_committed : e.target.checked});
  },

  copyDevDelStories: function(e){
    if (e.target.checked && this.state.c_stories_dev_committed)
      this.setState({c_stories_dev_delivered: e.target.checked, c_stories_dev_committed: false});
    else
      this.setState({c_stories_dev_delivered: e.target.checked});
  },
  
  render: function() {
      return (
        <div>
         <ReactModal isOpen={this.props.isOpen} onRequestClose={this.close} className='home-iter-popup' overlayClassName='att-modal-overlay' contentLabel='Add Iteration'>
            <div class='popup-title'>
              <h1>Add New Iteration</h1>
              <div onClick={this.close}>
                <InlineSVG src={require('../../../img/Att-icons/att-icons-close.svg')}></InlineSVG>
              </div>
            </div>
            <div class='home-iter-add-content'>
              <div className='home-iter-main'>
                <label className='home-iter-main-section'>Iteration Name</label>
                <input className='home-iter-text-field' id='name' value={this.state.name} onChange={this.nameChange} type='text'/>
              </div>
              <div className='home-iter-main'>
                <p className='home-iter-main-section' style={{'lineHeight': '0%'}}>Copy/Import From Last Iteration </p>
                <div className='home-iter-sub-section'>
                  <div class="checkbox">
                    <label for="cname">
                      <input type="checkbox" checked={this.state.c_name} onChange={this.copyNameChange} id="cname"/>
                      <span className='home-iter-sub-section-category'>Name</span>
                    </label>
                  </div>
                </div>
                <p className='home-iter-subdetail-section' style={{'lineHeight': '0%'}}>Stories/Cards (For Operations) from: </p>
                <div className='home-iter-sub-section'>
                  <div class="checkbox">
                    <label for="cstoriesopcom" style={{'display':'flex'}}>
                      <input type="checkbox" checked={this.state.c_stories_op_committed} onChange={this.copyOpCommStories} id="cstoriesopcom"/>
                      <span className='home-iter-sub-section-category'>Committed</span>
                    </label>
                  </div>
                  <span style={{'paddingLeft':'10%'}}/>
                  <div class="checkbox" >
                    <label for="cstoriesopdel" style={{'display':'flex'}}>
                      <input type="checkbox" checked={this.state.c_stories_op_delivered} onChange={this.copyOpDelStories} id="cstoriesopdel"/>
                      <span className='home-iter-sub-section-category' style={{'marginRight': '0.1em'}}>Delivered </span><span className='home-iter-sub-section-delivered'>(into Committed)</span>
                    </label>
                  </div>
                </div>
                <p className='home-iter-subdetail-section' style={{'lineHeight': '0%'}}>Story Points (For Development) from: </p>
                <div className='home-iter-sub-section'>
                  <div class="checkbox">
                    <label for="cstoriesdevcom">
                      <input type="checkbox" checked={this.state.c_stories_dev_committed} onChange={this.copyDevCommStories} id="cstoriesdevcom"/>
                      <span className='home-iter-sub-section-category'>Committed</span>
                    </label>
                  </div>
                  <span style={{'paddingLeft':'10%'}}/>
                  <div class="checkbox" >
                    <label for="cstoriesdevdel" style={{'display':'flex','textAlign':'center'}}>
                      <input type="checkbox" checked={this.state.c_stories_dev_delivered} onChange={this.copyDevDelStories} id="cstoriesdevdel"/>
                      <span className='home-iter-sub-section-category' style={{'marginRight': '0.1em'}}>Delivered </span> <span className='home-iter-sub-section-delivered'>(into Committed)</span>
                    </label>
                  </div>
                </div>
              </div >
              <div className='home-iter-main' style={{'width':'100%'}}>
                <p className='home-iter-main-section' style={{'lineHeight': '0%'}}>Iteration Dates</p>
                <div style={{'display':'flex', 'marginTop': '2%'}} id='iterationDates'>
                  <DatePicker onChange={this.startDateChange} selected={ this.state.iterationStartDate != null?moment.utc(this.state.iterationStartDate):null} readOnly dateFormat='DD MMM YYYY' customInput={<CustomDate fieldId='startDate' />} disabled={false} ref='iterationStartDate' fixedHeight/>
                  <p style={{'marginLeft':'5%', 'marginRight':'5%'}} className='home-iter-date-range'> to </p>
                  <DatePicker onChange={this.endDateChange} selected={ this.state.iterationEndDate != null? moment.utc(this.state.iterationEndDate):null} readOnly dateFormat='DD MMM YYYY' customInput={<CustomDate fieldId='endDate' />} disabled={false} ref='iterationEndDate' fixedHeight/>
                </div>
              </div>
                
              <div className='popup-btns'>
                <p class='ibm-btn-row ibm-button-link' style={{'position':'relative','float':'right'}}>
                  <a onClick={this.processIteration} class='ibm-btn-pri ibm-btn-small ibm-btn-blue-50' style={{'padding':'4%'}}>Add</a>
                  <a onClick={this.close} class='ibm-btn-sec ibm-btn-small ibm-btn-blue-50' style={{'padding':'4%'}}>Cancel</a>
                </p>
              </div>
          </div>
          </ReactModal>
          </div>
      )
  }
});
module.exports = HomeAddIteration;
