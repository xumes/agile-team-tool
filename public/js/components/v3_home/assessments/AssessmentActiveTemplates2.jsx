var React = require('react');
var _ = require('underscore');
var moment = require('moment');
var AssessmentTemplatePrinciple = require('./AssessmentTemplatePrinciple.jsx');

var AssessmentActiveTemplates = React.createClass({
  componentDidMount: function() {
    console.log(this.props.assessTemplate);
  },
  componentDidUpdate: function() {
  },
  countPractics: function(template) {
    var templateCount = []
    _.each(template.components, function(component){
      var practiceCount= [];
      _.each(component.principles, function(principle){
         practiceCount.push(principle.practices.length);
      });
      templateCount.push(practiceCount);
    });
    return templateCount;
  },
  expandComponent: function(cid) {
    if ($('#' + cid).hasClass('ibm-active')) {
      $('#' + cid).removeClass('ibm-active');
      $('#' + cid + ' > .ibm-twisty-body').css('display','none');
    } else {
      $('#' + cid).addClass('ibm-active');
      $('#' + cid + ' > .ibm-twisty-body').css('display','block');
    }
  },
  render: function()  {
    var self = this;
    if (_.isEmpty(self.props.assessTemplate)) {
      return null;
    } else {
      var containerId = 'atma';
      var componentId = containerId + '_' + self.props.assessTemplateId;
      return (
        <ul class='ibm-twisty agile-assessment ibm-widget-processed' id={containerId} data-widget='twisty'>
          <li key={componentId} id={componentId}>
            <AssessmentTemplatePrinciple principles={self.props.assessTemplate.principles} componentId={componentId} expandComponent={self.expandComponent}/>
          </li>
        </ul>
      );
    }
  }
});

module.exports = AssessmentActiveTemplates;
