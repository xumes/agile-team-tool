var React = require('react');
var AssessmentActiveTemplates = require('./AssessmentActiveTemplates2.jsx');
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
          activeTemplates: assessmentTemplates[0]
        });
      });
  },

  render: function() {
    if (_.isEmpty(this.props.assessment.assessmentTemplate)) {
      this.props.assessment.assessmentTemplate = this.state.activeTemplates;
    }
    return (
      <div id="assessmentContainer" class="agile-maturity">
      <AssessmentActiveTemplates assessment={this.props.assessment}/>
      </div>
    )
  }

});

module.exports = AssessmentTemplates;
