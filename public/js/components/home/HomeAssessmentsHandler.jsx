var Promise = require('bluebird');
var _ = require('underscore');
var moment = require('moment');

module.exports.teamAssessmentListHander = function(teamId, teamAssessments, teamAccess) {
  $('#gotoAssesmentList').attr('disabled', 'disabled');

  var allowAccess = teamAccess;
  //var listOption = getAssessmentDropdownList(sortAssessments(teamAssessments));
  var listOption = assessmentDropdownList(teamAssessments);

  var draftExist = false;
  for (var i = 0; i < listOption.length; i++) {
    if (listOption[i][1].toLowerCase().indexOf('draft') > -1) {
      draftExist = true;
      var draftAssesID = listOption[i][0];
      break;
    }
  }

  $('#CreateAssesmentBtn').attr('disabled', 'disabled');
  if (allowAccess) {
    if (!draftExist) {
      $('#CreateAssesmentBtn').removeAttr('disabled');
      $('#CreateAssesmentBtn').click(function(e) {
        window.location = 'assessment?id=' + encodeURIComponent(teamId);
      });
    }
  }

  $('#GoAssesmentBtn').click(function() {
    var teamID = encodeURIComponent(teamId);
    var assessId = encodeURIComponent($('#gotoAssesmentList option:selected').val());
    var isDraft = ($('#gotoAssesmentList option:selected').text().toLowerCase().indexOf('draft') > -1);
    if (assessId == '' || isDraft) {
      window.location = 'assessment?id=' + teamID + '&assessId=' + assessId;
    }
    else {
      window.location = 'progress?id=' + teamID + '&assessId=' + assessId;
    }
  });

  if (listOption.length > 6) {
    newOption = [];
    for (var i = 0; i <= 5; i++)
      newOption.push(listOption[i]);
    listOption = newOption;
  }

  setSelectOptions('gotoAssesmentList', listOption, null, null, null);
  IBMCore.common.widget.selectlist.init('#gotoAssesmentList');

  $('#gotoAssesmentList').removeAttr('disabled');

  plotAssessmentSeries(teamAssessments);

  // redrawCharts('assessmentSection');
};

function assessmentDropdownList(assessments) {
  var listOption = [];

  if (assessments == undefined || assessments == null) return listOption;

  for (var i = 0; i < assessments.length; i++) {
    var option = [];
    option.push(assessments[i]._id);
    if (assessments[i]['assessmentStatus'] != '' && assessments[i]['assessmentStatus'].toLowerCase() == 'submitted')
      option.push(fmDate(assessments[i]['submittedDate']));
    else
      option.push('Created: ' + fmDate(assessments[i]['createDate']) + ' (' + assessments[i]['assessmentStatus'] + ')');

    listOption.push(option);
  }
  return listOption;
}

function fmDate(date) {
  return moment.utc(date).format('DDMMMYYYY');
};

function destroyAssessmentCharts() {
  // destroy existing charts in the main container
  $(Highcharts.charts).each(function(i, chart) {
    if (chart == null) return;

    if ($('#assessmentSection #' + $(chart.container).attr('id')).length > 0) {
      chart.destroy();
    }
  });
}

function noAssessmentRecord(){
  $('#assessmentCharts').empty();
  $('#assessmentCharts').css('min-height', '40px');
  var p = document.createElement('p');
  p.appendChild(document.createTextNode('No assessment results to display.'));
  $('#assessmentCharts').append(p);

  var hrDiv = document.createElement('div');
  hrDiv.setAttribute('class', 'ibm-rule ibm-alternate ibm-gray-30');
  hrDiv.appendChild(document.createElement('hr'));
  $('#assessmentCharts').append(hrDiv);
}

