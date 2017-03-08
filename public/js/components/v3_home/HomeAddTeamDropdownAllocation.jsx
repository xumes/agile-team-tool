var React = require('react');
var Select = require('react-select');

var HomeAddTeamDropdownAllocation = React.createClass({

  allocHandler: function(data) {
    this.props.allocHandler(this.refs, data);
  },
  render: function() {
    var self = this;
    var memberUserId = self.props.memberUserId;
    var memberAlloc;
    if (self.props.memberAlloc === 0) {
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
      <Select
        name='select-alloc'
        ref='selalloc'
        data-uid={memberUserId}
        value={memberAlloc}
        options={selallocOptions}
        clearable={false}
        onChange={self.allocHandler} />
    );
  }
});

module.exports = HomeAddTeamDropdownAllocation;
