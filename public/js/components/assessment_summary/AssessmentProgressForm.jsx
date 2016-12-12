var React = require('react');
var api = require('../api.jsx');
var utils = require('../../utils');
var ComponentResultItem = require('./ComponentResultItem.jsx');
var OverallResultItem = require('./OverallResultItem.jsx');
var ProjectComponent = require('./ProjectComponent.jsx');
var DeliveryComponent = require('./DeliveryComponent.jsx');
var ActionPlanComponent = require('./ActionPlanComponent.jsx');
var LastUpdateSection = require('./LastUpdateSection.jsx');
var DebugSection = require('./DebugSection.jsx');
var IndependentAssessorSection = require('./IndependentAssessorSection.jsx');
var _ = require('underscore');
var moment = require('moment');
var team = null;
var assessmentData = [];
var hasIndAssessment = false;
var selAssessment;
var principles = [];

var teamId = '';
var assessId = '';
var displayType = {'display': 'block'};
var chartSeriesData = [];

var AssessmentProgressForm = React.createClass({
  getInitialState: function() {
    var urlParameters = utils.getJsonParametersFromUrl();
    var teamId = urlParameters.id;
    var assessId = urlParameters.assessId;
    var assessResult = {};
    return {
      teamId: teamId,
      assessId: assessId,
      assessResult: assessResult,
      selectedAssessment: {}
    }
  },

  componentDidMount: function() {
    var self = this;
    var teamId = self.state.teamId;
    var assessId = self.state.assessId;
    self.initShowHideWidget();
    api.getTeamAssessments(teamId, assessId)
      .then(function(assessResult) {
        _.each(assessResult, function(value, key, list) {
          if (value._id === assessId) {
            self.setState({selectedAssessment: value});
          }
        });
        self.setState({assessResult: assessResult});
      })
      .catch(function(err) {
        return console.log(err);
      });
  },

  hasDevOps: function(team_dlvr_software) {
    if (team_dlvr_software === undefined || team_dlvr_software === false) {
      /*$('#delContainer').remove();*/ // dont use this bec sometimes React will throw error
      displayType = {'display': 'none'};
    }
  },

  processData: function(teamId, assessId, jsonData) {
    jsonData = this.sortAssessments(jsonData);
    var filtered = this.filterSubmitted(jsonData, teamId, assessId);
    filtered.reverse();
    return filtered;
  },

  sortAssessments: function(assessments) {
    if (assessments != null && assessments.length > 1) {
      assessments.sort(function(a, b) {
        if (a['assessmentStatus'].toLowerCase() == 'draft' && b['assessmentStatus'].toLowerCase() == 'draft') {
          var aCreateDate = a['createDate'].split(' ')[0].replace(/-/g, '/') + ' ' + a['createDate'].split(' ')[1];
          var bCreateDate = b['createDate'].split(' ')[0].replace(/-/g, '/') + ' ' + b['createDate'].split(' ')[1];
          if (new Date(bCreateDate).getTime() == new Date(aCreateDate).getTime()) {
            return 0;
          } else {
            return (new Date(bCreateDate).getTime() > new Date(aCreateDate).getTime()) ? 1 : -1;
          }

        } else if (a['assessmentStatus'].toLowerCase() == 'submitted' && b['assessmentStatus'].toLowerCase() == 'submitted') {
          var aSubmitDate = a['submittedDate'].split(' ')[0].replace(/-/g, '/') + ' ' + a['submittedDate'].split(' ')[1];
          var bSubmitDate = b['submittedDate'].split(' ')[0].replace(/-/g, '/') + ' ' + b['submittedDate'].split(' ')[1];
          if (new Date(bSubmitDate).getTime() == new Date(aSubmitDate).getTime()) {
            return 1;
          } else {
            return (new Date(bSubmitDate).getTime() > new Date(aSubmitDate).getTime()) ? 1 : -1;
          }
        } else {
          if (b['assessmentStatus'].toLowerCase() == 'submitted')
            return -1;
          else
            return 1;
        }

      });
    }
    return assessments;
  },

  /**
   * Filters all Submitted assessment of certain type based on the first assessment it finds.
   *
   * @param assessmtList - list of assessments for a team.
   * @param teamId - team id
   * @param assessId - assessment id
   * @returns {Array} - list of filtered assessments of certain type.
   */
  filterSubmitted: function(assessmtList, teamId, assessId) {
    var assessmt_data = [];
    var assessmtType = '';
    var identifier = '';
    if (assessmtList != undefined) {
      for (var i = 0; i < assessmtList.length; i++) {
        if (assessmtList[i].teamId == teamId && assessmtList[i].assessmentStatus == 'Submitted' && assessmtList[i]._id == assessId) {
          assessmtType = this.getAssessmentType(assessmtList[i]);
          break;
        }
      }

      for (var i = 0; i < assessmtList.length; i++) {
        if (assessmtList[i].teamId == teamId && assessmtList[i].assessmentStatus == 'Submitted') {
          identifier = this.getAssessmentType(assessmtList[i]);

          if (assessmtType == '') {
            assessmtType = identifier;
            assessmt_data.push(assessmtList[i]);

          } else if (assessmtType == identifier) {
            assessmt_data.push(assessmtList[i]);

          }
        }
      }
    }
    return assessmt_data;
  },

  /**
   * Find the assessment component that would indicate if its a Project or Ops related assessment.
   *
   * @param assessment - assessment to verify
   * @returns {String} - assessment type.
   */
  getAssessmentType: function(assessment) {
    var identifier = '';
    var results = assessment['componentResults'];
    if (results != undefined) {
      for (var j = 0; j < results.length; j++) {
        if ((results[j]['componentName'].toLowerCase().indexOf('leadership') > -1 && results[j]['componentName'].toLowerCase().indexOf('ops') == -1) &&
          (results[j]['componentName'].toLowerCase().indexOf('leadership') > -1 && results[j]['componentName'].toLowerCase().indexOf('operations') == -1)) {
          identifier = 'Project';
        } else if ((results[j]['componentName'].toLowerCase().indexOf('leadership') > -1 && results[j]['componentName'].toLowerCase().indexOf('ops') > -1) ||
          (results[j]['componentName'].toLowerCase().indexOf('leadership') > -1 && results[j]['componentName'].toLowerCase().indexOf('operations') > -1)) {
          identifier = 'Ops';
        } else {
          identifier = '';
        }
        break;
      }
      return identifier;
    }
  },

  setIndAssessor: function(assessor) {
    $('#indAssessor').text(assessor);
  },

  loadHeader: function(assessDate, status, indDate, indstatus) {
    $('#assessmentDt').text(utils.showDateDDMMMYYYY(assessDate));
    $('#selfStatus').text(status);
    if ($('#indAssessor').text() != '') {
      $('#indDt').text(utils.showDateDDMMMYYYY(indDate));
      $('#indStatus').text(indstatus);
    } else {
      $('#indAssmtStat').remove();
      $('#indAssmtDt').remove();
    }
  },

  setAssessHeader: function(index, assessName) {
    $('#assessId_' + index + ' a').text($('#assessId_' + index + ' a').text() + ' ' + assessName);
  },

  displayOverAll: function(id, ovralcur_assessmt_score, ovraltar_assessmt_score, assessed_index) {
    this.loadDefaultChart(id, assessed_index);
  },

  loadDefaultChart: function(id, index) {
    var label = 'Overall';
    var graphId = '';
    if (id == 'resultBody') {
      graphId = 'container';
    } else if (id == 'deliveryResult') {
      graphId = 'deliveryContainer';
    }
    this.displaySelectedChart(null, index, label, graphId);
  },

  displaySelectedChart: function(event, assessed_index, id, elementId) {
    var chartData = new Object();
    var title;
    if (id == 'Overall') {
      var ave = this.getOverAllRawData(assessed_index);
      chartData = this.plotOverAll(ave);
      title = id;
    } else {
      cat = this.getAssessedData(assessed_index, id);
      chartData = this.getChartData(cat);
      title = this.getPracticeName(assessed_index, id);
    }
    var assessments = [];
    if (hasIndAssessment) {
      assessments = [{
        name: 'Target',
        data: chartData.target_score,
      }, {
        name: 'Current',
        data: chartData.current_score,
      }, {
        name: 'Independent',
        data: chartData.ind_score,
      }];
    } else {
      assessments = [{
        name: 'Target',
        data: chartData.target_score,
      }, {
        name: 'Current',
        data: chartData.current_score,
      }];
    }

    chartSeriesData = _.clone(assessments);

    this.loadResultChart(elementId, title, 'line', chartData.categories, 'Maturity Level', chartSeriesData,
      null, 'Select practice from adjacent table to see the results.');
  },

  getOverAllRawData: function(assessed_index) {
    var result = [];
    for (var i = 0; i < assessmentData.length; i++) {
      var obj = new Object();
      obj.self_assessmt_dt = assessmentData[i]['submittedDate'];
      var assessmt_cmpnt = assessmentData[i].componentResults[assessed_index];
      obj.assessed = new Object;
      if (assessmt_cmpnt != null) {
        if (assessmt_cmpnt.targetScore != undefined) {
          obj.assessed.targetScore = parseFloat(assessmt_cmpnt.targetScore);
        }
        if (assessmt_cmpnt.currentScore != undefined) {
          obj.assessed.currentScore = parseFloat(assessmt_cmpnt.currentScore);
        }
      }
      result.push(obj);
    }
    return result;
  },

  plotOverAll: function(data) {
    var result = new Object();
    if (data != null) {
      result.categories = [];
      result.target_score = [];
      result.current_score = [];
      result.ind_score = [];
      for (var x = 0; x < data.length; x++) {
        var date = data[x].self_assessmt_dt;
        var formattedDate = utils.showDateDDMMYYYYV2(date);
        result.categories[x] = formattedDate;
        if (data[x].assessed.targetScore != null) {
          result.target_score[x] = parseFloat(data[x].assessed.targetScore.toFixed(1));
        } else {
          result.target_score[x] = 0;
        }
        if (data[x].assessed.currentScore != null) {
          result.current_score[x] = parseFloat(data[x].assessed.currentScore.toFixed(1));
        } else {
          result.current_score[x] = 0;
        }
      }
    }
    return result;
  },

  getAssessedData: function(assessed_index, practice_id) {
    var result = [];
    for (var i = 0; i < assessmentData.length; i++) {
      var obj = new Object();
      obj.self_assessmt_dt = assessmentData[i]['submittedDate'];
      var assessmt_cmpnt = assessmentData[i].componentResults[assessed_index];
      obj.assessed = [];
      if (assessmt_cmpnt != null) {
        for (var x = 0; x < assessmt_cmpnt.assessedComponents.length; x++) {
          var assessed_cmpnt_tbl = assessmt_cmpnt.assessedComponents[x];
          if (assessed_cmpnt_tbl != null) {
            if (assessed_cmpnt_tbl.practiceId == practice_id) {
              obj.assessed[0] = assessed_cmpnt_tbl;
              break;
            }
          }
        }
      }
      result.push(obj);
    }
    return result;
  },

  getChartData: function(data) {
    var result = new Object();
    if (data != null) {
      result.categories = [];
      result.target_score = [null];
      result.current_score = [null];
      result.ind_score = [null];
      for (var x = 0; x < data.length; x++) {
        var date = data[x].self_assessmt_dt;
        result.categories[x] = utils.showDateDDMMYYYYV2(date);
        for (var y = 0; y < data[x].assessed.length; y++) {
          if (data[x].assessed[y].targetScore != '') {
            result.target_score[x] = parseInt(data[x].assessed[y].targetScore);
          } else {
            result.target_score[x] = null;
          }
          if (data[x].assessed[y].currentScore != '') {
            result.current_score[x] = parseInt(data[x].assessed[y].currentScore);
          } else {
            result.current_score[x] = null;
          }
          if (data[x].assessed[y].assessorTarget != '') {
            result.ind_score[x] = parseInt(data[x].assessed[y].assessorTarget);
          } else {
            result.ind_score[x] = null;
          }
        }
      }
    }
    return result;
  },

  getPracticeName: function(assessed_index, practice_id) {
    var result = '';
    for (var i = 0; i < assessmentData.length; i++) {
      var assessmt_cmpnt = assessmentData[i].componentResults[assessed_index];
      if (assessmt_cmpnt != null) {
        for (var x = 0; x < assessmt_cmpnt.assessedComponents.length; x++) {
          var assessed_cmpnt_tbl = assessmt_cmpnt.assessedComponents[x];
          if (assessed_cmpnt_tbl != null) {
            if (assessed_cmpnt_tbl.practiceId == practice_id) {
              result = assessed_cmpnt_tbl.practiceName;
              break;
            }
          }
        }
      }
    }
    return result;
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
                width: '450px',
                color: '#222',
                fontSize: '11px'
              }).add();
          }
        }
      },

      title: {
        style: {
          'fontSize': '14px'
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

  removeIndAssessment: function() {
    if (!hasIndAssessment) {
      $('#colContainer').find('#resultIndAsses').remove();
      $('#delContainer').find('#deliveryIndAsses').remove();
    }
  },

  storePrinciples: function(index, assessed_cmpnt, assessmt_cmpnt_name) {
    var obj = new Object();
    obj.index = index;
    obj.assessed_cmpnt = assessed_cmpnt;
    obj.assessmt_cmpnt_name = assessmt_cmpnt_name;
    principles.push(obj);
  },

  initShowHideWidget: function() {
    $("#colContainer").showhide();
    $("#delContainer").showhide();
    $("#actPlanContainer").showhide();
  },

  submitActionPlan: function (data, msg) {
    var self = this;
    api.updateAssessment(data)
    .then(function(result){
      self.setState({selectedAssessment:result});
      if (msg != null && msg != '')
        self.showMessagePopup(msg);
    })
    .catch(function(err){
      self.validationHandler(err);
    });
  },

  showMessagePopup: function(message) {
    alert(message);
  },

  validationHandler:function (errorResponse, operation) {
    var self = this;
    var errorlist = '';
    var response = errorResponse.responseJSON;

    if (response && response.error) {
      var errors = response.error.errors;
      if (errors){        
        var popupMsg = '';
        if (_.isObject(errors)) {
          _.each(errors, function(err, attr) {
            popupMsg += err.message + '<br>';
          });
        } else {
          popupMsg = errors;
        }
        if (!_.isEmpty(popupMsg)) {
          self.showMessagePopup(popupMsg);
        }
      }
    }
  },

  executeReset: function (actionPlan) {
    var self = this;
    api.getAssessmentDetails(this.state.assessId)
      .then(function(data){
        self.setState({selectedAssessment: data});
      })
      .catch(function(err){
        console.log(JSON.stringify(err));
      });
  },

  render: function() {
    var self = this;
    var teamId = self.state.teamId;
    var assessId = self.state.assessId;
    var assessResult = self.state.assessResult;
    var assessmt_data = self.processData(teamId, assessId, assessResult);
    var lastRecord = -1;
    var hasIndAssessment = false;
    var loadResultArray = [];
    var overAllArray = [];

    for (var ctr1 = 0; ctr1 < assessmt_data.length; ctr1++) {
      //index 0 - leadership
      //index 1- delivery
      var assessmt = assessmt_data[ctr1];
      if (assessmt._id === assessId) {
        lastRecord = ctr1;

        if (assessmt.assessorStatus == 'Submitted') {
          hasIndAssessment = true;
        } else {
          self.removeIndAssessment();
        }

        var firstIndex = lastRecord - 6;
        if (firstIndex < 0) {
          firstIndex = 0;
        } else {
          firstIndex = firstIndex + 1;
        }
        for (var x = firstIndex; x <= lastRecord; x++) {
          if (assessmt_data[x] != null) {
            assessmentData.push(assessmt_data[x]);
          }
        }

        if (assessmt.componentResults != null) {
          var practicesCnt = 0;
          for (var ctr2 = 0; ctr2 < assessmt.componentResults.length; ctr2++) {
            var assessmt_cmpnt_rslts = assessmt.componentResults[ctr2];
            var id = '';
            if (ctr2 == 0) {
              id = 'resultBody';
            } else {
              id = 'deliveryResult';
            }

            self.displayOverAll(id, assessmt_cmpnt_rslts.currentScore, assessmt_cmpnt_rslts.targetScore, ctr2);

            overAllArray.push(<OverallResultItem
              key={`overall-${ctr2}-${ctr1}`}
              id={id}
              x={ctr2}
              counter={ctr1}
              assessed_cmpnt={assessmt_cmpnt_rslts}
              hasIndAssessment={hasIndAssessment}
              displaySelectedChart={self.displaySelectedChart} />);

            for (var ctr3 = 0; ctr3 < assessmt_cmpnt_rslts.assessedComponents.length; ctr3++) {
              var assessed_cmpnt = assessmt_cmpnt_rslts.assessedComponents[ctr3];
              loadResultArray.push(<ComponentResultItem
                key={`asmtresult-${ctr2}-${ctr3}`}
                hasIndAssessment={hasIndAssessment}
                displaySelectedChart={self.displaySelectedChart}
                assessed_cmpnt={assessed_cmpnt} x={ctr2} id={id} />);

                self.storePrinciples(practicesCnt, assessed_cmpnt, assessmt_cmpnt_rslts.componentName);

              practicesCnt++;
            }
          }
        }

        self.hasDevOps(assessmt.deliversSoftware);
        selAssessment = assessId;
        break;
      }
    }

    var resultBodyAry = [];
    var deliveryResultAry = [];
    _.each(overAllArray, function(value, key, list) {
      if (value.props.id === 'resultBody') {
        resultBodyAry.push(value);
      }
      if (value.props.id === 'deliveryResult') {
        deliveryResultAry.push(value);
      }
    });
    _.each(loadResultArray, function(value, key, list) {
      if (value.props.id === 'resultBody') {
        resultBodyAry.push(value);
      }
      if (value.props.id === 'deliveryResult') {
        deliveryResultAry.push(value);
      }
    });

    return (
      <form id="progressForm" class="agile-maturity">
        <ProjectComponent resultBodyAry={resultBodyAry} />
        <DeliveryComponent deliveryResultAry={deliveryResultAry} displayType={displayType} />
        <ActionPlanComponent teamId={this.state.teamId} submitActionPlan={this.submitActionPlan} executeReset={this.executeReset} selectedAssessment={this.state.selectedAssessment} />
        <IndependentAssessorSection selectedAssessment={this.state.selectedAssessment} />
        <LastUpdateSection selectedAssessment={this.state.selectedAssessment} />
        <DebugSection selectedAssessment={this.state.selectedAssessment} />
        <div class="ibm-rule ibm-alternate">
          <hr />
        </div>
      </form>
    );
  }
});

module.exports = AssessmentProgressForm;