function plotAssessmentSeries(teamAssessments) {
  destroyAssessmentCharts();

  //get the 5 latest submitted results
  var assessmentsToPlot = [];
  for (var i = 0; i < teamAssessments.length && assessmentsToPlot.length <= 5; i++) {
    if (teamAssessments[i]['assessmentStatus'] != null && teamAssessments[i]['assessmentStatus'].toLowerCase() == 'submitted') {
      assessmentsToPlot.push(teamAssessments[i]);
    }
  }

  var chartSeries = [];
  var chartData = new Object();

  if (assessmentsToPlot.length > 0){
    $('#assessmentCharts').empty();
    $('#assessmentCharts').css('min-height', '280px');
  }
  else {
    noAssessmentRecord();
  }

  for (i = assessmentsToPlot.length - 1; i > -1; i--) {
    var results = assessmentsToPlot[i]['componentResults'];
    for (var j = 0; j < results.length; j++) {
      var found = false;
      var identifier = '';
      if ((results[j]['componentName'].toLowerCase().indexOf('leadership') > -1 && results[j]['componentName'].toLowerCase().indexOf('ops') == -1) &&
        (results[j]['componentName'].toLowerCase().indexOf('leadership') > -1 && results[j]['componentName'].toLowerCase().indexOf('operations') == -1)) {
        identifier = 'prj';
      } else if ((results[j]['componentName'].toLowerCase().indexOf('leadership') > -1 && results[j]['componentName'].toLowerCase().indexOf('ops') > -1) ||
        (results[j]['componentName'].toLowerCase().indexOf('leadership') > -1 && results[j]['componentName'].toLowerCase().indexOf('operations') > -1)) {
        identifier = 'ops';
      } else if (results[j]['componentName'].toLowerCase().indexOf('delivery') > -1) {
        identifier = 'devops';
      }

      $.each(chartSeries, function(index, obj) {
        if (obj['prefixId'] == identifier) {
          found = true;
          chartData = obj;
          // assessment name to be shown as graph title
          chartData['title'] = results[j]['componentName'];

        }
      });
      if (!found) {
        // create a section in the page for the particular assessment group
        $('#assessmentCharts').append(createChartSection(identifier));
        // var hrDiv = document.createElement('div');
        // hrDiv.setAttribute('class', 'ibm-rule ibm-alternate ibm-gray-30');
        // hrDiv.appendChild(document.createElement('hr'));
        // $('#assessmentCharts').append(hrDiv);

        chartData = new Object();
        // page element id that will render the graph data
        chartData['prefixId'] = identifier;
        // assessment name to be shown as graph title
        chartData['title'] = results[j]['componentName'];
        // x-axis graph labels
        chartData['categories'] = [];
        // data series to plot
        chartData['targetScore'] = [];
        chartData['currentScore'] = [];
        // placeholder for the spider chart data containing the answers to all practices for the particular assessment
        chartData['assessmentResult'] = [];
        // holder for all chart data to be shown
        chartSeries.push(chartData);

      }

      var submitDate = moment.utc(assessmentsToPlot[i]['submittedDate']).format('DD MMM YYYY'); //fmDate(assessmentsToPlot[i]['submittedDate']);
      chartData['categories'].push(submitDate);
      chartData['targetScore'].push(isNaN(parseFloat(results[j]['targetScore'])) ? 0 : parseFloat(results[j]['targetScore']));
      chartData['currentScore'].push(isNaN(parseFloat(results[j]['currentScore'])) ? 0 : parseFloat(parseFloat(results[j]['currentScore']).toFixed(1)));
      chartData['assessmentResult'].push(results[j]['assessedComponents']);
    }
  }

  // plot the line graph of selected maturity assessments
  $.each(chartSeries, function(index, chartData) {
    $('#' + chartData['prefixId'] + '_Chart').highcharts({
      chart: {
        type: 'line', width: 380
      },
      title: {
        style: {
          fontSize: '13px',
          fontWeight: 'bold'
        },
        text: chartData['title'] //'Overall Maturity for ' + chartData['title']
      },

      xAxis: {
        labels: {
          style: {
            'fontSize': '9px'
          }
        },
        categories: chartData['categories'],
        tickmarkPlacement: 'on'
      },

      yAxis: {
        max: 4,
        min: 0,
        title: {
          text: 'Maturity level'
        },
        labels: {
          style: {
            'fontSize': '9px'
          }
        },
        endOnTick: false,
        tickInterval: 1,
        allowDecimals: false
      },

      tooltip: {
        formatter: function() {
          var tt = '<b>' + this.key + '<b><br>';
          var point = this.point.index;
          for (var i=0;i < this.series.chart.series.length; i++) {
            if (this.series.chart.series[i].visible)
              tt +=
                '<span style="color:' +  this.series.chart.series[i].data[point].color + '">' + getCharacter(this.series.chart.series[i].symbol) +' </span>' + this.series.chart.series[i].name + ': ' + this.series.chart.series[i].data[point].y + '<br>';
          }
          tt = tt + "<i style='font-size: 8pt;'>Click to see practice results</i>";
          return tt;
        }
      },

      legend: {
        align: 'center',
        verticalAlign: 'bottom',
        layout: 'horizontal',
        itemStyle: {fontWeight: 'normal'}
      },

      credits: {
        enabled: false
      },

      plotOptions: {
        series: {
          allowPointSelect: true,
          marker: {
            states: {
              select: {
                fillColor: '#8CD211', lineColor: '#8CD211'
              }
            }
          }
        }
      },

      series: [{
        name: 'Overall maturity',
        data: chartData['currentScore'],
        point: {
            // click event callback to render spider graph data of practices for the particular series point.
          events: {
            click: function() {
              plotAssessment(this.index, chartData);
            }
          }
        }
      }]
    });
  });

  // plot the spider graph of the last assessment in the series.
  for (var i = 0; i < chartSeries.length; i++) {
    var lastResultIndex = chartSeries[i]['assessmentResult'].length - 1;
    plotAssessment(lastResultIndex, chartSeries[i]);
  }
}

