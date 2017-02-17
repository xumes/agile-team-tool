var React = require('react');
var api = require('../api.jsx');
var _ = require('underscore');
var InlineSVG = require('svg-inline-react');

var HomeAddTeamFooterButtons = React.createClass({
  backBtnHandler: function() {
    var self = this;
    console.log('backBtnHandler', self.props.buttonOptions.prevScreen);
    self.props.openWindow(self.props.buttonOptions.prevScreen);
  },
  nextBtnHandler: function() {
    var self = this;
    console.log('nextBtnHandler', self.props.buttonOptions.nextScreen);
    self.props.openWindow(self.props.buttonOptions.nextScreen);
  },
  render: function() {
    var self = this;
    console.log('render HomeAddTeamFooterButtons', self.props);
    if (self.props.buttonOptions.prevScreen == '') {
      return (
        <div class='new-team-creation-add-block-footer'>
          <p class='ibm-btn-row ibm-button-link footer-btn'>
            <button class='ibm-btn-pri ibm-btn-small ibm-btn-blue-50' id='nextBtn' onClick={self.nextBtnHandler} disabled={self.props.buttonOptions.nextDisabled}>Next</button>
          </p>
        </div>
      );
    } else  if (self.props.buttonOptions.nextScreen == '') {
      return (
        <div class='new-team-creation-add-block-footer'>
          <p class='ibm-btn-row ibm-button-link footer-btn'>
            <button class='ibm-btn-pri ibm-btn-small ibm-btn-blue-50' id='backBtn' onClick={self.backBtnHandler} disabled={self.props.buttonOptions.prevDisabled}>Back</button>
            <button class='ibm-btn-pri ibm-btn-small ibm-btn-blue-50' id='FinishBtn' onClick={self.finishBtnHandler} disabled={self.props.buttonOptions.nextDisabled}>Next</button>
          </p>
        </div>
      );
    } else {
      return (
        <div class='new-team-creation-add-block-footer'>
          <p class='ibm-btn-row ibm-button-link footer-btn'>
            <button class='ibm-btn-pri ibm-btn-small ibm-btn-blue-50' id='backBtn' onClick={self.backBtnHandler} disabled={self.props.buttonOptions.prevDisabled}>Back</button>
            <button class='ibm-btn-pri ibm-btn-small ibm-btn-blue-50' id='nextBtn' onClick={self.nextBtnHandler} disabled={self.props.buttonOptions.nextDisabled}>Next</button>
          </p>
        </div>
      );
    }

  }
});

module.exports = HomeAddTeamFooterButtons;
