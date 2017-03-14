var React = require('react');
var api = require('../../api.jsx');
var _ = require('underscore');
var moment = require('moment');
var ReactDOM = require('react-dom');
var InlineSVG = require('svg-inline-react');
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
            assessmentsData[type]['Overall']['current'].push(componentResult.currentScore);
            assessmentsData[type]['Overall']['target'].push(componentResult.targetScore);
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
    var self = this;
    if (self.props.assessType == 'Project' && self.props.componentId == '1') {
      var assessType = 'Project';
    } else if (self.props.assessType == 'Operations' && self.props.componentId == '1') {
      assessType = 'Operations';
    } else {
      assessType = 'Team Delivery';
    }
    var assessChartData = [
      {
        name: 'Target',
        data: assessmentsData[assessType][title]['target']
      },
      {
        name: 'Current',
        data: assessmentsData[assessType][title]['current']
      }
    ];
    self.loadResultChart('agileSummaryChart' + self.props.componentId, title, 'line', assessmentsData[assessType]['Date'], 'Maturity Level', assessChartData, null);
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
                color: '#323232',
                fontSize: '1.2em'
              }).add();
          }
        }
      },

      title: {
        style: {
          'fontSize': '1.4em'
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
  render: function() {
    var self = this;
    if (!_.isEmpty(self.props.componentResult)) {
      var components = self.props.componentResult.assessedComponents.map(function(component, idx){
        return (
          <div key={'component-block_' + idx} class='component-block'>
            <div style={{'width':'70%'}}>
              <h1 onClick={self.displayGraphHandler.bind(null, component.practiceName)}>{component.practiceName}</h1>
            </div>
            <div style={{'width':'15%'}}>
              <h2>{component.currentScore}</h2>
            </div>
            <div style={{'width':'15%'}}>
              <h2>{component.targetScore}</h2>
            </div>
          </div>
        )
      });
      return (
        <div class='agile-summary' id={'assessmentContainer' + self.props.componentId}>
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