function plotAssessment(index, chartData) {
  var spiderData = new Object();
  spiderData['title'] = chartData['title'] + ' Practices for ' + chartData['categories'][index]; // "Assessment Practices for " + chartData["categories"][index];
  spiderData['prefixId'] = chartData['prefixId'];
  spiderData['categories'] = [];
  spiderData['targetScore'] = [];
  spiderData['currentScore'] = [];
  var practices = chartData['assessmentResult'][index];
  for (var i = 0; i < practices.length; i++) {
    var practiceName = practices[i]['practiceName'].toLowerCase();
    practiceName = practiceName.replace(practiceName[0], practiceName[0].toUpperCase());
    spiderData['categories'].push(practiceName);
    spiderData['targetScore'].push(isNaN(parseFloat(practices[i]['targetScore'])) ? 0 : parseFloat(practices[i]['targetScore']));
    spiderData['currentScore'].push(isNaN(parseFloat(practices[i]['currentScore'])) ? 0 : parseFloat(practices[i]['currentScore']));
  }

  if ($('#' + spiderData['prefixId'] + '_SpiderChart').highcharts() != null)
    $('#' + spiderData['prefixId'] + '_SpiderChart').highcharts().destroy();

  $('#' + spiderData['prefixId'] + '_SpiderChart').highcharts({
    chart: {
      polar: true,
      type: 'line', width: 380,
      events: {
        load: function() {
          var text = this.renderer.text('Select an overall score on the adjacent graph to view practice results.', 25, 307)
            .css({
              width: '450px',
              color: '#222'
            }).add();
        }
      }
    },

    title: {
      style: {
        fontSize: '13px',
        fontWeight: 'bold'
      },
      text: spiderData['title']
    },

    xAxis: {
      reserveSpace: false,
      labels: {
        style: {
          'whiteSpace': 'nowrap',
          'fontSize': '10px'
        },
        formatter: function() {
          var text = this.value,
            formatted = text.length > 15 ? text.substring(0, 15) + '...' : text;

          return formatted;
        }
      },
      categories: spiderData['categories'],
      tickmarkPlacement: 'on',
      lineWidth: 0
    },

    yAxis: {
      labels: {
        style: {
          'fontSize': '9px'
        },
        enabled: false
      },
      gridLineInterpolation: 'polygon',
      lineWidth: 0,
      max: 4,
      min: 0,
      maxPadding: 0.1,
      tickInterval: 1,
      allowDecimals: false
    },

    tooltip: {
      formatter: function() {
        var tt = '<b>' + this.key + '<b><br>';
        var point = this.point.index;
        for (var i=0;i < this.series.chart.series.length; i++) {
          if (this.series.chart.series[i].visible)
            tt +=
              '<span style="color:' +  this.series.chart.series[i].data[point].color + '">' + getCharacter(this.series.chart.series[i].symbol) +' </span>' + this.series.chart.series[i].name + ': ' + this.series.chart.series[i].data[point].y + '<br>';
        }
        return tt;
      }
    },

    legend: {
      align: 'center',
      verticalAlign: 'bottom',
      layout: 'horizontal',
      itemStyle: {fontWeight: 'normal'}
    },

    credits: {
      enabled: false
    },

    series: [{
      name: 'Current',
      data: spiderData['currentScore'],
    }, {
      name: 'Target',
      data: spiderData['targetScore'],
    }]
  });
}

