var React = require('react');
var ReactModal = require('react-modal');
var InlineSVG = require('svg-inline-react');

var AssessmentSetupPopover = React.createClass({
  componentDidMount: function() {
    $('#assessmentSetupSelectType').select2({'width':'100%'});
    $('#assessmentSetupSelectSoftware').select2({'width':'100%'});
  },
  continueAssessmentDraft: function() {
    this.props.hideAssessmentSetupPopover();
    this.props.continueAssessmentDraft($('#assessmentSetupSelectType').val(), $('#assessmentSetupSelectSoftware').val());
  },
  render: function() {
    var self = this;
    return (
      <div tabIndex='1' class='assessment-setup-block'>
        <div class='setup-title'>
          <h1>{'New Maturity Assesment Setup'}</h1>
          <div onClick={self.props.hideAssessmentSetupPopover}>
            <InlineSVG src={require('../../../../img/Att-icons/att-icons-close.svg')}></InlineSVG>
          </div>
        </div>
        <div class='assessment-type-block'>
          <h1>{'Work Type'}</h1>
          <div class='assessment-select-block'>
            <select id='assessmentSetupSelectType' defaultValue='Project'>
              <option value='Project'>{'Project Delivery'}</option>
              <option value='Operations'>{'Operations Delivery'}</option>
            </select>
          </div>
          <h2>{'Operations teams support a repeatable process that delivers value to the customer.  Unlike a project, it normally has no definite start and end date.  Operation examples include recruitment, budgeting, call centers, supply chain and software operations.'}</h2>
        </div>
        <div class='assessment-software-block'>
          <h1>{'Does your team deliver software'}</h1>
          <div class='assessment-select-block2'>
            <select id='assessmentSetupSelectSoftware' defaultValue='No'>
              <option value='Yes'>{'Yes'}</option>
              <option value='No'>{'No'}</option>
            </select>
          </div>
          <h2>{'Answering yes will add the optional DevOps software delivery practices.'}</h2>
        </div>
        <div class='assessment-setup-btns'>
          <button type='button' id='cancelAssessBtn' class='ibm-btn-sec ibm-btn-blue-50' name='cancelAssessBtn' style={{'width':'25%'}} onClick={self.props.hideAssessmentSetupPopover}>{'Cancel'}</button>
          <button type='button' id='continueAssessBtn' class='ibm-btn-pri ibm-btn-blue-50' name='continueAssessBtn' style={{'width':'30%','marginRight':'5%'}} onClick={self.continueAssessmentDraft}>{'Continue'}</button>
        </div>
      </div>
    )
  }
});
module.exports = AssessmentSetupPopover;
