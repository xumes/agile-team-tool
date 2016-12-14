var React = require('react');
var Header = require('../Header.jsx');
var moment = require('moment');
var _ = require('underscore');

var AssessmentPageLastUpdate = React.createClass({
  render: function() {
    var fontSize = { 'fontSize' : '9pt' };
    if (_.isEmpty(this.props.assessment.assessment)) {
      var updateDate = '';
      var assessId = '';
      var updatedBy = '';
    } else {
      updateDate = moment(this.props.assessment.assessment.updateDate).format('MMM DD, YYYY, HH:mm') + ' (UTC)';
      assessId = this.props.assessment.assessment._id.toString();
      updatedBy = this.props.assessment.assessment.updatedBy;
    }
    return ( <div>
                <h2 class="ibm-bold ibm-h4">Last update</h2>
                <div class="ibm-rule ibm-alternate-2"><hr /></div>
                <div>
                  <span style={fontSize}>
                    Last update:
                    <span style={fontSize} id="lastUpdateTimestamp">&nbsp;{updateDate}</span>
                    &nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
                    Updated by:  <span style={fontSize} id="lastUpdateUser">{updatedBy}</span>
                  </span>
                </div>
                <div id="debugSection">
                  <p>
                    <label><span style={fontSize}>Doc id for this page(for SIT only):</span></label>
                    <span style={fontSize} id="doc_id">{assessId}</span>
                  </p>
                </div>
                <div class="ibm-rule ibm-alternate-2"><hr/></div>
               </div>)
  }
});

module.exports = AssessmentPageLastUpdate;
