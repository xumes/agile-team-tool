var React = require('react');
var api = require('../api.jsx');
var InlineSVG = require('svg-inline-react');
var ReactModal = require('react-modal');

var TeamResetPopup = React.createClass({
 processIteration: function () {
    this.props.updateTeamAvailability();
    this.props.onClose();
  },

  render: function() {
      return (
        <div>
         <ReactModal isOpen={this.props.isOpen} onRequestClose={this.props.onClose} className='home-iter-popup' overlayClassName='att-modal-overlay' contentLabel='Add Iteration'>
            <div class='home-modal-block' style={{'height':'22.8em', 'width':'25em'}}>
              <div class='home-iter-modal-block-header' style={{'backgroundColor':'#d0021b'}}>
                <h>Team Availability Reset</h>
                <div class='home-iter-modal-block-close-btn' onClick={this.props.onClose}>
                  <InlineSVG src={require('../../../img/Att-icons/att-icons-close.svg')}></InlineSVG>
                </div>
              </div>
              <div class='home-iter-modal-block-content' style={{'height':'auto'}}>
                <p style={{'fontWeight':'600'}}>You are about to overwrite the optimum team availability with {this.props.teamAvailability} based on the current team structure.</p>
                <p style={{'fontWeight':'600','paddingTop':'0'}}>This will also update the team member and FTE count for this iteration.</p>
                <p>Are you sure you want to continue?</p>
              </div>
              <div class='ibm-btn-row' style={{'width':'93%','top':'5%'}}>
                <div style={{'float':'right'}}>
                  <button class=' ibm-btn-pri ibm-btn-small ibm-btn-red-50' style={{'marginRight':'.5em','background':'#d0021b none repeat scroll 0 0','borderColor':'#d0021b'}} onClick={this.processIteration} id='updateBtn' ref='updateBtn'>Continue</button>
                  <button class=' ibm-btn-pri ibm-btn-small ibm-btn-blue-50' onClick={this.props.onClose} id='cancelBtn'>Cancel</button>
                </div>
              </div>
            </div>
          </ReactModal>
          </div>
      )
  }
});
module.exports = TeamResetPopup;
