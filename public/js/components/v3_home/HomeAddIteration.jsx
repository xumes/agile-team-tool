var React = require('react');
var api = require('../api.jsx');
var InlineSVG = require('svg-inline-react');
var ReactModal = require('react-modal');
var moment = require('moment');
var DatePicker = require('react-datepicker');
var CustomDate = require('./CustomDatePicker.jsx');

var initData = {
  'startDate':null,
  'endDate':null,
  'name':'',
  'teamId':'',
  'memberCount':'',
  'memberFte':'',
  'defectsStartBal':'',
  'storyPointsDelivered':'',
  'committedStoryPoints':'',
  'deliveredStories':'',
  'committedStories':''
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
      c_stories_op_delivered:false,
      c_stories_dev_delivered: false
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
    var name = this.props.loadDetailTeam.iterations[0].name + '(copy)';
    if (this.state.c_name && this.props.loadDetailTeam.iterations.length > 0) {
      this.startDateChange(new moment(this.props.loadDetailTeam.iterations[0].endDate).add(1,'day'));
    }
    this.setState({name: name, c_name: true});
    
  },

  close: function(){
    this.reset();
    this.setState({c_name: true});
    this.props.onClose();
  },

  startDateChange: function(date){
    var selectedStartDate = moment.utc(date);
    var selectedEndDate = moment.utc(this.state.iterationEndDate);
    if (selectedStartDate <= selectedEndDate) {
      this.clearFieldErrorHighlight('iterationStartDate');
      this.clearFieldErrorHighlight('iterationEndDate');
    }

    selectedEndDate = selectedStartDate.add(13,'day');
    this.setState({iterationStartDate: date, iterationEndDate:selectedEndDate});
  },

  endDateChange: function(date){
    var selectedStartDate = moment.utc(this.state.iterationStartDate);
    var selectedEndDate = moment.utc(date);
    if (selectedEndDate >= selectedStartDate) {
      this.clearFieldErrorHighlight('iterationStartDate');
      this.clearFieldErrorHighlight('iterationEndDate');
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

  showMessagePopup: function(message) {
    alert(message);
  },

  handleIterationErrors:function (errorResponse, operation) {
    var errorlist = '';
    var response = errorResponse.responseJSON;

    if (response && response.error) {
      var errors = response.error.errors;
      if (errors){
        // Return iteration errors as String
        errorlist = this.getIterationErrorPopup(errors);
        if (!_.isEmpty(errorlist)) {
          this.showMessagePopup(errorlist);
          if (operation === 'add') {
            this.setState({addBtnDisable: false});
          } else if (operation === 'update') {
            this.setState({updateBtnDisable: false});
          }
        }
      }
      else {
        this.showMessagePopup(response.error);
      }
    }
},

getIterationErrorPopup: function(errors) {
  var errorLists = '';
  // Model fields/Form element field
  var fields = {
    'name': 'iterationName',
    'startDate': 'iterationStartDate',
    'endDate': 'iterationEndDate'
  };

  Object.keys(fields).forEach(function(mdlField, index) {
    var frmElement = fields[mdlField];
    if (errors[mdlField]) {
      if (frmElement) {
        setFieldErrorHighlight(frmElement);
      }
      errorLists = errorLists + errors[mdlField].message + '\n';
    } else {
      if (frmElement) {
        clearFieldErrorHighlight(frmElement);
      }
    }
  });
    return errorLists;
  },

  setFieldErrorHighlight: function (id) {
    if ($('#' + value).is('select')) {
      $($('#select2-' + id + '-container').parent()).css('border-color', invalidBorder);
      $($('#select2-' + id + '-container').parent()).css('background', invalidBackground);
    }
    else {
      $('#' + id).css('border-color', invalidBorder);
      $('#' + id).css('background', invalidBackground);
    }
  },

  clearHighlightedIterErrors: function () {
    var fields = [
      'iterationName',
      'iterationStartDate',
      'iterationEndDate'
    ];

    for (j = 0; j < fields.length; j++) {
      this.clearFieldErrorHighlight(fields[j]);
    }
  },

  clearFieldErrorHighlight: function (id) {
    if ($('#' + id).is('select')) {
      $($('#select2-' + id + '-container').parent()).css('border-color', '');
      $($('#select2-' + id + '-container').parent()).css('background', '');
    }
    else {
      $('#' + id).css('border-color', '');
      $('#' + id).css('background', '');
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
    var currentTeam = this.props.loadDetailTeam.team;
    if (!_.isEmpty(currentTeam) && currentTeam.members) {
      count = currentTeam.members.length;
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

  processIteration: function () {
    var self =this;
    api.loadTeam(self.props.loadDetailTeam.team._id)
    .then(function(data) {
      if (data != undefined) {
        var jsonData = data;
        if (jsonData.type != undefined && jsonData.type.toLowerCase() != 'squad') {
          self.showMessagePopup('Team information has been changed to non squad.  Iteration information cannot be entered for non squad teams.');
          self.updateIterationInfo('clearIteration');
          return;
        }

          var data = _.clone(initData);
          data = self.populateCopyData(data);
          data.memberCount = self.teamMemCount();
          data.memberFte = self.teamMemFTE();
          data['teamId'] = self.props.loadDetailTeam.team._id;
          data['name'] = self.state.name;
          data['startDate'] = new Date(self.state.iterationStartDate);
          data['endDate'] = new Date(self.state.iterationEndDate);
          api.addIteration(data)
            .then(function(result) {
              self.clearHighlightedIterErrors();
              self.showMessagePopup('You have successfully added Iteration information.');
              self.props.iterListHandler();
              self.close();            
            })
            .catch(function(err){
              self.handleIterationErrors(err, 'add');
            });
      }
    });
  },

  copyNameChange: function(e){
    var copyName = '';
    if (e.target.checked && this.props.loadDetailTeam.iterations.length > 0) {
        copyName = this.props.loadDetailTeam.iterations[0].name + '(copy)';
    }
    this.setState({name: copyName, c_name: e.target.checked})
  },

  copyOpCommStories: function(e){
    this.setState({c_stories_op_committed : e.target.checked});
  },

  copyOpDelStories: function(e){
    this.setState({c_stories_op_delivered : e.target.checked});
  },

  copyDevCommStories: function(e){
    this.setState({c_stories_dev_committed : e.target.checked});
  },

  copyDevDelStories: function(e){
    this.setState({c_stories_dev_delivered: e.target.checked});
  },
  
  render: function() {
      return (
        <div>
         <ReactModal isOpen={this.props.isOpen} onRequestClose={this.close} className='home-iter-popup' overlayClassName='att-modal-overlay' shouldCloseOnOverlayClick={false} contentLabel='Add Iteration'>
            <div class='popup-title'>
                <h1>Add New Iteration</h1>
                <h2 onClick={this.close}>X</h2>
            </div>
            <div class='home-iter-add-content'>
              <div style={{'marginTop':'4%'}}>
                <p className='home-iter-main-section'>Iteration Name</p>                
                <input className='home-iter-text-field' id='iterationName' value={this.state.name} onChange={this.nameChange} type='text' style={{'marginTop':'5px'}}/>
              </div>
              <div style={{'marginTop':'5%'}}>
                <p className='home-iter-main-section'>Copy/Import From Last Iteration: </p>
                <div class='home-iter-category' id='importName'>             
                  <input id='cname' type='checkbox' checked={this.state.c_name} onChange={this.copyNameChange}/>
                  <label for='cname' className='home-iter-sub-section'>Name</label>
                </div>
              </div >
              <div style={{'marginTop':'2%'}}>
                <p className='home-iter-sub-section'>Stories/Cards (For Operations) from: </p>
                <div class='home-iter-category'>             
                  <input aria-label='Select action' id='cname' type='checkbox' checked={this.state.c_stories_op_committed} onChange={this.copyOpCommStories}/>
                  <label for='cname' className='home-iter-sub-section'>Committed</label>
                  <input aria-label='Select action' id='cname' type='checkbox' checked={this.state.c_stories_op_delivered} style={{'marginLeft':'5%'}} onChange={this.copyOpDelStories}/>
                  <label for='cname' className='home-iter-sub-section'>Delivered (into Committed)</label>
                </div>
              </div >
              <div style={{'marginTop':'2%'}}>
                <p className='home-iter-sub-section'>Story Points (For Development) from: </p>
                <div className='home-iter-category'>          
                  <input style={{'fontSize': '1.4em'}}aria-label='Select action' id='cname' type='checkbox' checked={this.state.c_stories_dev_committed} onChange={this.copyDevCommStories}/>
                  <label for='cname' className='home-iter-sub-section'>Committed</label>
                  <input aria-label='Select action' id='cname' type='checkbox' checked={this.state.c_stories_dev_delivered} style={{'marginLeft':'5%'}} onChange={this.copyDevDelStories}/>
                  <label for='cname' className='home-iter-sub-section'>Delivered (into Committed)</label>
                </div>
              </div > 
              <div style={{'marginTop':'5%'}}>
                <p className='home-iter-main-section'>Iteration Dates</p>
                  <div style={{'display':'flex'}} id='iterationDates'>
                    <DatePicker onChange={this.startDateChange} selected={this.state.iterationStartDate} readOnly dateFormat='DD MMM YYYY' customInput={<CustomDate fieldId='iterationStartDate' />} disabled={false} ref='iterationStartDate' fixedHeight/>
                    <p style={{'marginLeft':'5%', 'marginRight':'5%'}} className='home-iter-main-section'> to </p>
                    <DatePicker onChange={this.endDateChange} selected={this.state.iterationEndDate} readOnly dateFormat='DD MMM YYYY' customInput={<CustomDate fieldId='iterationEndDate' />} disabled={false} ref='iterationEndDate' fixedHeight/>
                  </div>
              </div>
                
              <div className='popup-btns'>
                <p class='ibm-btn-row ibm-button-link' style={{'position':'relative','float':'right'}}>
                  <a onClick={this.processIteration} class='ibm-btn-pri ibm-btn-small ibm-btn-blue-50'>Add</a>
                  <a onClick={this.close} class='ibm-btn-sec ibm-btn-small ibm-btn-blue-50'>Cancel</a>
                </p>
              </div>
          </div>
          </ReactModal>
          </div>
      )
  }
});
module.exports = HomeAddIteration;
