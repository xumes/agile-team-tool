var React = require('react');
var Header = require('./Header.jsx');
var TeamSquadForm = require('./TeamSquadForm.jsx');
var CreateSelectAssessment = require('./CreateSelectAssessment.jsx');

var AssessmentPageFormOne = React.createClass({
  render: function() {
    return ( <div>
                <Header title="Team Maturity Assessment"/>
                <TeamSquadForm  clickAction={this.clickAction} />
                <CreateSelectAssessment />
                <div class="ibm-rule ibm-alternate-1"><hr/></div>
               </div>)
  }
});

module.exports = AssessmentPageFormOne;
