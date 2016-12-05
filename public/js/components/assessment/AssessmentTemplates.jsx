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
    if (_.isEmpty(this.props.assessmentTemplate.template)) {
      var template = this.state.activeTemplates;
    } else {
      if (this.props.assessmentTemplate.template.length > 0) {
        template = this.props.assessmentTemplate.template[0];
      } else {
        template = this.props.assessmentTemplate.template;
      }
    }

    return (
      <div id="assessmentContainer" class="agile-maturity">
      <AssessmentActiveTemplates template={template} selectedAssessment={this.props.assessmentTemplate.assessment} type={this.props.assessmentTemplate.type} software={this.props.assessmentTemplate.software} access={this.props.assessmentTemplate.access}/>
      </div>
    )
  }

});

module.exports = AssessmentTemplates;
