var React = require('react');
var ActiveTemplate= require('./AssessmentActiveTemplate.jsx');

var AssessmentTemplates = React.createClass({
  render: function() {
    return (
      <div id="assessmentContainer" class="agile-maturity">
      <ActiveTemplate />
      </div>
    )
  }
  
});

module.exports = AssessmentTemplates;
