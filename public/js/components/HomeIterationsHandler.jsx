var Promise = require('bluebird');
var _ = require('underscore');
var moment = require('moment');

module.exports.squadIterationsHandler = function(teamId, teamIterations, teamAccess) {
  $('#gotoIterationList').attr('disabled', 'disabled');

  var graphCategoryWithChange = [];
  var graphCategory = [];

  var velocitySeries = new Object();
  velocitySeries.name = 'Delivered';
  velocitySeries.data = [];

  var commVelocitySeries = new Object();
  commVelocitySeries.name = 'Planned';
  commVelocitySeries.data = [];

  var throughputSeries = new Object();
  throughputSeries.name = 'Delivered';
  throughputSeries.data = [];

  var commThroughputSeries = new Object();
  commThroughputSeries.name = 'Planned';
  commThroughputSeries.data = [];

  var teamMemSeries = new Object();
  teamMemSeries.name = 'Team members';
  teamMemSeries.data = [];
  var teamMemCountArr = [];

  var fteSeries = new Object();
  fteSeries.name = 'FTE';
  fteSeries.data = [];
  fteSeries.color = '#434348'; //'#A52A2A';
  var fteCountArr = [];

  var targetSeries = new Object();
  targetSeries.name = 'Member goal (5 - 12)';
  targetSeries.data = [];
  targetSeries.color = '#8CD211';

  var defectsStartSeries = new Object();
  defectsStartSeries.name = 'Existing Defects';
  defectsStartSeries.data = [];

  var defectsSeries = new Object();
  defectsSeries.name = 'New';
  defectsSeries.data = [];

  var defectsClosedSeries = new Object();
  defectsClosedSeries.name = 'Resolved';
  defectsClosedSeries.data = [];

  var defectsEndSeries = new Object();
  defectsEndSeries.name = 'Defects at close';
  defectsEndSeries.data = [];

  var deploySeries = new Object();
  deploySeries.name = 'Deployments per iteration';
  deploySeries.data = [];

  var teamSatSeries = new Object();
  teamSatSeries.name = 'Team Satisfaction';
  teamSatSeries.data = [];

  var clientSatSeries = new Object();
  clientSatSeries.name = 'Client Satisfaction';
  clientSatSeries.data = [];

  var storyFTESeries = new Object();
  storyFTESeries.name = 'Stories/Tickets';
  storyFTESeries.data = [];

  var storyPointFTESeries = new Object();
  storyPointFTESeries.name = 'Story points';
  storyPointFTESeries.data = [];

  var cycleTimeBacklogSeries = new Object();
  cycleTimeBacklogSeries.name = 'Cycle time in backlog';
  cycleTimeBacklogSeries.data = [];

  var cycleTimeWIPSeries = new Object();
  cycleTimeWIPSeries.name = 'Cycle time in WIP';
  cycleTimeWIPSeries.data = [];

  var series = [];
  var iterationURL = 'iteration?id=' + encodeURIComponent(teamId) + '&iter=';

  // Get last 6 iterations
  var crntIter = '';
  var priorIter = '';
  var p6Iterations = [];
  var listOption = [];

  var iterIndx = 0;
  if (teamIterations != null) {
    teamIterations = sortIterations(teamIterations);

    $.each(teamIterations, function(index, value) {

      if (value.status == 'Completed') {
        if (iterIndx < 6) {
          var option = [value._id, value.name];
          listOption.push(option);
          p6Iterations.push(value);
        }
        if (crntIter == '') {
          crntIter = value;
        } else if (priorIter == '') {
          priorIter = value;
        }
        iterIndx++;
      } else {
        var option = [value._id, value.name];
        listOption.push(option);
      }
    });
  }

  setSelectOptions('gotoIterationList', listOption, null, null, null);
  IBMCore.common.widget.selectlist.init('#gotoIterationList');

  // charts
  for (var i = p6Iterations.length - 1; i > -1; i--) {
    var vData = new Object();
    var cvData = new Object();
    var tData = new Object();
    var ctData = new Object();
    var tmData = new Object();
    var fteData = new Object();
    var defectStartData = new Object();
    var defectData = new Object();
    var defectClosedData = new Object();
    var defectEndData = new Object();
    var deployData = new Object();
    var teamSatData = new Object();
    var clientSatData = new Object();
    var storiesFTEData = new Object();
    var storyPointFTEData = new Object();
    var cycleTimeBacklogData = new Object();
    var cycleTimeWIPData = new Object();

    var categoryWithChange = '';
    var category = '';
    if (p6Iterations[i].memberChanged) {
      category = showDateDDMMMYYYY(p6Iterations[i].endDate);
      categoryWithChange = '*' + category;
      vData.color = '#FFA500';
      tData.color = '#FFA500';
    } else {
      category = showDateDDMMMYYYY(p6Iterations[i].endDate);
      categoryWithChange = category;
    }
    graphCategoryWithChange.push(categoryWithChange);
    graphCategory.push(category);

    vData.name = p6Iterations[i].name;
    vData.y = isNaN(parseInt(p6Iterations[i].storyPointsDelivered)) ? 0 : parseInt(p6Iterations[i].storyPointsDelivered);
    vData.iterURL = iterationURL + p6Iterations[i]._id;
    vData.startDate = showDateDDMMMYYYY(p6Iterations[i].startDate);
    vData.endDate = showDateDDMMMYYYY(p6Iterations[i].endDate);
    velocitySeries.data.push(vData);

    cvData.name = p6Iterations[i].name;
    cvData.y = isNaN(parseInt(p6Iterations[i].commitedStoryPoints)) ? 0 : parseInt(p6Iterations[i].commitedStoryPoints);
    cvData.iterURL = iterationURL + p6Iterations[i]._id;
    cvData.startDate = showDateDDMMMYYYY(p6Iterations[i].startDate);
    cvData.endDate = showDateDDMMMYYYY(p6Iterations[i].endDate);
    commVelocitySeries.data.push(cvData);

    tData.name = p6Iterations[i].name;
    tData.y = isNaN(parseInt(p6Iterations[i].deliveredStories)) ? 0 : parseInt(p6Iterations[i].deliveredStories);
    tData.iterURL = iterationURL + p6Iterations[i]._id;
    tData.startDate = showDateDDMMMYYYY(p6Iterations[i].startDate);
    tData.endDate = showDateDDMMMYYYY(p6Iterations[i].endDate);
    throughputSeries.data.push(tData);

    ctData.name = p6Iterations[i].name;
    ctData.y = isNaN(parseInt(p6Iterations[i].committedStories)) ? 0 : parseInt(p6Iterations[i].committedStories);
    ctData.iterURL = iterationURL + p6Iterations[i]._id;
    ctData.startDate = showDateDDMMMYYYY(p6Iterations[i].startDate);
    ctData.endDate = showDateDDMMMYYYY(p6Iterations[i].endDate);
    commThroughputSeries.data.push(ctData);

    tmData.name = p6Iterations[i].name;
    tmData.y = isNaN(parseInt(p6Iterations[i].memberCount)) ? 0 : parseInt(p6Iterations[i].memberCount);
    tmData.iterURL = iterationURL + p6Iterations[i]._id;
    tmData.startDate = showDateDDMMMYYYY(p6Iterations[i].startDate);
    tmData.endDate = showDateDDMMMYYYY(p6Iterations[i].endDate);
    teamMemSeries.data.push(tmData);
    teamMemCountArr.push(tmData.y);

    fteData.name = p6Iterations[i].name;
    fteData.y = isNaN(parseInt(p6Iterations[i].memberFte)) ? 0 : parseFloat(p6Iterations[i].memberFte);
    fteData.iterURL = iterationURL + p6Iterations[i]._id;
    fteData.startDate = showDateDDMMMYYYY(p6Iterations[i].startDate);
    fteData.endDate = showDateDDMMMYYYY(p6Iterations[i].endDate);
    fteSeries.data.push(fteData);
    fteCountArr.push(fteData.y);

    targetSeries.data.push(-1);

    defectStartData.name = p6Iterations[i].name;
    defectStartData.y = isNaN(parseInt(p6Iterations[i].defectsStartBal)) ? 0 : parseInt(p6Iterations[i].defectsStartBal);
    defectStartData.iterURL = iterationURL + p6Iterations[i]._id;
    defectStartData.startDate = showDateDDMMMYYYY(p6Iterations[i].startDate);
    defectStartData.endDate = showDateDDMMMYYYY(p6Iterations[i].endDate);
    defectsStartSeries.data.push(defectStartData);

    defectData.name = p6Iterations[i].name;
    defectData.y = isNaN(parseInt(p6Iterations[i].defects)) ? 0 : parseInt(p6Iterations[i].defects);
    defectData.iterURL = iterationURL + p6Iterations[i]._id;
    defectData.startDate = showDateDDMMMYYYY(p6Iterations[i].startDate);
    defectData.endDate = showDateDDMMMYYYY(p6Iterations[i].endDate);
    defectsSeries.data.push(defectData);

    defectClosedData.name = p6Iterations[i].name;
    defectClosedData.y = isNaN(parseInt(p6Iterations[i].defectsClosed)) ? 0 : parseInt(p6Iterations[i].defectsClosed);
    defectClosedData.iterURL = iterationURL + p6Iterations[i]._id;
    defectClosedData.startDate = showDateDDMMMYYYY(p6Iterations[i].startDate);
    defectClosedData.endDate = showDateDDMMMYYYY(p6Iterations[i].endDate);
    defectsClosedSeries.data.push(defectClosedData);

    defectEndData.name = p6Iterations[i].name;
    defectEndData.y = isNaN(parseInt(p6Iterations[i].defectsEndBal)) ? 0 : parseInt(p6Iterations[i].defectsEndBal);
    defectEndData.iterURL = iterationURL + p6Iterations[i]._id;
    defectEndData.startDate = showDateDDMMMYYYY(p6Iterations[i].startDate);
    defectEndData.endDate = showDateDDMMMYYYY(p6Iterations[i].endDate);
    defectsEndSeries.data.push(defectEndData);

    deployData.name = p6Iterations[i].name;
    deployData.y = isNaN(parseInt(p6Iterations[i].deployments)) ? 0 : parseInt(p6Iterations[i].deployments);
    deployData.iterURL = iterationURL + p6Iterations[i]._id;
    deployData.startDate = showDateDDMMMYYYY(p6Iterations[i].startDate);
    deployData.endDate = showDateDDMMMYYYY(p6Iterations[i].endDate);
    deploySeries.data.push(deployData);

    teamSatData.name = p6Iterations[i].name;
    teamSatData.y = isNaN(parseInt(p6Iterations[i].teamSatisfaction)) ? 0 : parseFloat(p6Iterations[i].teamSatisfaction);
    teamSatData.iterURL = iterationURL + p6Iterations[i]._id;
    teamSatData.startDate = showDateDDMMMYYYY(p6Iterations[i].startDate);
    teamSatData.endDate = showDateDDMMMYYYY(p6Iterations[i].endDate);
    teamSatSeries.data.push(teamSatData);

    clientSatData.name = p6Iterations[i].name;
    clientSatData.y = isNaN(parseInt(p6Iterations[i].clientSatisfaction)) ? 0 : parseFloat(p6Iterations[i].clientSatisfaction);
    clientSatData.iterURL = iterationURL + p6Iterations[i]._id;
    clientSatData.startDate = showDateDDMMMYYYY(p6Iterations[i].startDate);
    clientSatData.endDate = showDateDDMMMYYYY(p6Iterations[i].endDate);
    clientSatSeries.data.push(clientSatData);

    var StoriesDel = isNaN(parseInt(p6Iterations[i].deliveredStories)) ? 0 : parseInt(p6Iterations[i].deliveredStories);
    var StoryPointDel = isNaN(parseInt(p6Iterations[i].storyPointsDelivered)) ? 0 : parseInt(p6Iterations[i].storyPointsDelivered);
    var fte = isNaN(parseInt(p6Iterations[i].memberFte)) ? 0 : parseFloat(p6Iterations[i].memberFte);
    var storiesFTE = isNaN(parseInt((StoriesDel / fte).toFixed(1))) ? 0 : parseFloat((StoriesDel / fte).toFixed(1));
    var strPointsFTE = isNaN(parseInt((StoryPointDel / fte).toFixed(1))) ? 0 : parseFloat((StoryPointDel / fte).toFixed(1));

    storiesFTEData.name = p6Iterations[i].name;
    storiesFTEData.y = storiesFTE;
    storiesFTEData.iterURL = iterationURL + p6Iterations[i]._id;
    storiesFTEData.startDate = showDateDDMMMYYYY(p6Iterations[i].startDate);
    storiesFTEData.endDate = showDateDDMMMYYYY(p6Iterations[i].endDate);
    storyFTESeries.data.push(storiesFTEData);

    storyPointFTEData.name = p6Iterations[i].name;
    storyPointFTEData.y = strPointsFTE;
    storyPointFTEData.iterURL = iterationURL + p6Iterations[i]._id;
    storyPointFTEData.startDate = showDateDDMMMYYYY(p6Iterations[i].startDate);
    storyPointFTEData.endDate = showDateDDMMMYYYY(p6Iterations[i].endDate);
    storyPointFTESeries.data.push(storyPointFTEData);

    cycleTimeBacklogData.name = p6Iterations[i].name;
    cycleTimeBacklogData.y = isNaN(parseInt(p6Iterations[i].cycleTimeInBacklog)) ? 0 : parseFloat(p6Iterations[i].cycleTimeInBacklog);
    cycleTimeBacklogData.iterURL = iterationURL + p6Iterations[i]._id;
    cycleTimeBacklogData.startDate = showDateDDMMMYYYY(p6Iterations[i].startDate);
    cycleTimeBacklogData.endDate = showDateDDMMMYYYY(p6Iterations[i].endDate);
    cycleTimeBacklogSeries.data.push(cycleTimeBacklogData);

    cycleTimeWIPData.name = p6Iterations[i].name;
    cycleTimeWIPData.y = isNaN(parseInt(p6Iterations[i].cycleTimeWIP)) ? 0 : parseFloat(p6Iterations[i].cycleTimeWIP);
    cycleTimeWIPData.iterURL = iterationURL + p6Iterations[i]._id;
    cycleTimeWIPData.startDate = showDateDDMMMYYYY(p6Iterations[i].startDate);
    cycleTimeWIPData.endDate = showDateDDMMMYYYY(p6Iterations[i].endDate);
    cycleTimeWIPSeries.data.push(cycleTimeWIPData);

  }

  var teamMemMax = getMax(teamMemCountArr);
  var fteMax = getMax(fteCountArr);
  var yMax = Math.max(teamMemMax, fteMax);
  if (yMax <= 12) {
    yMax = 12;
  }

  if (!(teamMemSeries.data.length > 0 || fteSeries.data.length > 0 || targetSeries.data.length > 0)) {
    yMax = null;
  }

  var sMax = 4;
  if (!(teamSatSeries.data.length > 0 || clientSatSeries.data.length > 0)) {
    sMax = null;
  }

  destroyIterationCharts();

  loadScoreChart('velocityChart', 'Velocity', 'line', graphCategoryWithChange, 'Story points', commVelocitySeries,  velocitySeries, 'Points', 'Iteration Dates', '* Indicates Team Change', true, true);
  loadScoreChart('throughputChart', 'Throughput', 'line', graphCategoryWithChange, 'Stories/tickets/cards', commThroughputSeries, throughputSeries, 'Points', 'Iteration Dates', '* Indicates Team Change', true, true);
  loadPizzaChart('pizzaChart', '2 Pizza Rule (Team Members)', 'line', graphCategory, 'Count', yMax, teamMemSeries, fteSeries, targetSeries, 'Points');
  loadMultiDefectDeployChart('defectsChart', graphCategory, defectsStartSeries, defectsSeries, defectsClosedSeries, defectsEndSeries, deploySeries);
  loadSatisfactionChart('statisfactionChart', 'Client and Team Satisfaction', 'line', graphCategory, 'Rating', teamSatSeries, clientSatSeries, 'Points', sMax);
  loadChartMulSeries('unitCostChart', 'Stories / Story Points per FTE', 'line', graphCategory, 'Count', 'Iteration Dates', storyFTESeries, storyPointFTESeries, 'Points', true);
  loadWipBacklogChart('wipBacklogChart', 'Cycle Time in Backlog and Cycle Time in WIP (in days)', 'line', graphCategory, 'Average days per story', 'Iteration Dates', cycleTimeBacklogSeries, cycleTimeWIPSeries, 'Points', true);

  $('#GoIterationBtn').click(function() {
    var iterID = encodeURIComponent($('#gotoIterationList option:selected').val());
    var teamID = encodeURIComponent(teamId);
    window.location = 'iteration?id=' + teamID + '&iter=' + iterID;
  });
  $('#gotoIterationList').removeAttr('disabled');

  $('#CreateIterationBtn').attr('disabled', 'disabled');
  if (teamAccess) {
    $('#CreateIterationBtn').removeAttr('disabled');
    $('#CreateIterationBtn').click(function(e) {
      window.location = 'iteration?id=' + encodeURIComponent(teamId) + '&iter=new';
    });
  }

  $('#squad_team_scard').show();
  redrawCharts('iterationSection');
};

