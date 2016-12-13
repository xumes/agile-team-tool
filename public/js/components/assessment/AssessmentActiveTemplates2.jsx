var React = require('react');
var _ = require('underscore');
var moment = require('moment');
var AssessmentTemplatePrinciple = require('./AssessmentTemplatePrinciple.jsx');

var AssessmentActiveTemplates2 = React.createClass({
  componentDidUpdate: function() {
    var self = this;
    $('#atma .iradio_square-blue').removeClass('checked');
    $('#atma span').html('Not answered');
    $('#atma a.ibm-twisty-trigger').css('background','');
    $('textarea').val('');
    $('textarea').prop('disabled', false);
    $('input[type=\'radio\']').prop('disabled', false);
    if (self.props.assessment.assessment != undefined && !_.isEmpty(self.props.assessment.assessment)) {
      var template = self.props.assessment.assessmentTemplate;
      var templateCount = self.countPractics(template);
      if (self.props.assessment.templateType.type == 'Operations') {
        templateCount.splice(0,1);
      } else {
        templateCount.splice(1,1);
      }
      var components = self.props.assessment.assessment.componentResults;
      if (self.props.assessment.assessment.assessmentStatus != 'Draft' || !self.props.assessment.access) {
        $('textarea').prop('disabled', true);
        $('input[type=\'radio\']').prop('disabled', true);
      }
      if (components.length > 0) {
        _.each(components, function(component, idx){
          var componentId ='atma_' + idx;
          if (!_.isEmpty(component.assessedComponents)) {
            _.each(component.assessedComponents, function(assessedComponent){
              var principleId = assessedComponent.principleId - 1;
              var practiceTotal = 0;
              for (var i = 0; i < assessedComponent.principleId - 1; i++) {
                practiceTotal = practiceTotal + templateCount[idx][i];
              }
              var practiceId = assessedComponent.practiceId - 1 - practiceTotal;
              var currLevelId = assessedComponent.currentScore - 1;
              var targLevelId = assessedComponent.targetScore - 1;
              var currLevelName = assessedComponent.currentLevelName;
              var targLevelName = assessedComponent.targetLevelName;
              var currAssessId = componentId + '_prin_' + principleId + '_prac_' + practiceId + '_td_curr_' + currLevelId;
              var targAssessId = componentId + '_prin_' + principleId + '_prac_' + practiceId + '_td_targ_' + targLevelId;
              var levelLabelId = componentId + '_prin_' + principleId + '_prac_' + practiceId + '_ans';
              var textAreaId = componentId + '_prin_' + principleId + '_prac_' + practiceId + '_action';
              $('#' + currAssessId + ' .iradio_square-blue.curr').addClass('checked');
              $('#' + targAssessId + ' .iradio_square-blue.targ').addClass('checked');
              $('#' + levelLabelId).html('Current: ' + currLevelName + ' | Target: ' + targLevelName);
              $('#' + textAreaId).val(assessedComponent.improveDescription);
            });
          }
        })
      }
    } else {
      if (!self.props.assessment.access) {
        $('textarea').prop('disabled', true);
        $('input[type=\'radio\']').prop('disabled', true);
      }
    }
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
    if (_.isEmpty(self.props.assessment.assessmentTemplate)) {
      return null;
    } else {
      var showingSection1 = -1;
      var showingSection2 = -1;
      if (self.props.assessment.assessmentTemplate.cloudantId.substring(self.props.assessment.assessmentTemplate.cloudantId.length-2, self.props.assessment.assessmentTemplate.cloudantId.length-1) == 0) {
        var versionNumber = self.props.assessment.assessmentTemplate.cloudantId.substring(self.props.assessment.assessmentTemplate.cloudantId.length-1, self.props.assessment.assessmentTemplate.cloudantId.length);
      } else {
        versionNumber = self.props.assessment.assessmentTemplate.cloudantId.substring(self.props.assessment.assessmentTemplate.cloudantId.length-2, self.props.assessment.assessmentTemplate.cloudantId.length);
      }
      if (self.props.assessment.templateType.type == 'Project') {
        showingSection1 = 0;
      } else if(self.props.assessment.templateType.type == 'Operations') {
        showingSection1 = 1;
      }
      if (self.props.assessment.templateType.software) {
        showingSection2 = 2;
      }
      var containerId = 'atma';
      if (self.props.assessment.assessmentTemplate.components.length <= 0) {
        var components = null;
      } else {
        var count = 0;
        components = self.props.assessment.assessmentTemplate.components.map(function(component, idx){
          if (idx == showingSection1 || idx == showingSection2) {
            var componentId = containerId + '_' + count;
            var assessedComponents = {};
            if (!_.isEmpty(self.props.assessment.assessment) && !_.isEmpty(self.props.assessment.assessment.components)) {
              assessedComponents = self.props.assessment.assessment.components[count];
            }
            count ++ ;
            return (
              <li key={componentId} id={componentId} data-open='true' class='ibm-active'>
                <a class='ibm-twisty-trigger' style={{'cursor':'pointer'}} onClick={self.expandComponent.bind(null,componentId)}>{component.name}</a>
                <div class='ibm-twisty-body' style={{'display':'block'}}><AssessmentTemplatePrinciple principles={component.principles} componentId={componentId} expandComponent={self.expandComponent}/></div>
              </li>
            )
          }
        });
      }
      return (
        <ul class='ibm-twisty agile-assessment ibm-widget-processed' id={containerId} data-widget='twisty'>
          {components}
          <div id='currTooltip' class='ibm-tooltip-content'>
            <p class='toolTip'>
              Your teams current maturity level.
            </p>
          </div>
          <div id='targTooltip' class='ibm-tooltip-content'>
            <p class='toolTip'>
              Your teams target maturity level.
            </p>
          </div>
        </ul>
      );
    }
  }
});

module.exports = AssessmentActiveTemplates2;
