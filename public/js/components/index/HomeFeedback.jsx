var React = require('react');
var api = require('../api.jsx');
var InlineSVG = require('svg-inline-react');
var Modal = require('react-overlays').Modal;
var _ = require('underscore');

var HomeFeedback = React.createClass({
  getInitialState: function() {
    return {
      teamNames: [],
      toolAreas: ['Charts overview', 'Create team', 'Help', 'Important links', 'Iteration overview', 'Maturity overview', 'Team Description', 'Team Detail', 'Team Navigation', 'Team Setup', 'User Interface', 'Other'],
      submitStatusOk: true,
      submitHeader: 'Thank you for your feedback!',
      submitMessage: 'Your input helps us improve the Agile Team Tool.',
      showConfirmModal: false
  }
  },
  componentWillUpdate: function(nextProps, nextState) {
    var self = this;
    if (!self.props.showFeedbackModal && nextProps.showFeedbackModal) {
      api.fetchTeamNames()
        .then(function(teams) {
          teams = _.sortBy(teams, 'name');
          self.setState({teamNames : teams});
        });
    }
  },
  componentDidUpdate: function(prevProps, prevState) {
    self = this;
    if (self.props.userInterfaceIndicator)
      $('#toolAreaFeedback').val('User Interface').change();
    else
      $('#toolAreaFeedback').val('Other').change();

    $('#teamNameFeedback').val('Not specified').change();
  },
  show: function() {
    $('#feedbackBlock select').select2({'dropdownParent':$('#feedbackBlock')});
  },
  feedbackChangeHandler: function(e) {
    if (e.target.value === '')
      $('#submitFeedbackBtn').attr('disabled', 'disabled');
    else
      $('#submitFeedbackBtn').removeAttr('disabled');
  },
  sendFeedback: function() {
    var self = this;
    api.sendFeedback(user.shortEmail, user.ldap.cn[0], $('#toolAreaFeedback option:selected').val(), $('#teamNameFeedback option:selected').val(), $('#feedback').val())
      .then(function(result) {
        self.setState({
          submitStatusOk: true,
          submitHeader: 'Thank you for your feedback!',
          submitMessage: 'Your input helps us improve the Agile Team Tool.',
          showConfirmModal: true
        });
      })
      .catch(function(err) {
        self.setState({
          submitStatusOk: false,
          submitHeader: 'Oops!',
          submitMessage: 'Something went wrong while trying to send your feedback.',
          showConfirmModal: true
        })
      });
  },
  closeConfirm: function() {
    var self = this;
    self.setState ({ showConfirmModal: false });
    if (self.state.submitStatusOk)
      self.props.closeFeedback();
  },
  render: function() {
    var self = this;
    var backdropStyle = {
      top: 0, bottom: 0, left: 0, right: 0,
      zIndex: 'auto',
      backgroundColor: '#000',
      opacity: 0.5,
      width: '100%',
      height: '100%'
    };
    var modalStyle = {
      position: 'fixed',
      width: '100%',
      height: '100%',
      zIndex: 1040,
      top: 0, bottom: 0, left: 0, right: 0,
    };
    var toolAreaOptions = null;
    toolAreaOptions = self.state.toolAreas.map(function(item, index) {
      return (
        <option key={index} value={item} >{item}</option>
      )
    });
    var teamNameOptions = null;
    teamNameOptions = self.state.teamNames.map(function(item, index) {
      return (
        <option key={index} value={item.name} >{item.name}</option>
      )
    });
    var confirmHeaderStyle = self.state.submitStatusOk ? null : {'backgroundColor':'#d0021b'};
    return (
      <div>
        <Modal aria-labelledby='Feedback Dialog' style={modalStyle} backdropStyle={backdropStyle} show={self.props.showFeedbackModal} onHide={self.props.closeFeedback} onShow={self.show}>
          <div class='home-modal-block' style={{'width':'27em'}} id='feedbackBlock'>
            <div class='home-modal-block-header'>
              <h>Feedback and support... Please let us know!</h>
              <div class='home-modal-block-close-btn' onClick={self.props.closeFeedback}>
                <InlineSVG src={require('../../../img/Att-icons/att-icons-close.svg')}></InlineSVG>
              </div>
            </div>

            <div class='home-modal-block-content'>
              <div class='feedback-block'>
                <p>
                  <label>Contact Information</label>
                  <span>
                    <h>{user.shortEmail}</h>
                  </span>
                </p>
                <p>
                  <label>Area of interest/concern</label>
                  <span>
                    <select id='toolAreaFeedback' defaultValue={'Other'}>
                      {toolAreaOptions}
                    </select>
                  </span>
                </p>
                <p>
                  <label>Team name</label>
                  <span>
                    <select id='teamNameFeedback' defaultValue={'Not specified'}>
                      <option key='ns' value='Not specified'>Not specified</option>
                      {teamNameOptions}
                    </select>
                  </span>
                </p>
                <p>
                  <label>Comments<span class='ibm-required'>*</span></label>
                  <span>
                    <textarea name='feedback' id='feedback' rows='4' maxLength='2000' placeholder='Please provide a detailed description of your idea, suggestion, or problem' aria-label='feedback' onChange={self.feedbackChangeHandler}></textarea>
                  </span>
                </p>
                <p>
                  Have a question?  Checkout our <a target='_blank' href='http://agileacademy.w3ibm.mybluemix.net/teamtool/howto/AgileTeamTool_FrequentlyAskedQuestions.pdf'>Frequently Asked Questions</a>.
                </p>
              </div>
            </div>
            <div class='home-modal-block-footer ibm-btn-row' style={{'width':'92%','top':'-3%'}}>
              <div style={{'float':'right'}}>
                <button class=' ibm-btn-pri ibm-btn-small ibm-btn-blue-50' style={{'marginRight':'.5em'}} onClick={self.sendFeedback} id='submitFeedbackBtn'>Submit</button>
                <button class=' ibm-btn-sec ibm-btn-small ibm-btn-blue-50' onClick={self.props.closeFeedback} id='cancelFeedbackBtn'>Cancel</button>
              </div>
            </div>
          </div>
        </Modal>

        <Modal aria-labelledby='Feedback Dialog' style={modalStyle} backdropStyle={backdropStyle} show={self.state.showConfirmModal} onHide={self.closeConfirm} >
          <div class='home-modal-block' style={{'width':'30em'}} id='feedbackConfirmBlock'>
            <div class='home-modal-block-header'  style={confirmHeaderStyle}>
              <h>{self.state.submitHeader}</h>
              <div class='home-modal-block-close-btn' onClick={self.closeConfirm}>
                <InlineSVG src={require('../../../img/Att-icons/att-icons-close.svg')}></InlineSVG>
              </div>
            </div>

            <div class='home-modal-block-content'>
              <div class='feedback-block'>
                <p style={{'paddingBottom':'1em'}}>
                  {self.state.submitMessage}
                </p>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    )
  }
});

module.exports = HomeFeedback;