function loadScoreChart(id, title, type, categories, yAxisLabel, seriesObj1, seriesObj2, unit, text, subtitle, showLegend, pointClickable) {
  new Highcharts.Chart({
    chart: {
      type: type,
      renderTo: id,
      marginLeft: 60,
      marginRight: 0, width: 380
    },
    lang: {
      noData: 'No results reported'
    },
    noData: {
      style: {
        fontWeight: 'bold',
        fontSize: '12px',
        color: '#303030'
      }
    },
    title: {
      style: {
        'fontSize': '15px'
      },
      text: title
    },

    xAxis: {
      title: {
        text: text,
        align: 'middle',
        x: -20
      },
      categories: categories,
      tickmarkPlacement: 'on',
      labels: {
        style: {
          'fontSize': '9px'
        },
        formatter: function() {
          if (typeof this.value === 'string' && this.value.indexOf('*') >= 0) {
            return '<span style="fill: orange;">' + this.value + '</span>';
          } else {
            return this.value;
          }
        }
      }
    },

    yAxis: {
      min: 0,
      title: {
        text: yAxisLabel
      }
    },

    plotOptions: {
      column: {
        pointPlacement: 'on'
      }
    },

    tooltip: {
      shared: true,
      formatter: function() {
        var formatResult = '<b>' + this.points[0].key + '</b><br>';
        for (var i = 0; i < this.points.length; i++) {
          formatResult = formatResult + '<span style="color:' + this.points[i].series.color + '">\u25CF</span>' + this.points[i].series.name + ': <b>' + this.points[i].y + '</b><br/>';
        }
        if (this.points[0].point.startDate != undefined) {
          formatResult = formatResult + '<br>' + this.points[0].point.startDate + ' - ' + this.points[0].point.endDate;
        }
        return formatResult;
      }
    },

    legend: {
      align: 'center',
      verticalAlign: 'bottom',
      layout: 'horizontal',
      itemMarginTop: -10
    },

    credits: {
      enabled: false
    },

    subtitle: {
      text: subtitle,
      verticalAlign: 'bottom',
      align: 'center',
      y: 8,
      style: {
        fontSize: '12px',
        color: '#FFA500',
        fontWeight: 'bold'
      }
    },

    series: [{
      showInLegend: showLegend,
      name: seriesObj1.name,
      data: seriesObj1.data,
      point: {
        events: {
          click: function(e) {
            if (pointClickable)
              window.location = e.point.iterURL;
          }
        }
      }
    }, {
      showInLegend: showLegend,
      name: seriesObj2.name,
      data: seriesObj2.data,
      point: {
        events: {
          click: function(e) {
            if (pointClickable)
              window.location = e.point.iterURL;
          }
        }
      }
    }]
  });
}

