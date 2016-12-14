var React = require('react');

var IterationButtons = React.createClass({
  updateIterationInfo: function(){
    this.props.parentUpdate('update');
  },

  addIterationInfo: function(){
    this.props.parentUpdate('add');
  },

  clearIterationInfo: function(){
    this.props.parentUpdate('clear');
  },

  render: function() {
    var btnStyle = {
      'width': '730px'
    };
    return (
      <div class='ibm-btn-row' style={{'textAlign': 'center'}}>
        <span style={btnStyle} className='ibm-btn-row '>
          <input type='button' className='ibm-btn-pri ibm-btn-small' id='addIterationBtn' value='Add iteration' onClick={this.addIterationInfo} disabled={this.props.addBtnDisable} />
          <input type='button' className='ibm-btn-sec ibm-btn-small' id='updateIterationBtn' value='Update iteration' onClick={this.updateIterationInfo} disabled={this.props.updateBtnDisable} />
          <input type='button' className='ibm-btn-sec ibm-btn-small' id='cancelIterationBtn' value='Reset iteration' onClick={this.clearIterationInfo} />
        </span>
      </div>
    )
  }
});

module.exports = IterationButtons;
