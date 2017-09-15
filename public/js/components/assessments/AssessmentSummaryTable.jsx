var React = require('react');
var api = require('../api.jsx');
var _ = require('underscore');
var moment = require('moment');
var ReactDOM = require('react-dom');
var InlineSVG = require('svg-inline-react');
var Tooltip = require('react-tooltip');
var assessmentsData = {
  'Project': {
  },
  'Operations': {
  },
  'Team Delivery': {
  }
};

var AssessmentSummaryTable = React.createClass({
  componentDidMount: function() {
    var self = this;
    assessmentsData = {
      'Project': {
      },
      'Operations': {
      },
      'Team Delivery': {
      }
    };
    if (self.props.loadDetailTeam && self.props.loadDetailTeam.assessments.length > 0) {
      var assessments = _.clone(self.props.loadDetailTeam.assessments);
      _.each(assessments.reverse(), function(assessment){
        if (assessment.assessmentStatus == 'Submitted') {
          _.each(assessment.componentResults, function(componentResult, idx){
            var type = 'Project';
            if (assessment.type == 'Project' && idx == 0) {
              type = 'Project';
            } else if (assessment.type == 'Operations' && idx == 0) {
              type = 'Operations';
            } else {
              type = 'Team Delivery';
            }
            if (assessmentsData[type]['Overall'] == null) {
              assessmentsData[type]['Overall'] = {};
              assessmentsData[type]['Overall']['current'] = [];
              assessmentsData[type]['Overall']['target'] = [];
            }
            if (assessmentsData[type]['Date'] == null) {
              assessmentsData[type]['Date'] = [];
            }
            assessmentsData[type]['Overall']['current'].push(parseFloat(componentResult.currentScore==null?0:componentResult.currentScore.toFixed(1)));
            assessmentsData[type]['Overall']['target'].push(parseFloat(componentResult.targetScore==null?0:componentResult.targetScore.toFixed(1)));
            assessmentsData[type]['Date'].push(moment.utc(assessment.submittedDate).format('DD MMM YYYY'));
            _.each(componentResult.assessedComponents, function(assessedComponent, idx2){
              switch (assessedComponent.practiceName) {
                case 'Adaptive Planning (Release and Iteration Planning)' :
                  var practiceName = 'Release and Iteration Planning';
                  break;
                case 'Track & Visualize Progress (Walls)' :
                  var practiceName = 'Walls of Work';
                  break;
                case 'Work Break Down (Stories)' :
                  var practiceName = 'Story Cards';
                  break;
                case 'Work Prioritization':
                  var practiceName = 'Backlog Refinement';
                  break;
                default:
                  practiceName = assessedComponent.practiceName;
              }
              if (assessmentsData[type][practiceName] == null) {
                assessmentsData[type][practiceName] = {};
                assessmentsData[type][practiceName]['current'] = [];
                assessmentsData[type][practiceName]['target'] = [];
              }
              assessmentsData[type][practiceName]['current'].push(assessedComponent.currentScore);
              assessmentsData[type][practiceName]['target'].push(assessedComponent.targetScore);
            });
          });
        }
      });
    }
    self.displayGraphHandler('Overall');
  },

  displayGraphHandler: function(title) {
    switch (title) {
      case 'Adaptive Planning (Release and Iteration Planning)' :
        var tempTitle = 'Release and Iteration Planning';
        break;
      case 'Track & Visualize Progress (Walls)' :
        var tempTitle = 'Walls of Work';
        break;
      case 'Work Break Down (Stories)' :
        var tempTitle = 'Story Cards';
        break;
      case 'Work Prioritization':
        var tempTitle = 'Backlog Refinement';
        break;
      default:
        tempTitle = title;
    }
    var self = this;
    if (self.props.assessType == 'Project' && self.props.componentId == '1') {
      var assessType = 'Project';
    } else if (self.props.assessType == 'Operations' && self.props.componentId == '1') {
      assessType = 'Operations';
    } else {
      assessType = 'Team Delivery';
    }
    if (assessmentsData[assessType][tempTitle] != undefined) {
      var assessChartData = [
        {
          name: 'Target',
          data: assessmentsData[assessType][tempTitle]['target']
        },
        {
          name: 'Current',
          data: assessmentsData[assessType][tempTitle]['current']
        }
      ];
      if ($('#agileSummaryChart' + self.props.componentId).length > 0) {
        self.loadResultChart('agileSummaryChart' + self.props.componentId, title, 'line', assessmentsData[assessType]['Date'], 'Maturity Level', assessChartData, null);
      }
    }
  },
  /**
   * id - element id to where the graph will be inserted
   * title - label for the graph
   * type - type of graph to be created (e.g. line, bar)
   * categories - label for the x-axis
   * yAxisLabel - label for the y-axis. pass null if no label needed
   * series - the array of values. should have an object with name and data on it
   * unit - unit for plotted values
   * addText - additional text to be displayed below the legend
   */
  loadResultChart: function(id, title, type, categories, yAxisLabel, series, unit, addText) {
    new Highcharts.Chart({
      chart: {
        type: type,
        renderTo: id,
        events: {
          load: function() {
            var text = this.renderer.text(addText, 145, 395)
              .css({
                width: '100%',
                color: '#5A5A5A',
                fontSize: '1.2em'
              }).add();
          }
        }
      },

      title: {
        style: {
          'fontSize': '1.3em'
        },
        text: title
      },

      xAxis: {
        categories: categories,
        tickmarkPlacement: 'on'
      },

      yAxis: {
        max: 5,
        min: 0,
        title: {
          text: yAxisLabel
        },
        allowDecimals: false
      },

      credits: {
        enabled: false
      },

      tooltip: {
        valueSuffix: unit,
        formatter: function() {
          var s1 = this.series.chart.series[0].processedYData[this.point.index];
          var s2 = this.series.chart.series[1].processedYData[this.point.index];
          var s3;
          if (this.series.chart.series[2] != undefined) {
            s3 = this.series.chart.series[2].processedYData[this.point.index];
          }

          var formatResult = '';
          if (s1 == s2) {
            formatResult = '<span style="color:' + this.series.color + '">\u25CF</span>' + this.series.chart.series[0].name + ' :<b>' + s1 + '</b><br/>' + '<span style="color:' + this.series.chart.series[1].color + '">\u25CF</span>' + this.series.chart.series[1].name + ' :<b>' + s2 + '</b>';
          } else {
            formatResult = '<span style="color:' + this.series.color + '">\u25CF</span>' + this.series.name + ' :<b>' + this.y + '</b>';
          }

          if (s3 != undefined) {
            if (this.y == s3 && this.series.name != this.series.chart.series[2].name) {
              formatResult = formatResult + '<br/><span style="color:' + this.series.chart.series[2].color + '">\u25CF</span>' + this.series.chart.series[2].name + ' :<b>' + s3 + '</b>';
            }
          }

          return formatResult;
        }
      },

      legend: {
        align: 'center',
        verticalAlign: 'bottom',
        layout: 'horizontal'
      },

      series: series
    });
  },
  countPractices: function(template) {
    var practiceCount= [];
    if (!_.isEmpty(template)) {
      _.each(template.principles, function(principle){
        _.each(principle.practices, function(practice, idx){
          practiceCount.push(idx);
        });
      });
    }
    return practiceCount;
  },
  render: function() {
    var self = this;
    if (!_.isEmpty(self.props.componentResult)) {
      var templateCount = [];
      _.each(self.props.assessTemplate.components, function(c) {
        templateCount.push(self.countPractices(c));
      });

      // exists for compatibility with assessments done on previous templates with different component naming convention
      if (self.props.componentResult.componentName.indexOf('Project') >= 0 || self.props.componentResult.componentName == 'Team Agile Leadership and Collaboration' || self.props.componentResult.componentName == 'Agile Leadership and Collaboration') {
        var tpTemplate = self.props.assessTemplate.components[0];
        var tpCount = templateCount[0];
      } else if (self.props.componentResult.componentName.indexOf('Operations') >= 0 || self.props.componentResult.componentName.indexOf('Ops') >= 0) {
        var tpTemplate = self.props.assessTemplate.components[1];
        tpCount = templateCount[1];
      } else {
        if (self.props.assessTemplate.version.indexOf('v01') >= 0) {
          var tpTemplate = self.props.assessTemplate.components[1];
          tpCount = templateCount[2];
        } else {
          var tpTemplate = self.props.assessTemplate.components[2];
          tpCount = templateCount[2];
        }
      }

      var components = self.props.componentResult.assessedComponents.map(function(component, idx){
        var principleIndex = parseInt(component['principleId']) - 1;
        var practiceSumIndex = parseInt(component['practiceId']) - 1;
        var practiceIndex = tpCount[practiceSumIndex];
        var description = tpTemplate.principles[principleIndex].practices[practiceIndex].description;
        var levels = tpTemplate.principles[principleIndex].practices[practiceIndex].levels;
        var currentScoreDescritpion = levels[component.currentScore - 1].criteria.join(' <br /> ');
        var targetScoreDescription = levels[component.targetScore - 1].criteria.join(' <br /> ');
        return (
          <div key={'component-block_' + idx} class='component-block'>
            <div style={{'width':'70%'}}>
              <h1 data-tip={description} onClick={self.displayGraphHandler.bind(null, component.practiceName)}>{component.practiceName}</h1>
            </div>
            <div style={{'width':'15%'}}>
              <h2 data-tip={currentScoreDescritpion}>{component.currentScore}</h2>
            </div>
            <div style={{'width':'15%'}}>
              <h2 data-tip={targetScoreDescription}>{component.targetScore}</h2>
            </div>
          </div>
        )
      });
      return (
        <div class='agile-summary' id={'assessmentContainer' + self.props.componentId}>
          <Tooltip html={true} type='light'/>
          <div class='agile-summary-table'>
            <div class='header-title'>
              <h1 style={{'width':'70%'}}>{'Practice'}</h1>
              <h1 style={{'width':'15%'}}>{'Current'}</h1>
              <h1 style={{'width':'15%'}}>{'Target'}</h1>
            </div>
            <div class='component-block'>
              <div style={{'width':'70%'}}>
                <h1 onClick={self.displayGraphHandler.bind(null, 'Overall')}>{'Overall'}</h1>
              </div>
              <div style={{'width':'15%'}}>
                <h2>{self.props.componentResult.currentScore==null?0:self.props.componentResult.currentScore.toFixed(1)}</h2>
              </div>
              <div style={{'width':'15%'}}>
                <h2>{self.props.componentResult.targetScore==null?0:self.props.componentResult.targetScore.toFixed(1)}</h2>
              </div>
            </div>
            {components}
          </div>
          <div class='agile-summary-chart' id={'agileSummaryChart' + self.props.componentId}>
          </div>
        </div>
      )
    } else {
      return null;
    }
  }
});

module.exports = AssessmentSummaryTable;
