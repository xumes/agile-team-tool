var React = require('react');
var _ = require('underscore');
var AssessmentTemplateCriteria = React.createClass({
  render: function() {
    var self = this;
    if (_.isEmpty(self.props.criterias)) {
      return null;
    } else {
      var count = 0;
      var criterias =self.props.criterias.map(function(c){
        var criteriaId = self.props.levelId + '_cri_' + count;
        count ++ ;
        return (
          <li key={criteriaId} id={criteriaId}>
            {c}
          </li>
        );
      });
      return (
        <ul>{criterias}</ul>
      );
    }
  }
});
module.exports = AssessmentTemplateCriteria;
