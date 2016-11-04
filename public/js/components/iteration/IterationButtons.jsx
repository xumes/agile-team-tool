var React = require('react');
var api = require('../api.jsx');

var IterationButtons = React.createClass({
  getInitialState: function() {
    return {
      addBtnDisable: true,
      updateBtnDisable: true
    }
  },

  enableButtons: function(addState, updateState){
    this.setState({
      addBtnDisable: addState,
      updateBtnDisable: updateState});
  },

  updateIterationInfo: function(){
    api.updateIteration(this.props.iteration)
      .then(function(result) {
      //TODO add response handling
      });
  },

  addIterationInfo: function(){
    api.addIteration(this.props.iteration)
      .then(function(result) {
        //TODO add response handling
      });
  },


  render: function() {
    var btnStyle = {
      'width': '730px'
    };
    return (
      <div class='ibm-btn-row' style={{'textAlign': 'right'}}>
        <p>
          <span style={btnStyle} className='ibm-btn-row '>
            <input type='button' className='ibm-btn-pri ibm-btn-small' id='addIterationBtn' value='Add iteration' onClick={this.addIterationInfo} disabled={this.state.addBtnDisable} />
            <input type='button' className='ibm-btn-sec ibm-btn-small' id='updateIterationBtn' value='Update iteration' onClick={this.updateIterationInfo} disabled={this.state.updateBtnDisable} />
            <input type='button' className='ibm-btn-sec ibm-btn-small' id='cancelIterationBtn' value='Reset iteration' onClick={this.clearIterationInfo} />
          </span>
        </p>
      </div>
    )
  }
});

module.exports = IterationButtons;
