var React = require('react');
var api = require('../api.jsx');
var lodash = require('lodash');

var ActiveTemplate = React.createClass({
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
      <ul>
        <li>an ul li</li>
      </ul>
    )
  }
});

module.exports = ActiveTemplate;
