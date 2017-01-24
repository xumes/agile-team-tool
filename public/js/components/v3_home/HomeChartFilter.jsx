var React = require('react');
var api = require('../api.jsx');
var InlineSVG = require('svg-inline-react');
var chartStatus = require('./chartStatus.jsx').chartStatus;

var HomeChartFilter = React.createClass({
  showSec: function(id) {
    if ($('#'+id+'ChartBtn').hasClass('home-chart-filter-unselected')) {
      // $('#'+id+'Chart_block').fadeIn();
      $('#'+id+'ChartBtn').removeClass('home-chart-filter-unselected');
      $('#'+id+'ChartBtn').addClass('home-chart-filter-selected');
    } else {
      // $('#'+id+'Chart_block').fadeOut();
      $('#'+id+'ChartBtn').removeClass('home-chart-filter-selected');
      $('#'+id+'ChartBtn').addClass('home-chart-filter-unselected');
    }
  },

  applyChanges: function() {
    var self = this;
    var team = self.props.loadDetailTeam.team;
    if (team.type == 'squad') {
      _.each(Object.keys(chartStatus.squad.btns), function(key){
        if ($('#'+key+'ChartBtn').hasClass('home-chart-filter-unselected')) {
          chartStatus.squad.btns[key] = false;
          $('#'+key+'Chart_block').hide();
        } else {
          chartStatus.squad.btns[key] = true;
          $('#'+key+'Chart_block').show();
        }
      });
      var charts = $('#squad_team_scard > .container-body-col-2-1');
      var chartLength = 0;
      _.each(charts, function(chart){
        if ($('#'+chart.id).css('display') != 'none') {
          chartLength++;
        }
      });
      var chartHeight = '';
      var secHeight = '';
      switch (Math.floor((chartLength+1)/2)) {
        case 0:
          chartHeight = '0';
          secHeight = '0';
          break;
        case 1:
          chartHeight = '98%';
          secHeight = '26.45%';
          break;
        case 2:
          chartHeight = '48%';
          secHeight = '52.9%';
          break;
        case 3:
          chartHeight = '31%';
          secHeight = '79.35%';
          break;
        case 4:
          chartHeight = '23%';
          secHeight = '105.8%';
          break;
      }
      $('#squad_team_scard > .container-body-col-2-1').css('height',chartHeight);
      $('#iterationSection').css('height',secHeight);
      chartStatus.squad.charts.chartHeight = chartHeight;
      chartStatus.squad.charts.secHeight = secHeight;
    } else {
      _.each(Object.keys(chartStatus.nonSquad.btns), function(key){
        if ($('#'+key+'ChartBtn').hasClass('home-chart-filter-unselected')) {
          chartStatus.nonSquad.btns[key] = false;
          $('#'+key+'Chart_block').hide();
        } else {
          chartStatus.nonSquad.btns[key] = true;
          $('#'+key+'Chart_block').show();
        }
      });
      var charts = $('#nsquad_team_scard > .container-body-col-2-1');
      var chartLength = 0;
      _.each(charts, function(chart){
        if ($('#'+chart.id).css('display') != 'none') {
          chartLength++;
        }
      });
      var chartHeight = '';
      var secHeight = '';
      switch (Math.floor((chartLength+1)/2)) {
        case 0:
          chartHeight = '0';
          secHeight = '0';
          break;
        case 1:
          chartHeight = '98%';
          secHeight = '26.45%';
          break;
        case 2:
          chartHeight = '48%';
          secHeight = '52.9%';
          break;
        case 3:
          chartHeight = '31%';
          secHeight = '79.35%';
          break;
        case 4:
          chartHeight = '23%';
          secHeight = '105.8%';
          break;
      }
      $('#nsquad_team_scard > .container-body-col-2-1').css('height',chartHeight);
      $('#iterationSection').css('height',secHeight);
      chartStatus.nonSquad.charts.chartHeight = chartHeight;
      chartStatus.nonSquad.charts.secHeight = secHeight;
    }
    $(Highcharts.charts).each(function(i,chart) {
      if (chart == null) return;
      if ($('#' + $(chart.container).attr('id')).length > 0) {
        var height = chart.renderTo.clientHeight;
        var width = chart.renderTo.clientWidth;
        chart.setSize(width, height);
      }
    });
  },
  render: function() {
    var self = this;
    if (self.props.loadDetailTeam.team == undefined) {
      return null;
    } else {
      var team = self.props.loadDetailTeam.team;
      if (team.type == 'squad') {
        var btns = Object.keys(chartStatus.squad.btns).map(function(key, indx){
          if (chartStatus.squad.btns[key]) {
            var btnClass = 'home-chart-filter-selected';
          } else {
            btnClass = 'home-chart-filter-unselected';
          }
          return (
            <div key={key} class={btnClass} id={key + 'ChartBtn'} onClick={self.showSec.bind(null, key)}>{key}</div>
          )
        });
      } else {
        btns = Object.keys(chartStatus.nonSquad.btns).map(function(key, indx){
          if (chartStatus.nonSquad.btns[key]) {
            var btnClass = 'home-chart-filter-selected';
          } else {
            btnClass = 'home-chart-filter-unselected';
          }
          return (
            <div key={key} class={btnClass} id={key + 'ChartBtn'} onClick={self.showSec.bind(null, key)}>{key}</div>
          )
        });
      }
      return (
        <div class='home-chart-filter-block' style={{'display':'none','width':'32%','height':'400%','top':'21%'}}>
          <div class='home-chart-filter-arrow'>
            <InlineSVG class='home-chart-filter-arrow-img' src={require('../../../img/Att-icons/play-arrow.svg')}></InlineSVG>
          </div>
          <div class='home-chart-filter-title'>
            <h1>Filter Trends Display</h1>
            <h2 onClick={self.props.showFilter}>X</h2>
          </div>
          <div class='home-chart-filter-content'>
            {btns}
          </div>
          <div class='home-chart-filter-btns'>
            <p class='ibm-btn-row ibm-button-link' style={{'position':'relative','top':'10%','right':'5%','float':'right'}}>
              <a onClick={self.applyChanges} class='ibm-btn-pri ibm-btn-small ibm-btn-blue-50'>Apply</a>
              <a href='#' class='ibm-btn-sec ibm-btn-small ibm-btn-blue-50'>Cancel</a>
            </p>
          </div>
        </div>
      )
    }
  }
});
module.exports = HomeChartFilter;