function loadPizzaChart(id, title, type, categories, yAxisLabel, yMax, seriesObj1, seriesObj2, seriesObj3, unit) {
  var plotBandOptions = null;

  if (seriesObj1.data.length > 0 || seriesObj2.data.length > 0 || seriesObj3.data.length > 0) {
    plotBandOptions = [{
      color: '#8CD211',
      from: 5,
      to: 12,
      id: 'plotband-2',
      name: 'band'
    }];
  }

  new Highcharts.Chart({
    chart: {
      type: type,
      renderTo: id,
      marginLeft: 60,
      marginRight: 0, width: 380
    },
    lang: {
      noData: 'No results reported'
    },
    noData: {
      style: {
        fontWeight: 'bold',
        fontSize: '12px',
        color: '#303030'
      }
    },
    title: {
      style: {
        'fontSize': '15px'
      },
      text: title
    },

    xAxis: {
      labels: {
        style: {
          'fontSize': '9px'
        },
        formatter: function() {
          if (typeof this.value === 'string' && this.value.indexOf('*') >= 0) {
            return '<span style="fill: orange;">' + this.value + '</span>';
          } else {
            return this.value;
          }
        }
      },
      title: {
        text: 'Iteration Dates',
        x: -20
      },
      categories: categories,
      tickmarkPlacement: 'on'
    },

    yAxis: {
      min: 0,
      max: yMax,
      tickInterval: 4,
      showEmpty: false,
      title: {
        text: yAxisLabel
      },
      plotBands: plotBandOptions

    },

    plotOptions: {
      column: {
        pointPlacement: 'on'
      }
    },

    tooltip: {
      shared: true,
      formatter: function() {
        var formatResult = '<b>' + this.points[0].key + '</b><br>';
        for (var i = 0; i < this.points.length; i++) {
          formatResult = formatResult + '<span style="color:' + this.points[i].series.color + '">\u25CF</span>' + this.points[i].series.name + ': <b>' + this.points[i].y + '</b><br/>';
        }
        formatResult = formatResult + '<br>' + this.points[0].point.startDate + ' - ' + this.points[0].point.endDate;
        return formatResult;
      }
    },

    legend: {
      align: 'center',
      verticalAlign: 'bottom',
      layout: 'horizontal',
      itemMarginTop: -10,
      itemDistance: 5
    },

    credits: {
      enabled: false
    },

    series: [{
      showInLegend: true,
      name: seriesObj1.name,
      data: seriesObj1.data,
      color: seriesObj1.color,
      point: {
        events: {
          click: function(e) {
            window.location = e.point.iterURL;
          }
        }
      }
    }, {
      showInLegend: true,
      name: seriesObj2.name,
      data: seriesObj2.data,
      color: seriesObj2.color,
      point: {
        events: {
          click: function(e) {
            window.location = e.point.iterURL;
          }
        }
      }
    }, {
      showInLegend: true,
      name: seriesObj3.name,
      data: seriesObj3.data,
      color: seriesObj3.color,
      marker: {
        symbol: 'square'
      }
    }]
  });
}

