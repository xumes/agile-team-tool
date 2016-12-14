var React = require('react');

var AssessmentTabNav = React.createClass({
  render: function() {
    return (
      <div>
        <h2 class="ibm-bold ibm-h3">
          <a id="assessmentLink" href="#">Team Maturity Assessment</a> <span style={{padding: '5px'}}></span>|<span style={{padding: '5px'}}></span> Team Assessment Summary
        </h2>
        <div class="ibm-rule ibm-alternate">
          <hr />
        </div>
      </div>
    );
  }
});

module.exports = AssessmentTabNav;
