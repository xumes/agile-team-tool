var React = require('react');
var Header = require('./Header.jsx');
var TeamSquadForm = require('./TeamSquadForm.jsx');
var CreateSelectAssessment = require('./CreateSelectAssessment.jsx');
var AssessmentButtons = require('./AssessmentButtons.jsx');

var AssessmentPage = React.createClass({
  render: function() {
    return (<div id="assessmentForm">
          <Header title="Team Maturity Assessment"/>
          <TeamSquadForm />
          <CreateSelectAssessment />
          <div class="ibm-rule ibm-alternate-1">
            <hr/>
          </div>  
          <AssessmentButtons />
        </div>)
  }
});

module.exports = AssessmentPage;