function loadStackedPizzaChart(id, title, type, categories, yAxisLabel, seriesObj1, seriesObj2, seriesObj3) {


  new Highcharts.Chart({
    chart: {
      type: type,
      renderTo: id,
      marginLeft: 60,
      marginRight: 0, width: 380
    },
    lang: {
      noData: 'No results reported'
    },
    noData: {
      style: {
        fontWeight: 'bold',
        fontSize: '12px',
        color: '#303030'
      }
    },
    title: {
      style: {
        'fontSize': '15px'
      },
      text: title
    },

    xAxis: {
      labels: {
        style: {
          'fontSize': '9px'
        }
      },
      title: {
        text: 'Team size by month for completed iterations'
      },
      categories: categories
    },

    yAxis: {
      min: 0,
      title: {
        text: yAxisLabel
      },
      reversedStacks: false
    },

    plotOptions: {
      column: {
        stacking: 'normal',
        dataLabels: {
          enabled: true,
          color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'black',
          style: {
            textShadow: '0 0 0px white',
            fontSize: '10px'
          }
        }
      }
    },

    tooltip: {
      headerFormat: '',
      pointFormat: 'Total iterations : {point.totalCompleted}'
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
      showInLegend: true,
      name: seriesObj1.name,
      data: seriesObj1.data,
      color: seriesObj1.color

    }, {
      showInLegend: true,
      name: seriesObj2.name,
      data: seriesObj2.data,
      color: seriesObj2.color

    }, {
      showInLegend: true,
      name: seriesObj3.name,
      data: seriesObj3.data,
      color: seriesObj3.color
    }]
  });
}

function loadBarPizzaChartParent(id, title, categories, columnSeries, yMax) {
  new Highcharts.Chart({
    chart: {
      type: 'column',
      renderTo: id,
      marginLeft: 60,
      marginRight: 0, width: 380
    },
    lang: {
      noData: 'No results reported'
    },
    noData: {
      style: {
        fontWeight: 'bold',
        fontSize: '12px',
        color: '#303030'
      }
    },
    title: {
      style: {
        'fontSize': '15px'
      },
      text: title
    },
    subtitle: {
      useHTML: true,
      text: '&#9608 Partial month',
      verticalAlign: 'bottom',
      align: 'center',
      y: 12,
      x: 28,
      style: {
        fontSize: '12px',
        color: '#FFA500',
        fontWeight: 'bold'
      }
    },
    legend: {
      itemStyle: {
        color: 'orange'
      },
      align: 'center',
      verticalAlign: 'bottom',
      layout: 'horizontal',
      itemMarginTop: -10,
      itemDistance: 5,
      symbolRadius: 0
    },

    xAxis: {
      labels: {
        style: {
          'fontSize': '9px'
        }
      },
      title: {
        text: 'Iteration results by month'
      },
      categories: categories,
      tickmarkPlacement: 'on'
    },

    yAxis: {
      max: yMax,
      title: {
        text: 'Iteration % with 5-12 members'
      }
    },

    plotOptions: {
      column: {
        stacking: 'normal',
        pointPlacement: 'on',
        minPointLength: 0.5
      }
    },

    tooltip: {
      headerFormat: '',
      pointFormat: '<b>% iterations: {point.y}</b>' +
        '<br/><b># iterations: {point.totalCompleted}</b>'
    },

    credits: {
      enabled: false
    },

    series: [{
      showInLegend: false,
      name: columnSeries.name,
      data: columnSeries.data,
      color: columnSeries.color,
      zoneAxis: 'x',
      zones: [{value: 5}, {dashStyle: 'dash', color: 'orange'}]
    }, {
      // this forces the coluns to adjust within the graph area
      type: 'line',
      showInLegend: false,
      // visible: false,
      name: 'Partial month',
      color: 'orange'
    }]
  });
}

function loadPiePizzaChart(id, title, type, seriesObj, subtitle) {
  new Highcharts.Chart({
    chart: {
      type: type,
      renderTo: id,
      marginLeft: 60,
      marginRight: 0, width: 380
    },
    lang: {
      noData: 'No results reported'
    },
    noData: {
      style: {
        fontWeight: 'bold',
        fontSize: '12px',
        color: '#303030'
      }
    },
    title: {
      style: {
        'fontSize': '15px'
      },
      text: title
    },

    plotOptions: {
      series: {
        dataLabels: {
          enabled: true,
          formatter: function() {
            return this.point.y;
          },
          style: {
            textShadow: 'px 1px contrast, -1px -1px contrast, -1px 1px contrast, 1px -1px contrast'
          },
          distance: -15
        }
      }
    },

    tooltip: {
      headerFormat: '',
      pointFormat: '<b>Team members:{point.tc}</b><br/><b>FTE:{point.fte}</b>'
    },

    legend: {
      align: 'center',
      verticalAlign: 'bottom',
      layout: 'horizontal'
    },

    credits: {
      enabled: false
    },

    subtitle: {
      text: subtitle,
      verticalAlign: 'bottom',
      align: 'center',
      y: -135,
      x: 30,
      style: {
        fontSize: '10px',
        //color : '#FFA500',
        fontWeight: 'bold'
      }
    },

    series: [{
      size: '120%',
      innerSize: '65%',
      showInLegend: true,
      colorByPoint: true,
      name: 'team/fte',
      data: seriesObj
    }]
  });
}

function loadChartMulSeries(id, title, type, categories, yAxisLabel, xAxisLabel, seriesObj1, seriesObj2, unit, pointClickable) {
  new Highcharts.Chart({
    chart: {
      type: type,
      renderTo: id,
      marginLeft: 60,
      marginRight: 0, width: 380
    },
    lang: {
      noData: 'No results reported'
    },
    noData: {
      style: {
        fontWeight: 'bold',
        fontSize: '12px',
        color: '#303030'
      }
    },
    title: {
      style: {
        'fontSize': '15px'
      },
      text: title
    },

    xAxis: {
      labels: {
        style: {
          'fontSize': '9px'
        },
        formatter: function() {
          if (typeof this.value === 'string' && this.value.indexOf('*') >= 0) {
            return '<span style="fill: orange;">' + this.value + '</span>';
          } else {
            return this.value;
          }
        }
      },
      title: {
        text: xAxisLabel,
        x: -20
      },
      categories: categories,
      tickmarkPlacement: 'on'
    },

    yAxis: {
      title: {
        text: yAxisLabel
      }
    },

    plotOptions: {
      column: {
        pointPlacement: 'on'
      }
    },

    tooltip: {
      shared: true,
      formatter: function() {
        var formatResult = '<b>' + this.points[0].key + '</b><br>';
        for (var i = 0; i < this.points.length; i++) {
          formatResult = formatResult + '<span style="color:' + this.points[i].series.color + '">\u25CF</span>' + this.points[i].series.name + ': <b>' + this.points[i].y + '</b><br/>';
        }
        if (this.points[0].point.startDate != undefined) {
          formatResult = formatResult + '<br>' + this.points[0].point.startDate + ' - ' + this.points[0].point.endDate;
        }
        return formatResult;
      }
    },

    legend: {
      align: 'center',
      verticalAlign: 'bottom',
      layout: 'horizontal',
      itemMarginTop: -10
    },

    credits: {
      enabled: false
    },

    series: [{
      showInLegend: true,
      name: seriesObj1.name,
      data: seriesObj1.data,
      point: {
        events: {
          click: function(e) {
            if (pointClickable)
              window.location = e.point.iterURL;
          }
        }
      }
    }, {
      showInLegend: true,
      name: seriesObj2.name,
      data: seriesObj2.data,
      point: {
        events: {
          click: function(e) {
            if (pointClickable)
              window.location = e.point.iterURL;
          }
        }
      }
    }]
  });
}

