var React = require('react');
var api = require('../api.jsx');
var layoutRenderer = require('../layoutRenderer.jsx');
var lodash = require('lodash');
var Header = require('./Header.jsx');

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
    var mainTwisty = null;
    if(!lodash.isEmpty(this.state.activeTemplates)){
      mainTwisty = layoutRenderer.mainTwisty(this.state.activeTemplates[0].cloudantId, 'agile-assessment');
      console.log('mainTwisty: ', mainTwisty);
    }
    return (
      <div id="assessmentContainer" class="agile-maturity">
      Active template goes here
      </div>
    )
  }
  
});

module.exports = AssessmentTemplates;
