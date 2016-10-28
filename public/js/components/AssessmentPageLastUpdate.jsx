var React = require('react');
var Header = require('./Header.jsx');

var AssessmentPageLastUpdate = React.createClass({
  render: function() {
    var fontSize = { 'fontSize' : '9pt' };

    return ( <div>
                <h2 class="ibm-bold ibm-h4">Last update</h2>
                <div class="ibm-rule ibm-alternate-2"><hr /></div>
                <div>
                  <span style={fontSize}>
                    Last update:
                    <span style={fontSize} id="lastUpdateTimestamp"></span>
                    &nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
                    Updated by:  <span style={fontSize} id="lastUpdateUser"></span>
                  </span>
                </div>
                <div id="debugSection">
                  <p>
                    <label><span style={fontSize}>Doc id for this page(for SIT only):</span></label>
                    <span style={fontSize} id="doc_id"></span>
                  </p>
                </div>
                <div class="ibm-rule ibm-alternate-2"><hr/></div>
               </div>)
  }
});

module.exports = AssessmentPageLastUpdate;