function loadMultiDefectDeployChart(id, categories, columnSeries1, columnSeries2, columnSeries3, columnSeries4, lineSeries) {
  new Highcharts.Chart({
    chart: {
      type: 'column',
      renderTo: id,
      marginLeft: 60,
      marginRight: 0, width: 380
    },
    lang: {
      noData: 'No results reported'
    },
    noData: {
      style: {
        fontWeight: 'bold',
        fontSize: '12px',
        color: '#303030'
      }
    },
    title: {
      style: {
        'fontSize': '15px'
      },
      text: 'Deployments and Defects'
    },

    xAxis: {
      labels: {
        style: {
          'fontSize': '9px'
        },
        formatter: function() {
          if (typeof this.value === 'string' && this.value.indexOf('*') >= 0) {
            return '<span style="fill: orange;">' + this.value + '</span>';
          } else {
            return this.value;
          }
        }
      },
      title: {
        text: 'Iteration Dates',
        x: -20
      },
      categories: categories,
      tickmarkPlacement: 'on'
    },

    yAxis: {
      title: {
        text: 'Count'
      }
    },

    plotOptions: {
      column: {
        stacking: 'normal',
        pointPlacement: 'on',
        minPointLength: 0.5
      },
    },

    tooltip: {
      shared: true,
      formatter: function() {
        var formatResult = '<b>' + this.points[0].key + '</b><br>';
        // for (var i = 0; i < this.points.length; i++) {
        //   formatResult = formatResult + '<span style="color:' + this.points[i].series.color + '">\u25CF</span>' + this.points[i].series.name + ': <b>' + this.points[i].y + '</b><br/>';
        // }
        for (var i = 0; i < this.points.length; i++) {
          if (i==0) {
            // var newSeries = this.points[i].series.chart.series[1]; //columnSeries2
            // var closedSeries = this.points[i].series.chart.series[2]; //columnSeries3
            var endSeries = this.points[i].series.chart.series[3]; //columnSeries4
            var deploySeries = this.points[i].series.chart.series[4]; //lineSeries
            var index = this.points[i].point.x;
            if (!_.isUndefined(index)) {
              formatResult = formatResult + '<span style="color:' + endSeries.color + '">\u25CF</span>' + endSeries.name + ': <b>' + endSeries.data[index].y + '</b><br/>';
              formatResult = formatResult + '<span style="color:' + deploySeries.color + '">\u25CF</span>' + 'Deployments: <b>' + deploySeries.data[index].y + '</b><br/>';
            }
          }
        }
        return formatResult;
      }
    },

    legend: {
      align: 'center',
      verticalAlign: 'bottom',
      layout: 'horizontal',
      itemMarginTop: -10,
      symbolRadius: 0
      // itemStyle: {"fontWeight": "normal" }
    },

    credits: {
      enabled: false
    },

    // Stripe patterns
    // defs: {
    //   patterns: [{
    //     id: 'start-defects',
    //     path: {
    //       d: 'M 0 10 L 10 0 M -1 1 L 1 -1 M 9 11 L 11 9',
    //       stroke: '#7ab4ee',
    //       strokeWidth: 5
    //     }
    //   }, {
    //     id: 'new-defects',
    //     path: {
    //       d: 'M 3 0 L 3 10 M 8 0 L 8 10',
    //       stroke: '#434348',
    //       strokeWidth: 3
    //     }
    //   }]
    // },

    series: [{
      showInLegend: false,
      visible: false,
      name: columnSeries1.name,
      data: columnSeries1.data,
      // borderColor: '#7ab4ee',
      // color: 'url(#start-defects)',
      point: {
        events: {
          click: function(e) {
            window.location = e.point.iterURL;
          }
        }
      }
    }, {
      showInLegend: false,
      visible: false,
      name: columnSeries2.name,
      data: columnSeries2.data,
      // borderColor: '#434348',
      // color: 'url(#new-defects)',
      point: {
        events: {
          click: function(e) {
            window.location = e.point.iterURL;
          }
        }
      }
    }, {
      showInLegend: false,
      visible: false,
      name: columnSeries3.name,
      data: columnSeries3.data,
      // borderColor: '#434348',
      // color: 'url(#new-defects)',
      color: '#7ab4ee',
      point: {
        events: {
          click: function(e) {
            window.location = e.point.iterURL;
          }
        }
      }
    }, {
      showInLegend: true,
      name: columnSeries4.name,
      data: columnSeries4.data,
      // borderColor: '#434348',
      // color: 'url(#new-defects)',
      color: '#7ab4ee',
      point: {
        events: {
          click: function(e) {
            window.location = e.point.iterURL;
          }
        }
      }
    }, {
      type: 'line',
      showInLegend: true,
      name: lineSeries.name,
      data: lineSeries.data,
      color: '#434348',
      marker: {
        symbol: 'diamond'
      },
      point: {
        events: {
          click: function(e) {
            window.location = e.point.iterURL;
          }
        }
      }
    }]
  });
}

function loadWipBacklogChart(id, title, type, categories, yAxisLabel, xAxisLabel, seriesObj1, seriesObj2, unit, pointClickable) {
  new Highcharts.Chart({
    chart: {
      type: type,
      renderTo: id,
      marginLeft: 60,
      marginRight: 0, width: 380
    },
    lang: {
      noData: 'No results reported'
    },
    noData: {
      style: {
        fontWeight: 'bold',
        fontSize: '12px',
        color: '#303030'
      }
    },
    title: {
      style: {
        'fontSize': '15px'
      },
      text: title
    },

    xAxis: {
      labels: {
        style: {
          'fontSize': '9px'
        },
        formatter: function() {
          if (typeof this.value === 'string' && this.value.indexOf('*') >= 0) {
            return '<span style="fill: orange;">' + this.value + '</span>';
          } else {
            return this.value;
          }
        }
      },
      title: {
        text: xAxisLabel,
        x: -20
      },
      categories: categories,
      tickmarkPlacement: 'on'
    },

    yAxis: {
      title: {
        text: yAxisLabel
      }
    },

    plotOptions: {
      column: {
        pointPlacement: 'on'
      }
    },

    tooltip: {
      shared: true,
      formatter: function() {
        var formatResult = '<b>' + this.points[0].key + '</b><br>';
        for (var i = 0; i < this.points.length; i++) {
          formatResult = formatResult + '<span style="color:' + this.points[i].series.color + '">\u25CF</span>' + this.points[i].series.name + ': <b>' + this.points[i].y + '</b><br/>';
        }
        if (this.points[0].point.startDate != undefined) {
          formatResult = formatResult + '<br>' + this.points[0].point.startDate + ' - ' + this.points[0].point.endDate;
        }
        return formatResult;
      }
    },

    legend: {
      align: 'center',
      verticalAlign: 'bottom',
      layout: 'horizontal',
      itemMarginTop: -10
    },

    credits: {
      enabled: false
    },

    series: [{
      showInLegend: true,
      name: seriesObj1.name,
      data: seriesObj1.data,
      point: {
        events: {
          click: function(e) {
            if (pointClickable)
              window.location = e.point.iterURL;
          }
        }
      }
    }, {
      showInLegend: true,
      name: seriesObj2.name,
      data: seriesObj2.data,
      point: {
        events: {
          click: function(e) {
            if (pointClickable)
              window.location = e.point.iterURL;
          }
        }
      }
    }]
  });
}

