var React = require('react');
var AssessmentActiveTemplates = require('./AssessmentActiveTemplates.jsx');
var api = require('../api.jsx');

var AssessmentTemplates = React.createClass({
  getInitialState: function() {
    return {
      activeTemplates: null
    }
  },
  
  componentDidMount: function() {
    var self = this;
    api.getAssessmentTemplate(null, 'active')
      .then(function(assessmentTemplates) {
        self.setState({
          activeTemplates: assessmentTemplates
        });
      });

  },
  render: function() {
    return (
      <div id="assessmentContainer" class="agile-maturity">
      <AssessmentActiveTemplates />
      </div>
    )
  }
  
});

module.exports = AssessmentTemplates;
