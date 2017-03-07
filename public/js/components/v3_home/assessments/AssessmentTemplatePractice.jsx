var React = require('react');
var _ = require('underscore');
var AssessmentTemplateLevel = require('./AssessmentTemplateLevel.jsx');
var AssessmentTemplatePractice = React.createClass({
  render: function() {
    var self = this;
    if (_.isEmpty(self.props.practices)) {
      return null;
    } else {
      var count = 0
      var principleId = self.props.principleId;
      var practiceMainId = principleId + '_' + 'prac';
      var practices = self.props.practices.map(function(practice){
        var practiceId = practiceMainId + '_' + count;
        var practiceAnsId = practiceId + '_ans';
        count ++ ;
        return (
          <div key={practiceId} id={practiceId} data-open='true' class='ibm-active'>
            <a class='ibm-twisty-trigger' style={{'cursor':'pointer'}} onClick={self.props.expandComponent.bind(null, practiceId)}>
              {practice.name}
              <span id={practiceAnsId}>Not answered</span>
            </a>
            <div class='ibm-twisty-body' style={{'display':'block'}}><AssessmentTemplateLevel levels={practice.levels} description={practice.description} practiceId={practiceId}/></div>
          </div>
        )
      });
      return (
        <div class='ibm-twisty agile-practice' id={practiceMainId}>
          {practices}
        </div>
      )
    }
  }
});
module.exports = AssessmentTemplatePractice;