function loadLineChartParent(id, title, categories, yAxisLabel, xAxisLabel, lineSeries, unit) {
  new Highcharts.Chart({
    chart: {
      type: 'line',
      renderTo: id,
      marginLeft: 60,
      marginRight: 0, width: 380
    },
    lang: {
      noData: 'No results reported'
    },
    noData: {
      style: {
        fontWeight: 'bold',
        fontSize: '12px',
        color: '#303030'
      }
    },
    title: {
      style: {
        'fontSize': '15px'
      },
      text: title
    },

    xAxis: {
      labels: {
        style: {
          'fontSize': '9px'
        }
      },
      title: {
        text: xAxisLabel
      },
      categories: categories,
      tickmarkPlacement: 'on'
    },

    yAxis: {
      title: {
        text: yAxisLabel
      }
    },

    plotOptions: {
      column: {
        pointPlacement: 'on'
      }
    },

    tooltip: {
      formatter: function() {
        if (this.point.totalSquad != undefined) {
          return yAxisLabel + ': ' + this.point.y + '<br>' + 'Squad Teams: ' + this.point.totalSquad + '<br>' + 'Iterations: ' + this.point.totalCompleted;
        } else {
          return '<b>' + this.key + '</b><br>' + yAxisLabel + ': ' + this.point.y + '<br>' + this.point.startDate + ' - ' + this.point.endDate;
        }
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

    subtitle: {
      text: '---Partial month',
      verticalAlign: 'bottom',
      align: 'center',
      y: 15,
      x: 30,
      style: {
        fontSize: '12px',
        color: '#FFA500',
        fontWeight: 'bold'
      }
    },

    series: [{
      showInLegend: false,
      name: lineSeries.name,
      data: lineSeries.data,
      zoneAxis: 'x',
      zones: [{value: 4.1}, {dashStyle: 'dash', color: 'orange'}]
    }]
  });
}

function loadMultiDefectDeployChartParent(id, categories, columnSeries1, columnSeries2, columnSeries3, columnSeries4, lineSeries) {
  new Highcharts.Chart({
    chart: {
      type: 'column',
      renderTo: id,
      marginLeft: 60,
      marginRight: 0, width: 380
    },
    lang: {
      noData: 'No results reported'
    },
    noData: {
      style: {
        fontWeight: 'bold',
        fontSize: '12px',
        color: '#303030'
      }
    },
    title: {
      style: {
        'fontSize': '15px'
      },
      text: 'Deployment and Defects'
    },

    xAxis: {
      labels: {
        style: {
          'fontSize': '9px'
        }
      },
      title: {
        text: 'Iteration results by month'
      },
      categories: categories,
      tickmarkPlacement: 'on'
    },

    yAxis: {
      title: {
        text: 'Count'
      }
    },

    plotOptions: {
      column: {
        stacking: 'normal',
        pointPlacement: 'on',
        minPointLength: 0.5
      }
    },

    tooltip: {
      shared: true,
      formatter: function() {
        var formatResult = '<b>' + this.points[0].key + '</b><br>';
        // for (var i = 0; i < this.points.length; i++) {
        //   formatResult = formatResult + '<span style="color:' + this.points[i].series.color + '">\u25CF</span>' + this.points[i].series.name + ': <b>' + this.points[i].y + '</b><br/>';
        // }
        for (var i = 0; i < this.points.length; i++) {
          if (i==0) {
            var newSeries = this.points[i].series.chart.series[1]; //columnSeries2
            var closedSeries = this.points[i].series.chart.series[2]; //columnSeries3
            var endSeries = this.points[i].series.chart.series[3]; //columnSeries4
            var deploySeries = this.points[i].series.chart.series[4]; //lineSeries
            var index = this.points[i].point.x;
            if (!_.isUndefined(index)) {
              formatResult = formatResult + '<span style="color:' + endSeries.color + '">\u25CF</span>' + endSeries.name + ': <b>' + endSeries.data[index].y + '</b><br/>';
              formatResult = formatResult + '<span style="color:' + deploySeries.color + '">\u25CF</span>' + 'Deployments: <b>' + deploySeries.data[index].y + '</b><br/>';
            }
          }
        }
        return formatResult;
      }
    },

    legend: {
      align: 'center',
      verticalAlign: 'bottom',
      layout: 'horizontal',
      itemMarginTop: -10,
      symbolRadius: 0
      // itemStyle: {"fontWeight": "normal" }
    },

    credits: {
      enabled: false
    },

    subtitle: {
      text: '---Partial month',
      verticalAlign: 'bottom',
      align: 'center',
      y: 15,
      x: 30,
      style: {
        fontSize: '12px',
        color: '#FFA500',
        fontWeight: 'bold'
      }
    },

    defs: {
      patterns: [{
      //   id: 'start-defects',
      //   path: {
      //     d: 'M 0 10 L 10 0 M -1 1 L 1 -1 M 9 11 L 11 9',
      //     stroke: '#data',
      //     strokeWidth: 5
      //   }
      // }, {
        id: 'partial',
        path: {
          d: 'M 0 3 L 5 3 L 5 0 M 5 10 L 5 7 L 10 7',
          stroke: 'orange',
          strokeWidth: 4
        }
      }]
    },

    series: [{
      showInLegend: false,
      visible: false,
      name: columnSeries1.name,
      data: columnSeries1.data,
      zoneAxis: 'x',
      zones: [{value: 5}, {dashStyle: 'dash', color: 'orange'}]
    }, {
      showInLegend: false,
      visible: false,
      name: columnSeries2.name,
      data: columnSeries2.data,
      zoneAxis: 'x',
      zones: [{value: 5}, {dashStyle: 'dash', color: 'orange'}]
    }, {
      showInLegend: false,
      visible: false,
      name: columnSeries3.name,
      data: columnSeries3.data,
      zoneAxis: 'x',
      zones: [{value: 5}, {dashStyle: 'dash', color: 'orange'}]
    }, {
      showInLegend: true,
      name: columnSeries4.name,
      data: columnSeries4.data,
      color: '#7ab4ee',
      zoneAxis: 'x',
      zones: [{value: 5}, {dashStyle: 'dash', color: 'orange'}]
    }, {
      type: 'line',
      showInLegend: true,
      name: lineSeries.name,
      data: lineSeries.data,
      color: '#434348',
      marker: {
        symbol: 'diamond'
      },
      zoneAxis: 'x',
      zones: [{value: 4.1}, {dashStyle: 'dash', color: 'orange'}]
    }]
  });
}


function loadMultiLineChartParent(id, title, categories, yAxisLabel, xAxisLabel, seriesObj1, seriesObj2, unit, pointClickable, yMax) {
  new Highcharts.Chart({
    chart: {
      type: 'line',
      renderTo: id,
      marginLeft: 60,
      marginRight: 0, width: 380
    },
    lang: {
      noData: 'No results reported'
    },
    noData: {
      style: {
        fontWeight: 'bold',
        fontSize: '12px',
        color: '#303030'
      }
    },
    title: {
      style: {
        'fontSize': '15px'
      },
      text: title
    },

    xAxis: {
      labels: {
        style: {
          'fontSize': '9px'
        }
      },
      title: {
        text: xAxisLabel
      },
      categories: categories,
      tickmarkPlacement: 'on'
    },

    // yAxis: {
    //   title: {
    //     text: yAxisLabel
    //   }
    // },

    yAxis: {
      min: 0,
      max: yMax,
      tickInterval: yMax != null ? 2 : null,
      title: {
        text: yAxisLabel
      }
    },

    plotOptions: {
      column: {
        pointPlacement: 'on'
      }
    },

    tooltip: {
      shared: true,
      formatter: function() {
        var formatResult = '<b>' + this.points[0].key + '</b><br>';
        var serName = '';
        for (var i = 0; i < this.points.length; i++) {
          if (serName != this.points[i].series.name) {
            formatResult = formatResult + '<span style="color:' + this.points[i].series.color + '">\u25CF</span>' + this.points[i].series.name + ': <b>' + this.points[i].y + '</b><br/>';
          }
          serName = this.points[i].series.name;
        }
        return formatResult;
      }
    },

    legend: {
      align: 'center',
      verticalAlign: 'bottom',
      layout: 'horizontal',
      itemMarginTop: -10
    },

    credits: {
      enabled: false
    },

    subtitle: {
      text: '---Partial month',
      verticalAlign: 'bottom',
      align: 'center',
      y: 15,
      x: 30,
      style: {
        fontSize: '12px',
        color: '#FFA500',
        fontWeight: 'bold'
      }
    },

    series: [{
      showInLegend: true,
      name: seriesObj1.name,
      data: seriesObj1.data,
      zoneAxis: 'x',
      zones: [{value: 4.1}, {dashStyle: 'dash', color: 'orange'}]
    }, {
      showInLegend: true,
      name: seriesObj2.name,
      data: seriesObj2.data,
      zoneAxis: 'x',
      zones: [{value: 4.1}, {dashStyle: 'dash', color: 'orange'}]
    }

    ]
  });
}

function loadSatisfactionChart(id, title, type, categories, yAxisLabel, seriesObj1, seriesObj2, unit, yMax) {
  new Highcharts.Chart({
    chart: {
      type: type,
      renderTo: id,
      marginLeft: 60,
      marginRight: 0, width: 380
    },
    lang: {
      noData: 'No results reported'
    },
    noData: {
      style: {
        fontWeight: 'bold',
        fontSize: '12px',
        color: '#303030'
      }
    },

    title: {
      style: {
        'fontSize': '15px'
      },
      text: title
    },

    xAxis: {
      labels: {
        style: {
          'fontSize': '9px'
        },
        formatter: function() {
          if (typeof this.value === 'string' && this.value.indexOf('*') >= 0) {
            return '<span style="fill: orange;">' + this.value + '</span>';
          } else {
            return this.value;
          }
        }
      },
      title: {
        text: 'Iteration Dates'
      },
      categories: categories,
      tickmarkPlacement: 'on'
    },

    yAxis: {
      min: 0,
      max: yMax,
      tickInterval: 2,
      showEmpty: false,
      title: {
        text: yAxisLabel
      }
    },

    plotOptions: {
      column: {
        pointPlacement: 'on'
      }
    },

    tooltip: {
      shared: true,
      formatter: function() {
        var formatResult = '<b>' + this.points[0].key + '</b><br>';
        for (var i = 0; i < this.points.length; i++) {
          formatResult = formatResult + '<span style="color:' + this.points[i].series.color + '">\u25CF</span>' + this.points[i].series.name + ': <b>' + this.points[i].y + '</b><br/>';
        }
        formatResult = formatResult + '<br>' + this.points[0].point.startDate + ' - ' + this.points[0].point.endDate;
        return formatResult;
      }
    },

    legend: {
      align: 'center',
      verticalAlign: 'bottom',
      layout: 'horizontal',
      itemMarginTop: -10
    },

    credits: {
      enabled: false
    },

    series: [{
      showInLegend: true,
      name: seriesObj1.name,
      data: seriesObj1.data,
      point: {
        events: {
          click: function(e) {
            window.location = e.point.iterURL;
          }
        }
      }
    }, {
      showInLegend: true,
      name: seriesObj2.name,
      data: seriesObj2.data,
      point: {
        events: {
          click: function(e) {
            window.location = e.point.iterURL;
          }
        }
      }
    }]
  });
}

module.exports.iterationSnapshotHandler = function(teamId, teamName, snapshotData) {
  var teamIterations = snapshotData.iterationData;
  var nonsquadScore = (snapshotData.teamMemberData)[0];
  var timestamp = snapshotData.lastUpdate;
  var graphCategory = [];

  var velocitySeries = new Object();
  velocitySeries.name = teamName;
  velocitySeries.data = [];

  var throughputSeries = new Object();
  throughputSeries.name = teamName;
  throughputSeries.data = [];

  var teamLt5Ser = new Object();
  teamLt5Ser.name = 'Teams <5 mbrs';
  teamLt5Ser.data = [];
  teamLt5Ser.color = '#D3D3D3';

  var team5to12Ser = new Object();
  team5to12Ser.name = 'Teams 5-12 mbrs';
  team5to12Ser.data = [];
  team5to12Ser.color = '#8CD211';

  var teamGt12Ser = new Object();
  teamGt12Ser.name = 'Teams >12 mbrs';
  teamGt12Ser.data = [];
  teamGt12Ser.color = '#808080';

  var defectsStartSeries = new Object();
  defectsStartSeries.name = 'Existing Defects';
  defectsStartSeries.data = [];

  var defectsSeries = new Object();
  defectsSeries.name = 'New';
  defectsSeries.data = [];

  var defectsClosedSeries = new Object();
  defectsClosedSeries.name = 'Resolved';
  defectsClosedSeries.data = [];

  var defectsEndSeries = new Object();
  defectsEndSeries.name = 'Defects at close';
  defectsEndSeries.data = [];

  var deploySeries = new Object();
  deploySeries.name = 'Deployments per iteration';
  deploySeries.data = [];

  var clientStatSeries = new Object();
  clientStatSeries.name = 'Client Satisfaction';
  clientStatSeries.data = [];

  var teamStatSeries = new Object();
  teamStatSeries.name = 'Team Satisfaction';
  teamStatSeries.data = [];

  var cycleTimeBacklogSeries = new Object();
  cycleTimeBacklogSeries.name = 'Cycle time in backlog';
  cycleTimeBacklogSeries.data = [];

  var cycleTimeWIPSeries = new Object();
  cycleTimeWIPSeries.name = 'Cycle time in WIP';
  cycleTimeWIPSeries.data = [];

  var monthList = teamIterations;
  monthList = sortMMMYYYY(monthList);
  var curTeamstat = nonsquadScore;

  //for (var i = monthList.length - 1; i > -1; i--) {
  for (var i = 0; i < monthList.length; i++) {
    var graphCat;
    graphCat = monthList[i].month;
    graphCategory.push(graphCat);

    var vData = new Object();
    vData.name = monthList[i].month;
    vData.y = isNaN(parseInt(monthList[i].totalPoints)) ? 0 : parseInt(monthList[i].totalPoints);
    vData.totalCompleted = isNaN(parseInt(monthList[i].totalCompleted)) ? 0 : parseInt(monthList[i].totalCompleted);
    vData.totalSquad = isNaN(parseInt(monthList[i].totalSquad)) ? 0 : parseInt(monthList[i].totalSquad);
    velocitySeries.data.push(vData);

    var tData = new Object();
    tData.name = monthList[i].month;
    tData.y = isNaN(parseInt(monthList[i].totalStories)) ? 0 : parseInt(monthList[i].totalStories);
    tData.totalCompleted = isNaN(parseInt(monthList[i].totalCompleted)) ? 0 : parseInt(monthList[i].totalCompleted);
    tData.totalSquad = isNaN(parseInt(monthList[i].totalSquad)) ? 0 : parseInt(monthList[i].totalSquad);
    throughputSeries.data.push(tData);

    var defData = new Object();
    defData.name = monthList[i].month;
    defData.y = isNaN(parseInt(monthList[i].totalDefectsStartBal)) ? 0 : parseInt(monthList[i].totalDefectsStartBal);
    defectsStartSeries.data.push(defData);

    defData = new Object();
    defData.name = monthList[i].month;
    defData.y = isNaN(parseInt(monthList[i].totalDefects)) ? 0 : parseInt(monthList[i].totalDefects);
    defectsSeries.data.push(defData);

    defData = new Object();
    defData.name = monthList[i].month;
    defData.y = isNaN(parseInt(monthList[i].totalDefectsClosed)) ? 0 : parseInt(monthList[i].totalDefectsClosed);
    defectsClosedSeries.data.push(defData);

    defData = new Object();
    defData.name = monthList[i].month;
    defData.y = isNaN(parseInt(monthList[i].totalDefectsEndBal)) ? 0 : parseInt(monthList[i].totalDefectsEndBal);
    defectsEndSeries.data.push(defData);

    var depData = new Object();
    depData.name = monthList[i].month;
    depData.y = isNaN(parseInt(monthList[i].totalDplymts)) ? 0 : parseInt(monthList[i].totalDplymts);
    deploySeries.data.push(depData);

    var tsData = new Object();
    tsData.name = monthList[i].month;
    tsData.y = isNaN(parseInt(monthList[i].totTeamStat)) ? null : parseFloat(monthList[i].totTeamStat.toFixed(1));
    teamStatSeries.data.push(tsData);

    var csData = new Object();
    csData.name = monthList[i].month;
    csData.y = isNaN(parseInt(monthList[i].totClientStat)) ? null : parseFloat(monthList[i].totClientStat.toFixed(1));
    clientStatSeries.data.push(csData);

    // var tLt5Data = new Object();
    // tLt5Data.name = monthList[i].month;
    // tLt5Data.y = isNaN(parseInt(monthList[i].teamsLt5)) ? null : parseInt(monthList[i].teamsLt5) == 0 ? null : parseInt(monthList[i].teamsLt5);
    // tLt5Data.totalCompleted = isNaN(parseInt(monthList[i].totalCompleted)) ? 0 : parseInt(monthList[i].totalCompleted);
    // teamLt5Ser.data.push(tLt5Data);

    // var tGt12Data = new Object();
    // tGt12Data.name = monthList[i].month;
    // tGt12Data.y = isNaN(parseInt(monthList[i].teamsGt12)) ? null : parseInt(monthList[i].teamsGt12) == 0 ? null : parseInt(monthList[i].teamsGt12);
    // tGt12Data.totalCompleted = isNaN(parseInt(monthList[i].totalCompleted)) ? 0 : parseInt(monthList[i].totalCompleted);
    // teamGt12Ser.data.push(tGt12Data);

    var t5to12Data = new Object();
    t5to12Data.name = monthList[i].month;
    var i5to12 = isNaN(parseInt(monthList[i].teams5to12)) ? 0 : parseInt(monthList[i].teams5to12);
    var totIter = isNaN(parseInt(monthList[i].totalCompleted)) ? 0 : parseInt(monthList[i].totalCompleted);
    var percen = totIter!=0 ? parseFloat(((i5to12 / totIter) * 100).toFixed(1)) : 0;
    t5to12Data.y = percen;
    t5to12Data.totalCompleted = totIter;
    t5to12Data.percentage = percen;
    team5to12Ser.data.push(t5to12Data);

    var ctfPData = new Object();
    ctfPData.name = monthList[i].month;
    ctfPData.x = graphCategory.indexOf(monthList[i].month);
    ctfPData.y = isNaN(parseInt(monthList[i].totCycleTimeBacklog)) ? null : parseFloat(monthList[i].totCycleTimeBacklog.toFixed(1));
    cycleTimeBacklogSeries.data.push(ctfPData);

    var ctwPData = new Object();
    ctwPData.name = monthList[i].month;
    ctwPData.x = graphCategory.indexOf(monthList[i].month);
    ctwPData.y = isNaN(parseInt(monthList[i].totCycleTimeWIP)) ? null : parseFloat(monthList[i].totCycleTimeWIP.toFixed(1));
    cycleTimeWIPSeries.data.push(ctwPData);

  }

  var pData = [];
  var pDataObj = new Object();
  pDataObj.name = 'Teams <5 mbrs';
  pDataObj.y = curTeamstat.teamsLt5 == 0 ? null : curTeamstat.teamsLt5;
  pDataObj.tc = curTeamstat.tcLt5;
  pDataObj.fte = curTeamstat.fteLt5.toFixed(1);
  pDataObj.color = '#D3D3D3';
  pData.push(pDataObj);

  pDataObj = new Object();
  pDataObj.name = 'Teams 5-12 mbrs';
  pDataObj.y = curTeamstat.teams5to12 == 0 ? null : curTeamstat.teams5to12;
  pDataObj.tc = curTeamstat.tc5to12;
  pDataObj.fte = curTeamstat.fte5to12.toFixed(1);
  pDataObj.color = '#8CD211';
  pDataObj.dataLabels = {color: 'black'};
  pData.push(pDataObj);

  pDataObj = new Object();
  pDataObj.name = 'Teams >12 mbrs';
  pDataObj.y = curTeamstat.teamsGt12 == 0 ? null : curTeamstat.teamsGt12;
  pDataObj.tc = curTeamstat.tcGt12;
  pDataObj.fte = curTeamstat.fteGt12.toFixed(1);
  pDataObj.color = '#808080';
  pData.push(pDataObj);


  var totTeamCnt = curTeamstat.teamsLt5 + curTeamstat.teams5to12 + curTeamstat.teamsGt12;
  var cenTitle = 'Total team count:<br>' + totTeamCnt;

  var pizYMax = 100;
  if (!team5to12Ser.data.length > 0) {
    pizYMax = null;
  }

  var ctsYMax = 4;
  if (!(teamStatSeries.data.length > 0 || clientStatSeries.data.length > 0)) {
    ctsYMax = null;
  }
  destroyIterationCharts();
  loadLineChartParent('pvelocityChart', 'Velocity', graphCategory, 'Story points', 'Iteration results by month', velocitySeries, 'Points');
  loadLineChartParent('pthroughputChart', 'Throughput', graphCategory, 'Stories/tickets/cards', 'Iteration results by month', throughputSeries, 'Points');
  loadMultiDefectDeployChartParent('pdefectsChart', graphCategory, defectsStartSeries, defectsSeries, defectsClosedSeries, defectsEndSeries, deploySeries);
  loadMultiLineChartParent('pwipBacklogChart', 'Cycle Time in Backlog and Cycle Time in WIP (in days)', graphCategory, 'Average days per story', 'Iteration results by month', cycleTimeBacklogSeries, cycleTimeWIPSeries, 'Points', false);
  loadMultiLineChartParent('pstatisfactionChart', 'Client and Team Satisfaction', graphCategory, 'Rating', 'Iteration results by month', teamStatSeries, clientStatSeries, 'Points', false, ctsYMax);
  loadBarPizzaChartParent('pPizzaChart', 'Squad Team Size Per Iteration', graphCategory, team5to12Ser, pizYMax);
  loadPiePizzaChart('piePizzaChart', '2 Pizza Rule (Squad Teams - Current)', 'pie', pData, cenTitle);

  setRefreshDate(timestamp);
  $('#nsquad_team_scard').show();
  redrawCharts('iterationSection');
};

function setRefreshDate(timestamp) {
  //var myDate = new Date(timestamp*1000); // creates a date that represents the number of milliseconds after midnight GMT on Januray 1st 1970.
  //$("#refreshDate").html(moment(myDate).format("DD-MMM-YYYY, hh:mm"));
  $('#refreshDate').html(moment.utc(timestamp).format('MMM DD, YYYY, HH:mm (z)'));
}

function showDateDDMMMYYYY(formatDate) {
  if (formatDate == null || formatDate == '') return '';
  var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  var date = new Date(formatDate);
  var day = date.getDate();
  day = day.toString().length < 2 ? '0' + day.toString() : day.toString();
  var monthIndex = date.getMonth();
  var year = date.getFullYear();

  return (day + monthNames[monthIndex] + year);
}

function sortMMMYYYY(iterations) {
  var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  if (iterations != null && iterations.length > 1) {
    iterations.sort(function(a, b) {

      var date1 = a.month.split(' ');
      var date2 = b.month.split(' ');
      var month1 = monthNames.indexOf(date1[0]);
      var yr1 = parseInt(date1[1]);
      var month2 = monthNames.indexOf(date2[0]);
      var yr2 = parseInt(date2[1]);
      if (yr1 == yr2) {
        if (month1 == month2)
          return 0;
        else {
          return (month2 > month1) ? 1 : -1;
        }
      } else
        return (yr2 > yr1) ? 1 : -1;
    });
  }
  return iterations;
}

function sortIterations(iterations) {
  if (iterations != null && iterations.length > 1) {
    iterations.sort(function(a, b) {
      if (new Date(b.endDate).getTime() == new Date(a.endDate).getTime()) {
        return 0;
      } else {
        return (new Date(b.endDate).getTime() > new Date(a.endDate).getTime()) ? 1 : -1;
      }
    });
  }
  return iterations;
}

function redrawCharts(section) {
  $(Highcharts.charts).each(function(i,chart) {
    if (chart == null) return;

    if ($('#' + section + ' #' + $(chart.container).attr('id')).length > 0) {
      var height = chart.renderTo.clientHeight;
      var width = chart.renderTo.clientWidth;
      chart.setSize(width, height);
    }
  });
}

function destroyIterationCharts() {
  // var chartIds = ['velocityChart', 'throughputChart', 'pizzaChart', 'defectsChart', 'statisfactionChart', 'unitCostChart', 'pvelocityChart', 'pthroughputChart', 'pPizzaChart', 'pdefectsChart', 'piePizzaChart'];
  // $.each(chartIds, function(index, id) {
  //   if ($('#' + id).highcharts() != null)
  //     $('#' + id).highcharts().destroy();
  // });
  $(Highcharts.charts).each(function(i, chart) {
    if (chart == null) return;

    if ($('#iterationSection #' + $(chart.container).attr('id')).length > 0) {
      chart.destroy();
    }
  });
}
