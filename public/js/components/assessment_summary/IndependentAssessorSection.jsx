var React = require('react');

var IndependentAssessorSection = React.createClass({
  render: function() {
    return (
      <h3 class="ibm-h3 agile-summary">
        Independent Assessor: <span id="indAssessor"></span>
      </h3>
    );
  }
});

module.exports = IndependentAssessorSection;
