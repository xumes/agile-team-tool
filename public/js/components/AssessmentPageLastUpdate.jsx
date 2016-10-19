var React = require('react');
var Header = require('./Header.jsx');

var AssessmentPageLastUpdate = React.createClass({
  render: function() {
    return ( <div>
                <h2 class="ibm-bold ibm-h4">Last update</h2>
                <div class="ibm-rule ibm-alternate-2"><hr /></div>
                <div>
                  <span style={{"fontSize": "9pt"}}>
                    Last update:
                    <span style={{"fontSize": "9pt"}} id="lastUpdateTimestamp"></span>
                    &nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
                    Updated by:  <span style={{"fontSize": "9pt"}} id="lastUpdateUser"></span>
                  </span>
                </div>
                <div id="debugSection">
                  <p>
                    <label><span style={{"fontSize": "9pt"}}>Doc id for this page(for SIT only):</span></label>
                    <span style={{"fontSize": "9pt"}} id="doc_id"></span>
                  </p>
                </div>
               </div>)
  }
});

module.exports = AssessmentPageLastUpdate;