function createChartSection(prefixId) {
  var mainDiv = document.createElement('div');
  mainDiv.setAttribute('class', 'ibm-columns');
  mainDiv.setAttribute('style', 'margin-bottom: 3em;');

  var colDiv = document.createElement('div');
  colDiv.setAttribute('class', 'ibm-col-6-2');

  var div = document.createElement('div');
  div.setAttribute('id', prefixId + '_Chart');
  div.setAttribute('style', 'width: 100%; min-height: 310px;');
  colDiv.appendChild(div);
  mainDiv.appendChild(colDiv);

  colDiv = document.createElement('div');
  colDiv.setAttribute('class', 'ibm-col-6-2');
  div = document.createElement('div');
  div.setAttribute('id', prefixId + '_SpiderChart');
  div.setAttribute('style', 'width: 100%; min-height: 310px;');
  colDiv.appendChild(div);
  mainDiv.appendChild(colDiv);

  return mainDiv;
}

module.exports.assessmentParentRollup = function(snapshotData){
  var assessmentData = snapshotData.assessmentData;
  var date = moment.utc(snapshotData.lastUpdate).format('DD MMM YYYY');
  //set div min height
  $('#assessmentTrend').attr('style','min-height: 380px;');
  $('#assessmentEval').attr('style','min-height: 380px;');
  var graphCategory = [];
  //Evaluation rollup
  var teamNoAssessment = new Object();
  teamNoAssessment.name = 'Squads with no assessment';
  teamNoAssessment.data = [];
  teamNoAssessment.color = '#808080';

  var teamGt120Days = new Object();
  teamGt120Days.name = 'Squads > 120 days since last assessment';
  teamGt120Days.data = [];
  teamGt120Days.color = '#CCCCCC';

  var teamLt120Days = new Object();
  teamLt120Days.name = 'Squads with assessment in last 120 days';
  teamLt120Days.data = [];
  teamLt120Days.color = '#B4E051';

  //Maturity trends rollup
  var teamFoundational = new Object();
  teamFoundational.name = 'Project teams (Foundational practices)';
  teamFoundational.data = [];
  teamFoundational.color = '#7ab4ee';

  var teamDevOps = new Object();
  teamDevOps.name = 'DevOps practices';
  teamDevOps.data = [];
  teamDevOps.color = '#434348';

  var teamOperations = new Object();
  teamOperations.name = 'Operations teams (Foundational practices)';
  teamOperations.data = [];
  teamOperations.color = '#808080';

  for (var i = 0; i < assessmentData.length; i++) {
    var graphCat;

    var tNoData = new Object();
    var tGt120Data = new Object();
    var tLt120Data = new Object();

    var tFoundationData = new Object();
    var tDevOpsData = new Object();
    var tOperationsData = new Object();

    graphCat = assessmentData[i].month;
    graphCategory.push(graphCat);

    tLt120Data.name = assessmentData[i].month;
    var l120days = isNaN(parseInt(assessmentData[i].less_120_days)) ? null : parseInt(assessmentData[i].less_120_days) == 0 ? null : parseInt(assessmentData[i].less_120_days);
    tLt120Data.y = l120days;
    teamLt120Days.data.push(tLt120Data);

    tGt120Data.name = assessmentData[i].month;
    var g120days = isNaN(parseInt(assessmentData[i].gt_120_days)) ? null : parseInt(assessmentData[i].gt_120_days) == 0 ? null : parseInt(assessmentData[i].gt_120_days);
    tGt120Data.y = g120days;
    teamGt120Days.data.push(tGt120Data);

    tNoData.name = assessmentData[i].month;
    var noData = isNaN(parseInt(assessmentData[i].no_submission)) ? null : parseInt(assessmentData[i].no_submission) == 0 ? null : parseInt(assessmentData[i].no_submission);
    tNoData.y = noData;
    teamNoAssessment.data.push(tNoData);

    tFoundationData.name = assessmentData[i].month;
    var foundationScore = isNaN(parseFloat(assessmentData[i].prj_foundation_score)) ? null : parseFloat(assessmentData[i].prj_foundation_score) == 0 ? null : (parseFloat(assessmentData[i].prj_foundation_score));
    tFoundationData.y = (foundationScore == null) ? null : parseFloat(foundationScore.toFixed(1));
    tFoundationData.squads = assessmentData[i].total_prj_foundation;
    teamFoundational.data.push(tFoundationData);

    tDevOpsData.name = assessmentData[i].month;
    var devopsScore = isNaN(parseFloat(assessmentData[i].prj_devops_score)) ? null : parseFloat(assessmentData[i].prj_devops_score) == 0 ? null : (parseFloat(assessmentData[i].prj_devops_score));
    tDevOpsData.y = (devopsScore == null) ? null : parseFloat(devopsScore.toFixed(1));
    tDevOpsData.squads = assessmentData[i].total_prj_devops;
    teamDevOps.data.push(tDevOpsData);

    tOperationsData.name = assessmentData[i].month;
    var operationScore = isNaN(parseFloat(assessmentData[i].operation_score)) ? null : parseFloat(assessmentData[i].operation_score) == 0 ? null : (parseFloat(assessmentData[i].operation_score));
    tOperationsData.y = (operationScore == null) ? null : parseFloat(operationScore.toFixed(1));
    tOperationsData.squads = assessmentData[i].total_operation;
    teamOperations.data.push(tOperationsData);
  }

  loadBarAssessmentEvaluation('assessmentEval', date, graphCategory,teamLt120Days, teamGt120Days, teamNoAssessment, 100);
  loadLineMaturityTrend('assessmentTrend', graphCategory, teamFoundational, teamDevOps, teamOperations, 4);
};

