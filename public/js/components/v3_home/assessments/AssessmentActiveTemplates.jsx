var React = require('react');
var _ = require('underscore');
var moment = require('moment');
var AssessmentTemplatePrinciple = require('./AssessmentTemplatePrinciple.jsx');

var AssessmentActiveTemplates = React.createClass({
  componentDidMount: function() {
    this.initial();
  },
  componentDidUpdate: function() {
    this.initial();
  },

  initial: function() {
    var self = this;
    $('#atma_' + self.props.assessTemplateId + ' .iradio_square-blue').removeClass('checked');
    $('#atma_' + self.props.assessTemplateId + ' span').html('Not answered');
    $('#atma_' + self.props.assessTemplateId + ' a.ibm-twisty-trigger').css('background','');
    $('#atma_' + self.props.assessTemplateId + ' textarea').val('');
    $('#atma_' + self.props.assessTemplateId + ' textarea').prop('disabled', false);
    $('#atma_' + self.props.assessTemplateId + ' input[type=\'radio\']').prop('disabled', false);
    if (self.props.isUpdate && self.props.assessDraft != undefined && !_.isEmpty(self.props.assessDraft) && !_.isEmpty(self.props.assessDraft.componentResults[self.props.assessTemplateId])) {
      var template = self.props.assessTemplate;
      var assessDraft = self.props.assessDraft.componentResults[self.props.assessTemplateId];
      var componentId ='atma_' + self.props.assessTemplateId;
      var templateCount = self.countPractics(template);
      if (!_.isEmpty(assessDraft.assessedComponents)) {
        _.each(assessDraft.assessedComponents, function(assessedComponent){
          var principleId = assessedComponent.principleId - 1;
          var practiceTotal = 0;
          for (var i = 0; i < assessedComponent.principleId - 1; i++) {
            practiceTotal = practiceTotal + templateCount[i];
          }
          var practiceId = assessedComponent.practiceId - 1 - practiceTotal;
          var currLevelId = assessedComponent.currentScore - 1;
          var targLevelId = assessedComponent.targetScore - 1;
          var currLevelName = assessedComponent.currentLevelName==''?'---':assessedComponent.currentLevelName;
          var targLevelName = assessedComponent.targetLevelName==''?'---':assessedComponent.targetLevelName;
          var currAssessId = componentId + '_prin_' + principleId + '_prac_' + practiceId + '_td_curr_' + currLevelId;
          var targAssessId = componentId + '_prin_' + principleId + '_prac_' + practiceId + '_td_targ_' + targLevelId;
          var levelLabelId = componentId + '_prin_' + principleId + '_prac_' + practiceId + '_ans';
          var textAreaId = componentId + '_prin_' + principleId + '_prac_' + practiceId + '_action';
          $('#' + currAssessId + ' .iradio_square-blue.curr').addClass('checked');
          $('#' + targAssessId + ' .iradio_square-blue.targ').addClass('checked');
          if (currLevelName == '---' && targLevelName == '---') {
            $('#' + levelLabelId).html('Not answered');
          } else {
            $('#' + levelLabelId).html('Current: ' + currLevelName + ' | Target: ' + targLevelName);
          }
          $('#' + textAreaId).val(assessedComponent.improveDescription);
        });
      }
    } else {
      $('textarea').prop('disabled', self.props.haveAccess);
      $('input[type=\'radio\']').prop('disabled', self.props.haveAccess);
    }
  },
  // countPractics: function(template) {
  //   var templateCount = []
  //   _.each(template.components, function(component){
  //     var practiceCount= [];
  //     _.each(component.principles, function(principle){
  //        practiceCount.push(principle.practices.length);
  //     });
  //     templateCount.push(practiceCount);
  //   });
  //   return templateCount;
  // },
  countPractics: function(template) {
    var practiceCount= [];
    _.each(template.principles, function(principle){
       practiceCount.push(principle.practices.length);
    });
    return practiceCount;
  },
  expandComponent: function(cid) {
    if ($('#' + cid).hasClass('ibm-active')) {
      $('#' + cid).removeClass('ibm-active');
      $('#' + cid + ' > .ibm-twisty-trigger').removeClass('expand');
      $('#' + cid + ' > .ibm-twisty-trigger').addClass('collapse');
      $('#' + cid + ' > .ibm-twisty-body').css('display','none');
    } else {
      $('#' + cid).addClass('ibm-active');
      $('#' + cid + ' > .ibm-twisty-trigger').removeClass('collapse');
      $('#' + cid + ' > .ibm-twisty-trigger').addClass('expand');
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
        <div class='ibm-twisty agile-assessment ibm-widget-processed' id={containerId} data-widget='twisty'>
          <div key={componentId} id={componentId}>
            <AssessmentTemplatePrinciple principles={self.props.assessTemplate.principles} componentId={componentId} expandComponent={self.expandComponent}/>
          </div>
        </div>
      );
    }
  }
});

module.exports = AssessmentActiveTemplates;
