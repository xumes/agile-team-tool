var React = require('react');
var api = require('../api.jsx');
var InlineSVG = require('svg-inline-react');
var ReactModal = require('react-modal');
var moment = require('moment');
var DatePicker = require('react-datepicker');
var CustomDate = require('./CustomDatePicker.jsx');
var utils = require('../utils.jsx');
var ConfirmDialog = require('./ConfirmDialog.jsx');

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

var HomeEditIteration = React.createClass({
  getInitialState: function() {
    return {
      iterationStartDate: null,
      iterationEndDate: null,
      name: '',
      showConfirmModal: false,
      alertMsg: '',
      alertType: ''
    }
  },

  componentDidMount: function(){
    this.reset();
  },

  componentDidUpdate: function(prevProps, prevState){
    if (prevProps.selectedIter != this.props.selectedIter) {
      this.reset();
    }
  },

  reset: function(){
    if (this.props.selectedIter != null){
      var name = this.props.selectedIter.name;
      var startDate = new moment(this.props.selectedIter.startDate);
      var endDate = new moment(this.props.selectedIter.endDate);
      this.setState({
        name: name, 
        iterationStartDate: startDate,
        iterationEndDate: endDate});
    }
    else {
      this.setState({
      name: '',
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
    if (action == 'change'){
      this.processIteration();
    }
    else if (action == 'clearIteration') {
      if (action == 'clear'){
        var resetData = _.clone(initData);
        this.setState({iteration:resetData, enableFields: false, readOnlyAccess: false});
      }
    }
  },

  processIteration: function () {
    var self =this;
    api.loadTeam(self.props.selectedIter.teamId)
    .then(function(data) {
      if (data != undefined) {
        var jsonData = data;
        if (jsonData.type != undefined && jsonData.type.toLowerCase() != 'squad') {
          //alert('Team information has been changed to non squad.  Iteration information cannot be entered for non squad teams.');
          self.setState({alertMsg: 'Team information has been changed to non squad.  Iteration information cannot be entered for non squad teams.', showConfirmModal: true, alertType: 'error'}, 
            function(){
              self.updateIterationInfo('clearIteration');                
          });
          
          return;
        }
        var data = _.clone(self.props.selectedIter);
        data['name'] = self.state.name;
        data['startDate'] = new Date( moment.utc(self.state.iterationStartDate));
        data['endDate'] = new Date( moment.utc(self.state.iterationEndDate));
        return api.updateIteration(data);
      }
    })
    .then(function(result) {
      utils.clearHighlightedIterErrors();
      //alert('You have successfully updated Iteration information.');
      self.setState({alertMsg: 'You have successfully updated Iteration information.', showConfirmModal: true, alertType: 'information'}, 
        function(){
          self.props.iterListHandler(self.props.selectedIter._id);                  
        });
    })
    .catch(function(err){
      utils.handleIterationErrors(err);
    });
  },

  hideConfirmDialog: function() {
    this.setState({showConfirmModal: false, alertMsg: ''});
    this.close();
  },
  
  render: function() {
      return (
        <div>
         <ReactModal isOpen={this.props.isOpen} onRequestClose={this.close} className='home-iter-popup' overlayClassName='att-modal-overlay' contentLabel='Iteration Setup'>
            <div class='popup-title'>
              <h1>Iteration Setup</h1>
              <div onClick={this.close}>
                <InlineSVG src={require('../../../img/Att-icons/att-icons-close.svg')}></InlineSVG>
              </div>
            </div>
            <div class='home-iter-add-content'>
              <div className='home-iter-main'>
                <label className='home-iter-main-section'>Iteration Name</label>
                <input className='home-iter-text-field' id='name' value={this.state.name} onChange={this.nameChange} type='text'/>
              </div>
              <div className='home-iter-main' style={{'width':'100%'}}>
                <p className='home-iter-main-section' style={{'lineHeight': '0%'}}>Iteration Dates</p>
                <div style={{'display':'flex', 'marginTop': '2%'}} id='iterationDates'>
                  <DatePicker onChange={this.startDateChange} selected={ moment.utc(this.state.iterationStartDate)} readOnly dateFormat='DD MMM YYYY' customInput={<CustomDate fieldId='startDate' />} disabled={false} ref='iterationStartDate' fixedHeight/>
                  <p style={{'marginLeft':'5%', 'marginRight':'5%'}} className='home-iter-date-range'> to </p>
                  <DatePicker onChange={this.endDateChange} selected={ moment.utc(this.state.iterationEndDate)} readOnly dateFormat='DD MMM YYYY' customInput={<CustomDate fieldId='endDate' />} disabled={false} ref='iterationEndDate' fixedHeight/>
                </div>
              </div>
                
              <div className='popup-btns'>
                <div class='ibm-btn-row' style={{'float':'right', 'paddingBottom':'1rem'}}>
                  <a onClick={this.processIteration} class='ibm-btn-pri ibm-btn-small ibm-btn-blue-50' style={{'padding':'0.4rem'}}>Change</a>
                  <a onClick={this.close} class='ibm-btn-sec ibm-btn-small ibm-btn-blue-50' style={{'padding':'0.4rem'}}>Cancel</a>
                </div>
              </div>
          </div>
          <ConfirmDialog showConfirmModal={this.state.showConfirmModal} hideConfirmDialog={this.hideConfirmDialog} confirmAction={this.hideConfirmDialog} alertType={this.state.alertType} content={this.state.alertMsg} actionBtnLabel='Ok' />
          </ReactModal>
          </div>
      )
  }
});
module.exports = HomeEditIteration;