function loadBarAssessmentEvaluation(id, asOfDate, categories, seriesObj1, seriesObj2, seriesObj3, yMax) {
  Highcharts.setOptions({
    lang: {
      thousandsSep: ''
    }
  });

  new Highcharts.Chart({
    chart: {
      type: 'column',
      renderTo: id,
      marginLeft: 60,
      width:390,
      events: {
        load: function(event) {
          // modify the legend symbol
          $('#' +id+' .highcharts-legend-item rect').attr('width', '7').attr('height', '7').attr('x', '5').attr('y', '7');
        }
      }
    },
    lang: {
      noData: 'No data to display'
    },
    noData: {
      style: {
        fontWeight: 'normal',
        fontSize: '12px',
        color: '#303030'
      }
    },
    title: {
      style: {
        fontSize: '13px',
        fontWeight: 'bold'
      },
      text:  'Frequency of Maturity Assessment Evaluations',
      x: 23
    },
    subtitle: {
      style: {
        fontSize: '13px'
      }, y: 27,
      text: '(as of ' + asOfDate + ')'
    },
    legend: {
      symbolRadius: 0,
      itemStyle: {fontWeight: 'normal'}
    },
    xAxis: {
      labels: {
        style: {
          'fontSize': '9px'
        }
      },
      title: {
        text: 'Months'
      },
      categories: categories,
      tickmarkPlacement: 'on'
    },
    yAxis: {
      min: 0,
      max: yMax,
      tickInterval: 20,
      title: {
        text: '% of squads within the team'
      }
    },
    plotOptions: {
      column: {
        stacking: 'percent'
      },
      series: {
        pointWidth: 35,
        dataLabels: {
          enabled: true,
          style: {
            textShadow: false,
            fontWeight: 'normal'
          }
        }
      }
    },
    tooltip: {
      formatter: function() {
        var formatResult = '<b>' + this.key + '<b><br>';
        var point = this.point.index;
        for (var i=0;i < this.series.chart.series.length; i++) {
          var percentage = this.series.chart.series[i].data[point].percentage || 0;
          if (this.series.chart.series[i].visible && this.series.chart.series[i].data[point].y > 0)
            formatResult +=
              '<span style="color:' +  this.series.chart.series[i].data[point].color + '">' + getCharacter(this.series.chart.series[i].symbol) +' </span>' + this.series.chart.series[i].data[point].y + ' (' + percentage.toFixed(1) + ' % of teams)<br/>';
        }
        return formatResult;
      }
    },
    series: [{
      name: seriesObj3.name,
      data: seriesObj3.data,
      color: seriesObj3.color,
      dataLabels: {
        style:{
          color: 'white'
        }
      }
    }, {
      name: seriesObj2.name,
      data: seriesObj2.data,
      color: seriesObj2.color,
      dataLabels: {
        style:{
          color: 'black'
        }
      }
    }, {
      name: seriesObj1.name,
      data: seriesObj1.data,
      color: seriesObj1.color,
      dataLabels: {
        style:{
          color: 'black'
        }
      }
    }],
    credits: {
      enabled: false
    }
  });
}

