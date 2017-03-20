var React = require('react');
var ReactDOM = require('react-dom');
var InlineSVG = require('svg-inline-react');

var ConfirmPopover = React.createClass({
  getInitialState: function() {
    return (
      {showModel: false}
    )
  },
  hideConfirm: function() {
    $('#' + this.props.confirmId).hide();
  },
  render: function (){
    var self = this;
    return (
      <div id={self.props.confirmId} class='confirm-popover' style={{'display':'none'}}>
        <div class='header-title'>
          <div onClick={self.hideConfirm}>
            <InlineSVG src={require('../../../img/Att-icons/att-icons-close.svg')}></InlineSVG>
          </div>
        </div>
        <div class='content'>
          <h1>{self.props.content}</h1>
        </div>
        <div class='btns'>
          <button type='button' id='cancelConfirm' class='ibm-btn-sec ibm-btn-blue-50' onClick={self.hideConfirm}>{'Cancel'}</button>
          <button type='button' id='saveConfirm' class='ibm-btn-pri ibm-btn-blue-50' style={{'marginRight':'1%'}} onClick={self.props.confirmClick}>{'Confirm'}</button>
        </div>
      </div>
    )
  }
});

module.exports = ConfirmPopover;
