function teamAssessmentListHander(teamId, teamAssessments) {
  $('#gotoAssesmentList').attr('disabled', 'disabled');

  var allowAccess = hasAccess(teamId);
  //var listOption = getAssessmentDropdownList(sortAssessments(teamAssessments));
  var listOption = assessmentDropdownList(teamAssessments);

  var draftExist = false;
  for (var i = 0; i < listOption.length; i++) {
    if (listOption[i][1].toLowerCase().indexOf('draft') > -1) {
      draftExist = true;
      draftAssesID = listOption[i][0];
      break;
    }
  }

  $('#CreateAssesmentBtn').attr('disabled', 'disabled');
  if (allowAccess) {
    if (!draftExist) {
      $('#CreateAssesmentBtn').removeAttr('disabled');
      $('#CreateAssesmentBtn').click(function(e) {
        window.location = 'assessment?id=' + encodeURIComponent(teamId) + '&assessId=new';
      });
    }
  }

  $('#GoAssesmentBtn').click(function() {
    var teamID = encodeURIComponent(teamId);
    var assessId = encodeURIComponent($('#gotoAssesmentList option:selected').val());
    var isDraft = ($('#gotoAssesmentList option:selected').text().toLowerCase().indexOf('draft') > -1);
    if (assessId == '' || isDraft)
      window.location = 'assessment?id=' + teamID + '&assessId=' + assessId;
    else
      window.location = 'progress?id=' + teamID + '&assessId=' + assessId;
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
}

function hasAccessToAssessment(teamId) {
  var url = '/api/users/isuserallowed?' + 'email=' + encodeURIComponent((userInfo.email).toLowerCase()) + '&teamId=' + encodeURIComponent(teamId);
  var req = $.ajax({
    type: 'GET',
    url: url
  }).done(function(data) {
    if (data == true) {
    }
  }).fail(function(err){
    console.log(err);
  });
}

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
  return moment(date).format('DDMMMYYYY');
};

function destroyAssessmentCharts() {
  // destroy existing charts in the main container
  $(Highcharts.charts).each(function(i, chart) {
    if (chart == null) return;

    if ($('#assessmentCharts #' + $(chart.container).attr('id')).length > 0) {
      chart.destroy();
    }
  });

  $('#assessmentCharts').empty();

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

  chartSeries = [];
  var chartData = new Object();

  if (assessmentsToPlot.length > 0)
    $('#assessmentCharts').empty();

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

      var submitDate = fmDate(assessmentsToPlot[i]['submittedDate']);
      chartData['categories'].push(submitDate);
      chartData['targetScore'].push(isNaN(parseFloat(results[j]['targetScore'])) ? 0 : parseFloat(results[j]['targetScore']));
      chartData['currentScore'].push(isNaN(parseFloat(results[j]['currentScore'])) ? 0 : parseFloat(results[j]['currentScore']));
      chartData['assessmentResult'].push(results[j]['assessedComponents']);

    }
  }
  // alert('sections done');
  // plot the line graph of selected maturity assessments
  $.each(chartSeries, function(index, chartData) {
    $('#' + chartData['prefixId'] + '_Chart').highcharts({
      chart: {
        type: 'line', width: 380
      },

      title: {
        style: {
          'fontSize': '14px'
        },
        text: 'Overall Maturity for ' + chartData['title']
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
        shared: true,
        //pointFormat : '<span style="color:{series.color}">{series.name}: <b>{point.y:,.1f}</b><br/>'
        formatter: function() {
          var tt = this.x + '<br/>';
          for (var i = 0; i < this.points.length; i++) {
            tt = tt + "<label style='color:" + this.points[i].color + ";'>" + this.points[i].series.name + '</label>: ' + "<label style='font-weight: bold;'>" + this.points[i].y + '</label><br/>';
          }
          tt = tt + "<i style='font-size: 8pt;'>Select to see practice results</i>";
          return tt;
        },
        useHTML: true,
        style: {
          'fontSize': '11px'
        }
      },

      legend: {
        align: 'center',
        verticalAlign: 'bottom',
        layout: 'horizontal'
      },

      credits: {
        enabled: false
      },

      series: [{
        name: 'Current',
        data: chartData['currentScore'],
        point: {
            // click event callback to render spider graph data of practices for the particular series point.
          events: {
            click: function() {
              plotAssessment(this.index, chartData);
            }
          }
        }
      }
        /*, {
        						name : "Target overall",
        						data : chartData["targetScore"],
        						point : {
        							// click event callback to render spider graph data of  practices for the particular series point.
        							events : {
        								click : function() {
        									console.log(this);
        									plotAssessment(this.index, chartData);
        								}
        							}
        						}
        					}*/
      ]
    });
  });

  // plot the spider graph of the last assessment in the series.
  for (i = 0; i < chartSeries.length; i++) {
    var lastResultIndex = chartSeries[i]['assessmentResult'].length - 1;
    plotAssessment(lastResultIndex, chartSeries[i]);
  }
}

function plotAssessment(index, chartData) {
  spiderData = new Object();
  spiderData['title'] = chartData['title'] + ' Practices for ' + chartData['categories'][index]; // "Assessment Practices for " + chartData["categories"][index];
  spiderData['prefixId'] = chartData['prefixId'];
  spiderData['categories'] = [];
  spiderData['targetScore'] = [];
  spiderData['currentScore'] = [];
  var practices = chartData['assessmentResult'][index];
  for (var i = 0; i < practices.length; i++) {
    spiderData['categories'].push(practices[i]['practiceName']);
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
          var text = this.renderer.text('Select an overall score on the adjacent graph to view practice results.', 30, 295)
            .css({
              width: '450px',
              color: '#222',
              fontSize: '10px'
            }).add();
        }
      }
    },

    title: {
      style: {
        'fontSize': '13px'
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
      shared: true,
      pointFormat: '<span style="color:{series.color}">{series.name}: <b>{point.y:,.1f}</b><br/>'
    },

    legend: {
      align: 'center',
      verticalAlign: 'bottom',
      layout: 'horizontal'
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