function loadLineMaturityTrend(id, categories, seriesObj1, seriesObj2, seriesObj3, yMax) {
  new Highcharts.Chart({
    chart: {
      type: 'line',
      renderTo: id,
      marginLeft: 65,
      width:390
    },
    lang: {
      noData: 'No data to display'
    },
    noData: {
      style: {
        fontWeight: 'normal',
        fontSize: '12px',
        color: '#303030'
      }
    },
    title: {
      style: {
        fontSize: '13px',
        fontWeight: 'bold'
      },
      text: 'Maturity Assessment Trends Per Month',
    },
    subtitle: {
      style: {
        fontSize: '13px'
      }, y: 27,
      text: '(based on most recent assessments)'
    },
    legend: {
      align: 'center',
      verticalAlign: 'bottom',
      layout: 'vertical',
      itemStyle: {fontWeight: 'normal'}
    },
    xAxis: {
      labels: {
        style: {
          'fontSize': '9px'
        }
      },
      title: {
        text: 'Months'
      },
      categories: categories,
      tickmarkPlacement: 'on'
    },
    yAxis: {
      min: 0,
      max: yMax,
      tickInterval: .5,
      title: {
        text: 'Average maturity level',
        style: {
          width: 170
        },
        x: -12
      }
    },
    tooltip: {
      formatter: function() {
        var formatResult = '<b>' + this.key + '<b><br>';
        var point = this.point.index;
        for (var i=0;i < this.series.chart.series.length; i++) {
          if (this.series.chart.series[i].visible && this.series.chart.series[i].data[point].y)
            formatResult +=
              '<span style="color:' +  this.series.chart.series[i].data[point].color + '">' + getCharacter(this.series.chart.series[i].symbol) +' </span>' + this.series.chart.series[i].data[point].y + ' ('+ this.series.chart.series[i].data[point].squads + ' squads)<br/>';
        }
        return formatResult;
      }
    },
    series: [{
      name: seriesObj1.name,
      data: seriesObj1.data,
      color: seriesObj1.color,
      marker: {
        symbol: 'circle'
      }
    }, {
      name: seriesObj2.name,
      data: seriesObj2.data,
      color: seriesObj2.color,
      marker: {
        symbol: 'diamond'
      }
    }, {
      name: seriesObj3.name,
      data: seriesObj3.data,
      color: seriesObj3.color,
      marker: {
        symbol: 'triangle'
      }
    }],
    credits: {
      enabled: false
    }
  });
}

function getCharacter(symbol) {
  switch (symbol) {
    case 'circle':
      symbol = '\u25CF';
      break;
    case 'diamond':
      symbol = '\u25C6';
      break;
    case 'square':
      symbol = '\u25A0';
      break;
    case 'triangle':
      symbol = '\u25B2';
      break;
    case 'triangle-down':
      symbol = '\u25BC';
      break;
    default:
      symbol = '\u25A0';
  }
  return symbol;
}
