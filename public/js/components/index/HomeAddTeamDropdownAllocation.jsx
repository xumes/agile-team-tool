var React = require('react');
var Select = require('react-select');
var utils = require('../utils.jsx');
var ConfirmDialog = require('./ConfirmDialog.jsx');

var HomeAddTeamDropdownAllocation = React.createClass({
  getInitialState: function() {
    return {
      alertMsg: '',
      showConfirmModal: false
    }
  },

  allocHandler: function(data) {
    if (!data) {
      // alert('Member allocation is required.');
      this.setState({alertMsg: 'Member allocation is required.', showConfirmModal: true});
    } else {
      if (!utils.isValidNumRange(data.value)) {
        // alert('Allocation should be between 0 to 100.');
        this.setState({alertMsg: 'Allocation should be between 0 to 100.', showConfirmModal: true});
      } else {
        this.props.allocHandler(this.refs, data);
      }
    }
  },
  hideConfirmDialog: function() {
    this.setState({showConfirmModal: false, alertMsg: ''});
  },
  render: function() {
    var self = this;
    var memberUserId = self.props.memberUserId;
    var memberAlloc;
    if (self.props.memberAlloc == 0) {
      memberAlloc = 0;
    } else {
      memberAlloc = self.props.memberAlloc;
    }
    var selallocOptions = [];
    var allocationArray = Array.from(Array(101).keys());
    allocationArray.map(function(v) {
      selallocOptions.push({value: v, label: v});
    });  

    return(
      <div>
        <Select
          name='select-alloc'
          ref='selalloc'
          data-uid={memberUserId}
          value={memberAlloc}
          options={selallocOptions}
          clearable={false}
          placeholder = '0'
          onChange={self.allocHandler} />
        <ConfirmDialog showConfirmModal={self.state.showConfirmModal} hideConfirmDialog={self.hideConfirmDialog} confirmAction={self.hideConfirmDialog} alertType='error' content={self.state.alertMsg} actionBtnLabel='Ok' />
      </div>
    );
  }
});

module.exports = HomeAddTeamDropdownAllocation;
