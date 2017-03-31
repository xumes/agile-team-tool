var React = require('react');
var Modal = require('react-overlays').Modal;
var InlineSVG = require('svg-inline-react');
var ConfirmDialog = React.createClass({

  render: function() {
    var content = this.props.content;
    return(
      <Modal aria-labelledby='modal-label' className='reactbootstrap-modal' backdropClassName='reactbootstrap-backdrop' show={this.props.showConfirmModal} onHide={this.props.hideConfirmDialog}>
        <div class='home-modal-block style1'>
          <div class='home-modal-block-header redBg'>
            <h>Warning!</h>
            <div class='home-modal-block-close-btn' onClick={this.props.hideConfirmDialog}>
              <InlineSVG src={require('../../../img/Att-icons/att-icons-close.svg')}></InlineSVG>
            </div>
          </div>
          <div class='home-modal-block-content setauto'>
            <p>{content}</p>
          </div>
          <div class='home-modal-block-footer ibm-btn-row style1'>
            <div class='floatright'>
              <button class=' ibm-btn-pri ibm-btn-small ibm-btn-red-50 action-btn' onClick={this.props.confirmAction} id='updateBtn' ref='updateBtn'>{this.props.actionBtnLabel}</button>
              <button class=' ibm-btn-pri ibm-btn-small ibm-btn-blue-50' onClick={this.props.hideConfirmDialog} id='cancelBtn'>{this.props.cancelBtnLabel}</button>
            </div>
          </div>
        </div>
      </Modal>
    );
  }
});

module.exports = ConfirmDialog;
