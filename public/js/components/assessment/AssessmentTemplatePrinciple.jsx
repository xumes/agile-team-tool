var React = require('react');
var _ = require('underscore');
var AssessmentTemplatePractice = require('./AssessmentTemplatePractice.jsx');
var AssessmentTemplatePrinciple = React.createClass({
  render: function() {
    var self = this;
    if (_.isEmpty(self.props.principles)) {
      return null;
    } else {
      var count = 0
      var componentId = self.props.componentId;
      var principleMainId = componentId + '_' + 'prin';
      var principles = self.props.principles.map(function(principle){
        var principleId = principleMainId + '_' + count;
        count ++ ;
        return (
          <li key={principleId} id={principleId} data-open='true' class='ibm-active'>
            <a class='ibm-twisty-trigger' style={{'cursor':'pointer'}} onClick={()=>self.props.expandComponent(principleId)}>{principle.name}</a>
            <div class='ibm-twisty-body' style={{'display':'block'}}><AssessmentTemplatePractice practices={principle.practices} principleId={principleId} expandComponent={self.props.expandComponent}/></div>
          </li>
        )
      });
      return (
        <ul class='ibm-twisty agile-principle' id={principleMainId}>
          {principles}
        </ul>
      )
    }
  }
});
module.exports = AssessmentTemplatePrinciple;
