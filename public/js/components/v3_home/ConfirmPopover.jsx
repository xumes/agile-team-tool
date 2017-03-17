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
          <button type='button' id='cancelBtnConfirm' class='ibm-btn-sec ibm-btn-blue-50' style={{'display':self.props.cancelBtn}} onClick={self.hideConfirm}>{'Cancel'}</button>
          <button type='button' id='okBtnConfirm' class='ibm-btn-sec ibm-btn-blue-50' style={{'display':self.props.okBtn}} onClick={self.hideConfirm}>{'Ok'}</button>
          <button type='button' id='saveBtnConfirm' class='ibm-btn-pri ibm-btn-blue-50' style={{'marginRight':'1%','display':self.props.confirmBtn}} onClick={self.props.confirmClick}>{'Confirm'}</button>
        </div>
      </div>
    )
  }
});

module.exports = ConfirmPopover;
