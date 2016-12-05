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
    if (self.props.selectedAssessment != undefined && !_.isEmpty(self.props.selectedAssessment)) {
      var template = self.props.template;
      var templateCount = self.countPractics(template);
      if (self.props.type == 'Operations') {
        templateCount.splice(0,1);
      } else {
        templateCount.splice(1,1);
      }
      var components = self.props.selectedAssessment.componentResults;
      if (self.props.selectedAssessment.assessmentStatus != 'Draft' || !self.props.access) {
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
              currAssessId = componentId + '_prin_' + principleId + '_prac_' + practiceId + '_td_curr_' + currLevelId;
              targAssessId = componentId + '_prin_' + principleId + '_prac_' + practiceId + '_td_targ_' + targLevelId;
              levelLabelId = componentId + '_prin_' + principleId + '_prac_' + practiceId + '_ans';
              textAreaId = componentId + '_prin_' + principleId + '_prac_' + practiceId + '_action';
              $('#' + currAssessId + ' .iradio_square-blue.curr').addClass('checked');
              $('#' + targAssessId + ' .iradio_square-blue.targ').addClass('checked');
              $('#' + levelLabelId).html('Current: ' + currLevelName + ' | Target: ' + targLevelName);
              $('#' + textAreaId).val(assessedComponent.improveDescription);
            });
          }
        })
      }
    } else {
      if (!self.props.access) {
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
    if (_.isEmpty(self.props.template)) {
      return null;
    } else {
      var showingSection1 = -1;
      var showingSection2 = -1;
      if (self.props.template.cloudantId.substring(self.props.template.cloudantId.length-2, self.props.template.cloudantId.length-1) == 0) {
        var versionNumber = self.props.template.cloudantId.substring(self.props.template.cloudantId.length-1, self.props.template.cloudantId.length);
      } else {
        versionNumber = self.props.template.cloudantId.substring(self.props.template.cloudantId.length-2, self.props.template.cloudantId.length);
      }
      if (self.props.type == 'Project') {
        showingSection1 = 0;
      } else if(self.props.type == 'Operations') {
        showingSection1 = 1;
      }
      if (self.props.software == 'Yes') {
        showingSection2 = 2;
      }
      var containerId = 'atma';
      if (self.props.template.components.length <= 0) {
        var components = null;
      } else {
        var count = 0;
        components = self.props.template.components.map(function(component, idx){
          if (idx == showingSection1 || idx == showingSection2) {
            var componentId = containerId + '_' + count;
            var assessedComponents = {};
            if (!_.isEmpty(self.props.assessment) && !_.isEmpty(self.props.assessment.components)) {
              assessedComponents = self.props.assessment.components[count];
            }
            count ++ ;
            return (
              <li key={componentId} id={componentId} data-open='true' class='ibm-active'>
                <a class='ibm-twisty-trigger' style={{'cursor':'pointer'}} onClick={()=>self.expandComponent(componentId)}>{component.name}</a>
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
