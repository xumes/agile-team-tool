var React = require('react');
var Modal = require('react-overlays').Modal;
var InlineSVG = require('svg-inline-react');
var ConfirmDialog = React.createClass({

  render: function() {
    var self = this;
    var content = this.props.content;
    var heading = this.props.heading;
    var alertType = this.props.alertType;
    var headingStyle = '';
    var displayBtn;
    if (alertType === 'information') {
      heading = heading || 'Information';
    } else if (alertType === 'warning') {
      heading = heading || 'Warning!';
      headingStyle = 'redBg';
    } else if (alertType === 'error') {
      heading = heading || 'Error';
      headingStyle = 'redBg';
    }
    displayBtn = function() {
      if (alertType === 'information') {
        return (
          <button class=' ibm-btn-pri ibm-btn-small ibm-btn-blue-50 action-btn' onClick={self.props.confirmAction} id='updateBtn' ref='updateBtn'>{self.props.actionBtnLabel}</button>
        );
      } else if (alertType === 'warning') {
        return (
          <div>
            {self.props.actionBtnLabel && <button class=' ibm-btn-pri ibm-btn-small ibm-btn-red-50 action-btn' onClick={self.props.confirmAction} id='updateBtn' ref='updateBtn'>{self.props.actionBtnLabel}</button>}
            {self.props.cancelBtnLabel && <button class=' ibm-btn-pri ibm-btn-small ibm-btn-blue-50' onClick={self.props.hideConfirmDialog} id='cancelBtn'>{self.props.cancelBtnLabel}</button>}
          </div>
        );
      } else if (alertType === 'error') {
        return (<div>{self.props.actionBtnLabel && <button class=' ibm-btn-pri ibm-btn-small ibm-btn-red-50 action-btn' onClick={self.props.confirmAction} id='updateBtn' ref='updateBtn'>{self.props.actionBtnLabel}</button>}</div>);
      }
    }
    return(
      <Modal aria-labelledby='modal-label' className='reactbootstrap-modal' backdropClassName='reactbootstrap-backdrop' show={this.props.showConfirmModal} onHide={this.props.hideConfirmDialog}>
        <div class='home-modal-block style1'>
          <div class={'home-modal-block-header ' + headingStyle}>
            <h>{heading}</h>
            <div class='home-modal-block-close-btn' onClick={this.props.hideConfirmDialog}>
              <InlineSVG src={require('../../../img/Att-icons/att-icons-close.svg')}></InlineSVG>
            </div>
          </div>
          <div class='home-modal-block-content setauto'>
            <p>{content}</p>
          </div>
          <div class='home-modal-block-footer ibm-btn-row style1'>
            <div class='floatright'>
              {displayBtn()}
            </div>
          </div>
        </div>
      </Modal>
    );
  }
});

module.exports = ConfirmDialog;
